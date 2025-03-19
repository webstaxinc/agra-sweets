
import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { updateCartItemQuantity, removeFromCart } from '@/lib/storage';
import { Product } from '@/lib/types';

interface CartItemProps {
  product: Product;
  quantity: number;
  onUpdate: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ product, quantity, onUpdate }) => {
  const handleRemove = () => {
    removeFromCart(product.id);
    onUpdate();
  };

  const handleIncreaseQuantity = () => {
    updateCartItemQuantity(product.id, quantity + 1);
    onUpdate();
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateCartItemQuantity(product.id, quantity - 1);
      onUpdate();
    } else {
      handleRemove();
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border animate-fade-in">
      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">₹{product.price}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecreaseQuantity}
          className="p-1 rounded-full bg-secondary text-secondary-foreground"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="min-w-[25px] text-center">{quantity}</span>
        
        <button
          onClick={handleIncreaseQuantity}
          className="p-1 rounded-full bg-primary text-primary-foreground"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <p className="font-medium min-w-[60px] text-right">₹{product.price * quantity}</p>
      
      <button
        onClick={handleRemove}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Remove item"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartItem;
