import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/utils/simpleSupabaseFix';

export const WorkingBatchRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    harvestQuantity: '',
    pricePerKg: '',
    sowingDate: '',
    harvestDate: '',
    freshnessDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const batchData = {
        farmer_id: user.id,
        crop_type: formData.cropType,
        variety: formData.variety,
        harvest_quantity: parseFloat(formData.harvestQuantity),
        price_per_kg: parseFloat(formData.pricePerKg),
        sowing_date: formData.sowingDate,
        harvest_date: formData.harvestDate,
        freshness_duration: parseInt(formData.freshnessDuration), // Keep as integer
        total_price: parseFloat(formData.harvestQuantity) * parseFloat(formData.pricePerKg),
        grading: 'A',
        status: 'available'
      };

      const { error } = await db.from('batches').insert(batchData);

      if (error) {
        throw error;
      }

      toast({
        title: "Batch Registered",
        description: "Your batch has been successfully registered",
      });

      // Reset form
      setFormData({
        cropType: '',
        variety: '',
        harvestQuantity: '',
        pricePerKg: '',
        sowingDate: '',
        harvestDate: '',
        freshnessDuration: ''
      });
    } catch (error) {
      console.error('Error registering batch:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Unable to register batch",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Batch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cropType">Crop Type</Label>
              <Input
                id="cropType"
                value={formData.cropType}
                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={formData.variety}
                onChange={(e) => setFormData({...formData, variety: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="harvestQuantity">Harvest Quantity (kg)</Label>
              <Input
                id="harvestQuantity"
                type="number"
                value={formData.harvestQuantity}
                onChange={(e) => setFormData({...formData, harvestQuantity: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="pricePerKg">Price per kg ($)</Label>
              <Input
                id="pricePerKg"
                type="number"
                step="0.01"
                value={formData.pricePerKg}
                onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sowingDate">Sowing Date</Label>
              <Input
                id="sowingDate"
                type="date"
                value={formData.sowingDate}
                onChange={(e) => setFormData({...formData, sowingDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="harvestDate">Harvest Date</Label>
              <Input
                id="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="freshnessDuration">Freshness Duration (days)</Label>
            <Input
              id="freshnessDuration"
              type="number"
              value={formData.freshnessDuration}
              onChange={(e) => setFormData({...formData, freshnessDuration: e.target.value})}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register Batch'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};