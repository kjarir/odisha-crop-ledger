import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');

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
      <div className="w-full max-w-md">
        <Card className="govt-card shadow-large">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold">Join AgriTrace</CardTitle>
            <Badge variant="outline" className="mx-auto text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Government Verified
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Role</Label>
              <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="grid grid-cols-1 gap-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={role.id} id={role.id} />
                    <label 
                      htmlFor={role.id} 
                      className="flex-1 cursor-pointer flex items-center space-x-2 p-2 rounded border hover:bg-muted/50 transition-smooth"
                    >
                      <role.icon className={`h-4 w-4 ${role.color}`} />
                      <div>
                        <span className="font-medium text-sm">{role.label}</span>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    className="pl-9"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={signupMethod === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSignupMethod('email')}
                  className="flex-1 text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
                <Button
                  variant={signupMethod === 'phone' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSignupMethod('phone')}
                  className="flex-1 text-xs"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Phone
                </Button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact" className="text-sm">
                  {signupMethod === 'email' ? 'Email' : 'Phone'}
                </Label>
                <div className="relative">
                  <Input
                    id="contact"
                    type={signupMethod === 'email' ? 'email' : 'tel'}
                    placeholder={signupMethod === 'email' ? 'your.email@example.com' : '+91 98765 43210'}
                    className="pl-9"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {signupMethod === 'email' ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    className="pl-9 pr-9"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {selectedRole === 'farmer' && (
                <div className="space-y-1">
                  <Label htmlFor="farmLocation" className="text-sm">Farm Location</Label>
                  <Input
                    id="farmLocation"
                    placeholder="District (e.g., Cuttack)"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                By creating account, you agree to{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link> &{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>.
              </div>

              <Button className="w-full gradient-primary">
                Create Account
              </Button>
            </div>

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