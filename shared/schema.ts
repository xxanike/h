import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  role: z.enum(["buyer", "seller", "admin"]).default("buyer"),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// Product Schema
export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().positive(),
  tags: z.array(z.string()),
  thumbnailURL: z.string(),
  fileURL: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  sellerId: z.string(),
  sellerName: z.string(),
  sellerPhotoURL: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  rejectionReason: z.string().optional(),
  createdAt: z.string(),
  approvedAt: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const insertProductSchema = productSchema.omit({ 
  id: true, 
  createdAt: true, 
  approvedAt: true,
  status: true,
  rejectionReason: true 
});
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productTitle: z.string(),
  buyerId: z.string(),
  buyerName: z.string(),
  buyerEmail: z.string(),
  sellerId: z.string(),
  transactionId: z.string(),
  amount: z.number().positive(),
  status: z.enum(["pending_verification", "verified", "rejected"]).default("pending_verification"),
  downloadURL: z.string().optional(),
  sellerEarnings: z.number(),
  marketplaceCommission: z.number(),
  createdAt: z.string(),
  verifiedAt: z.string().optional(),
});

export type Order = z.infer<typeof orderSchema>;

export const insertOrderSchema = orderSchema.omit({ 
  id: true, 
  createdAt: true, 
  verifiedAt: true,
  status: true,
  downloadURL: true 
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Admin Log Schema
export const adminLogSchema = z.object({
  id: z.string(),
  action: z.enum([
    "approve_product", 
    "reject_product", 
    "verify_payment", 
    "reject_payment",
    "download_file",
    "update_role"
  ]),
  adminId: z.string(),
  adminName: z.string(),
  targetId: z.string(),
  targetType: z.enum(["product", "order", "user"]),
  details: z.string(),
  createdAt: z.string(),
});

export type AdminLog = z.infer<typeof adminLogSchema>;

export const insertAdminLogSchema = adminLogSchema.omit({ id: true, createdAt: true });
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;

// Payout Schema
export const payoutSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  sellerName: z.string(),
  amount: z.number().positive(),
  upiId: z.string(),
  status: z.enum(["pending", "completed"]).default("pending"),
  orderIds: z.array(z.string()),
  markedBy: z.string().optional(),
  markedByName: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export type Payout = z.infer<typeof payoutSchema>;

export const insertPayoutSchema = payoutSchema.omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true,
  status: true 
});
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
