import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  Users, 
  QrCode,
  Calendar,
  Leaf,
  Award,
  Eye,
  Download,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    totalRevenue: 0,
    avgQualityScore: 0
  });
  const [recentBatches, setRecentBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get farmer profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        // Fetch batches for this farmer
        const { data: batches } = await supabase
          .from('batches')
          .select('*')
          .eq('farmer_id', profile.id);

        if (batches) {
          const totalBatches = batches.length;
          const activeBatches = batches.filter(b => b.status === 'available').length;
          const totalRevenue = batches.reduce((sum, batch) => sum + (batch.total_price || 0), 0);
          const avgQualityScore = batches.length > 0 
            ? Math.round(batches.reduce((sum, batch) => sum + (batch.quality_score || 0), 0) / batches.length)
            : 0;

          setStats({
            totalBatches,
            activeBatches,
            totalRevenue,
            avgQualityScore
          });

          setRecentBatches(batches.slice(-3).reverse());
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success text-success-foreground';
      case 'Sold':
        return 'bg-muted text-muted-foreground';
      case 'Processing':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your agricultural batches and track performance.
          </p>
        </div>
        <Button className="gradient-primary" asChild>
          <Link to="/register-batch">
            <Plus className="h-4 w-4 mr-2" />
            Register New Batch
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="govt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
                <p className="text-2xl font-bold">{stats.totalBatches}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="govt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Batches</p>
                <p className="text-2xl font-bold">{stats.activeBatches}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-secondary">
                <Leaf className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="govt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-accent-light">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="govt-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Quality Score</p>
                <p className="text-2xl font-bold">{stats.avgQualityScore}%</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={stats.avgQualityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Batches */}
      <Card className="govt-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Batches</CardTitle>
              <CardDescription>
                Your latest registered agricultural produce batches
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/batches">
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBatches.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No batches yet</h3>
                <p className="text-muted-foreground">Start by registering your first batch.</p>
              </div>
            ) : (
              recentBatches.map((batch) => (
              <div
                key={batch.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{batch.crop_type}</span>
                        <Badge variant="outline" className="text-xs">
                          {batch.id.substring(0, 8)}...
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{batch.variety}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{batch.harvest_quantity} kg</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(batch.harvest_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-4 mt-4 md:mt-0">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Quality: <span className="font-medium text-success">{batch.quality_score || 0}/100</span>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{batch.price_per_kg}/kg
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <QrCode className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/register-batch">
          <Card className="govt-card hover-lift cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mx-auto mb-4">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Register New Batch</h3>
              <p className="text-sm text-muted-foreground">
                Add a new harvest batch with AI quality analysis
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/marketplace">
          <Card className="govt-card hover-lift cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-secondary mx-auto mb-4">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Visit Marketplace</h3>
              <p className="text-sm text-muted-foreground">
                Browse buyers and sell your produce directly
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="govt-card hover-lift cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-accent-light mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track performance and market trends
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      </div>
    </div>
  );
};