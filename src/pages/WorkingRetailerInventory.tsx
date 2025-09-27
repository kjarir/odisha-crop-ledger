import React from 'react';
import { SimpleInventoryFix } from '@/components/SimpleInventoryFix';
import { SimpleMarketplaceFix } from '@/components/SimpleMarketplaceFix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Store } from 'lucide-react';

export default function WorkingRetailerInventory() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
      
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            My Inventory
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Buy from Distributors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <SimpleInventoryFix userType="retailer" />
        </TabsContent>
        
        <TabsContent value="marketplace" className="space-y-4">
          <SimpleMarketplaceFix marketplaceType="distributor_retailer" />
        </TabsContent>
      </Tabs>
    </div>
  );
}