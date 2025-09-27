import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceManager } from '@/utils/marketplaceManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Batch {
  id: string;
  crop_type: string;
  variety: string;
  harvest_quantity: number;
  price_per_kg: number;
  total_price: number;
  harvest_date: string;
  quality_score: number;
  marketplace_status: string;
  current_owner?: string;
}

interface MarketplaceBatch {
  batch_id: string;
  batches: Batch & {
    profiles: {
      full_name: string;
      farm_location: string;
    };
  };
}

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [inventory, setInventory] = useState<Batch[]>([]);
  const [marketplaceBatches, setMarketplaceBatches] = useState<MarketplaceBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch retailer inventory
      if (profile?.id) {
        const inventoryResult = await MarketplaceManager.getRetailerInventory(profile.id);
        if (inventoryResult.success) {
          setInventory(inventoryResult.data);
        }
      }

      // Fetch distributor marketplace batches
      const marketplaceResult = await MarketplaceManager.getDistributorMarketplaceBatches();
      if (marketplaceResult.success) {
        setMarketplaceBatches(marketplaceResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseFromDistributor = async (batch: Batch) => {
    if (!profile?.id) {
      toast.error('Profile not found');
      return;
    }

    try {
      // Purchase batch
      const purchaseResult = await MarketplaceManager.purchaseFromDistributorMarketplace(
        batch.id,
        profile.id
      );

      if (!purchaseResult.success) {
        throw purchaseResult.error;
      }

      // Create transaction record
      await MarketplaceManager.createTransaction(
        batch.id,
        batch.current_owner || '',
        profile.id,
        'distributor_to_retailer',
        batch.harvest_quantity,
        batch.total_price
      );

      toast.success('Batch purchased successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error purchasing batch:', error);
      toast.error('Failed to purchase batch');
    }
  };

  if (loading) {
    return <div className="p-6 bg-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
        <Badge variant="secondary">
          {profile?.full_name || 'Retailer'}
        </Badge>
      </div>

      {/* Inventory Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">My Inventory</h2>
        {inventory.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">No batches in inventory</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventory.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {batch.crop_type} - {batch.variety}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Quantity:</strong> {batch.harvest_quantity}kg</p>
                  <p><strong>Price:</strong> ₹{batch.price_per_kg}/kg</p>
                  <p><strong>Total:</strong> ₹{batch.total_price}</p>
                  <p><strong>Quality Score:</strong> {batch.quality_score || 'N/A'}</p>
                  <Badge variant="outline" className="mt-2">
                    Ready for Sale
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Distributor Marketplace Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Available from Distributors</h2>
        {marketplaceBatches.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">No batches available from distributors</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {marketplaceBatches.map((item) => {
              const batch = item.batches;
              return (
                <Card key={batch.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {batch.crop_type} - {batch.variety}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      From: {batch.profiles?.full_name || 'Unknown Distributor'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Quantity:</strong> {batch.harvest_quantity}kg</p>
                    <p><strong>Price:</strong> ₹{batch.price_per_kg}/kg</p>
                    <p><strong>Total:</strong> ₹{batch.total_price}</p>
                    <p><strong>Harvest Date:</strong> {new Date(batch.harvest_date).toLocaleDateString()}</p>
                    <p><strong>Quality Score:</strong> {batch.quality_score || 'N/A'}</p>
                    <Button 
                      onClick={() => handlePurchaseFromDistributor(batch)}
                      className="w-full mt-4"
                    >
                      Purchase from Distributor
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}