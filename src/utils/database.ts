import { supabase } from '@/integrations/supabase/client';

// Type-safe database operations utility
export const db = {
  batches: {
    select: (query = '*') => (supabase as any).from('batches').select(query),
    insert: (data: any) => (supabase as any).from('batches').insert(data),
    update: (data: any) => (supabase as any).from('batches').update(data),
    delete: () => (supabase as any).from('batches').delete(),
  },
  transactions: {
    select: (query = '*') => (supabase as any).from('transactions').select(query),
    insert: (data: any) => (supabase as any).from('transactions').insert(data),
    update: (data: any) => (supabase as any).from('transactions').update(data),
    delete: () => (supabase as any).from('transactions').delete(),
  },
  profiles: {
    select: (query = '*') => (supabase as any).from('profiles').select(query),
    insert: (data: any) => (supabase as any).from('profiles').insert(data),
    update: (data: any) => (supabase as any).from('profiles').update(data),
    delete: () => (supabase as any).from('profiles').delete(),
  },
  marketplace_availability: {
    select: (query = '*') => (supabase as any).from('marketplace_availability').select(query),
    insert: (data: any) => (supabase as any).from('marketplace_availability').insert(data),
    update: (data: any) => (supabase as any).from('marketplace_availability').update(data),
    delete: () => (supabase as any).from('marketplace_availability').delete(),
  },
  group_files: {
    select: (query = '*') => (supabase as any).from('group_files').select(query),
    insert: (data: any) => (supabase as any).from('group_files').insert(data),
    update: (data: any) => (supabase as any).from('group_files').update(data),
    delete: () => (supabase as any).from('group_files').delete(),
  },
  rpc: (functionName: string, params?: any) => (supabase as any).rpc(functionName, params),
};

// Batch interface
export interface BatchData {
  id: string;
  farmer_id: string;
  crop_type: string;
  variety: string;
  harvest_quantity: number;
  price_per_kg: number;
  harvest_date: string;
  created_at: string;
  current_owner?: string;
  current_owner_id?: string;
  status: string;
  marketplace_status?: string;
  certification_level?: string;
  ipfs_hash?: string;
  group_id?: string;
  blockchain_tx_hash?: string;
  farmer_profile?: {
    full_name: string;
    farm_location?: string;
  };
}

// Transaction interface
export interface TransactionData {
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
export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  role: string;
  farm_location?: string;
  wallet_address?: string;
  reputation_score?: number;
  is_verified?: boolean;
  created_at: string;
}