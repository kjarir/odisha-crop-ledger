import { useState } from 'react';
import { Search, QrCode, Package2, Eye, MapPin, Calendar, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TrackProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);

  const handleSearch = () => {
    // Mock tracking data
    setTrackingResult({
      batchId: 'BAT-2024-001',
      cropType: 'Rice',
      variety: 'Basmati',
      farmer: 'Rajesh Kumar',
      location: 'Cuttack, Odisha',
      harvestDate: '2024-01-15',
      qualityScore: 92,
      certification: 'Organic',
      currentStatus: 'Available',
      images: ['/placeholder.svg'],
      chain: [
        {
          stage: 'Harvested',
          date: '2024-01-15',
          actor: 'Rajesh Kumar (Farmer)',
          location: 'Farm Plot #123, Cuttack',
          txHash: '0x1234...abcd'
        },
        {
          stage: 'Quality Tested',
          date: '2024-01-16',
          actor: 'AgriTrace Lab',
          location: 'Bhubaneswar Lab',
          txHash: '0x5678...efgh'
        },
        {
          stage: 'Listed for Sale',
          date: '2024-01-17',
          actor: 'Rajesh Kumar (Farmer)',
          location: 'AgriTrace Marketplace',
          txHash: '0x9abc...ijkl'
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Track Agricultural Products</h1>
          <p className="text-white/80">Enter batch ID or QR code to trace complete supply chain</p>
        </div>

        {/* Search Section */}
        <Card className="govt-card shadow-large mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Product Tracking
            </CardTitle>
            <CardDescription>
              Enter batch ID, QR code, or blockchain transaction hash
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter batch ID (e.g., BAT-2024-001) or scan QR code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button onClick={handleSearch} className="gradient-primary">
                <Search className="h-4 w-4 mr-2" />
                Track
              </Button>
              <Button variant="outline" size="icon">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingResult && (
          <div className="space-y-6">
            {/* Product Overview */}
            <Card className="govt-card shadow-large">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package2 className="h-5 w-5 mr-2" />
                      {trackingResult.cropType} - {trackingResult.variety}
                    </CardTitle>
                    <CardDescription>Batch ID: {trackingResult.batchId}</CardDescription>
                  </div>
                  <Badge variant="outline" className="gradient-primary">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Farmer:</span>
                      <span>{trackingResult.farmer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{trackingResult.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Harvest Date:</span>
                      <span>{trackingResult.harvestDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Quality Score:</span>
                      <Badge variant="outline">{trackingResult.qualityScore}/100</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <img 
                        src="/placeholder.svg" 
                        alt="Product" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Tracking */}
            <Card className="govt-card shadow-large">
              <CardHeader>
                <CardTitle>Supply Chain Timeline</CardTitle>
                <CardDescription>Complete traceability from farm to market</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                    <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline" className="space-y-4">
                    {trackingResult.chain.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium">{event.stage}</h4>
                          <p className="text-sm text-muted-foreground">{event.actor}</p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{event.date}</p>
                          <p className="text-xs text-muted-foreground">{event.txHash}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="certificates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Organic Certification</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline" className="w-full justify-center">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Organic
                          </Badge>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Quality Grade</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline" className="w-full justify-center">
                            Grade A+ (92/100)
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="blockchain" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Contract Address:</span>
                        <code className="text-xs">0x742d35Cc6634C0532925a3b8D4Cc9Bf4</code>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Token ID:</span>
                        <code className="text-xs">#1001</code>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Network:</span>
                        <span className="text-sm">Polygon Mumbai</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results State */}
        {!trackingResult && (
          <Card className="govt-card shadow-large">
            <CardContent className="text-center py-12">
              <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Ready to Track</h3>
              <p className="text-muted-foreground">
                Enter a batch ID or scan a QR code to view complete product traceability
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};