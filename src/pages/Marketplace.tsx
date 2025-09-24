import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { BatchDetailsModal } from '@/components/BatchDetailsModal';
import { UltraSimplePurchaseModal } from '@/components/UltraSimplePurchaseModal';
import { BatchQuantityDisplay } from '@/components/BatchQuantityDisplay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Award, 
  Eye, 
  ShoppingCart,
  Leaf,
  Package,
  TrendingUp,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('batches')
        .select(`
          *,
          profiles:farmer_id (
            full_name,
            farm_location
          )
        `)
        .eq('status', 'available');

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'Premium':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'Organic':
        return 'bg-success text-success-foreground';
      case 'Fresh':
        return 'bg-gradient-to-r from-accent to-accent-light text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Available' 
      ? 'bg-success text-success-foreground' 
      : 'bg-warning text-warning-foreground';
  };

  const handleViewDetails = (batch: any) => {
    setSelectedBatch(batch);
    setIsDetailsModalOpen(true);
  };

  const handleBuyNow = (batch: any) => {
    setSelectedBatch(batch);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseComplete = () => {
    // Refresh the batches list to update availability
    fetchBatches();
    setIsPurchaseModalOpen(false);
    setSelectedBatch(null);
  };

  const handleVerifyCertificate = (batch: any) => {
    if (batch.blockchain_id || batch.blockchain_batch_id) {
      navigate(`/verify?batchId=${batch.blockchain_id || batch.blockchain_batch_id}`);
    } else {
      toast({
        variant: "destructive",
        title: "No Blockchain ID",
        description: "This batch doesn't have a blockchain ID for verification.",
      });
    }
  };

  const handleViewCertificate = (batch: any) => {
    const ipfsHash = batch.ipfs_hash || batch.ipfs_certificate_hash;
    if (ipfsHash) {
      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "No Certificate",
        description: "No certificate available for this batch.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">Agricultural Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Browse verified agricultural produce from farmers across Odisha. 
          Every batch comes with complete provenance and quality guarantees.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="govt-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops, varieties, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="grains">Grains & Cereals</SelectItem>
                <SelectItem value="pulses">Pulses & Legumes</SelectItem>
                <SelectItem value="spices">Spices & Herbs</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="cuttack">Cuttack</SelectItem>
                <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                <SelectItem value="puri">Puri</SelectItem>
                <SelectItem value="ganjam">Ganjam</SelectItem>
                <SelectItem value="balasore">Balasore</SelectItem>
                <SelectItem value="khorda">Khorda</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="govt-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{batches.length}</div>
            <div className="text-sm text-muted-foreground">Available Batches</div>
          </CardContent>
        </Card>
        <Card className="govt-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">247</div>
            <div className="text-sm text-muted-foreground">Active Farmers</div>
          </CardContent>
        </Card>
        <Card className="govt-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">94%</div>
            <div className="text-sm text-muted-foreground">Avg Quality</div>
          </CardContent>
        </Card>
        <Card className="govt-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">₹2.4L</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>
      </div>

        {/* Batch Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No batches available</h3>
              <p className="text-muted-foreground">Check back later for new produce listings.</p>
            </div>
          ) : (
            batches.map((batch) => (
              <Card key={batch.id} className="govt-card hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
                        <Leaf className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{batch.crop_type}</CardTitle>
                        <CardDescription>{batch.variety}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getCertificationColor(batch.certification || 'Standard')}>
                      {batch.certification || 'Standard'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Farmer & Location */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{batch.profiles?.full_name || 'Unknown Farmer'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{batch.profiles?.farm_location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Harvested: {new Date(batch.harvest_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Quality Score</span>
                    </div>
                    <div className="text-lg font-bold text-success">{batch.quality_score || 0}/100</div>
                  </div>

                  {/* Price & Quantity */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">₹{batch.price_per_kg}</div>
                      <div className="text-sm text-muted-foreground">per kg</div>
                    </div>
                    <div className="text-right">
                      <BatchQuantityDisplay 
                        batchId={batch.id} 
                        originalQuantity={batch.harvest_quantity}
                        className="mb-2"
                      />
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewDetails(batch)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gradient-primary"
                      disabled={batch.status !== 'available'}
                      onClick={() => handleBuyNow(batch)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {batch.status === 'available' ? 'Buy Now' : 'Reserved'}
                    </Button>
                  </div>

                  {/* Verification Actions */}
                  <div className="flex space-x-2 mt-2">
                    {(batch.blockchain_id || batch.blockchain_batch_id) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleVerifyCertificate(batch)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                    )}
                    {(batch.ipfs_hash || batch.ipfs_certificate_hash) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewCertificate(batch)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                    )}
                  </div>

                  {/* Batch ID */}
                  <div className="text-xs text-muted-foreground font-mono">
                    ID: {(batch.blockchain_id || batch.blockchain_batch_id) ? 
                      `${batch.blockchain_id || batch.blockchain_batch_id}` : 
                      batch.id.substring(0, 8) + '...'
                    }
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Batches
            <TrendingUp className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Batch Details Modal */}
      <BatchDetailsModal
        batch={selectedBatch}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBatch(null);
        }}
        onBuyNow={handleBuyNow}
      />

      {/* Purchase Modal */}
      <ErrorBoundary>
        <UltraSimplePurchaseModal
          batch={selectedBatch}
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedBatch(null);
          }}
          onPurchaseComplete={handlePurchaseComplete}
        />
      </ErrorBoundary>
    </div>
  );
};