
import { CartItem, Order, Product, TimeSlot, User } from './types';
import { communities, products, orders, users } from './data';

// User
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('current_user');
  return userJson ? JSON.parse(userJson) : null;
};

export const login = (email: string, password: string): User | null => {
  // Since this is a mock login, we're ignoring the password
  // and just checking if the email exists in our mock data
  const user = users.find((u) => u.email === email);
  
  if (user) {
    localStorage.setItem('current_user', JSON.stringify(user));
    return user;
  }
  
  return null;
};

export const logout = (): void => {
  localStorage.removeItem('current_user');
};

// Cart
export const getCart = (): { communityId: string | null, items: CartItem[] } => {
  const cartJson = localStorage.getItem('cart');
  return cartJson 
    ? JSON.parse(cartJson) 
    : { communityId: null, items: [] };
};

export const addToCart = (communityId: string, productId: string, quantity: number): void => {
  const cart = getCart();
  
  // If adding to a different community, clear the cart first
  if (cart.communityId && cart.communityId !== communityId) {
    clearCart();
    cart.items = [];
  }
  
  cart.communityId = communityId;
  
  const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
  
  if (existingItemIndex >= 0) {
    // Update quantity if item already exists
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({ productId, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const updateCartItemQuantity = (productId: string, quantity: number): void => {
  const cart = getCart();
  const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
  
  if (existingItemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(existingItemIndex, 1);
    } else {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

export const removeFromCart = (productId: string): void => {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.productId !== productId);
  
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const clearCart = (): void => {
  localStorage.setItem('cart', JSON.stringify({ communityId: null, items: [] }));
};

export const getCartDetails = () => {
  const { communityId, items } = getCart();
  
  if (!communityId || items.length === 0) {
    return {
      community: null,
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    };
  }
  
  const community = communities.find(c => c.id === communityId);
  
  const itemsWithDetails = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product,
      total: product ? product.price * item.quantity : 0,
    };
  }).filter(item => item.product); // Filter out items with no matching product
  
  const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.total, 0);
  const deliveryFee = community ? community.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  
  return {
    community,
    items: itemsWithDetails,
    subtotal,
    deliveryFee,
    total,
  };
};

// Orders
export const getAllOrders = (): Order[] => {
  const ordersJson = localStorage.getItem('orders');
  return ordersJson ? JSON.parse(ordersJson) : orders;
};

export const saveAllOrders = (orders: Order[]): void => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

export const getOrder = (orderId: string): Order | undefined => {
  const orders = getAllOrders();
  return orders.find(order => order.id === orderId);
};

export const createOrder = (
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  timeSlot: TimeSlot
): Order | null => {
  const user = getCurrentUser();
  const { community, items: cartItems, subtotal, deliveryFee, total } = getCartDetails();
  
  if (!user || !community || cartItems.length === 0) {
    return null;
  }
  
  const newOrder: Order = {
    id: Date.now().toString(),
    customerId: user.id,
    customerName,
    customerPhone,
    customerAddress,
    communityId: community.id,
    items: cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    })),
    timeSlot,
    deliveryFee,
    subtotal,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  const allOrders = getAllOrders();
  const updatedOrders = [newOrder, ...allOrders];
  saveAllOrders(updatedOrders);
  clearCart();
  
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['status']): Order | null => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    return null;
  }
  
  orders[orderIndex].status = status;
  saveAllOrders(orders);
  
  return orders[orderIndex];
};

// Products
export const getAllProducts = (): Product[] => {
  const productsJson = localStorage.getItem('products');
  return productsJson ? JSON.parse(productsJson) : products;
};

export const saveAllProducts = (products: Product[]): void => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const updateProduct = (productId: string, updates: Partial<Product>): Product | null => {
  const products = getAllProducts();
  const productIndex = products.findIndex(product => product.id === productId);
  
  if (productIndex === -1) {
    return null;
  }
  
  products[productIndex] = { ...products[productIndex], ...updates };
  saveAllProducts(products);
  
  return products[productIndex];
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getAllProducts();
  const newProduct = {
    ...product,
    id: Date.now().toString(),
  };
  
  saveAllProducts([...products, newProduct]);
  
  return newProduct;
};

export const deleteProduct = (productId: string): boolean => {
  const products = getAllProducts();
  const filteredProducts = products.filter(product => product.id !== productId);
  
  if (filteredProducts.length === products.length) {
    return false; // Product not found
  }
  
  saveAllProducts(filteredProducts);
  return true;
};

// Initialize localStorage with mock data on first load
export const initializeStorage = (): void => {
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(orders));
  }
  
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(products));
  }
};
