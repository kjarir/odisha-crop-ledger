import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, MapPin, Calendar, DollarSign, Eye, Plus, ShoppingCart, User, History, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { transactionManager } from '@/utils/transactionManager';
import { BlockchainTransactionHistory } from '@/components/BlockchainTransactionHistory';

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
}

export const RetailerInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log('🔍 DEBUG: Fetching retailer inventory for user:', user?.id);
      
      // Get batches owned by this retailer
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

      console.log('🔍 DEBUG: Retailer inventory query result:', { data, error });

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
        farm_location: batch.farmer_profile?.farm_location || 'Unknown Location'
      })) || [];

      console.log('🔍 DEBUG: Formatted retailer inventory:', formattedInventory);
      
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
      }
      
      setInventory(formattedInventory);
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

  const handleViewDetails = async (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
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

  const handleSellToCustomer = (item: InventoryItem) => {
    // For now, just show an alert - you can implement a proper customer sale modal later
    alert(`Selling ${item.crop_type} - ${item.variety} to customer. This feature will be implemented soon!`);
  };

  const handleDownloadCertificate = async (ipfsHash: string, transactionType: string, timestamp: string) => {
    try {
      console.log('🔍 DEBUG: Downloading certificate for IPFS hash:', ipfsHash);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch certificate from IPFS');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date(timestamp).toISOString().split('T')[0];
      const filename = `${transactionType.toLowerCase()}_certificate_${date}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('✅ Certificate downloaded successfully:', filename);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.price_per_kg * item.harvest_quantity), 0);
  const totalQuantity = inventory.reduce((sum, item) => sum + item.harvest_quantity, 0);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Retailer Inventory</h1>
          <p className="text-muted-foreground">Manage your retail inventory and serve customers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchInventory} variant="outline">
            Refresh
          </Button>
          <Button asChild>
            <Link to="/retailer-marketplace">
              <Plus className="h-4 w-4 mr-2" />
              Buy from Distributors
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
              console.log('🔍 DEBUG: Starting manual fix for retailer user:', user?.id);
              
              // Get all transactions where this user was the buyer
              const { data: transactions, error: transError } = await supabase
                .from('transactions')
                .select('batch_id, buyer_id, seller_id')
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
                  // Update existing batches
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
                  }
                } else {
                  console.log('🔍 DEBUG: No matching batches found');
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
          
          <Button 
            onClick={async () => {
              console.log('🔍 DEBUG: Direct database inspection for retailer');
              
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
              
              // Show the mismatch
              if (myTransactions && allBatches) {
                const transactionBatchIds = myTransactions.map(t => t.batch_id);
                const actualBatchIds = allBatches.map(b => b.id);
                console.log('🔍 DEBUG: Transaction batch IDs:', transactionBatchIds);
                console.log('🔍 DEBUG: Actual batch IDs:', actualBatchIds);
                console.log('🔍 DEBUG: Matching IDs:', transactionBatchIds.filter(id => actualBatchIds.includes(id)));
              }
            }}
            variant="outline"
            size="sm"
          >
            Debug Database
          </Button>
          
          <Button 
            onClick={async () => {
              console.log('🔍 DEBUG: FORCE UPDATE ALL BATCHES for retailer');
              
              // Get all batches and force update them to be owned by this user
              const { data: allBatches } = await supabase
                .from('batches')
                .select('*');
              
              console.log('🔍 DEBUG: All batches found:', allBatches);
              console.log('🔍 DEBUG: Full batch details:', JSON.stringify(allBatches, null, 2));
              
              if (allBatches && allBatches.length > 0) {
                // Get the first batch ID
                const firstBatchId = allBatches[0].id;
                console.log('🔍 DEBUG: First batch ID:', firstBatchId);
                
                // Try using RPC function first
                console.log('🔍 DEBUG: Trying RPC function...');
                const { data: rpcResult, error: rpcError } = await supabase.rpc('update_batch_owner', {
                  batch_id: firstBatchId,
                  new_owner: user?.id
                });
                
                console.log('🔍 DEBUG: RPC result:', rpcResult);
                console.log('🔍 DEBUG: RPC error:', rpcError);
                
                if (!rpcError) {
                  console.log('🔍 DEBUG: RPC update successful');
                  fetchInventory();
                  return;
                }
                
                // Fallback to direct update
                console.log('🔍 DEBUG: RPC failed, trying direct update...');
                const { data: updateResult, error: updateError } = await supabase
                  .from('batches')
                  .update({ 
                    current_owner: user?.id,
                    status: 'available'
                  })
                  .eq('id', firstBatchId)
                  .select();
                
                console.log('🔍 DEBUG: Force update result:', updateResult);
                console.log('🔍 DEBUG: Force update error:', updateError);
                
                if (updateError) {
                  console.error('Force update failed:', updateError);
                  
                  // Final fallback - try raw SQL
                  console.log('🔍 DEBUG: Trying raw SQL update...');
                  const { data: sqlResult, error: sqlError } = await supabase
                    .rpc('exec_sql', {
                      sql: `UPDATE batches SET current_owner = '${user?.id}', status = 'available' WHERE id = '${firstBatchId}'`
                    });
                  
                  console.log('🔍 DEBUG: SQL result:', sqlResult);
                  console.log('🔍 DEBUG: SQL error:', sqlError);
                  
                  if (!sqlError) {
                    console.log('🔍 DEBUG: SQL update successful');
                    fetchInventory();
                  }
                } else {
                  console.log('Force update successful - updated batch:', firstBatchId, 'to user:', user?.id);
                  fetchInventory();
                }
              }
            }}
            variant="outline"
            size="sm"
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            FORCE UPDATE ALL
          </Button>
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
            <div className="text-2xl font-bold">{totalItems}</div>
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
                    <CardDescription>{item.variety}</CardDescription>
                  </div>
                  <Badge className={getCertificationColor(item.certification_level)}>
                    {item.certification_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{item.harvest_quantity} kg available</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>₹{item.price_per_kg}/kg</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Harvested: {new Date(item.harvest_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
                    className="flex-1"
                    onClick={() => handleSellToCustomer(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sell to Customer
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
              <Link to="/retailer-marketplace">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy from Distributors
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={() => setShowDetailsModal(false)}>
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
       </div>
     );
   };
