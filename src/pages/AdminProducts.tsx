
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, RefreshCw, Trash, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { 
  getAllProducts, 
  updateProduct, 
  addProduct, 
  deleteProduct, 
  getCurrentUser 
} from '@/lib/storage';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

const AdminProducts = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New product form state
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    inStock: true,
  });
  
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
    
    refreshProducts();
  }, [user, navigate]);
  
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);
  
  const refreshProducts = () => {
    setProducts(getAllProducts());
  };
  
  const handleToggleStock = (product: Product) => {
    const updated = updateProduct(product.id, { inStock: !product.inStock });
    if (updated) {
      toast.success(`${product.name} is now ${updated.inStock ? 'in stock' : 'out of stock'}`);
      refreshProducts();
    }
  };
  
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      const success = deleteProduct(productId);
      if (success) {
        toast.success(`Deleted ${productName}`);
        refreshProducts();
      } else {
        toast.error('Failed to delete product');
      }
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      inStock: product.inStock,
    });
    setShowAddModal(true);
  };
  
  const handleAddProduct = () => {
    // Simple validation
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0 || !newProduct.image || !newProduct.category) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (editingProduct) {
      // Update existing product
      const updated = updateProduct(editingProduct.id, newProduct);
      if (updated) {
        toast.success(`Updated ${updated.name}`);
        refreshProducts();
        handleCloseModal();
      }
    } else {
      // Add new product
      const added = addProduct(newProduct);
      toast.success(`Added ${added.name}`);
      refreshProducts();
      handleCloseModal();
    }
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      inStock: true,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1 text-foreground hover:text-primary transition-colors mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </button>
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Products</h1>
            <p className="text-muted-foreground">Add, edit, or remove products from your catalog</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={refreshProducts}
              className="btn-secondary p-2 rounded-full"
              aria-label="Refresh products"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="max-w-full mx-auto">
          <div className="relative max-w-md w-full mb-6 animate-fade-in">
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
          
          {filteredProducts.length > 0 ? (
            <div className="bg-white rounded-lg border border-border overflow-hidden animate-fade-in">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{product.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-primary hover:text-primary/80 mx-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="text-destructive hover:text-destructive/80 mx-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-10 bg-white rounded-lg border border-border animate-fade-in">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-medium mb-2">No products found</h2>
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No products matching "${searchTerm}"`
                  : 'There are no products in the catalog yet'}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary mt-4"
                >
                  Add Product
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="input-field min-h-[100px]"
                    placeholder="Enter product description"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      className="input-field"
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="input-field"
                      placeholder="Enter category"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="input-field"
                    placeholder="Enter image URL"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                    className="h-4 w-4 text-primary border-input rounded focus:ring-primary"
                  />
                  <label htmlFor="inStock" className="ml-2 block text-sm text-foreground">
                    In Stock
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-4">
              <button 
                onClick={handleCloseModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                className="btn-primary"
              >
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
