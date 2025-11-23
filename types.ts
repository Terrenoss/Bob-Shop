

export enum ProductSource {
  ALIEXPRESS = 'AliExpress',
  ALIBABA = 'Alibaba',
  LOCAL = 'Bob-Shop Inventory'
}

export interface ProductVariant {
  name: string; // e.g. "Color", "Size"
  options: string[]; // e.g. ["Red", "Blue"], ["S", "M", "L"]
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // For dropshipping margin visualization
  image: string;
  category: string;
  source: ProductSource;
  isPublished: boolean;
  stock: number;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { "Color": "Red", "Size": "M" }
}

export interface SupplierProduct {
  id: string;
  rawTitle: string;
  rawDescription: string;
  wholesalePrice: number;
  supplierName: string;
  source: ProductSource;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  password?: string; // Only for mock auth logic
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
}

export interface OrderStatusHistory {
  status: Order['status'];
  date: string;
  note?: string;
}

export interface Address {
  name: string;
  line1: string;
  city: string;
  postalCode: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  
  // Financials
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: OrderStatusHistory[];
  date: string;
  
  // Shipping & Tracking
  shippingAddress: Address;
  billingAddress?: Address;
  
  trackingNumber?: string;
  carrier?: string;
  paymentMethod?: string;
  internalNotes?: string; // For admin use
}