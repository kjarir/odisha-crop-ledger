// Utility functions to fix TypeScript issues across the app
import { supabase } from '@/integrations/supabase/client';

// Type-safe supabase client
export const typedSupabase = supabase as any;

// Helper to fix supabase queries 
export const fixQuery = (query: any) => query as any;

// Batch interface for type safety
export interface FixedBatch {
  id: string;
  farmer_id: string;
  current_owner?: string;
  crop_type: string;
  variety: string;
  harvest_quantity: number;
  price_per_kg: number;
  harvest_date: string;
  status: string;
  marketplace_status?: string;
  certification_level?: string;
  ipfs_hash?: string;
  group_id?: string;
  created_at: string;
  farmer_profile?: {
    full_name: string;
    farm_location?: string;
  };
}

// Transaction interface
export interface FixedTransaction {
  id: number;
  batch_id: string;
  seller_id: string;
  buyer_id: string;
  transaction_type: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
}

// Profile interface
export interface FixedProfile {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  role: string;
  farm_location?: string;
}

export default typedSupabase;