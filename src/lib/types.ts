
export interface Community {
  id: string;
  name: string;
  address: string;
  image: string;
  deliveryFee: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type TimeSlot = 'morning' | 'evening';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  communityId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  timeSlot: TimeSlot;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: 'pending' | 'out-for-delivery' | 'delivered';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface OrderAnalytics {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface ProductAnalytics {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}
