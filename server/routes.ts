import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { authenticate, requireAdmin, requireSeller } from "./middleware/auth";
import { adminDb, adminStorage, adminAuth } from "./firebase-admin";
import { config } from "./config";

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const userDoc = await adminDb.collection("users").doc(req.user!.uid).get();
      
      if (!userDoc.exists) {
        // Create user if doesn't exist (first login)
        const newUser = {
          id: req.user!.uid,
          email: req.user!.email,
          displayName: req.user!.displayName,
          photoURL: (await adminAuth.getUser(req.user!.uid)).photoURL || "",
          role: "buyer",
          createdAt: new Date().toISOString(),
        };
        
        await adminDb.collection("users").doc(req.user!.uid).set(newUser);
        return res.json(newUser);
      }
      
      res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Marketplace configuration endpoint (authenticated for security)
  app.get("/api/config/marketplace", authenticate, async (req, res) => {
    try {
      // Return public marketplace configuration
      // Only expose non-sensitive data that's needed for the UI
      // Do not expose file paths or other internal configuration
      res.json({
        upiId: config.marketplace.upiId,
        commissionRate: config.marketplace.commissionRate,
        sellerRate: config.marketplace.sellerRate,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketplace config" });
    }
  });

  // Product routes
  app.get("/api/products/approved", async (req, res) => {
    try {
      const snapshot = await adminDb.collection("products")
        .where("status", "==", "approved")
        .orderBy("createdAt", "desc")
        .get();
      
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const doc = await adminDb.collection("products").doc(req.params.id).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/my", authenticate, requireSeller, async (req, res) => {
    try {
      const snapshot = await adminDb.collection("products")
        .where("sellerId", "==", req.user!.uid)
        .orderBy("createdAt", "desc")
        .get();
      
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  const uploadFields = upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "file", maxCount: 1 }
  ]);

  app.post("/api/products", authenticate, requireSeller, uploadFields, async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { title, description, price, tags } = req.body;

      if (!files?.thumbnail || !files?.file) {
        return res.status(400).json({ error: "Missing required files" });
      }

      const thumbnailFile = files.thumbnail[0];
      const productFile = files.file[0];

      // Validate thumbnail
      if (!config.upload.allowedThumbnailTypes.includes(thumbnailFile.mimetype)) {
        return res.status(400).json({ error: "Invalid thumbnail type" });
      }

      // Upload to Firebase Storage
      const bucket = adminStorage.bucket(`${config.firebase.projectId}.appspot.com`);
      
      const thumbnailPath = `thumbnails/${req.user!.uid}/${Date.now()}_${thumbnailFile.originalname}`;
      const filePath = `products/${req.user!.uid}/${Date.now()}_${productFile.originalname}`;

      await bucket.file(thumbnailPath).save(thumbnailFile.buffer, {
        metadata: { contentType: thumbnailFile.mimetype },
      });

      await bucket.file(filePath).save(productFile.buffer, {
        metadata: { contentType: productFile.mimetype },
      });

      const thumbnailURL = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;
      const fileURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // Create product document
      const product = {
        title,
        description,
        price: Number(price),
        tags: JSON.parse(tags),
        thumbnailURL,
        fileURL,
        fileName: productFile.originalname,
        fileSize: productFile.size,
        sellerId: req.user!.uid,
        sellerName: req.user!.displayName,
        sellerPhotoURL: (await adminAuth.getUser(req.user!.uid)).photoURL || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const docRef = await adminDb.collection("products").add(product);

      // Optional: Discord webhook notification (placeholder)
      if (config.discord.webhookUrl) {
        // TODO: Send Discord webhook notification
      }

      res.json({ id: docRef.id, ...product });
    } catch (error) {
      console.error("Product upload error:", error);
      res.status(500).json({ error: "Failed to upload product" });
    }
  });

  // Order routes
  app.post("/api/orders", authenticate, async (req, res) => {
    try {
      const order = {
        ...req.body,
        status: "pending_verification",
        createdAt: new Date().toISOString(),
      };

      const docRef = await adminDb.collection("orders").add(order);
      res.json({ id: docRef.id, ...order });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/my", authenticate, async (req, res) => {
    try {
      // Get orders where user is seller
      const snapshot = await adminDb.collection("orders")
        .where("sellerId", "==", req.user!.uid)
        .orderBy("createdAt", "desc")
        .get();
      
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Admin routes
  app.get("/api/admin/products/pending", authenticate, requireAdmin, async (req, res) => {
    try {
      const snapshot = await adminDb.collection("products")
        .where("status", "==", "pending")
        .orderBy("createdAt", "desc")
        .get();
      
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending products" });
    }
  });

  app.post("/api/admin/products/:id/approve", authenticate, requireAdmin, async (req, res) => {
    try {
      await adminDb.collection("products").doc(req.params.id).update({
        status: "approved",
        approvedAt: new Date().toISOString(),
      });

      const productDoc = await adminDb.collection("products").doc(req.params.id).get();
      const product = productDoc.data();

      // Log admin action
      await adminDb.collection("admin_logs").add({
        action: "approve_product",
        adminId: req.user!.uid,
        adminName: req.user!.displayName,
        targetId: req.params.id,
        targetType: "product",
        details: `Approved product: ${product?.title}`,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve product" });
    }
  });

  app.post("/api/admin/products/:id/reject", authenticate, requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      
      await adminDb.collection("products").doc(req.params.id).update({
        status: "rejected",
        rejectionReason: reason,
      });

      const productDoc = await adminDb.collection("products").doc(req.params.id).get();
      const product = productDoc.data();

      // Log admin action
      await adminDb.collection("admin_logs").add({
        action: "reject_product",
        adminId: req.user!.uid,
        adminName: req.user!.displayName,
        targetId: req.params.id,
        targetType: "product",
        details: `Rejected product: ${product?.title} - Reason: ${reason}`,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject product" });
    }
  });

  app.get("/api/admin/orders/pending", authenticate, requireAdmin, async (req, res) => {
    try {
      const snapshot = await adminDb.collection("orders")
        .where("status", "==", "pending_verification")
        .orderBy("createdAt", "desc")
        .get();
      
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending orders" });
    }
  });

  app.post("/api/admin/orders/:id/verify", authenticate, requireAdmin, async (req, res) => {
    try {
      const orderDoc = await adminDb.collection("orders").doc(req.params.id).get();
      const order = orderDoc.data();

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get product to get download URL
      const productDoc = await adminDb.collection("products").doc(order.productId).get();
      const product = productDoc.data();

      await adminDb.collection("orders").doc(req.params.id).update({
        status: "verified",
        downloadURL: product?.fileURL,
        verifiedAt: new Date().toISOString(),
      });

      // Log admin action
      await adminDb.collection("admin_logs").add({
        action: "verify_payment",
        adminId: req.user!.uid,
        adminName: req.user!.displayName,
        targetId: req.params.id,
        targetType: "order",
        details: `Verified payment for order: ${order.productTitle} - Transaction: ${order.transactionId}`,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/admin/orders/:id/reject", authenticate, requireAdmin, async (req, res) => {
    try {
      await adminDb.collection("orders").doc(req.params.id).update({
        status: "rejected",
      });

      const orderDoc = await adminDb.collection("orders").doc(req.params.id).get();
      const order = orderDoc.data();

      // Log admin action
      await adminDb.collection("admin_logs").add({
        action: "reject_payment",
        adminId: req.user!.uid,
        adminName: req.user!.displayName,
        targetId: req.params.id,
        targetType: "order",
        details: `Rejected payment for order: ${order?.productTitle} - Transaction: ${order?.transactionId}`,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  app.get("/api/admin/products/:id/download", authenticate, requireAdmin, async (req, res) => {
    try {
      const productDoc = await adminDb.collection("products").doc(req.params.id).get();
      const product = productDoc.data();

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Log admin action
      await adminDb.collection("admin_logs").add({
        action: "download_file",
        adminId: req.user!.uid,
        adminName: req.user!.displayName,
        targetId: req.params.id,
        targetType: "product",
        details: `Downloaded file: ${product.fileName}`,
        createdAt: new Date().toISOString(),
      });

      res.json({ downloadURL: product.fileURL });
    } catch (error) {
      res.status(500).json({ error: "Failed to get download URL" });
    }
  });

  app.get("/api/admin/logs", authenticate, requireAdmin, async (req, res) => {
    try {
      const snapshot = await adminDb.collection("admin_logs")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
      
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Placeholder virus scan hook
  async function virusScanHook(fileBuffer: Buffer): Promise<boolean> {
    // TODO: Integrate with virus scanning service (e.g., ClamAV, VirusTotal)
    // For now, return true (safe)
    console.log("Virus scan hook called - implement real scanning here");
    return true;
  }

  const httpServer = createServer(app);
  return httpServer;
}
