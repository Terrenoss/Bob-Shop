

export enum ProductSource {
  ALIEXPRESS = 'AliExpress',
  ALIBABA = 'Alibaba',
  LOCAL = 'Bob-Shop Inventory'
}

export interface ProductVariant {
  name: string; // e.g. "Color", "Size"
  options: string[]; // e.g. ["Red", "Blue"], ["S", "M", "L"]
}

export interface ProductSection {
  title: string;
  content: string;
  image?: string;
}

export interface Product {
  id: string;
  sku?: string; // Stock Keeping Unit
  title: string;
  description: string;
  
  // Pricing
  price: number; // Selling Price
  originalPrice?: number; // Compare at price (strikethrough)
  costPrice?: number; // Actual cost from supplier (Internal only)
  
  // Specific Tax/Shipping overrides
  shippingCost?: number; 
  taxRate?: number; 

  image: string; // Main thumbnail
  images?: string[]; // Gallery images
  category: string;
  source: ProductSource;
  supplierUrl?: string; // Link to AliExpress/Supplier (Internal only)
  
  isPublished: boolean;
  stock: number;
  variants?: ProductVariant[];

  // Rich Content
  sections?: ProductSection[];

  // Digital Product Fields
  isDigital?: boolean;
  digitalDownloadLink?: string; // Legacy field, prefer digitalContent
  digitalContent?: string; // The key/code/link to reveal
  deliveryTimeframe?: string; // e.g. "Instant", "24 hours", "7 days"
  requiredFields?: string[]; // e.g. ["Username", "Server Region"]

  // Condition & Dates
  condition?: 'new' | 'used';
  launchDate?: string; // ISO Date string
  endDate?: string; // ISO Date string (optional, if null = indefinite)
}

export interface Category {
  id: string;
  name: string; // e.g. "High-Tech"
  description?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  variant?: string; // e.g. "Color: Red, Size: M"
  images?: string[]; // URLs of images attached to review
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { "Color": "Red", "Size": "M" }
  customFieldValues?: Record<string, string>; // e.g. { "Username": "Player1", "Server": "EUW" }
  fulfillmentProofImage?: string; // Image URL for proof of sending
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

export interface Address {
  name: string;
  line1: string;
  city: string;
  postalCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  password?: string; // Only for mock auth logic
  defaultAddress?: Address;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
  startDate?: string;
  endDate?: string;
}

export interface OrderStatusHistory {
  status: Order['status'];
  date: string;
  note?: string;
  isTrackingUpdate?: boolean; // New flag for manual tracking events
  location?: string;
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

export interface StoreSettings {
  shippingCost: number;
  taxRate: number; // Decimal e.g. 0.20 for 20%
}

// Notifications & Chat
export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  date: string;
  type: 'info' | 'order' | 'chat';
  link?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface ChatContext {
  type: 'order' | 'general' | 'product';
  data?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number; // For admin/user depending on context, usually used to show admin unread messages
  userUnreadCount?: number; // For the user to see they have replies
  context?: ChatContext; // Persisted context for admin visibility
  status: 'open' | 'resolved';
}