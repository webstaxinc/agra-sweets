
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getOrder, getCurrentUser } from '@/lib/storage';
import { communities } from '@/lib/data';
import { Order } from '@/lib/types';
import { toast } from 'sonner';

const Receipt = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [order, setOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!id) {
      toast.error('Order ID is missing');
      navigate('/');
      return;
    }
    
    const orderData = getOrder(id);
    if (orderData) {
      setOrder(orderData);
    } else {
      toast.error('Order not found');
      navigate('/');
    }
  }, [id, navigate, user]);
  
  if (!order) {
    return null;
  }
  
  const community = communities.find(c => c.id === order.communityId);
  
  const getStatusIcon = () => {
    switch(order.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'out-for-delivery':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <Check className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getTimeSlotText = (timeSlot: 'morning' | 'evening') => {
    return timeSlot === 'morning' 
      ? '9:00 AM - 12:00 PM' 
      : '4:00 PM - 7:00 PM';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-foreground hover:text-primary transition-colors mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-border overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-foreground">Order Confirmation</h1>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground">
                  {getStatusIcon()}
                  <span className="text-sm font-medium capitalize">{order.status.replace(/-/g, ' ')}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Thank you for your order, {order.customerName}!
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Order Number</h3>
                  <p>#{order.id}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Order Date</h3>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Delivery Time</h3>
                  <p className="capitalize">{order.timeSlot} ({getTimeSlotText(order.timeSlot)})</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-medium mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Delivery Address</h3>
                    <p>{order.customerAddress}</p>
                    <p className="text-sm text-muted-foreground">{community?.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                    <p>{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium mb-2">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{order.deliveryFee.toFixed(2)}</span>
                </div>
                
                <div className="pt-2 mt-2 border-t border-border flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 animate-fade-in">
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
