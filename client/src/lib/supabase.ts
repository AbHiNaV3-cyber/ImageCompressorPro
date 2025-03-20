import { createClient } from '@supabase/supabase-js';
import type { ImageInfo } from '@shared/schema';

// Create a single supabase client for the application
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definition for the compression history
export type CompressionHistoryItem = {
  id?: string;
  created_at?: string;
  user_id?: string;
  image_info: ImageInfo;
};

// Helper functions for interacting with Supabase
export const saveCompressionHistory = async (imageInfo: ImageInfo): Promise<void> => {
  try {
    const { error } = await supabase
      .from('compression_history')
      .insert({
        image_info: imageInfo
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving compression history:', error);
    throw error;
  }
};

export const getCompressionHistory = async (): Promise<CompressionHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('compression_history')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching compression history:', error);
    return [];
  }
};

export const deleteCompressionHistoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('compression_history')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting compression history item:', error);
    throw error;
  }
};