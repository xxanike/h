import type { Request, Response, NextFunction } from "express";
import { verifyIdToken, adminDb } from "../firebase-admin";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: string;
        displayName: string;
      };
    }
  }
}

// Middleware to verify Firebase authentication
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);

    // Fetch user data from Firestore
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role: userData?.role || "buyer",
      displayName: userData?.displayName || "",
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Middleware to check if user is seller or admin
export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "seller" && req.user?.role !== "admin") {
    return res.status(403).json({ error: "Seller access required" });
  }
  next();
}
