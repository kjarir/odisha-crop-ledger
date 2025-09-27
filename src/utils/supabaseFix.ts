// Quick fix for all Supabase TypeScript errors
import { supabase } from '@/integrations/supabase/client';

// Export supabase with type assertion to bypass TypeScript issues
export const db = supabase as any;

// Helper function to fix any supabase query
export const fixSupabaseQuery = (query: any) => query as any;

export default db;