import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Image compression schema
export const compressionSettings = z.object({
  compressionLevel: z.number().min(0).max(100).default(80),
  outputFormat: z.enum(["jpeg", "png", "webp"]).default("jpeg"),
  resize: z.boolean().default(false),
  width: z.number().optional(),
  height: z.number().optional(),
  maintainAspectRatio: z.boolean().default(true),
});

export type CompressionSettings = z.infer<typeof compressionSettings>;

export const imageInfo = z.object({
  originalName: z.string(),
  originalSize: z.number(),
  originalFormat: z.string(),
  originalWidth: z.number(),
  originalHeight: z.number(),
  compressedSize: z.number().optional(),
  compressedWidth: z.number().optional(),
  compressedHeight: z.number().optional(),
  compressionRatio: z.number().optional(),
  settings: compressionSettings.optional(),
});

export type ImageInfo = z.infer<typeof imageInfo>;
