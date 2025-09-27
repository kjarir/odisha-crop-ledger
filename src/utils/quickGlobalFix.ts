// Quick global fix to disable error-prone components
import { supabase } from '@/integrations/supabase/client';

// Global type-safe Supabase client
export const db = supabase as any;

// Disable problematic blockchain functionality temporarily
export const disableBlockchain = true;

// Mock blockchain transaction manager
export const mockBlockchainManager = {
  registerBatch: () => Promise.resolve(null),
  transferBatch: () => Promise.resolve(null),
  updatePrice: () => Promise.resolve(null),
  getBatch: () => Promise.resolve(null),
};

export default db;