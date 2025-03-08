
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getUser } from '@/lib/auth';

interface AddListFormProps {
  onListAdded: () => void;
}

const AddListForm: React.FC<AddListFormProps> = ({ onListAdded }) => {
  const [listName, setListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const user = await getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      await api.lists.create({
        listName: listName.trim(),
        createdBy: user.id,
        allowedUsers: [user.id]
      });
      
      setListName('');
      setIsOpen(false);
      toast.success('List created successfully');
      onListAdded();
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="w-4 h-4" />
          New List
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shopping List</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="listName">List Name</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Weekly Groceries"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Create List
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListForm;
