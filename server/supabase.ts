import { createClient } from '@supabase/supabase-js';
import type { ImageInfo } from '@shared/schema';

// Check for environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
}

// Create a single supabase client for the server
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Type definition for the compression history
export type CompressionHistoryItem = {
  id?: string;
  created_at?: string;
  user_id?: string;
  image_info: ImageInfo;
};