
import React from 'react';
import { Order } from '@/lib/types';
import { Clock, Package, CheckCircle } from 'lucide-react';
import { updateOrderStatus } from '@/lib/storage';
import { communities } from '@/lib/data';
import { toast } from 'sonner';

interface AdminOrderItemProps {
  order: Order;
  onUpdate: () => void;
}

const AdminOrderItem: React.FC<AdminOrderItemProps> = ({ order, onUpdate }) => {
  const community = communities.find(c => c.id === order.communityId);
  
  const getStatusIcon = () => {
    switch(order.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'out-for-delivery':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };
  
  const handleStatusUpdate = (status: Order['status']) => {
    updateOrderStatus(order.id, status);
    toast.success(`Order status updated to ${status}`);
    onUpdate();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white mb-6 animate-fade-in">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Order #{order.id}</h3>
              <span className="flex items-center gap-1 text-sm">
                {getStatusIcon()}
                <span>{order.status.replace(/-/g, ' ')}</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          
          <div className="text-right">
            <p className="font-medium">₹{order.total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{order.timeSlot} delivery</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Customer</h4>
            <p>{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Delivery Address</h4>
            <p>{order.customerAddress}</p>
            <p className="text-sm text-muted-foreground">{community?.name}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Items</h4>
            <p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
            <p className="text-sm text-muted-foreground">₹{order.subtotal.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-2">Order Items</h4>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {order.status !== 'delivered' && (
          <div className="mt-4 flex justify-end gap-3">
            {order.status === 'pending' && (
              <button 
                onClick={() => handleStatusUpdate('out-for-delivery')}
                className="btn-primary"
              >
                Mark Out for Delivery
              </button>
            )}
            
            {order.status === 'out-for-delivery' && (
              <button 
                onClick={() => handleStatusUpdate('delivered')}
                className="btn-primary"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderItem;
