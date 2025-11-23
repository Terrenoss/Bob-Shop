export enum ProductSource {
  ALIEXPRESS = 'AliExpress',
  ALIBABA = 'Alibaba',
  LOCAL = 'Bob-Shop Inventory'
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
}

export interface CartItem extends Product {
  quantity: number;
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
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped';
  date: string;
}