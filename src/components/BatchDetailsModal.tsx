import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  User, 
  Package, 
  Award, 
  DollarSign,
  CheckCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SupplyChainTracker } from './SupplyChainTracker';
import { QRCodeDisplay } from './QRCodeDisplay';
import { ImmutableSupplyChainDisplay } from './ImmutableSupplyChainDisplay';

interface BatchDetailsModalProps {
  batch: any;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow?: (batch: any) => void;
}

export const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({ batch, isOpen, onClose, onBuyNow }) => {
  const navigate = useNavigate();

  if (!batch) return null;

  // Handle both old batch structure and new marketplace structure
  const batchData = batch.batches || batch;
  const marketplaceData = batch.batches ? batch : null;

  const handleVerifyCertificate = () => {
    if (batchData.blockchain_id || batchData.blockchain_batch_id) {
      navigate(`/verify?batchId=${batchData.blockchain_id || batchData.blockchain_batch_id}`);
      onClose();
    }
  };

  const handleViewCertificate = () => {
    const ipfsHash = batchData.ipfs_hash || batchData.ipfs_certificate_hash;
    if (ipfsHash) {
      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, '_blank');
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
    return status === 'available' 
      ? 'bg-success text-success-foreground' 
      : 'bg-warning text-warning-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                {batchData.crop_type} - {batchData.variety}
              </DialogTitle>
              <DialogDescription className="text-lg">
                Complete batch information and traceability details
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={getCertificationColor(batchData.certification)}>
                {batchData.certification}
              </Badge>
              <Badge className={getStatusColor(batchData.status)}>
                {batchData.status}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">₹{batchData.price_per_kg}</div>
              <div className="text-sm text-muted-foreground">per kg</div>
            </div>
          </div>

          <Separator />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Crop Type</div>
                      <div className="text-sm text-muted-foreground">{batchData.crop_type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Variety</div>
                      <div className="text-sm text-muted-foreground">{batchData.variety}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Harvest Quantity</div>
                      <div className="text-sm text-muted-foreground">{batchData.harvest_quantity} kg</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Grading</div>
                      <div className="text-sm text-muted-foreground">{batchData.grading}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Freshness Duration</div>
                      <div className="text-sm text-muted-foreground">{batchData.freshness_duration} days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Farmer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Farmer</div>
                      <div className="text-sm text-muted-foreground">
                        {batchData.profiles?.full_name || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">
                        {batchData.profiles?.farm_location || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Dates & Pricing */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Sowing Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(batchData.sowing_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Harvest Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(batchData.harvest_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Registered</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(batchData.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Price per kg</div>
                      <div className="text-sm text-muted-foreground">₹{batchData.price_per_kg}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Total Value</div>
                      <div className="text-sm text-muted-foreground">₹{batchData.total_price}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain & Verification */}
              {(batchData.blockchain_id || batchData.blockchain_batch_id || batchData.ipfs_hash || batchData.ipfs_certificate_hash) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(batchData.blockchain_id || batchData.blockchain_batch_id) && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">Blockchain ID</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {batchData.blockchain_id || batchData.blockchain_batch_id}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(batchData.ipfs_hash || batchData.ipfs_certificate_hash) && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Certificate Available</div>
                          <div className="text-sm text-muted-foreground">IPFS Certificate</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Supply Chain Tracking */}
            <div className="mt-6">
              <ImmutableSupplyChainDisplay batchId={batchData.id} />
            </div>

            {/* QR Code Display */}
            <div className="mt-6">
              <QRCodeDisplay
                batchId={batchData.blockchain_id || batchData.blockchain_batch_id || batchData.id}
                cropType={batchData.crop_type}
                variety={batchData.variety}
                harvestDate={batchData.harvest_date}
                farmerId={batchData.farmer_id}
                blockchainHash={batchData.blockchain_hash}
                ipfsHash={batchData.ipfs_hash || batchData.ipfs_certificate_hash}
                groupId={batchData.group_id}
              />
            </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              size="lg" 
              className="flex-1 min-w-[200px]"
              disabled={batchData.status !== 'available'}
              onClick={() => {
                if (onBuyNow && batchData.status === 'available') {
                  onBuyNow(batch);
                  onClose();
                }
              }}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {batchData.status === 'available' ? 'Buy Now' : 'Reserved'}
            </Button>
            
            {(batchData.blockchain_id || batchData.blockchain_batch_id) && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleVerifyCertificate}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Certificate
              </Button>
            )}
            
            {(batchData.ipfs_hash || batchData.ipfs_certificate_hash) && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleViewCertificate}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Certificate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
