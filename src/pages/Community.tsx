
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { communities } from '@/lib/data';
import { getAllProducts, getCurrentUser, getCartDetails } from '@/lib/storage';
import { toast } from 'sonner';

const Community = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allProducts = getAllProducts();
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  
  const community = communities.find(community => community.id === id);
  const { community: cartCommunity } = getCartDetails();
  
  const categories = Array.from(new Set(allProducts.map(product => product.category)));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!community) {
      toast.error('Community not found');
      navigate('/');
      return;
    }
    
    // Check if user is trying to order from a different community than what's in cart
    if (cartCommunity && cartCommunity.id !== id) {
      toast.warning('You already have items in your cart from another community. Your cart will be cleared if you add items from this community.');
    }
  }, [community, id, navigate, user, cartCommunity]);

  useEffect(() => {
    let filtered = allProducts;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, allProducts]);

  if (!community) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-foreground hover:text-primary transition-colors mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Communities</span>
        </button>
        
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src={community.image} 
                alt={community.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{community.name}</h1>
              <p className="text-muted-foreground">{community.address}</p>
            </div>
          </div>
        </header>
        
        <div className="max-w-md relative mb-6 animate-fade-in">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-12 w-full bg-white shadow-sm"
          />
        </div>
        
        <div className="mb-6 overflow-x-auto whitespace-nowrap pb-2 animate-fade-in">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`mr-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`mr-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                communityId={community.id} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 animate-fade-in">
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No products found matching "${searchTerm}"` 
                : 'No products available in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
