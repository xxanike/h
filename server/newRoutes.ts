import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { authenticate, requireAdmin, requireSeller } from "./middleware/newAuth";
import { db, users, products, orders, adminLogs, eq, desc } from "../db";
import { config } from "./config";
import passport from "passport";
import { nanoid } from "nanoid";

const uploadDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = file.fieldname === "thumbnail" 
      ? path.join(uploadDir, "thumbnails")
      : path.join(uploadDir, "products");
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${nanoid(10)}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
  }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
    }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/config/marketplace", authenticate, async (req, res) => {
    try {
      res.json({
        upiId: config.marketplace.upiId,
        commissionRate: config.marketplace.commissionRate,
        sellerRate: config.marketplace.sellerRate,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketplace config" });
    }
  });

  app.get("/api/products/approved", async (req, res) => {
    try {
      const approvedProducts = await db
        .select()
        .from(products)
        .where(eq(products.status, "approved"))
        .orderBy(desc(products.createdAt));
      
      res.json(approvedProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, req.params.id))
        .limit(1);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/my", authenticate, requireSeller, async (req, res) => {
    try {
      const myProducts = await db
        .select()
        .from(products)
        .where(eq(products.sellerId, req.user!.id!))
        .orderBy(desc(products.createdAt));
      
      res.json(myProducts);
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

      if (!config.upload.allowedThumbnailTypes.includes(thumbnailFile.mimetype)) {
        return res.status(400).json({ error: "Invalid thumbnail type" });
      }

      const thumbnailURL = `/uploads/thumbnails/${thumbnailFile.filename}`;
      const fileURL = `/uploads/products/${productFile.filename}`;

      const productId = nanoid();
      const newProduct = {
        id: productId,
        title,
        description,
        price: Number(price),
        tags: JSON.parse(tags),
        thumbnailURL,
        fileURL,
        fileName: productFile.originalname,
        fileSize: productFile.size,
        sellerId: req.user!.id!,
        sellerName: req.user!.displayName!,
        sellerPhotoURL: req.user!.photoURL || null,
        status: "pending",
      };

      await db.insert(products).values(newProduct);

      res.json(newProduct);
    } catch (error) {
      console.error("Product upload error:", error);
      res.status(500).json({ error: "Failed to upload product" });
    }
  });

  app.post("/api/orders", authenticate, async (req, res) => {
    try {
      const orderId = nanoid();
      const order = {
        id: orderId,
        ...req.body,
        status: "pending_verification",
      };

      await db.insert(orders).values(order);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/my", authenticate, async (req, res) => {
    try {
      const myOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.sellerId, req.user!.id!))
        .orderBy(desc(orders.createdAt));
      
      res.json(myOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/products/pending", authenticate, requireAdmin, async (req, res) => {
    try {
      const pendingProducts = await db
        .select()
        .from(products)
        .where(eq(products.status, "pending"))
        .orderBy(desc(products.createdAt));
      
      res.json(pendingProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending products" });
    }
  });

  app.post("/api/admin/products/:id/approve", authenticate, requireAdmin, async (req, res) => {
    try {
      await db
        .update(products)
        .set({ 
          status: "approved",
          approvedAt: new Date(),
        })
        .where(eq(products.id, req.params.id));

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, req.params.id))
        .limit(1);

      await db.insert(adminLogs).values({
        id: nanoid(),
        action: "approve_product",
        adminId: req.user!.id!,
        adminName: req.user!.displayName!,
        targetId: req.params.id,
        targetType: "product",
        details: `Approved product: ${product?.title}`,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve product" });
    }
  });

  app.post("/api/admin/products/:id/reject", authenticate, requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      
      await db
        .update(products)
        .set({ 
          status: "rejected",
          rejectionReason: reason,
        })
        .where(eq(products.id, req.params.id));

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, req.params.id))
        .limit(1);

      await db.insert(adminLogs).values({
        id: nanoid(),
        action: "reject_product",
        adminId: req.user!.id!,
        adminName: req.user!.displayName!,
        targetId: req.params.id,
        targetType: "product",
        details: `Rejected product: ${product?.title} - Reason: ${reason}`,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject product" });
    }
  });

  app.get("/api/admin/orders/pending", authenticate, requireAdmin, async (req, res) => {
    try {
      const pendingOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "pending_verification"))
        .orderBy(desc(orders.createdAt));
      
      res.json(pendingOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending orders" });
    }
  });

  app.post("/api/admin/orders/:id/verify", authenticate, requireAdmin, async (req, res) => {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, order.productId))
        .limit(1);

      await db
        .update(orders)
        .set({ 
          status: "verified",
          downloadURL: product?.fileURL,
          verifiedAt: new Date(),
        })
        .where(eq(orders.id, req.params.id));

      await db.insert(adminLogs).values({
        id: nanoid(),
        action: "verify_payment",
        adminId: req.user!.id!,
        adminName: req.user!.displayName!,
        targetId: req.params.id,
        targetType: "order",
        details: `Verified payment for order: ${order.productTitle} - Transaction: ${order.transactionId}`,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/admin/orders/:id/reject", authenticate, requireAdmin, async (req, res) => {
    try {
      await db
        .update(orders)
        .set({ status: "rejected" })
        .where(eq(orders.id, req.params.id));

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      await db.insert(adminLogs).values({
        id: nanoid(),
        action: "reject_payment",
        adminId: req.user!.id!,
        adminName: req.user!.displayName!,
        targetId: req.params.id,
        targetType: "order",
        details: `Rejected payment for order: ${order?.productTitle} - Transaction: ${order?.transactionId}`,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  app.get("/api/admin/products/:id/download", authenticate, requireAdmin, async (req, res) => {
    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, req.params.id))
        .limit(1);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await db.insert(adminLogs).values({
        id: nanoid(),
        action: "download_file",
        adminId: req.user!.id!,
        adminName: req.user!.displayName!,
        targetId: req.params.id,
        targetType: "product",
        details: `Downloaded file: ${product.fileName}`,
      });

      res.json({ downloadURL: product.fileURL });
    } catch (error) {
      res.status(500).json({ error: "Failed to get download URL" });
    }
  });

  app.get("/api/admin/logs", authenticate, requireAdmin, async (req, res) => {
    try {
      const logs = await db
        .select()
        .from(adminLogs)
        .orderBy(desc(adminLogs.createdAt))
        .limit(50);
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
