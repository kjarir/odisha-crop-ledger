import { useState } from 'react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  FileText,
  BarChart3,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data
  const stats = {
    totalUsers: 1247,
    totalBatches: 3456,
    totalTransactions: 8921,
    averageQuality: 87,
    monthlyGrowth: 12.5,
    activeUsers: 892
  };

  const recentUsers = [
    { id: 1, name: 'Rajesh Kumar', role: 'farmer', status: 'pending', joinDate: '2024-01-20' },
    { id: 2, name: 'Priya Sharma', role: 'retailer', status: 'verified', joinDate: '2024-01-19' },
    { id: 3, name: 'Amit Patel', role: 'helper', status: 'pending', joinDate: '2024-01-18' },
    { id: 4, name: 'Sunita Devi', role: 'farmer', status: 'verified', joinDate: '2024-01-17' }
  ];

  const recentBatches = [
    { id: 'BAT-001', farmer: 'Rajesh Kumar', crop: 'Rice', quality: 92, status: 'available' },
    { id: 'BAT-002', farmer: 'Sunita Devi', crop: 'Wheat', quality: 88, status: 'sold' },
    { id: 'BAT-003', farmer: 'Mohan Singh', crop: 'Maize', quality: 85, status: 'available' },
    { id: 'BAT-004', farmer: 'Radha Krishna', crop: 'Rice', quality: 94, status: 'transferred' }
  ];

  const auditLogs = [
    { id: 1, action: 'User Verification', user: 'Priya Sharma', timestamp: '2024-01-20 10:30', status: 'completed' },
    { id: 2, action: 'Batch Registration', user: 'Rajesh Kumar', timestamp: '2024-01-20 09:15', status: 'completed' },
    { id: 3, action: 'Role Assignment', user: 'Admin', timestamp: '2024-01-20 08:45', status: 'completed' },
    { id: 4, action: 'Policy Update', user: 'System', timestamp: '2024-01-19 16:20', status: 'completed' }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/80">Government of Odisha - AgriTrace Platform Management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <TabsList className="grid w-full grid-cols-6 bg-transparent">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Users
              </TabsTrigger>
              <TabsTrigger value="batches" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Batches
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Audit Logs
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="govt-card shadow-large">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{stats.monthlyGrowth}%</span>
                    <span className="text-muted-foreground ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="govt-card shadow-large">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Batches</p>
                      <p className="text-2xl font-bold">{stats.totalBatches.toLocaleString()}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+15.2%</span>
                    <span className="text-muted-foreground ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="govt-card shadow-large">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8.4%</span>
                    <span className="text-muted-foreground ml-1">this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="govt-card shadow-large">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Quality</p>
                      <p className="text-2xl font-bold">{stats.averageQuality}/100</p>
                    </div>
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                  <Progress value={stats.averageQuality} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="govt-card shadow-large">
                <CardHeader>
                  <CardTitle>Recent User Registrations</CardTitle>
                  <CardDescription>Latest users awaiting verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.role}</p>
                          </div>
                        </div>
                        <Badge variant={user.status === 'verified' ? 'default' : 'outline'}>
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="govt-card shadow-large">
                <CardHeader>
                  <CardTitle>Recent Batch Registrations</CardTitle>
                  <CardDescription>Latest produce entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBatches.map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{batch.id}</p>
                            <p className="text-sm text-muted-foreground">{batch.crop} by {batch.farmer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{batch.quality}/100</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{batch.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="govt-card shadow-large">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles, verification, and access</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Input placeholder="Search users..." className="w-64" />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.name.toLowerCase().replace(' ', '.')}@email.com</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'verified' ? 'default' : 'outline'}>
                            {user.status === 'verified' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {user.status === 'pending' && (
                              <Button size="sm" className="gradient-primary">
                                Verify
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <Card className="govt-card shadow-large">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Batch Management</CardTitle>
                    <CardDescription>Monitor and manage agricultural batches</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Search batches..." className="w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Crop Type</TableHead>
                      <TableHead>Quality Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.id}</TableCell>
                        <TableCell>{batch.farmer}</TableCell>
                        <TableCell>{batch.crop}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={batch.quality} className="w-16" />
                            <span className="text-sm">{batch.quality}/100</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            batch.status === 'available' ? 'default' : 
                            batch.status === 'sold' ? 'outline' : 'secondary'
                          }>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="govt-card shadow-large">
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>Quality scores across all batches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grade A+ (90-100)</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grade A (80-89)</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <Progress value={35} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grade B+ (70-79)</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <Progress value={15} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grade B & Below</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <Progress value={5} />
                  </div>
                </CardContent>
              </Card>

              <Card className="govt-card shadow-large">
                <CardHeader>
                  <CardTitle>Regional Distribution</CardTitle>
                  <CardDescription>Farmers by district</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cuttack</span>
                      <span className="text-sm font-medium">324 farmers</span>
                    </div>
                    <Progress value={85} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bhubaneswar</span>
                      <span className="text-sm font-medium">287 farmers</span>
                    </div>
                    <Progress value={75} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Puri</span>
                      <span className="text-sm font-medium">198 farmers</span>
                    </div>
                    <Progress value={52} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Others</span>
                      <span className="text-sm font-medium">438 farmers</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="govt-card shadow-large">
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>System activity and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="govt-card shadow-large">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform settings and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Verification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-verify farmers</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manual review threshold</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Blockchain Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Network configuration</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Gas price settings</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};