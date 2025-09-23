import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Calendar, 
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export const BatchRegistration = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cropType: '',
    variety: '',
    harvestQuantity: '',
    sowingDate: '',
    harvestDate: '',
    pricePerKg: '',
    certification: '',
    grading: 'Standard'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user profile first
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { data, error } = await (supabase as any)
        .from('batches')
        .insert({
          farmer_id: profile.id,
          crop_type: formData.cropType,
          variety: formData.variety,
          harvest_quantity: parseFloat(formData.harvestQuantity),
          sowing_date: formData.sowingDate,
          harvest_date: formData.harvestDate,
          price_per_kg: parseFloat(formData.pricePerKg),
          total_price: parseFloat(formData.harvestQuantity) * parseFloat(formData.pricePerKg),
          grading: formData.grading,
          freshness_duration: 7,
          certification: formData.certification || 'Standard',
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Batch registered successfully!",
        description: `Batch ${data.id.substring(0, 8)}... has been created.`,
      });

      // Reset form
      setFormData({
        cropType: '',
        variety: '',
        harvestQuantity: '',
        sowingDate: '',
        harvestDate: '',
        pricePerKg: '',
        certification: '',
        grading: 'Standard'
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register New Batch</h1>
          <p className="text-muted-foreground">
            Register your agricultural produce on the blockchain for complete traceability
          </p>
        </div>

        <Card className="govt-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Batch Information
            </CardTitle>
            <CardDescription>
              Fill in the details about your agricultural produce batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Select 
                    value={formData.cropType} 
                    onValueChange={(value) => setFormData({...formData, cropType: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Maize">Maize</SelectItem>
                      <SelectItem value="Turmeric">Turmeric</SelectItem>
                      <SelectItem value="Black Gram">Black Gram</SelectItem>
                      <SelectItem value="Green Chili">Green Chili</SelectItem>
                      <SelectItem value="Coconut">Coconut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety *</Label>
                  <Input 
                    id="variety"
                    placeholder="e.g., Basmati, Pusa Basmati 1121"
                    value={formData.variety}
                    onChange={(e) => setFormData({...formData, variety: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvestQuantity">Harvest Quantity (kg) *</Label>
                  <Input 
                    id="harvestQuantity"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.harvestQuantity}
                    onChange={(e) => setFormData({...formData, harvestQuantity: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Kg (₹) *</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 25"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sowingDate">Sowing Date *</Label>
                  <Input 
                    id="sowingDate"
                    type="date"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({...formData, sowingDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date *</Label>
                  <Input 
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grading">Grading</Label>
                  <Select 
                    value={formData.grading} 
                    onValueChange={(value) => setFormData({...formData, grading: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grading" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certification">Certification</Label>
                  <Select 
                    value={formData.certification} 
                    onValueChange={(value) => setFormData({...formData, certification: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organic">Organic</SelectItem>
                      <SelectItem value="Fair Trade">Fair Trade</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Reset Form
                </Button>
                <Button type="submit" disabled={loading} className="gradient-primary">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Registering...' : 'Register Batch'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mx-auto mb-4">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Blockchain Registry</h3>
              <p className="text-sm text-muted-foreground">
                Your batch will be recorded on an immutable blockchain ledger
              </p>
            </CardContent>
          </Card>

          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-secondary mx-auto mb-4">
                <Calendar className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Traceability</h3>
              <p className="text-sm text-muted-foreground">
                Complete farm-to-table tracking with QR codes
              </p>
            </CardContent>
          </Card>

          <Card className="govt-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-accent-light mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Fair Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Get fair market prices with transparent pricing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};