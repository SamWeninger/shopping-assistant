
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ListCard from '@/components/ListCard';
import AddListForm from '@/components/AddListForm';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

// Mock data for lists until we can integrate with the API
// In a real app, this would be replaced with API calls
interface ShoppingList {
  id: string;
  name: string;
  itemCount: number;
  userCount: number;
  updatedAt: string;
  createdBy: string;
}

const MOCK_LISTS: ShoppingList[] = [
  {
    id: '1',
    name: 'Weekly Groceries',
    itemCount: 12,
    userCount: 3,
    updatedAt: new Date().toISOString(),
    createdBy: 'John'
  },
  {
    id: '2',
    name: 'Thanksgiving Dinner',
    itemCount: 8,
    userCount: 5,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'Sarah'
  },
  {
    id: '3',
    name: 'Hardware Store',
    itemCount: 5,
    userCount: 2,
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    createdBy: 'Mike'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate('/auth');
        } else {
          // In a real app, this would fetch lists from the API
          setLists(MOCK_LISTS);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleListAdded = () => {
    // In a real app, this would refresh lists from the API
    const newList = {
      id: `${lists.length + 1}`,
      name: 'New Shopping List',
      itemCount: 0,
      userCount: 1,
      updatedAt: new Date().toISOString(),
      createdBy: 'Me'
    };
    
    setLists([newList, ...lists]);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">My Shopping Lists</h1>
            <AddListForm onListAdded={handleListAdded} />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-pulse w-12 h-12 bg-primary/20 rounded-full mb-4 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary/40" />
              </div>
              <p className="text-muted-foreground">Loading your lists...</p>
            </div>
          ) : lists.length > 0 ? (
            <div className="space-y-3">
              {lists.map((list, index) => (
                <ListCard
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  itemCount={list.itemCount}
                  userCount={list.userCount}
                  updatedAt={list.updatedAt}
                  createdBy={list.createdBy}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Shopping Lists Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first shopping list to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
