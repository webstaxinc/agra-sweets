
import React from 'react';
import { Product } from '@/lib/types';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { addToCart, updateCartItemQuantity, getCart } from '@/lib/storage';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  communityId: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, communityId }) => {
  const { items } = getCart();
  const cartItem = items.find(item => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    
    addToCart(communityId, product.id, 1);
    toast.success(`Added ${product.name} to cart`);
  };

  const handleIncreaseQuantity = () => {
    if (!product.inStock) return;
    
    addToCart(communityId, product.id, 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 0) {
      updateCartItemQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-scale-up">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white mb-2" />
            <p className="text-white font-medium text-sm">Out of Stock</p>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-semibold">₹{product.price}</p>
          
          {quantity > 0 ? (
            <div className="flex items-center">
              <button
                onClick={handleDecreaseQuantity}
                className="p-1 rounded-full bg-secondary text-secondary-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="mx-2 min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={handleIncreaseQuantity}
                className={`p-1 rounded-full ${
                  product.inStock 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!product.inStock}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`btn-primary py-1.5 px-3 ${
                !product.inStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!product.inStock}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
