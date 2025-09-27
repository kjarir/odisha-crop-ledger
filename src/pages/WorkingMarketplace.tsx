import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleMarketplaceFix } from '@/components/SimpleMarketplaceFix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkingMarketplace() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to access the marketplace</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine marketplace type based on user role
  const role = (user as any)?.user_metadata?.role || 'farmer';
  const marketplaceType = role === 'farmer' ? 'farmer_distributor' : 'distributor_retailer';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <SimpleMarketplaceFix marketplaceType={marketplaceType} />
    </div>
  );
}