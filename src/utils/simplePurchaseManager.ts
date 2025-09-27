import { supabase } from '@/integrations/supabase/client';

/**
 * Simple Purchase Manager - Direct database operations for purchases
 */
export class SimplePurchaseManager {
  /**
   * Purchase a batch and update ownership
   */
  static async purchaseBatch(
    batchId: string,
    buyerId: string,
    sellerId: string,
    quantity: number,
    price: number
  ) {
    try {
      console.log(`🔍 PURCHASE: Starting purchase of batch ${batchId} by user ${buyerId}`);
      
      // Step 1: Update batch ownership
      const { data: batchUpdate, error: batchError } = await (supabase as any)
        .from('batches')
        .update({
          current_owner: buyerId,
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId)
        .select();

      if (batchError) {
        console.error('🔍 ERROR: Failed to update batch ownership:', batchError);
        throw new Error(`Failed to update batch: ${batchError.message}`);
      }

      console.log('🔍 SUCCESS: Batch ownership updated:', batchUpdate);

      // Step 2: Create transaction record
      const transactionData = {
        batch_id: batchId,
        buyer_id: buyerId,
        seller_id: sellerId,
        transaction_type: 'purchase',
        quantity: quantity,
        price: price,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      const { data: transactionResult, error: transactionError } = await (supabase as any)
        .from('transactions')
        .insert(transactionData)
        .select();

      if (transactionError) {
        console.error('🔍 ERROR: Failed to create transaction:', transactionError);
        // Don't throw here - batch ownership is more important
        console.warn('🔍 WARNING: Continuing despite transaction error');
      } else {
        console.log('🔍 SUCCESS: Transaction created:', transactionResult);
      }

      return { 
        success: true, 
        data: { 
          batch: batchUpdate, 
          transaction: transactionResult 
        } 
      };
    } catch (error) {
      console.error('🔍 ERROR: Purchase failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's purchased batches
   */
  static async getUserBatches(userId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('batches')
        .select(`
          id,
          crop_type,
          variety,
          harvest_quantity,
          price_per_kg,
          total_price,
          harvest_date,
          quality_score,
          status,
          current_owner,
          farmer_id,
          marketplace_status,
          created_at
        `)
        .eq('current_owner', userId)
        .eq('status', 'available');

      if (error) throw error;
      
      console.log(`🔍 USER BATCHES: Found ${data?.length || 0} batches for user ${userId}`);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('🔍 ERROR: Failed to get user batches:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get available batches for purchase (not owned by current user)
   */
  static async getAvailableBatches(currentUserId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('batches')
        .select(`
          id,
          crop_type,
          variety,
          harvest_quantity,
          price_per_kg,
          total_price,
          harvest_date,
          quality_score,
          status,
          current_owner,
          farmer_id,
          marketplace_status,
          profiles!batches_farmer_id_fkey (
            full_name,
            farm_location
          )
        `)
        .eq('status', 'available')
        .neq('current_owner', currentUserId)
        .or(`current_owner.is.null,farmer_id.neq.${currentUserId}`);

      if (error) throw error;
      
      console.log(`🔍 AVAILABLE BATCHES: Found ${data?.length || 0} batches available for purchase`);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('🔍 ERROR: Failed to get available batches:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get user's purchase transactions
   */
  static async getUserTransactions(userId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('🔍 ERROR: Failed to get user transactions:', error);
      return { success: false, data: [] };
    }
  }
}