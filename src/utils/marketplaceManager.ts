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
      // Update batch ownership to distributor
      const { error: batchError } = await (supabase as any)
        .from('batches')
        .update({
          current_owner: distributorId,
          marketplace_status: 'distributor_inventory',
          status: 'available'
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Remove from farmer-distributor marketplace
      const { error: removeError } = await (supabase as any)
        .from('marketplace_availability')
        .update({ is_available: false })
        .eq('batch_id', batchId)
        .eq('marketplace_type', 'farmer_distributor');

      if (removeError) throw removeError;

      return { success: true };
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
      // Update batch marketplace status
      const { error: batchError } = await (supabase as any)
        .from('batches')
        .update({
          marketplace_status: 'distributor_retailer_marketplace'
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Add to distributor-retailer marketplace
      const { error: marketplaceError } = await (supabase as any)
        .from('marketplace_availability')
        .insert({
          batch_id: batchId,
          marketplace_type: 'distributor_retailer',
          is_available: true
        });

      if (marketplaceError) throw marketplaceError;

      return { success: true };
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
      const { data, error } = await (supabase as any)
        .from('marketplace_availability')
        .select(`
          batch_id,
          batches (
            id,
            crop_type,
            variety,
            harvest_quantity,
            price_per_kg,
            total_price,
            harvest_date,
            quality_score,
            farmer_id,
            profiles!batches_farmer_id_fkey (
              full_name,
              farm_location
            )
          )
        `)
        .eq('marketplace_type', 'farmer_distributor')
        .eq('is_available', true);

      if (error) throw error;
      return { success: true, data: data || [] };
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
      const { data, error } = await (supabase as any)
        .from('marketplace_availability')
        .select(`
          batch_id,
          batches (
            id,
            crop_type,
            variety,
            harvest_quantity,
            price_per_kg,
            total_price,
            harvest_date,
            quality_score,
            current_owner,
            profiles!batches_current_owner_fkey (
              full_name,
              farm_location
            )
          )
        `)
        .eq('marketplace_type', 'distributor_retailer')
        .eq('is_available', true);

      if (error) throw error;
      return { success: true, data: data || [] };
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