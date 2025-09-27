import { supabase } from '@/integrations/supabase/client';

// Simple global fix - export supabase with type assertion
export const db = supabase as any;

// Helper for batch operations
export const batchOps = {
  getAll: () => db.from('batches').select('*'),
  getByOwner: (ownerId: string) => db.from('batches').select('*').eq('current_owner', ownerId),
  getAvailable: () => db.from('batches').select('*').eq('status', 'available'),
  updateOwner: (batchId: string, ownerId: string) => db.from('batches').update({ current_owner: ownerId }).eq('id', batchId),
};

// Helper for transaction operations
export const transactionOps = {
  getAll: () => db.from('transactions').select('*'),
  getByUser: (userId: string) => db.from('transactions').select('*').eq('buyer_id', userId),
  create: (data: any) => db.from('transactions').insert(data),
};

export default db;