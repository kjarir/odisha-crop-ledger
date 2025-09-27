import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { purchaseTransactionCreator } from '@/utils/purchaseTransactionCreator';
import { singleStepGroupManager } from '@/utils/singleStepGroupManager';
import { blockchainTransactionManager } from '@/utils/blockchainTransactionManager';
import { useWeb3 } from '@/contexts/Web3Context';
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  DollarSign,
  CheckCircle
} from 'lucide-react';

interface UltraSimplePurchaseModalProps {
  batch: any;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export const UltraSimplePurchaseModal: React.FC<UltraSimplePurchaseModalProps> = ({ 
  batch, 
  isOpen, 
  onClose, 
  onPurchaseComplete 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { signer } = useWeb3();

  if (!batch || !isOpen) return null;

  const handlePurchase = async (quantity: number, address: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to make a purchase.",
      });
      return;
    }

    if (!address.trim()) {
      toast({
        variant: "destructive",
        title: "Delivery Address Required",
        description: "Please enter a delivery address.",
      });
      return;
    }

    try {
      const unitPrice = batch.price_per_kg;
      const totalPrice = quantity * unitPrice;
      const deliveryFee = totalPrice > 1000 ? 0 : 50;
      const finalTotal = totalPrice + deliveryFee;

      // For the new group-based system, we don't need complex transaction verification
      // Just check if the batch has a group_id
      if (!batch.group_id) {
        throw new Error('Batch does not have a group ID - cannot process purchase');
      }
      
      // Get buyer name from profile
      let buyerName = 'Unknown Buyer';
      try {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name')
          .eq('user_id', user?.id)
          .single();
        
        if (profile?.full_name) {
          buyerName = profile.full_name;
        } else if (user?.name) {
          buyerName = user.name;
        } else if (user?.email) {
          // Extract name from email as fallback
          const emailName = user.email.split('@')[0];
          buyerName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      } catch (error) {
        console.warn('Could not fetch buyer name from profile:', error);
        if (user?.name) {
          buyerName = user.name;
        } else if (user?.email) {
          const emailName = user.email.split('@')[0];
          buyerName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      }
      const currentOwner = batch.farmer_name || 'Jarir Khan';
      
      // Use the single-step group manager for purchase
      const { pdfBlob, ipfsHash } = await singleStepGroupManager.uploadPurchaseCertificate(
        batch.group_id,
        {
          batchId: batch.id,
          from: currentOwner,
          to: buyerName,
          quantity: quantity,
          pricePerKg: unitPrice,
          timestamp: new Date().toISOString()
        }
      );

      // Record transaction on blockchain
      console.log('🔍 DEBUG: Recording purchase transaction on blockchain...');
      if (!signer) {
        throw new Error('Wallet not connected. Please connect your wallet to complete the purchase.');
      }
      
      // Update blockchain transaction manager with signer
      blockchainTransactionManager.updateSigner(signer);
      
      try {
        const blockchainTransaction = await blockchainTransactionManager.recordPurchaseTransaction(
          batch.id,
          batch.current_owner || batch.farmer_id, // From current owner
          user.id, // To buyer
          quantity,
          finalTotal,
          'PURCHASE'
        );
        console.log('🔍 DEBUG: Blockchain transaction recorded:', blockchainTransaction);
      } catch (blockchainError) {
        console.error('🔍 DEBUG: Blockchain transaction failed:', blockchainError);
        // Continue with database transaction even if blockchain fails
        console.log('🔍 DEBUG: Continuing with database transaction despite blockchain error');
      }

      // Create transaction record
      const transactionData = {
        batch_id: batch.id,
        buyer_id: user.id,
        seller_id: batch.farmer_id || batch.current_owner || 'unknown_farmer',
        transaction_type: 'PURCHASE',
        quantity: quantity,
        price: finalTotal,
        status: 'completed'
      };

      console.log('🔍 DEBUG: Creating transaction with data:', transactionData);
      
      const { data: transactionResult, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select();

      console.log('🔍 DEBUG: Transaction creation result:', { transactionResult, transactionError });

      if (transactionError) {
        throw new Error(`Failed to create transaction: ${transactionError.message}`);
      }

      // Update batch ownership
      const batchUpdateData = {
        current_owner: user.id,
        status: 'available' // Keep available for other purchases
      };

      console.log('🔍 DEBUG: Updating batch with data:', batchUpdateData, 'for batch ID:', batch.id);
      console.log('🔍 DEBUG: User ID for ownership:', user.id);
      console.log('🔍 DEBUG: Batch ID to update:', batch.id);
      console.log('🔍 DEBUG: Batch ID type:', typeof batch.id);
      console.log('🔍 DEBUG: Full batch object:', batch);

      // First, check if the batch exists
      const { data: existingBatch, error: checkError } = await supabase
        .from('batches')
        .select('*')
        .eq('id', batch.id)
        .single();

      console.log('🔍 DEBUG: Existing batch check:', { existingBatch, checkError });

      if (checkError) {
        console.error('🔍 ERROR: Batch not found:', checkError);
        throw new Error(`Batch not found: ${checkError.message}`);
      }

      const { data: batchResult, error: batchError } = await supabase
        .from('batches')
        .update(batchUpdateData)
        .eq('id', batch.id)
        .select();

      console.log('🔍 DEBUG: Batch update result:', { batchResult, batchError });
      console.log('🔍 DEBUG: Batch ID being updated:', batch.id);
      console.log('🔍 DEBUG: New owner ID:', user.id);

      if (batchError) {
        console.error('🔍 ERROR: Batch update failed:', batchError);
        throw new Error(`Failed to update batch: ${batchError.message}`);
      } else {
        console.log('🔍 SUCCESS: Batch ownership updated successfully');
      }

      // Remove batch from farmer-distributor marketplace after purchase
      try {
        const { error: removeError } = await supabase.rpc(
          'remove_batch_from_marketplace',
          { 
            batch_id_param: batch.id,
            marketplace_type_param: 'farmer_distributor'
          }
        );
        
        if (removeError) {
          console.error('🔍 WARNING: Failed to remove from marketplace:', removeError);
        } else {
          console.log('🔍 SUCCESS: Batch removed from farmer-distributor marketplace');
        }
      } catch (removeError) {
        console.error('🔍 WARNING: Error removing from marketplace:', removeError);
      }

      onPurchaseComplete();
      onClose();
      toast({
        title: "Purchase Successful!",
        description: `Your order for ${quantity}kg of ${batch.crop_type} has been placed. The certificate has been updated with your purchase details.`,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during purchase.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase {batch.crop_type}
          </DialogTitle>
          <DialogDescription>
            Complete your purchase of {batch.crop_type} - {batch.variety}
          </DialogDescription>
        </DialogHeader>

        <PurchaseForm 
          batch={batch} 
          onPurchase={handlePurchase} 
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

// Separate component for the form to avoid hooks issues
const PurchaseForm: React.FC<{
  batch: any;
  onPurchase: (quantity: number, address: string) => void;
  onClose: () => void;
}> = ({ batch, onPurchase, onClose }) => {
  const [quantity, setQuantity] = React.useState(1);
  const [address, setAddress] = React.useState('');

  const unitPrice = batch.price_per_kg;
  const totalPrice = quantity * unitPrice;
  const deliveryFee = totalPrice > 1000 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="space-y-6">
      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Crop Type</Label>
              <p className="font-medium">{batch.crop_type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Variety</Label>
              <p className="font-medium">{batch.variety}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Available Quantity</Label>
              <p className="font-medium">{batch.harvest_quantity} kg</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Price per kg</Label>
              <p className="font-medium text-green-600">₹{batch.price_per_kg}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantity & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Quantity & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity (kg)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={batch.harvest_quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Available: {batch.harvest_quantity} kg
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({quantity}kg × ₹{unitPrice}):</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-green-600">₹{finalTotal}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              placeholder="Enter your complete delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={() => onPurchase(quantity, address)}
          disabled={!address.trim()}
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Purchase Now
        </Button>
      </div>
    </div>
  );
};
