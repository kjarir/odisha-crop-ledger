import { supabase } from '@/integrations/supabase/client';

// Wrapper to provide typed Supabase operations
export const typedSupabase = {
  from: (table: string) => ({
    select: (query?: string) => (supabase as any).from(table).select(query || '*'),
    insert: (data: any) => (supabase as any).from(table).insert(data),
    update: (data: any) => (supabase as any).from(table).update(data),
    delete: () => (supabase as any).from(table).delete(),
    upsert: (data: any) => (supabase as any).from(table).upsert(data),
  }),
  rpc: (functionName: string, params?: any) => (supabase as any).rpc(functionName, params),
  auth: supabase.auth,
  storage: supabase.storage,
};

export default typedSupabase;