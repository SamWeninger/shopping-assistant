
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LogOut, UserCircle, Mail, Phone } from 'lucide-react';
import { signOut, getCurrentUser, getUser } from '@/lib/auth';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    id: string;
    username: string;
    email: string;
    phone: string;
  } | null>(null);
  
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      try {
        const cognitoUser = await getCurrentUser();
        if (!cognitoUser) {
          navigate('/auth');
          return;
        }
        
        const user = await getUser();
        if (user) {
          setUserInfo({
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading user:', error);
        navigate('/auth');
      }
    };
    
    checkAuthAndLoadUser();
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Profile" showBack />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Header title="Profile" showBack />
      
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="subtle-shadow animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-6 h-6" />
                My Profile
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <div className="flex items-center">
                  <Input
                    value={userInfo?.id || ''}
                    readOnly
                    className="font-mono text-sm bg-muted"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(userInfo?.id || '');
                      toast.success('User ID copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this ID with others to be added to their shopping lists
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                  <span>{userInfo?.username || 'Not set'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>{userInfo?.email || 'Not set'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span>{userInfo?.phone || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-6">
              <Button
                variant="destructive"
                className="w-full gap-1.5"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground animate-fade-in">
            <p>FamilyCart App</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
