
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, ChevronLeft } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/auth');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <header className="sticky top-0 z-10 glass px-4 py-3 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="mr-2 hover:bg-background/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        {location.pathname === '/dashboard' && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span className="text-xl font-medium">FamilyCart</span>
          </Link>
        )}
        
        {title && (
          <h1 className="text-xl font-medium truncate">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild 
          className="hover:bg-background/50"
        >
          <Link to="/profile">
            <User className="w-5 h-5" />
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSignOut} 
          className="hover:bg-background/50"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
