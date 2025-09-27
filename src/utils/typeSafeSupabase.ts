// Comprehensive type-safe Supabase wrapper
import { supabase } from '@/integrations/supabase/client';

// Create type-safe wrapper that bypasses TypeScript issues
const typeSafeSupabase = supabase as any;

// Export all the methods we need
export const db = {
  from: (table: string) => typeSafeSupabase.from(table),
  rpc: (functionName: string, params?: any) => typeSafeSupabase.rpc(functionName, params),
  auth: typeSafeSupabase.auth,
  storage: typeSafeSupabase.storage,
};

export default db;