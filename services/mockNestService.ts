

import { Product, Order, User, ProductSource, Coupon, OrderStatusHistory } from '../types';

// --- Simulated Database (LocalStorage) ---

const DB_KEYS = {
  PRODUCTS: 'bob-shop-db-products',
  ORDERS: 'bob-shop-db-orders',
  USERS: 'bob-shop-db-users',
};

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Smart LED Sunset Lamp',
    description: 'Create the perfect golden hour vibe in your room anytime. 16 color modes controlled via app. USB powered, 180 degree rotation.',
    price: 29.99,
    originalPrice: 9.50,
    category: 'Home Decor',
    image: 'https://picsum.photos/400/400?random=1',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 50,
    variants: [{ name: 'Color', options: ['Sunset Red', 'Rainbow', 'Sunlight'] }]
  },
  {
    id: '2',
    title: 'Minimalist Titanium Watch',
    description: 'Ultra-lightweight aerospace grade titanium. Sapphire crystal glass. Water resistant up to 50m. Japanese quartz movement.',
    price: 129.00,
    originalPrice: 45.00,
    category: 'Accessories',
    image: 'https://picsum.photos/400/400?random=2',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 12,
    variants: [{ name: 'Strap', options: ['Leather Black', 'Leather Brown', 'Metal'] }]
  },
  {
    id: '3',
    title: 'Noise Cancelling Earbuds Pro',
    description: 'Active noise cancellation, transparency mode, and spatial audio. 24-hour battery life with charging case.',
    price: 89.99,
    originalPrice: 25.00,
    category: 'Electronics',
    image: 'https://picsum.photos/400/400?random=3',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 100,
    variants: [{ name: 'Color', options: ['White', 'Black'] }]
  }
];

const INITIAL_USERS: User[] = [
  { id: 'admin-01', name: 'Bob Admin', email: 'bob@shop.com', role: 'admin', password: 'admin' },
  { id: 'cust-01', name: 'Alex Customer', email: 'alex@gmail.com', role: 'customer', password: '123' }
];

const MOCK_COUPONS: Coupon[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0 },
  { code: 'SAVE20', type: 'fixed', value: 20, minOrder: 100 },
  { code: 'BOBSHOP', type: 'percent', value: 15, minOrder: 50 },
];

// --- NestJS Service Simulation ---

class AuthService {
  async findOne(email: string): Promise<User | undefined> {
    const data = localStorage.getItem(DB_KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : INITIAL_USERS;
    return users.find(u => u.email === email);
  }

  async login(email: string): Promise<User | undefined> {
    return this.findOne(email);
  }

  async register(user: Omit<User, 'id'>): Promise<User> {
    const data = localStorage.getItem(DB_KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : INITIAL_USERS;
    
    if (users.find(u => u.email === user.email)) {
      throw new Error('User already exists');
    }

    const newUser = { ...user, id: `user-${Date.now()}` };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }
}

class ProductsService {
  async findAll(): Promise<Product[]> {
    const data = localStorage.getItem(DB_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  }

  async findOne(id: string): Promise<Product | undefined> {
    const products = await this.findAll();
    return products.find(p => p.id === id);
  }

  async create(product: Product): Promise<Product> {
    const products = await this.findAll();
    const newProducts = [product, ...products];
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(newProducts));
    return product;
  }

  async delete(id: string): Promise<void> {
    const products = await this.findAll();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(newProducts));
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
      const products = await this.findAll();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return undefined;
      
      const updatedProduct = { ...products[index], ...updates };
      products[index] = updatedProduct;
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
      return updatedProduct;
  }
}

class OrdersService {
  async findAll(userId?: string): Promise<Order[]> {
    const data = localStorage.getItem(DB_KEYS.ORDERS);
    const orders: Order[] = data ? JSON.parse(data) : [];
    if (userId) {
      return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findOne(orderId: string): Promise<Order | undefined> {
    const orders = await this.findAll();
    return orders.find(o => o.id === orderId);
  }

  async create(order: Order): Promise<Order> {
    const orders = await this.findAll();
    
    // Initialize Status History
    if (!order.statusHistory) {
      order.statusHistory = [{
        status: order.status,
        date: new Date().toISOString(),
        note: 'Order placed'
      }];
    }

    const newOrders = [order, ...orders];
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(newOrders));
    
    // Decrement stock
    const prodService = new ProductsService();
    const allProducts = await prodService.findAll();
    
    for (const item of order.items) {
        const pIndex = allProducts.findIndex(p => p.id === item.id);
        if (pIndex !== -1) {
            allProducts[pIndex].stock = Math.max(0, allProducts[pIndex].stock - item.quantity);
        }
    }
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(allProducts));

    return order;
  }

  async update(orderId: string, updates: Partial<Order>): Promise<Order | undefined> {
    const orders = await this.findAll();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return undefined;

    const currentOrder = orders[index];
    const updatedOrder = { ...currentOrder, ...updates };

    // Check if status changed to record history
    if (updates.status && updates.status !== currentOrder.status) {
         updatedOrder.statusHistory.push({
            status: updates.status,
            date: new Date().toISOString(),
            note: updates.internalNotes || 'Status updated via Admin'
         });
    }

    orders[index] = updatedOrder;
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return updatedOrder;
  }

  async refund(orderId: string): Promise<Order | undefined> {
      const orders = await this.findAll();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) return undefined;

      const currentOrder = orders[index];
      
      // Prevent double refund logic could go here
      
      currentOrder.status = 'cancelled';
      currentOrder.statusHistory.push({
          status: 'cancelled',
          date: new Date().toISOString(),
          note: 'Refund processed by Admin'
      });
      
      // Restock items (Simplified)
      const prodService = new ProductsService();
      const allProducts = await prodService.findAll();
      for (const item of currentOrder.items) {
          const pIndex = allProducts.findIndex(p => p.id === item.id);
          if (pIndex !== -1) {
              allProducts[pIndex].stock += item.quantity;
          }
      }
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(allProducts));
      
      orders[index] = currentOrder;
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
      return currentOrder;
  }
}

class CouponsService {
    async validate(code: string): Promise<Coupon | null> {
        const coupon = MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
        return coupon || null;
    }
}

// Export Singleton Instances
export const productsService = new ProductsService();
export const ordersService = new OrdersService();
export const authService = new AuthService();
export const couponsService = new CouponsService();
