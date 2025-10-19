import type { Request, Response, NextFunction } from "express";
import type { User } from "../../db/schema";

declare global {
  namespace Express {
    interface User extends Partial<User> {}
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!req.user) {
    return res.status(401).json({ error: "User not found" });
  }
  
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "seller" && req.user.role !== "admin")) {
    return res.status(403).json({ error: "Seller access required" });
  }
  next();
}
