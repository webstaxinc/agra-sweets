
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import OrderSummary from '@/components/OrderSummary';
import { getCartDetails, getCurrentUser, createOrder } from '@/lib/storage';
import { TimeSlot } from '@/lib/types';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [cart, setCart] = useState(getCartDetails());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('evening');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const cartDetails = getCartDetails();
    setCart(cartDetails);
    
    if (!cartDetails.community || cartDetails.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [user, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart.community) {
      toast.error('Something went wrong. Please try again.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      const order = createOrder(name, phone, address, timeSlot);
      
      if (order) {
        toast.success('Order placed successfully!');
        navigate(`/receipt/${order.id}`);
      } else {
        toast.error('Failed to place order. Please try again.');
        setIsLoading(false);
      }
    }, 1500);
  };
  
  if (!cart.community) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <button 
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1 text-foreground hover:text-primary transition-colors mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
        
        <h1 className="text-2xl font-bold text-foreground mb-6 animate-fade-in">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-border p-6 animate-fade-in">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Delivery Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field"
                      placeholder="Enter your complete address"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Community: {cart.community.name}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Delivery Time</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border ${timeSlot === 'morning' ? 'border-primary' : 'border-border'} rounded-lg cursor-pointer transition-colors`}>
                      <input
                        type="radio"
                        name="timeSlot"
                        value="morning"
                        checked={timeSlot === 'morning'}
                        onChange={() => setTimeSlot('morning')}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${timeSlot === 'morning' ? 'bg-primary' : 'border border-input'}`}>
                        {timeSlot === 'morning' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Morning</p>
                        <p className="text-sm text-muted-foreground">9:00 AM - 12:00 PM</p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border ${timeSlot === 'evening' ? 'border-primary' : 'border-border'} rounded-lg cursor-pointer transition-colors`}>
                      <input
                        type="radio"
                        name="timeSlot"
                        value="evening"
                        checked={timeSlot === 'evening'}
                        onChange={() => setTimeSlot('evening')}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${timeSlot === 'evening' ? 'bg-primary' : 'border border-input'}`}>
                        {timeSlot === 'evening' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Evening</p>
                        <p className="text-sm text-muted-foreground">4:00 PM - 7:00 PM</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Payment Method</h2>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-center text-muted-foreground">
                      <Clock className="w-5 h-5 inline-block mr-2" />
                      Payment integration coming soon. For now, proceed with mock payment.
                    </p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
          
          <div>
            <OrderSummary 
              subtotal={cart.subtotal} 
              deliveryFee={cart.deliveryFee} 
              total={cart.total} 
            />
            
            <div className="bg-white rounded-lg border border-border p-4 mt-4 animate-fade-in">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <ul className="space-y-2">
                {cart.items.map((item) => (
                  <li key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
