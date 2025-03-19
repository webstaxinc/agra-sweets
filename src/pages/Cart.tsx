
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CartItem from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';
import { getCartDetails, getCurrentUser } from '@/lib/storage';

const Cart = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [cart, setCart] = useState(getCartDetails());
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCart(getCartDetails());
  }, [user, navigate]);
  
  const handleCartUpdate = () => {
    setCart(getCartDetails());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-foreground hover:text-primary transition-colors mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-foreground mb-6 animate-fade-in">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.community ? (
              <div className="bg-white rounded-lg border border-border p-4 mb-4 animate-fade-in">
                <h2 className="font-medium">Delivering to</h2>
                <p className="text-sm text-muted-foreground">{cart.community.name}</p>
              </div>
            ) : null}
            
            {cart.items.length > 0 ? (
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="px-4">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.product.id}
                      product={item.product}
                      quantity={item.quantity}
                      onUpdate={handleCartUpdate}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-border p-8 text-center animate-fade-in">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-medium mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-4">Looks like you haven't added any items to your cart yet.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="btn-primary"
                >
                  Browse Communities
                </button>
              </div>
            )}
          </div>
          
          <div>
            <OrderSummary 
              subtotal={cart.subtotal} 
              deliveryFee={cart.deliveryFee} 
              total={cart.total} 
            />
            
            {cart.items.length > 0 && (
              <div className="mt-4 animate-fade-in">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full py-3"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
