
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Sandwich, BarChart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminOrderItem from '@/components/AdminOrderItem';
import { getAllOrders, getCurrentUser } from '@/lib/storage';
import { Order } from '@/lib/types';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }
    
    refreshOrders();
  }, [user, navigate]);
  
  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm) ||
        order.customerPhone.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);
  
  const refreshOrders = () => {
    setOrders(getAllOrders());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage orders and inventory</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/analytics')}
              className="btn-secondary flex items-center gap-2"
            >
              <BarChart className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="btn-secondary flex items-center gap-2"
            >
              <Sandwich className="w-4 h-4" />
              <span>Manage Products</span>
            </button>
          </div>
        </header>
        
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-12 w-full bg-white shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('out-for-delivery')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'out-for-delivery'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Out for Delivery
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'delivered'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>
          
          {filteredOrders.length > 0 ? (
            <div>
              {filteredOrders.map(order => (
                <AdminOrderItem 
                  key={order.id} 
                  order={order} 
                  onUpdate={refreshOrders} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-white rounded-lg border border-border animate-fade-in">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-medium mb-2">No orders found</h2>
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No orders matching "${searchTerm}"`
                  : statusFilter !== 'all'
                    ? `No orders with status "${statusFilter}"`
                    : 'There are no orders yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
