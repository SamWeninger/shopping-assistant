
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getUser } from '@/lib/auth';

interface User {
  id: string;
  username?: string;
  email?: string;
}

interface UserManagementProps {
  listId: string;
  users: User[];
  onUsersChanged: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ listId, users, onUsersChanged }) => {
  const [newUserId, setNewUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await api.users.add(listId, newUserId.trim());
      setNewUserId('');
      toast.success('User added to list');
      onUsersChanged();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    try {
      const currentUser = await getUser();
      if (!currentUser) {
        toast.error('User not authenticated');
        return;
      }
      
      await api.users.remove(listId, userId, currentUser.id);
      toast.success('User removed from list');
      onUsersChanged();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Shared Users</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to List</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="Enter user ID"
                  disabled={isSubmitting}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {users.length > 0 ? (
          users.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 bg-muted rounded-md"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{user.username || user.email || user.id}</span>
              </div>
              
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => handleRemoveUser(user.id)} 
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No users added yet</p>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
