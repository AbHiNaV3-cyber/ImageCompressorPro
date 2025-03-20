import { users, compressionHistory, type User, type InsertUser, type ImageInfo, type CompressionHistory } from "@shared/schema";
import { supabase } from "./supabase";
import type { CompressionHistoryItem } from "./supabase";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface with CRUD methods for users and compression history
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Compression history methods
  saveCompressionHistory(imageInfo: ImageInfo): Promise<CompressionHistoryItem | undefined>;
  getCompressionHistory(): Promise<CompressionHistoryItem[]>;
  deleteCompressionHistory(id: string): Promise<void>;
}

// Supabase storage implementation
export class SupabaseStorage implements IStorage {
  constructor() {
    // Initialize Supabase connection if needed
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
    }
    
    return data as User;
  }

  // Compression history methods
  async saveCompressionHistory(imageInfo: ImageInfo): Promise<CompressionHistoryItem | undefined> {
    const { data, error } = await supabase
      .from('compression_history')
      .insert({
        image_info: imageInfo
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error saving compression history:', error);
      return undefined;
    }
    
    return data as CompressionHistoryItem;
  }

  async getCompressionHistory(): Promise<CompressionHistoryItem[]> {
    const { data, error } = await supabase
      .from('compression_history')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching compression history:', error);
      return [];
    }
    
    return data as CompressionHistoryItem[];
  }

  async deleteCompressionHistory(id: string): Promise<void> {
    const { error } = await supabase
      .from('compression_history')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Failed to delete compression history: ${error.message}`);
    }
  }
}

// We're keeping the MemStorage implementation for fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private compressionHistory: Map<string, CompressionHistoryItem>;
  currentId: number;
  currentCompressionId: number;

  constructor() {
    this.users = new Map();
    this.compressionHistory = new Map();
    this.currentId = 1;
    this.currentCompressionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveCompressionHistory(imageInfo: ImageInfo): Promise<CompressionHistoryItem | undefined> {
    const id = this.currentCompressionId.toString();
    this.currentCompressionId++;
    
    const historyItem: CompressionHistoryItem = {
      id,
      created_at: new Date().toISOString(),
      image_info: imageInfo
    };
    
    this.compressionHistory.set(id, historyItem);
    return historyItem;
  }

  async getCompressionHistory(): Promise<CompressionHistoryItem[]> {
    return Array.from(this.compressionHistory.values())
      .sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }

  async deleteCompressionHistory(id: string): Promise<void> {
    this.compressionHistory.delete(id);
  }
}

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveCompressionHistory(imageInfo: ImageInfo): Promise<CompressionHistoryItem | undefined> {
    const [history] = await db
      .insert(compressionHistory)
      .values({
        imageInfo: imageInfo
      })
      .returning();
      
    if (!history) return undefined;
    
    return {
      id: history.id,
      created_at: history.createdAt.toISOString(),
      image_info: history.imageInfo
    };
  }

  async getCompressionHistory(): Promise<CompressionHistoryItem[]> {
    const historyItems = await db
      .select()
      .from(compressionHistory)
      .orderBy(compressionHistory.createdAt);
      
    return historyItems.map(item => ({
      id: item.id,
      created_at: item.createdAt.toISOString(),
      image_info: item.imageInfo
    }));
  }

  async deleteCompressionHistory(id: string): Promise<void> {
    await db
      .delete(compressionHistory)
      .where(eq(compressionHistory.id, id));
  }
}

// Use DatabaseStorage as the primary storage mechanism
export const storage = new DatabaseStorage();
