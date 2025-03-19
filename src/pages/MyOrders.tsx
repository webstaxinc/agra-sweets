
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Package, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getAllOrders, getCurrentUser } from '@/lib/storage';
import { Order } from '@/lib/types';
import { communities } from '@/lib/data';

const MyOrders = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const allOrders = getAllOrders();
    const userOrders = allOrders.filter(order => order.customerId === user.id);
    setOrders(userOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, [user, navigate]);
  
  const getStatusIcon = (status: Order['status']) => {
    switch(status) {
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">View your order history and status</p>
        </header>
        
        {orders.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {orders.map((order) => {
              const community = communities.find(c => c.id === order.communityId);
              return (
                <div 
                  key={order.id} 
                  className="border border-border rounded-lg overflow-hidden bg-white animate-fade-in"
                  onClick={() => navigate(`/receipt/${order.id}`)}
                >
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Order #{order.id}</h3>
                          <span className="flex items-center gap-1 text-sm">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status.replace(/-/g, ' ')}</span>
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
                    <div className="flex flex-col md:flex-row justify-between gap-4">
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
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-lg border border-border max-w-3xl mx-auto animate-fade-in">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-medium mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders yet
            </p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
