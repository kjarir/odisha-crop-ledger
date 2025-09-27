// Fixed database operations with proper type assertions
import { supabase } from '@/integrations/supabase/client';

// Helper function to add type assertion to any supabase query
export const fixedSupabase = {
  from: (tableName: string) => ({
    select: (query?: string) => (supabase as any).from(tableName).select(query || '*'),
    insert: (data: any) => (supabase as any).from(tableName).insert(data),
    update: (data: any) => (supabase as any).from(tableName).update(data),
    delete: () => (supabase as any).from(tableName).delete(),
    upsert: (data: any) => (supabase as any).from(tableName).upsert(data),
  }),
  rpc: (functionName: string, params?: any) => (supabase as any).rpc(functionName, params),
  auth: supabase.auth,
  storage: supabase.storage,
};

// Quick fix for existing supabase calls - just add this before any .from() call
export const fixSupabaseCall = (supabaseInstance: any) => supabaseInstance as any;

export default fixedSupabase;