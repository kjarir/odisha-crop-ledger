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

      const purchaseInfo = `| Purchase: ${user.email || 'Unknown'} bought ${quantity}kg for ₹${finalTotal} on ${new Date().toLocaleDateString()}`;
      
      const purchaseData = {
        grading: `${batch.grading}${purchaseInfo}`,
        status: 'available'
      };

      const { error: purchaseError } = await (supabase as any)
        .from('batches')
        .update(purchaseData)
        .eq('id', batch.id);

      if (purchaseError) {
        throw new Error(`Failed to update batch: ${purchaseError.message}`);
      }

      onPurchaseComplete();
      onClose();
      toast({
        title: "Purchase Successful!",
        description: `Your order for ${quantity}kg of ${batch.crop_type} has been placed.`,
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
