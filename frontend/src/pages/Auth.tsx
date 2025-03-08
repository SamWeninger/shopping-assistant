
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { signIn, signUp, confirmSignUp, getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          navigate('/dashboard');
        }
      } catch (error) {
        // User is not authenticated, show auth screen
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await signIn(username, password);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await signUp(username, password, email, phone);
      setNeedsConfirmation(true);
      toast.success('Sign up successful! Please check your email for confirmation code');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !confirmationCode) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await confirmSignUp(username, confirmationCode);
      setNeedsConfirmation(false);
      setActiveTab('signin');
      toast.success('Account confirmed successfully! You can now sign in');
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error(error.message || 'Failed to confirm account');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="flex items-center gap-2 mb-6 animate-fade-in">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">FamilyCart</h1>
      </div>
      
      <Card className="w-full max-w-md animate-scale-in subtle-shadow">
        {needsConfirmation ? (
          <>
            <CardHeader>
              <CardTitle>Verify Your Account</CardTitle>
              <CardDescription>
                Enter the confirmation code sent to your email
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleConfirmSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmationCode">Confirmation Code</Label>
                  <Input
                    id="confirmationCode"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={loading}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNeedsConfirmation(false)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Account'}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Welcome to FamilyCart</CardTitle>
              <CardDescription>
                Manage shopping lists with your family
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-username">Username</Label>
                      <Input
                        id="signin-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        disabled={loading}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username*</Label>
                      <Input
                        id="signup-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email*</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number (optional)"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password*</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        disabled={loading}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;
