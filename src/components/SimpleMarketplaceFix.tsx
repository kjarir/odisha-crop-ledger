import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/utils/simpleSupabaseFix';
import { ShoppingCart, Store } from 'lucide-react';

interface SimpleMarketplaceFixProps {
  marketplaceType: 'farmer_distributor' | 'distributor_retailer';
}

export const SimpleMarketplaceFix: React.FC<SimpleMarketplaceFixProps> = ({ marketplaceType }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAvailableBatches();
    }
  }, [user, marketplaceType]);

  const fetchAvailableBatches = async () => {
    try {
      setLoading(true);
      
      // Get available batches based on marketplace type
      let query;
      if (marketplaceType === 'farmer_distributor') {
        // Show batches owned by farmers
        query = db.from('batches')
          .select('*')
          .eq('status', 'available')
          .neq('farmer_id', user?.id); // Don't show user's own batches
      } else {
        // Show batches owned by distributors
        query = db.from('batches')
          .select('*')
          .eq('marketplace_status', 'distributor_retailer_marketplace')
          .neq('current_owner', user?.id); // Don't show user's own batches
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching batches:', error);
        return;
      }
      
      setBatches(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (batch: any) => {
    try {
      // Create transaction
      await db.from('transactions').insert({
        batch_id: batch.id,
        seller_id: batch.current_owner || batch.farmer_id,
        buyer_id: user?.id,
        transaction_type: 'PURCHASE',
        quantity: batch.harvest_quantity,
        price: batch.price_per_kg * batch.harvest_quantity,
        status: 'completed'
      });

      // Update batch ownership
      await db.from('batches').update({ 
        current_owner: user?.id,
        status: 'purchased'
      }).eq('id', batch.id);

      toast({
        title: "Purchase Successful",
        description: `${batch.crop_type} - ${batch.variety} purchased successfully`,
      });

      fetchAvailableBatches();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "Unable to complete purchase",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {marketplaceType === 'farmer_distributor' ? 'Farmer Marketplace' : 'Distributor Marketplace'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : batches.length === 0 ? (
            <p className="text-muted-foreground">No batches available</p>
          ) : (
            <div className="grid gap-4">
              {batches.map((batch) => (
                <Card key={batch.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{batch.crop_type} - {batch.variety}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {batch.harvest_quantity} kg
                      </p>
                      <Badge variant="secondary">{batch.status}</Badge>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold">${batch.price_per_kg}/kg</p>
                      <Button 
                        onClick={() => handlePurchase(batch)}
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};