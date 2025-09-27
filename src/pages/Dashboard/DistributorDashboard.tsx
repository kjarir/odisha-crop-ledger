import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SimplePurchaseManager } from '@/utils/simplePurchaseManager';
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
  farmer_id?: string;
  current_owner?: string;
  profiles?: {
    full_name: string;
    farm_location: string;
  };
}

export default function DistributorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [inventory, setInventory] = useState<Batch[]>([]);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchData();
    }
  }, [user]);

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
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get user's inventory using user.id (not profile.id)
      const inventoryResult = await SimplePurchaseManager.getUserBatches(user.id);
      if (inventoryResult.success) {
        setInventory(inventoryResult.data);
      }

      // Get available batches for purchase
      const availableResult = await SimplePurchaseManager.getAvailableBatches(user.id);
      if (availableResult.success) {
        setAvailableBatches(availableResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (batch: Batch) => {
    if (!user?.id) {
      toast.error('Please log in to purchase');
      return;
    }

    try {
      const result = await SimplePurchaseManager.purchaseBatch(
        batch.id,
        user.id,
        batch.farmer_id || batch.current_owner || 'unknown',
        batch.harvest_quantity,
        batch.total_price
      );

      if (result.success) {
        toast.success(`Successfully purchased ${batch.crop_type}!`);
        fetchData(); // Refresh data
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase batch');
    }
  };

  if (loading) {
    return <div className="p-6 bg-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
        <Badge variant="secondary">
          {profile?.full_name || 'Distributor'}
        </Badge>
      </div>

      {/* Inventory Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">My Inventory ({inventory.length})</h2>
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
                    Owned
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Batches Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Available for Purchase ({availableBatches.length})</h2>
        {availableBatches.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">No batches available for purchase</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableBatches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {batch.crop_type} - {batch.variety}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    From: {batch.profiles?.full_name || 'Unknown Farmer'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Quantity:</strong> {batch.harvest_quantity}kg</p>
                  <p><strong>Price:</strong> ₹{batch.price_per_kg}/kg</p>
                  <p><strong>Total:</strong> ₹{batch.total_price}</p>
                  <p><strong>Harvest Date:</strong> {new Date(batch.harvest_date).toLocaleDateString()}</p>
                  <p><strong>Quality Score:</strong> {batch.quality_score || 'N/A'}</p>
                  <Button 
                    onClick={() => handlePurchase(batch)}
                    className="w-full mt-4"
                  >
                    Purchase for ₹{batch.total_price}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}