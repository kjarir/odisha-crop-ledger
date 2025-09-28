-- Check the actual foreign key constraint names
-- Run this in your Supabase SQL Editor

-- Check all foreign key constraints for marketplace table
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'marketplace';

-- Check if marketplace table exists and its structure
SELECT 'Marketplace table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'marketplace' 
ORDER BY ordinal_position;

-- Check if profiles table exists
SELECT 'Profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if batches table exists
SELECT 'Batches table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'batches' 
ORDER BY ordinal_position;
