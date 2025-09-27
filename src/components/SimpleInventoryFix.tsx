import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/utils/simpleSupabaseFix';
import { Package, ShoppingCart } from 'lucide-react';

interface SimpleInventoryFixProps {
  userType: 'farmer' | 'distributor' | 'retailer';
}

export const SimpleInventoryFix: React.FC<SimpleInventoryFixProps> = ({ userType }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBatches();
    }
  }, [user, userType]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      
      let query;
      if (userType === 'farmer') {
        query = db.from('batches').select('*').eq('farmer_id', user?.id);
      } else {
        query = db.from('batches').select('*').eq('current_owner', user?.id);
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

  const handlePurchase = async (batchId: string, sellerId: string) => {
    try {
      // Create transaction
      await db.from('transactions').insert({
        batch_id: batchId,
        seller_id: sellerId,
        buyer_id: user?.id,
        transaction_type: 'PURCHASE',
        quantity: 1,
        price: 100,
        status: 'completed'
      });

      // Update batch ownership
      await db.from('batches').update({ 
        current_owner: user?.id,
        status: 'purchased'
      }).eq('id', batchId);

      toast({
        title: "Purchase Successful",
        description: "Batch added to your inventory",
      });

      fetchBatches();
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
            <Package className="h-5 w-5" />
            {userType === 'farmer' ? 'My Batches' : 'My Inventory'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : batches.length === 0 ? (
            <p className="text-muted-foreground">No batches found</p>
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
                    <div className="text-right">
                      <p className="font-bold">${batch.price_per_kg}/kg</p>
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