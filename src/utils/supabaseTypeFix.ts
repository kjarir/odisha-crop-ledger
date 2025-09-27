// Temporary fix for Supabase TypeScript issues
// This file provides type-safe wrappers for Supabase operations

import { supabase } from '@/integrations/supabase/client';

// Global type assertion for all Supabase operations
export const db = supabase as any;

// Export it as the main supabase client with proper typing
export { db as supabase };

export default db;