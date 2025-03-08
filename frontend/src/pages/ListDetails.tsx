
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ItemCard from '@/components/ItemCard';
import AddItemForm from '@/components/AddItemForm';
import UserManagement from '@/components/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { getCurrentUser, getUser } from '@/lib/auth';
import { toast } from 'sonner';
import api from '@/lib/api';

// Mock data for the items until we integrate with the API
interface Item {
  id: string;
  name: string;
  quantity: string;
  addedBy: string;
  purchased: boolean;
  cost?: number;
  purchasedBy?: string;
  hasReceipt?: boolean;
}

const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    name: 'Milk',
    quantity: '1 gallon',
    addedBy: 'John',
    purchased: false
  },
  {
    id: '2',
    name: 'Eggs',
    quantity: '1 dozen',
    addedBy: 'Sarah',
    purchased: true,
    cost: 3.99,
    purchasedBy: 'Sarah',
    hasReceipt: true
  },
  {
    id: '3',
    name: 'Bread',
    quantity: '2 loaves',
    addedBy: 'Mike',
    purchased: false
  }
];

// Mock users
const MOCK_USERS = [
  { id: 'user1', username: 'John' },
  { id: 'user2', username: 'Sarah' },
  { id: 'user3', username: 'Mike' }
];

const ListDetails = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  
  const [listName, setListName] = useState('Shopping List');
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        
        // In a real app, these would be API calls
        // mock data for now
        setListName('Weekly Groceries');
        setItems(MOCK_ITEMS);
        setLoading(false);
      } catch (error) {
        console.error('Error loading list:', error);
        toast.error('Failed to load shopping list');
        navigate('/dashboard');
      }
    };
    
    checkAuthAndLoadData();
  }, [listId, navigate]);
  
  const handleDeleteList = async () => {
    try {
      const user = await getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      await api.lists.delete(listId!, user.id);
      toast.success('List deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };
  
  const handleMarkPurchased = async (itemId: string, purchased: boolean) => {
    try {
      const user = await getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      if (purchased) {
        await api.items.markPurchased(listId!, itemId, {
          purchasedBy: user.id,
          cost: 0, // Default cost
        });
      }
      
      // Update the local state
      setItems(items.map(item => 
        item.id === itemId ? { ...item, purchased } : item
      ));
      
      toast.success(purchased ? 'Item marked as purchased' : 'Item marked as not purchased');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.items.delete(listId!, itemId);
      
      // Update the local state
      setItems(items.filter(item => item.id !== itemId));
      
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };
  
  const handleItemAdded = () => {
    // In a real app, this would refresh items from the API
    const newItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      quantity: '1',
      addedBy: 'Me',
      purchased: false
    };
    
    setItems([newItem, ...items]);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header title={listName} showBack />
      
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{listName}</h1>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Delete List
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Shopping List</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this shopping list? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteList}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">Shared With</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="space-y-4">
              <AddItemForm onItemAdded={handleItemAdded} />
              
              {loading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Loading items...</p>
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      listId={listId!}
                      name={item.name}
                      quantity={item.quantity}
                      addedBy={item.addedBy}
                      purchased={item.purchased}
                      cost={item.cost}
                      purchasedBy={item.purchasedBy}
                      hasReceipt={item.hasReceipt}
                      index={index}
                      onMarkPurchased={handleMarkPurchased}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No items in this list yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shared">
              <UserManagement 
                listId={listId!} 
                users={users} 
                onUsersChanged={() => {
                  // In a real app, this would refresh users from the API
                  console.log('Users changed');
                }} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ListDetails;
