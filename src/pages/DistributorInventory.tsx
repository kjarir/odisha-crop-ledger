import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, MapPin, Calendar, DollarSign, Eye, Edit, Plus, Save, X, User, History, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { transactionManager } from '@/utils/transactionManager';
import { BlockchainTransactionHistory } from '@/components/BlockchainTransactionHistory';
import { useToast } from '@/components/ui/use-toast';

interface InventoryItem {
  id: string;
  crop_type: string;
  variety: string;
  harvest_quantity: number;
  price_per_kg: number;
  harvest_date: string;
  certification_level: string;
  status: string;
  farmer_name: string;
  farm_location: string;
  farmer_profile?: {
    full_name: string;
    farm_location: string;
  };
}

export const DistributorInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [registeredBatches, setRegisteredBatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 DEBUG: Fetching inventory for user:', user?.id);
      
      // Get batches owned by this distributor with farmer profile information
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          farmer_profile:profiles!batches_farmer_id_fkey (
            full_name,
            farm_location
          )
        `)
        .eq('current_owner', user?.id)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      console.log('🔍 DEBUG: Inventory query result:', { data, error });
      
      // Debug: Check all batches to see what's in the database
      const { data: allBatches } = await supabase
        .from('batches')
        .select('*')
        .limit(10);
      
      console.log('🔍 DEBUG: All batches in database:', allBatches);
      console.log('🔍 DEBUG: Looking for batches with current_owner:', user?.id);
      
      // Debug: Check what the current_owner field actually contains
      if (allBatches && allBatches.length > 0) {
        console.log('🔍 DEBUG: Batch current_owner values:', allBatches.map(b => ({ id: b.id, current_owner: b.current_owner, farmer_id: b.farmer_id })));
        
        // Check if any batch should be owned by this user
        const userOwnedBatches = allBatches.filter(b => b.current_owner === user?.id);
        console.log('🔍 DEBUG: Batches owned by current user:', userOwnedBatches);
        
        // Check the exact query that should return results
        const { data: directQuery } = await supabase
          .from('batches')
          .select('*')
          .eq('current_owner', user?.id)
          .eq('status', 'available');
        console.log('🔍 DEBUG: Direct query for user-owned batches:', directQuery);
        
        // Check if the issue is with the status field
        const { data: statusQuery } = await supabase
          .from('batches')
          .select('*')
          .eq('current_owner', user?.id);
        console.log('🔍 DEBUG: Query without status filter:', statusQuery);
      }
      
      // Debug: Check farmer profiles
      if (data && data.length > 0) {
        console.log('🔍 DEBUG: Batch with farmer profiles:', data.map(b => ({ 
          id: b.id, 
          farmer_id: b.farmer_id, 
          farmer_profile: b.farmer_profile 
        })));
      }

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }

      const formattedInventory = data?.map(batch => ({
        id: batch.id,
        crop_type: batch.crop_type || 'Unknown Crop',
        variety: batch.variety || 'Unknown Variety',
        harvest_quantity: batch.harvest_quantity || 0,
        price_per_kg: batch.price_per_kg || 0,
        harvest_date: batch.harvest_date || batch.created_at,
        certification_level: batch.certification_level || 'Standard',
        status: batch.status || 'available',
        farmer_name: batch.farmer_profile?.full_name || 'Unknown Farmer',
        farm_location: batch.farmer_profile?.farm_location || 'Unknown Location',
        marketplace_status: batch.marketplace_status
      })) || [];

      console.log('🔍 DEBUG: Formatted inventory:', formattedInventory);

      setInventory(formattedInventory);

      // Update registered batches set based on marketplace_status
      const registeredIds = new Set(
        data
          ?.filter(batch => batch.marketplace_status === 'distributor_retailer_marketplace')
          .map(batch => batch.id) || []
      );
      setRegisteredBatches(registeredIds);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'Premium':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'Organic':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'Standard':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.price_per_kg * item.harvest_quantity), 0);
  const totalQuantity = inventory.reduce((sum, item) => sum + item.harvest_quantity, 0);

  const handleViewDetails = async (item: InventoryItem) => {
    setSelectedItem(item);
    setLoadingHistory(true);
    
           try {
             console.log('🔍 DEBUG: Fetching complete transaction history for batch:', item.id);
             const transactions = await transactionManager.getCompleteTransactionHistory(item.id);
             console.log('🔍 DEBUG: Complete transaction history (DB + Blockchain):', transactions);
             setTransactionHistory(transactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setTransactionHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEditPrice = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditingPrice(item.price_per_kg.toString());
    setIsEditing(true);
  };

  const handleRegisterToMarketplace = async (item: any) => {
    try {
      console.log('🔍 DEBUG: Registering batch to distributor-retailer marketplace:', item.id);
      
      // Add to registered batches set immediately to disable button
      setRegisteredBatches(prev => new Set(prev).add(item.id));
      
      // Use the RPC function to register batch to retailer marketplace
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'register_batch_to_retailer_marketplace',
        { batch_id_param: item.id }
      );

      console.log('🔍 DEBUG: RPC registration result:', { rpcResult, rpcError });

      if (rpcError) {
        // Remove from registered set if update failed
        setRegisteredBatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
        throw new Error(`Failed to register to marketplace: ${rpcError.message}`);
      }

      toast({
        title: "Registered to Marketplace!",
        description: `Your ${item.crop_type} batch is now available for retailers to purchase.`,
      });

      // Refresh inventory
      fetchInventory();
    } catch (error) {
      console.error('Error registering to marketplace:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register batch to marketplace.",
      });
    }
  };

  const handleSavePrice = async () => {
    if (!selectedItem || !editingPrice) return;

    try {
      const newPrice = parseFloat(editingPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        alert('Please enter a valid price');
        return;
      }

      const { error } = await supabase
        .from('batches')
        .update({ price_per_kg: newPrice })
        .eq('id', selectedItem.id);

      if (error) {
        console.error('Error updating price:', error);
        alert('Failed to update price');
        return;
      }

      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, price_per_kg: newPrice }
          : item
      ));

      setIsEditing(false);
      setSelectedItem(null);
      setEditingPrice('');
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Failed to save price');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setEditingPrice('');
  };

  const handleDownloadCertificate = async (ipfsHash: string, transactionType: string, timestamp: string) => {
    try {
      console.log('🔍 DEBUG: Downloading certificate for IPFS hash:', ipfsHash);
      
      // Create IPFS URL
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      // Fetch the file from IPFS
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch certificate from IPFS');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const date = new Date(timestamp).toISOString().split('T')[0];
      const filename = `${transactionType.toLowerCase()}_certificate_${date}.pdf`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Certificate downloaded successfully:', filename);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Distributor Inventory</h1>
        <div className="flex gap-2">
          <Button onClick={fetchInventory} variant="outline">
            Refresh
          </Button>
          <Button 
            onClick={async () => {
              console.log('🔍 DEBUG: Checking distributor inventory state');
              
              // Get all batches
              const { data: allBatches } = await supabase
                .from('batches')
                .select('*')
                .order('created_at', { ascending: false });
              
              console.log('🔍 All batches:', allBatches);
              
              // Check distributor owned batches
              const distributorBatches = allBatches?.filter(batch => 
                batch.current_owner === user?.id
              ) || [];
              
              console.log('🔍 Distributor owned batches:', distributorBatches);
              
              // Force refresh
              fetchInventory();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔍 Debug Inventory
          </Button>
          <Button asChild>
            <Link to="/marketplace">
              <Plus className="h-4 w-4 mr-2" />
              Buy More from Farmers
            </Link>
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Debug Info:</strong> User ID: {user?.id} | Inventory Items: {inventory.length}
        </p>
                 <div className="flex gap-2 mt-2">
                   <Button 
                     onClick={async () => {
                       console.log('🔍 DEBUG: Starting manual fix for user:', user?.id);
                       
                       // Get all transactions where this user was the buyer
                       const { data: transactions, error: transError } = await supabase
                         .from('transactions')
                         .select('batch_id, buyer_id, seller_id, quantity, price, created_at')
                         .eq('buyer_id', user?.id)
                         .eq('transaction_type', 'PURCHASE');
                       
                       console.log('🔍 DEBUG: Found transactions:', transactions);
                       
                       if (transError) {
                         console.error('Error fetching transactions:', transError);
                         return;
                       }
                       
                       if (transactions && transactions.length > 0) {
                         const batchIds = transactions.map(t => t.batch_id);
                         console.log('🔍 DEBUG: Updating batches:', batchIds);
                         
                         // First, check which batches actually exist
                         const { data: existingBatches } = await supabase
                           .from('batches')
                           .select('id')
                           .in('id', batchIds);
                         
                         const existingBatchIds = existingBatches?.map(b => b.id) || [];
                         console.log('🔍 DEBUG: Existing batch IDs:', existingBatchIds);
                         
                         if (existingBatchIds.length > 0) {
                           // First, let's see what the current batch looks like
                           const { data: currentBatch } = await supabase
                             .from('batches')
                             .select('*')
                             .eq('id', existingBatchIds[0])
                             .single();
                           
                           console.log('🔍 DEBUG: Current batch before update:', currentBatch);
                           
                           // Update existing batches - fix the null current_owner issue
                           const { data: updateResult, error: updateError } = await supabase
                             .from('batches')
                             .update({ 
                               current_owner: user?.id,
                               status: 'available'
                             })
                             .in('id', existingBatchIds)
                             .select();
                           
                           console.log('🔍 DEBUG: Update result:', updateResult);
                           console.log('🔍 DEBUG: Update error:', updateError);
                           
                           if (updateError) {
                             console.error('Manual fix failed:', updateError);
                           } else {
                             console.log('Manual fix successful - updated batches:', updateResult);
                             
                             // Verify the update worked
                             const { data: verifyBatch } = await supabase
                               .from('batches')
                               .select('*')
                               .eq('id', existingBatchIds[0])
                               .single();
                             
                             console.log('🔍 DEBUG: Batch after update verification:', verifyBatch);
                           }
                         } else {
                           console.log('🔍 DEBUG: No matching batches found - creating dummy batch');
                           
                           // Create a dummy batch for the first transaction
                           const firstTransaction = transactions[0];
                           const { data: newBatch, error: createError } = await supabase
                             .from('batches')
                             .insert({
                               id: firstTransaction.batch_id,
                               current_owner: user?.id,
                               farmer_id: firstTransaction.seller_id,
                               crop_type: 'Purchased Crop',
                               variety: 'Unknown',
                               harvest_quantity: firstTransaction.quantity,
                               price_per_kg: firstTransaction.price / firstTransaction.quantity,
                               harvest_date: new Date().toISOString().split('T')[0],
                               certification_level: 'Standard',
                               status: 'available'
                             })
                             .select();
                           
                           console.log('🔍 DEBUG: Created batch:', newBatch);
                           
                           if (createError) {
                             console.error('Failed to create batch:', createError);
                           }
                         }
                         
                         fetchInventory();
                       } else {
                         console.log('No transactions found for this user');
                       }
                     }}
                     variant="outline"
                     size="sm"
                   >
                     Manual Fix Ownership
                   </Button>
                   
                   <div className="flex gap-2">
                     <Button 
                       onClick={async () => {
                         console.log('🔍 DEBUG: Direct database inspection');
                         
                         // Check all transactions
                         const { data: allTransactions } = await supabase
                           .from('transactions')
                           .select('*')
                           .limit(20);
                         console.log('🔍 DEBUG: ALL TRANSACTIONS:', allTransactions);
                         
                         // Check all batches
                         const { data: allBatches } = await supabase
                           .from('batches')
                           .select('*')
                           .limit(20);
                         console.log('🔍 DEBUG: ALL BATCHES:', allBatches);
                         
                         // Check your specific transactions
                         const { data: myTransactions } = await supabase
                           .from('transactions')
                           .select('*')
                           .eq('buyer_id', user?.id);
                         console.log('🔍 DEBUG: MY TRANSACTIONS:', myTransactions);
                         
                         // Check batches owned by you
                         const { data: myBatches } = await supabase
                           .from('batches')
                           .select('*')
                           .eq('current_owner', user?.id);
                         console.log('🔍 DEBUG: MY BATCHES (current_owner):', myBatches);
                         
                         // Show the mismatch
                         if (myTransactions && allBatches) {
                           const transactionBatchIds = myTransactions.map(t => t.batch_id);
                           const actualBatchIds = allBatches.map(b => b.id);
                           console.log('🔍 DEBUG: Transaction batch IDs:', transactionBatchIds);
                           console.log('🔍 DEBUG: Actual batch IDs:', actualBatchIds);
                           console.log('🔍 DEBUG: Matching IDs:', transactionBatchIds.filter(id => actualBatchIds.includes(id)));
                           
                           // Check ownership of transaction batches
                           transactionBatchIds.forEach(batchId => {
                             const batch = allBatches.find(b => b.id === batchId);
                             if (batch) {
                               console.log(`🔍 DEBUG: Batch ${batchId} - current_owner: ${batch.current_owner}, farmer_id: ${batch.farmer_id}, expected_owner: ${user?.id}`);
                             }
                           });
                         }
                       }}
                       variant="outline"
                       size="sm"
                     >
                       Debug Database
                     </Button>
                     
                     <Button 
                       onClick={async () => {
                         console.log('🔍 DEBUG: FORCE FIXING BATCH OWNERSHIP');
                         
                         // Get the specific batch ID from the logs (updated to new batch ID)
                         const batchId = '6cd7cbb7-803f-42c1-a817-7be587ae6442';
                         
                         console.log('🔍 DEBUG: Force updating batch:', batchId, 'to owner:', user?.id);
                         
                         // Try multiple update methods
                         
                         // Method 1: Direct update by ID
                         const { data: update1, error: error1 } = await supabase
                           .from('batches')
                           .update({ 
                             current_owner: user?.id,
                             status: 'available',
                             marketplace_status: 'distributor_marketplace'
                           })
                           .eq('id', batchId)
                           .select();
                         
                         console.log('🔍 DEBUG: Method 1 (by ID) - result:', update1, 'error:', error1);
                         
                         // Method 2: Update by null current_owner
                         const { data: update2, error: error2 } = await supabase
                           .from('batches')
                           .update({ 
                             current_owner: user?.id,
                             status: 'available',
                             marketplace_status: 'distributor_marketplace'
                           })
                           .is('current_owner', null)
                           .select();
                         
                         console.log('🔍 DEBUG: Method 2 (by null) - result:', update2, 'error:', error2);
                         
                         // Method 3: Use RPC function if available
                         try {
                           const { data: rpcResult, error: rpcError } = await supabase.rpc('update_batch_owner', {
                             batch_id: batchId,
                             new_owner: user?.id
                           });
                           console.log('🔍 DEBUG: Method 3 (RPC) - result:', rpcResult, 'error:', rpcError);
                         } catch (rpcErr) {
                           console.log('🔍 DEBUG: RPC method not available:', rpcErr);
                         }
                         
                         // Verify the update worked
                         const { data: verifyBatch } = await supabase
                           .from('batches')
                           .select('*')
                           .eq('id', batchId)
                           .single();
                         
                         console.log('🔍 DEBUG: Batch after force update:', verifyBatch);
                         
                         if (verifyBatch && verifyBatch.current_owner === user?.id) {
                           console.log('✅ SUCCESS: Batch ownership force updated!');
                           fetchInventory();
                         } else {
                           console.log('❌ FAILED: Batch ownership still not updated');
                         }
                       }}
                       variant="outline"
                       size="sm"
                       className="bg-red-100 text-red-800 hover:bg-red-200"
                     >
                       Force Fix Ownership
                     </Button>
                     
                     <Button 
                       onClick={async () => {
                         console.log('🔍 DEBUG: SHOWING EXACT BATCH DATA');
                         
                         // Get the specific batch that was mentioned in logs
                         const { data: specificBatch } = await supabase
                           .from('batches')
                           .select('*')
                           .eq('id', '0d02e2d6-27d9-4521-805e-15f81e67e74c')
                           .single();
                         
                         console.log('🔍 DEBUG: Specific batch data:', specificBatch);
                         
                         if (specificBatch) {
                           console.log('🔍 DEBUG: Batch details:');
                           console.log('  - ID:', specificBatch.id);
                           console.log('  - current_owner:', specificBatch.current_owner);
                           console.log('  - farmer_id:', specificBatch.farmer_id);
                           console.log('  - status:', specificBatch.status);
                           console.log('  - crop_type:', specificBatch.crop_type);
                           console.log('  - variety:', specificBatch.variety);
                           
                           // Check if this batch should appear in inventory
                           const shouldAppear = specificBatch.current_owner === user?.id && specificBatch.status === 'available';
                           console.log('🔍 DEBUG: Should this batch appear in inventory?', shouldAppear);
                           console.log('🔍 DEBUG: Current user ID:', user?.id);
                           console.log('🔍 DEBUG: Batch current_owner matches user?', specificBatch.current_owner === user?.id);
                           console.log('🔍 DEBUG: Batch status is available?', specificBatch.status === 'available');
                         }
                       }}
                       variant="outline"
                       size="sm"
                       className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                     >
                       Show Batch Data
                     </Button>
                   </div>
                 </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity} kg</div>
            <p className="text-xs text-muted-foreground">Available for sale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading inventory...</p>
        </div>
      ) : inventory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.crop_type}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.variety}</p>
                  </div>
                  <Badge className={getCertificationColor(item.certification_level)}>
                    {item.certification_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{item.harvest_quantity} kg available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>₹{item.price_per_kg}/kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Harvested: {new Date(item.harvest_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>From: {item.farmer_name}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="font-bold text-lg">₹{(item.price_per_kg * item.harvest_quantity).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(item)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className={`flex-1 ${
                      registeredBatches.has(item.id) 
                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={() => handleRegisterToMarketplace(item)}
                    disabled={registeredBatches.has(item.id)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    {registeredBatches.has(item.id) ? 'Registered ✓' : 'Register to Marketplace'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditPrice(item)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Price
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Inventory Yet</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any products in your inventory yet.
            </p>
            <Button asChild>
              <Link to="/marketplace">Start Buying from Farmers</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Details Modal */}
      <Dialog open={!!selectedItem && !isEditing} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {selectedItem?.crop_type} - {selectedItem?.variety}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete batch information and traceability details
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCertificationColor(selectedItem?.certification_level || 'Standard')}>
                  {selectedItem?.certification_level || 'Standard'}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {selectedItem?.status || 'available'}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Crop Type:</span>
                      <p className="font-semibold">{selectedItem.crop_type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Variety:</span>
                      <p className="font-semibold">{selectedItem.variety}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Harvest Quantity:</span>
                      <p className="font-semibold">{selectedItem.harvest_quantity} kg</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Grading:</span>
                      <p className="font-semibold">{selectedItem.certification_level}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Freshness Duration:</span>
                      <p className="font-semibold">7 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Sowing Date:</span>
                      <p className="font-semibold">{new Date(selectedItem.harvest_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Harvest Date:</span>
                      <p className="font-semibold">{new Date(selectedItem.harvest_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Registered:</span>
                      <p className="font-semibold">{new Date(selectedItem.harvest_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Price per kg:</span>
                      <p className="font-semibold text-lg">₹{selectedItem.price_per_kg}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Total Value:</span>
                      <p className="font-semibold text-lg">₹{(selectedItem.price_per_kg * selectedItem.harvest_quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Farmer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Farmer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Farmer Name:</span>
                      <p className="font-semibold">{selectedItem.farmer_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Location:</span>
                      <p className="font-semibold">{selectedItem.farm_location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Transaction History
                    </CardTitle>
                    {transactionHistory.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Download all certificates that have IPFS hashes
                          const certificatesWithHashes = transactionHistory.filter(t => t.ipfsHash);
                          certificatesWithHashes.forEach(transaction => {
                            handleDownloadCertificate(
                              transaction.ipfsHash, 
                              transaction.type, 
                              transaction.timestamp
                            );
                          });
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download All Certificates
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Loading transaction history...</span>
                    </div>
                  ) : transactionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {transactionHistory.map((transaction, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {transaction.type === 'HARVEST' ? 'Harvest' : 
                                 transaction.type === 'PURCHASE' ? 'Purchase' : 
                                 transaction.type === 'TRANSFER' ? 'Transfer' : transaction.type}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">From:</span> {transaction.fromName || transaction.from}
                            </div>
                            <div>
                              <span className="font-medium">To:</span> {transaction.toName || transaction.to}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {transaction.quantity} kg
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> ₹{transaction.price || 'N/A'}
                            </div>
                          </div>
                          {transaction.ipfsHash && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Certificate:</span> {transaction.ipfsHash.substring(0, 20)}...
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleDownloadCertificate(
                                  transaction.ipfsHash, 
                                  transaction.type, 
                                  transaction.timestamp
                                )}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No transaction history found</p>
                    </div>
                     )}
                   </CardContent>
                 </Card>

                 {/* Blockchain Transaction History */}
                 <BlockchainTransactionHistory 
                   batchId={selectedItem.id} 
                   className="mt-6"
                 />
               </div>
             )}
           </DialogContent>
         </Dialog>

      {/* Edit Price Modal */}
      <Dialog open={isEditing} onOpenChange={handleCancelEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Product</Label>
                <p className="text-lg font-semibold">{selectedItem.crop_type} - {selectedItem.variety}</p>
              </div>
              <div>
                <Label htmlFor="price">Price per kg (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  placeholder="Enter new price"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSavePrice}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Price
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
