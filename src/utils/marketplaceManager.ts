import { supabase } from '@/integrations/supabase/client';

/**
 * Marketplace Manager
 * Handles batch transitions between different marketplaces
 */
export class MarketplaceManager {
  /**
   * Purchase batch from farmer-distributor marketplace
   */
  static async purchaseFromFarmerMarketplace(batchId: string, distributorId: string) {
    try {
      console.log(`🔍 DEBUG: Purchasing batch ${batchId} for distributor ${distributorId}`);
      
      // Update batch ownership to distributor
      const { data: batchData, error: batchError } = await (supabase as any)
        .from('batches')
        .update({
          current_owner: distributorId,
          marketplace_status: 'distributor_inventory',
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId)
        .select();

      if (batchError) {
        console.error('🔍 ERROR: Batch update failed:', batchError);
        throw batchError;
      }

      console.log('🔍 DEBUG: Batch updated successfully:', batchData);
      return { success: true, data: batchData };
    } catch (error) {
      console.error('Error purchasing from farmer marketplace:', error);
      return { success: false, error };
    }
  }

  /**
   * Move batch from distributor inventory to distributor-retailer marketplace
   */
  static async moveToRetailerMarketplace(batchId: string) {
    try {
      console.log(`🔍 DEBUG: Moving batch ${batchId} to retailer marketplace`);
      
      // Update batch marketplace status
      const { data: batchData, error: batchError } = await (supabase as any)
        .from('batches')
        .update({
          marketplace_status: 'distributor_retailer_marketplace',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId)
        .select();

      if (batchError) {
        console.error('🔍 ERROR: Failed to update batch marketplace status:', batchError);
        throw batchError;
      }

      console.log('🔍 DEBUG: Batch moved to retailer marketplace successfully:', batchData);
      return { success: true, data: batchData };
    } catch (error) {
      console.error('Error moving to retailer marketplace:', error);
      return { success: false, error };
    }
  }

  /**
   * Purchase batch from distributor-retailer marketplace
   */
  static async purchaseFromDistributorMarketplace(batchId: string, retailerId: string) {
    try {
      // Update batch ownership to retailer
      const { error: batchError } = await (supabase as any)
        .from('batches')
        .update({
          current_owner: retailerId,
          marketplace_status: 'retailer_inventory',
          status: 'available'
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Remove from distributor-retailer marketplace
      const { error: removeError } = await (supabase as any)
        .from('marketplace_availability')
        .update({ is_available: false })
        .eq('batch_id', batchId)
        .eq('marketplace_type', 'distributor_retailer');

      if (removeError) throw removeError;

      return { success: true };
    } catch (error) {
      console.error('Error purchasing from distributor marketplace:', error);
      return { success: false, error };
    }
  }

  /**
   * Create transaction record for purchase
   */
  static async createTransaction(
    batchId: string,
    sellerId: string,
    buyerId: string,
    transactionType: string,
    quantity: number,
    price: number
  ) {
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .insert({
          batch_id: batchId,
          seller_id: sellerId,
          buyer_id: buyerId,
          transaction_type: transactionType,
          quantity,
          price,
          status: 'completed'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { success: false, error };
    }
  }

  /**
   * Get batches available for distributors
   */
  static async getFarmerMarketplaceBatches() {
    try {
      // Get available batches from farmer marketplace
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
          farmer_id,
          marketplace_status,
          current_owner,
          profiles!batches_farmer_id_fkey (
            full_name,
            farm_location
          )
        `)
        .eq('marketplace_status', 'farmer_marketplace')
        .eq('status', 'available');

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedData = (data || []).map(batch => ({
        batch_id: batch.id,
        batches: batch
      }));

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching farmer marketplace batches:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get batches available for retailers
   */
  static async getDistributorMarketplaceBatches() {
    try {
      // Get available batches from distributor marketplace
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
          current_owner,
          marketplace_status,
          profiles!batches_current_owner_fkey (
            full_name,
            farm_location
          )
        `)
        .eq('marketplace_status', 'distributor_retailer_marketplace')
        .eq('status', 'available');

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedData = (data || []).map(batch => ({
        batch_id: batch.id,
        batches: batch
      }));

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching distributor marketplace batches:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get distributor inventory
   */
  static async getDistributorInventory(distributorId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('batches')
        .select('*')
        .eq('current_owner', distributorId)
        .eq('marketplace_status', 'distributor_inventory');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching distributor inventory:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get retailer inventory
   */
  static async getRetailerInventory(retailerId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('batches')
        .select('*')
        .eq('current_owner', retailerId)
        .eq('marketplace_status', 'retailer_inventory');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching retailer inventory:', error);
      return { success: false, data: [] };
    }
  }
}