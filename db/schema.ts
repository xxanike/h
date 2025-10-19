import { pgTable, text, real, timestamp, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("buyer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  tags: jsonb("tags").notNull().$type<string[]>(),
  thumbnailURL: text("thumbnail_url").notNull(),
  fileURL: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  sellerId: text("seller_id").notNull().references(() => users.id),
  sellerName: text("seller_name").notNull(),
  sellerPhotoURL: text("seller_photo_url"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  productTitle: text("product_title").notNull(),
  buyerId: text("buyer_id").notNull().references(() => users.id),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  sellerId: text("seller_id").notNull().references(() => users.id),
  transactionId: text("transaction_id").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending_verification"),
  downloadURL: text("download_url"),
  sellerEarnings: real("seller_earnings").notNull(),
  marketplaceCommission: real("marketplace_commission").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

export const adminLogs = pgTable("admin_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  adminId: text("admin_id").notNull().references(() => users.id),
  adminName: text("admin_name").notNull(),
  targetId: text("target_id").notNull(),
  targetType: text("target_type").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id").notNull().references(() => users.id),
  sellerName: text("seller_name").notNull(),
  amount: real("amount").notNull(),
  upiId: text("upi_id").notNull(),
  status: text("status").notNull().default("pending"),
  orderIds: jsonb("order_ids").notNull().$type<string[]>(),
  markedBy: text("marked_by"),
  markedByName: text("marked_by_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertAdminLogSchema = createInsertSchema(adminLogs);
export const selectAdminLogSchema = createSelectSchema(adminLogs);

export const insertPayoutSchema = createInsertSchema(payouts);
export const selectPayoutSchema = createSelectSchema(payouts);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;
