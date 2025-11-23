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

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    postalCode: string;
  };
}