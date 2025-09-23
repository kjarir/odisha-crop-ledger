import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Phone, 
  Leaf, 
  Wallet,
  Shield,
  Users,
  UserCheck
} from 'lucide-react';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <Card className="govt-card shadow-large">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your AgriTrace account to continue tracking and managing your agricultural produce.
              </CardDescription>
            </div>
            <Badge variant="outline" className="mx-auto">
              <Shield className="w-3 h-3 mr-1" />
              Government Verified Platform
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="credentials" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credentials" className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Credentials</span>
                </TabsTrigger>
                <TabsTrigger value="wallet" className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Web3 Wallet</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    variant={loginMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLoginMethod('email')}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant={loginMethod === 'phone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLoginMethod('phone')}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">
                      {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="identifier"
                        type={loginMethod === 'email' ? 'email' : 'tel'}
                        placeholder={
                          loginMethod === 'email' 
                            ? 'farmer@example.com' 
                            : '+91 98765 43210'
                        }
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {loginMethod === 'email' ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
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

                  <div className="flex items-center justify-between text-sm">
                    <Link to="/forgot-password" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button className="w-full gradient-primary" size="lg">
                    Sign In
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4">
                <div className="text-center py-8 space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-accent to-accent-light mx-auto">
                    <Wallet className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Connect Your Web3 Wallet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use your MetaMask, WalletConnect, or other Web3 wallet to sign in securely.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" size="lg">
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect MetaMask
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      <Users className="h-5 w-5 mr-2" />
                      WalletConnect
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Don't have a wallet? <Link to="/wallet-setup" className="text-primary hover:underline">Set one up</Link>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-white/80">
            Protected by Government of Odisha security protocols
          </p>
        </div>
      </div>
    </div>
  );
};