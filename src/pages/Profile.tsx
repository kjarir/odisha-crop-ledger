import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Wallet, 
  Edit, 
  Star, 
  Award,
  Shield,
  Camera,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const user = {
    id: 'user-123',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    role: 'farmer',
    farmLocation: 'Cuttack, Odisha',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4Cc9Bf4fcfB5311',
    avatarUrl: '/placeholder.svg',
    isVerified: true,
    reputationScore: 85,
    joinedDate: '2024-01-15',
    totalBatches: 12,
    totalSales: 28500,
    averageRating: 4.8,
    badges: [
      { name: 'Verified Farmer', icon: Shield, color: 'text-green-600' },
      { name: 'Quality Producer', icon: Star, color: 'text-yellow-600' },
      { name: 'Top Seller', icon: Award, color: 'text-blue-600' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="govt-card shadow-large">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-lg">
                        {user.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h1 className="text-xl font-bold flex items-center justify-center">
                      {user.fullName}
                      {user.isVerified && (
                        <Shield className="h-5 w-5 ml-2 text-green-600" />
                      )}
                    </h1>
                    <Badge variant="outline" className="mt-1">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{user.farmLocation}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="text-sm text-muted-foreground mb-2">Reputation Score</div>
                    <div className="flex items-center space-x-2">
                      <Progress value={user.reputationScore} className="flex-1" />
                      <span className="text-sm font-medium">{user.reputationScore}/100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="govt-card shadow-large mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                    <badge.icon className={`h-5 w-5 ${badge.color}`} />
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="govt-card shadow-large">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="farm">Farm Info</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          value={user.fullName} 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          value={user.email} 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={user.phone} 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input 
                          id="role" 
                          value={user.role} 
                          disabled={true}
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-2 pt-4">
                        <Button className="gradient-primary">Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="farm" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Farm Location</Label>
                        <Input 
                          id="farmLocation" 
                          value={user.farmLocation} 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmSize">Farm Size (Acres)</Label>
                        <Input 
                          id="farmSize" 
                          placeholder="Enter farm size" 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryCrops">Primary Crops</Label>
                        <Input 
                          id="primaryCrops" 
                          placeholder="e.g., Rice, Wheat, Vegetables" 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="certifications">Certifications</Label>
                        <Input 
                          id="certifications" 
                          placeholder="e.g., Organic, Fair Trade" 
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="wallet" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Wallet className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Connected Wallet</p>
                            <p className="text-sm text-muted-foreground">
                              {user.walletAddress}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold mb-1">Balance</h4>
                            <p className="text-2xl font-bold">0.85 ETH</p>
                            <p className="text-sm text-muted-foreground">≈ $2,125 USD</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold mb-1">Total Earned</h4>
                            <p className="text-2xl font-bold">12.3 ETH</p>
                            <p className="text-sm text-muted-foreground">≈ $30,750 USD</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <h4 className="font-semibold mb-1">Total Batches</h4>
                          <p className="text-2xl font-bold text-primary">{user.totalBatches}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <h4 className="font-semibold mb-1">Total Sales</h4>
                          <p className="text-2xl font-bold text-green-600">₹{user.totalSales.toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <h4 className="font-semibold mb-1">Average Rating</h4>
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <p className="text-2xl font-bold">{user.averageRating}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Activity Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium">New batch registered</p>
                            <p className="text-sm text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium">Payment received</p>
                            <p className="text-sm text-muted-foreground">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium">Profile verified</p>
                            <p className="text-sm text-muted-foreground">3 days ago</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};