# Database Setup Instructions

## Quick Fix for Current Errors

The errors you're seeing are because the `transactions` table doesn't exist in your Supabase database yet. Here's how to fix it:

### Step 1: Create the Transactions Table

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from `supabase_transactions_table.sql` file
4. Run the SQL to create the table and indexes

### Step 2: Alternative - Use the Migration Button

1. Go to your app's Admin page (`/admin`)
2. Click on the "Settings" tab
3. Click "Run Database Migration" button
4. Follow the instructions shown in the console

### Step 3: Test the System

1. Go to the Admin page
2. Use the "Transaction System Test" component
3. Run the full test to verify everything works

## What the SQL Does

The SQL creates:
- `transactions` table with all necessary columns
- Indexes for better performance
- Row Level Security (RLS) policies
- Proper permissions for authenticated users

## After Setup

Once the table is created:
- Batch registration will create harvest transactions
- Purchases will create purchase transactions
- All transactions will be stored immutably
- Certificates will show complete transaction history
- Verification system will work properly

## Troubleshooting

If you still see errors:
1. Make sure the table was created successfully
2. Check that RLS policies are enabled
3. Verify that your Supabase connection is working
4. Try running the test component in the admin panel

The system is designed to handle missing tables gracefully, so once you create the table, everything should work perfectly!
