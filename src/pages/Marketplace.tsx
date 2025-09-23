import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  TrendingUp
} from 'lucide-react';

export const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const batches = [
    {
      id: 'BT-2024-015',
      crop: 'Basmati Rice',
      variety: 'Pusa Basmati 1121',
      farmer: 'Ramesh Kumar',
      location: 'Cuttack',
      quantity: '500 kg',
      price: 2400,
      qualityScore: 96,
      harvestDate: '2024-01-20',
      status: 'Available',
      certificationLevel: 'Premium',
      description: 'High-quality basmati rice with excellent grain length and aroma.'
    },
    {
      id: 'BT-2024-016',
      crop: 'Turmeric',
      variety: 'Salem Turmeric',
      farmer: 'Sita Devi',
      location: 'Ganjam',
      quantity: '200 kg',
      price: 1800,
      qualityScore: 94,
      harvestDate: '2024-01-18',
      status: 'Available',
      certificationLevel: 'Organic',
      description: 'Premium organic turmeric with high curcumin content.'
    },
    {
      id: 'BT-2024-017',
      crop: 'Black Gram',
      variety: 'Pant U-19',
      farmer: 'Mahesh Patel',
      location: 'Balasore',
      quantity: '300 kg',
      price: 3200,
      qualityScore: 92,
      harvestDate: '2024-01-15',
      status: 'Available',
      certificationLevel: 'Standard',
      description: 'Fresh black gram suitable for dal production.'
    },
    {
      id: 'BT-2024-018',
      crop: 'Green Chili',
      variety: 'Bhavani',
      farmer: 'Priya Sharma',
      location: 'Khorda',
      quantity: '150 kg',
      price: 4500,
      qualityScore: 89,
      harvestDate: '2024-01-22',
      status: 'Available',
      certificationLevel: 'Fresh',
      description: 'Spicy green chilies perfect for fresh consumption.'
    },
    {
      id: 'BT-2024-019',
      crop: 'Coconut',
      variety: 'Malayan Dwarf',
      farmer: 'Krishna Rao',
      location: 'Puri',
      quantity: '1000 pieces',
      price: 25,
      qualityScore: 91,
      harvestDate: '2024-01-21',
      status: 'Reserved',
      certificationLevel: 'Standard',
      description: 'Fresh tender coconuts directly from coastal farms.'
    }
  ];

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

  return (
    <div className="container py-8 space-y-8">
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
        {batches.map((batch) => (
          <Card key={batch.id} className="govt-card hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
                    <Leaf className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{batch.crop}</CardTitle>
                    <CardDescription>{batch.variety}</CardDescription>
                  </div>
                </div>
                <Badge className={getCertificationColor(batch.certificationLevel)}>
                  {batch.certificationLevel}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Farmer & Location */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{batch.farmer}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{batch.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Harvested: {new Date(batch.harvestDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Quality Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Quality Score</span>
                </div>
                <div className="text-lg font-bold text-success">{batch.qualityScore}%</div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {batch.description}
              </p>

              {/* Price & Quantity */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">₹{batch.price}</div>
                  <div className="text-sm text-muted-foreground">per kg</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{batch.quantity}</div>
                  <Badge className={getStatusColor(batch.status)}>
                    {batch.status}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 gradient-primary"
                  disabled={batch.status !== 'Available'}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {batch.status === 'Available' ? 'Buy Now' : 'Reserved'}
                </Button>
              </div>

              {/* Batch ID */}
              <div className="text-xs text-muted-foreground font-mono">
                ID: {batch.id}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Batches
          <TrendingUp className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};