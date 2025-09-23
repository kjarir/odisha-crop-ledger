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
      <div className="w-full max-w-lg">
        <Card className="govt-card shadow-large">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Join AgriTrace</CardTitle>
              <CardDescription>
                Create your account to start tracking agricultural produce with complete transparency and blockchain security.
              </CardDescription>
            </div>
            <Badge variant="outline" className="mx-auto">
              <Shield className="w-3 h-3 mr-1" />
              Government Verified Registration
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Your Role</Label>
              <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={role.id} id={role.id} className="mt-1" />
                    <label 
                      htmlFor={role.id} 
                      className="flex-1 cursor-pointer space-y-1 p-3 rounded-lg border hover:bg-muted/50 transition-smooth"
                    >
                      <div className="flex items-center space-x-2">
                        <role.icon className={`h-5 w-5 ${role.color}`} />
                        <span className="font-medium">{role.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Contact Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Preferred Contact Method</Label>
              <div className="flex space-x-2">
                <Button
                  variant={signupMethod === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSignupMethod('email')}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant={signupMethod === 'phone' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSignupMethod('phone')}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">
                  {signupMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Input
                    id="contact"
                    type={signupMethod === 'email' ? 'email' : 'tel'}
                    placeholder={
                      signupMethod === 'email' 
                        ? 'your.email@example.com' 
                        : '+91 98765 43210'
                    }
                    className="pl-10"
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

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
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
                <div className="space-y-2">
                  <Label htmlFor="farmLocation">Farm Location (District)</Label>
                  <Input
                    id="farmLocation"
                    placeholder="e.g., Cuttack, Bhubaneswar, Puri"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                Your information is protected by Government of Odisha data security protocols.
              </div>

              <Button className="w-full gradient-primary" size="lg">
                Create Account
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-white/80">
            Next: Email/SMS verification and role-specific onboarding
          </p>
        </div>
      </div>
    </div>
  );
};