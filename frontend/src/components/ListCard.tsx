
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingBag, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

interface ListCardProps {
  id: string;
  name: string;
  itemCount: number;
  userCount: number;
  updatedAt: string;
  createdBy: string;
  index: number; // For staggered animations
}

const ListCard: React.FC<ListCardProps> = ({
  id,
  name,
  itemCount,
  userCount,
  updatedAt,
  createdBy,
  index,
}) => {
  const timeAgo = formatDistance(new Date(updatedAt), new Date(), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/list/${id}`}>
        <Card className="overflow-hidden subtle-shadow hover:card-shadow transition-default">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium truncate">{name}</h3>
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                <span>{itemCount} items</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{userCount} users</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-2 bg-muted/30 flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{timeAgo}</span>
            </div>
            <span>Created by {createdBy}</span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ListCard;
