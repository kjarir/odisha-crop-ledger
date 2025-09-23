import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Leaf, 
  Tractor,
  Store,
  Users,
  Shield
} from 'lucide-react';

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: selectedRole,
            farm_location: selectedRole === 'farmer' ? farmLocation : null,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'farmer',
      label: 'Farmer',
      description: 'Register and track your agricultural produce',
      icon: Tractor,
      color: 'text-primary'
    },
    {
      id: 'retailer',
      label: 'Retailer',
      description: 'Purchase and sell agricultural products',
      icon: Store,
      color: 'text-secondary'
    },
    {
      id: 'helper',
      label: 'Helper/Worker',
      description: 'Assist in farm operations and logistics',
      icon: Users,
      color: 'text-accent'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-sm">
        <Card className="govt-card shadow-large">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-lg font-bold">Join AgriTrace</CardTitle>
            <Badge variant="outline" className="mx-auto text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Gov Verified
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3 px-4 pb-4">
            <form onSubmit={handleSignup} className="space-y-3">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="grid gap-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={role.id} id={role.id} />
                      <label 
                        htmlFor={role.id} 
                        className="flex-1 cursor-pointer flex items-center space-x-2 text-sm"
                      >
                        <role.icon className={`h-3 w-3 ${role.color}`} />
                        <span>{role.label}</span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">Name</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-8 h-9"
                    required
                  />
                  <User className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8 h-9"
                    required
                  />
                  <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-8 pr-8 h-9"
                    required
                  />
                  <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {selectedRole === 'farmer' && (
                <div className="space-y-2">
                  <Label htmlFor="farmLocation" className="text-sm">Location</Label>
                  <Input
                    id="farmLocation"
                    placeholder="District"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-primary underline">Terms</Link>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary h-9" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Have account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};