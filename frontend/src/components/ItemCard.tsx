
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Receipt } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

interface ItemCardProps {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  addedBy: string;
  purchased: boolean;
  cost?: number;
  purchasedBy?: string;
  hasReceipt?: boolean;
  index: number;
  onMarkPurchased: (id: string, purchased: boolean) => void;
  onDelete: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  listId,
  name,
  quantity,
  addedBy,
  purchased,
  cost,
  purchasedBy,
  hasReceipt = false,
  index,
  onMarkPurchased,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <Card className={`overflow-hidden subtle-shadow transition-default ${purchased ? 'bg-muted/30' : 'bg-card'}`}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox 
              id={`item-${id}`}
              checked={purchased}
              onCheckedChange={(checked) => onMarkPurchased(id, checked as boolean)}
              className="data-[state=checked]:bg-primary"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Link to={`/list/${listId}/item/${id}`}>
                  <h4 className={`font-medium ${purchased ? 'line-through text-muted-foreground' : ''}`}>{name}</h4>
                </Link>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                <span className="truncate">{quantity}</span>
                {cost && (
                  <span className="ml-2 text-primary-foreground bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                    {formatCurrency(cost)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasReceipt && (
              <Receipt className="w-4 h-4 text-muted-foreground" />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-muted/50">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/list/${listId}/item/${id}`}>View details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
                  Delete item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
