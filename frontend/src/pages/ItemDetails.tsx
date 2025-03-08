
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Receipt, ShoppingCart, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import UploadReceipt from '@/components/UploadReceipt';
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
import { formatCurrency } from '@/lib/utils';

// Mock data for the item until we integrate with the API
interface ItemDetails {
  id: string;
  name: string;
  quantity: string;
  addedBy: string;
  addedByName: string;
  purchased: boolean;
  cost?: number;
  purchasedBy?: string;
  purchasedByName?: string;
  itemDetails?: string;
  receipts?: string[]; // URLs to receipt images
}

const MOCK_ITEM: ItemDetails = {
  id: '1',
  name: 'Milk',
  quantity: '1 gallon',
  addedBy: 'user1',
  addedByName: 'John',
  purchased: false
};

const ItemDetails = () => {
  const { listId, itemId } = useParams<{ listId: string; itemId: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cost, setCost] = useState('');
  const [itemDetails, setItemDetails] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        
        // In a real app, this would be an API call
        // Mock data for now
        setItem(MOCK_ITEM);
        setCost(MOCK_ITEM.cost ? MOCK_ITEM.cost.toString() : '');
        setItemDetails(MOCK_ITEM.itemDetails || '');
        setLoading(false);
      } catch (error) {
        console.error('Error loading item:', error);
        toast.error('Failed to load item details');
        navigate(`/list/${listId}`);
      }
    };
    
    checkAuthAndLoadData();
  }, [listId, itemId, navigate]);
  
  const handleMarkPurchased = async () => {
    if (!item) return;
    
    try {
      const user = await getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      await api.items.markPurchased(listId!, itemId!, {
        purchasedBy: user.id,
        cost: parseFloat(cost) || 0,
        itemDetails: itemDetails.trim() || undefined
      });
      
      // Update local state
      setItem({
        ...item,
        purchased: true,
        purchasedBy: user.id,
        purchasedByName: user.username,
        cost: parseFloat(cost) || 0,
        itemDetails: itemDetails.trim() || undefined
      });
      
      toast.success('Item marked as purchased');
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      toast.error('Failed to update item');
    }
  };
  
  const handleUnmarkPurchased = async () => {
    // Note: This is a mock function as the API doesn't have a specific endpoint for this
    // In a real implementation, you might need to use a different approach or add this endpoint
    
    setItem(item ? { ...item, purchased: false, cost: undefined, purchasedBy: undefined } : null);
    toast.success('Item marked as not purchased');
  };
  
  const handleUpdateDetails = async () => {
    // Note: This is a mock function as the API doesn't have a specific endpoint for updating item details
    // In a real implementation, you might need to use a different approach or add this endpoint
    
    setItem(item ? {
      ...item,
      cost: parseFloat(cost) || undefined,
      itemDetails: itemDetails.trim() || undefined
    } : null);
    
    setIsEditing(false);
    toast.success('Item details updated');
  };
  
  const handleDeleteItem = async () => {
    try {
      await api.items.delete(listId!, itemId!);
      toast.success('Item deleted successfully');
      navigate(`/list/${listId}`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };
  
  if (loading || !item) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Item Details" showBack />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading item details...</p>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Header title="Item Details" showBack />
      
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto">
          <Card className="mb-4 animate-fade-in subtle-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                {item.purchased ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Purchased</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">Not purchased</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Quantity</Label>
                  <p className="text-foreground">{item.quantity}</p>
                </div>
                
                <div>
                  <Label>Added By</Label>
                  <p className="text-foreground">{item.addedByName || item.addedBy}</p>
                </div>
                
                {item.purchased && (
                  <>
                    <div>
                      <Label>Purchased By</Label>
                      <p className="text-foreground">{item.purchasedByName || item.purchasedBy}</p>
                    </div>
                    
                    <div>
                      <Label>Cost</Label>
                      <p className="text-foreground">{item.cost ? formatCurrency(item.cost) : 'Not specified'}</p>
                    </div>
                    
                    {item.itemDetails && (
                      <div>
                        <Label>Details</Label>
                        <p className="text-foreground whitespace-pre-wrap">{item.itemDetails}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            
            {!isEditing ? (
              <CardFooter className="flex gap-2 pt-2 pb-6">
                {item.purchased ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Details
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={handleUnmarkPurchased}
                    >
                      Mark Not Purchased
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    className="flex-1 gap-1.5"
                    onClick={() => setIsEditing(true)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Purchased
                  </Button>
                )}
              </CardFooter>
            ) : (
              <CardContent className="pb-6">
                <Separator className="my-4" />
                
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="Enter cost"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="details">Additional Details</Label>
                    <Textarea
                      id="details"
                      placeholder="Enter any additional details"
                      value={itemDetails}
                      onChange={(e) => setItemDetails(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false);
                        setCost(item.cost ? item.cost.toString() : '');
                        setItemDetails(item.itemDetails || '');
                      }}
                    >
                      Cancel
                    </Button>
                    
                    {item.purchased ? (
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={handleUpdateDetails}
                      >
                        Update Details
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="flex-1 gap-1.5"
                        onClick={handleMarkPurchased}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Purchased
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 animate-fade-in">
              <UploadReceipt
                listId={listId!}
                itemId={itemId}
                onReceiptUploaded={() => {
                  // In a real app, this would refresh the receipts from the API
                  console.log('Receipt uploaded');
                }}
              />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-1.5 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4" />
                    Delete Item
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this item? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            {item.receipts && item.receipts.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Attached Receipts
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {item.receipts.map((receipt, index) => (
                    <a
                      key={index}
                      href={receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-md overflow-hidden border subtle-shadow hover:card-shadow transition-default"
                    >
                      <img
                        src={receipt}
                        alt={`Receipt ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetails;
