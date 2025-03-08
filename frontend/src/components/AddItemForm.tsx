
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getUser } from '@/lib/auth';

const AddItemForm: React.FC<{ onItemAdded: () => void }> = ({ onItemAdded }) => {
  const { listId } = useParams<{ listId: string }>();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const user = await getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      await api.items.add(listId!, {
        itemName: itemName.trim(),
        quantity: quantity.trim() || '1',
        addedBy: user.id
      });
      
      setItemName('');
      setQuantity('');
      toast.success('Item added successfully');
      onItemAdded();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <Input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Add new item..."
          className="flex-1"
          disabled={isSubmitting}
        />
        
        <Input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="w-20"
          disabled={isSubmitting}
        />
        
        <Button type="submit" size="icon" disabled={isSubmitting}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default AddItemForm;
