
import React from 'react';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal, deliveryFee, total }) => {
  return (
    <div className="rounded-lg border border-border p-4 bg-white animate-fade-in">
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>₹{deliveryFee.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="border-t border-border pt-2 mt-4">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
