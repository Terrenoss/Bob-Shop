import { Product, Order, User, ProductSource } from '../types';

// --- Simulated Database (LocalStorage) ---

const DB_KEYS = {
  PRODUCTS: 'bob-shop-db-products',
  ORDERS: 'bob-shop-db-orders',
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
    stock: 50
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
    stock: 12
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
    stock: 100
  }
];

// --- NestJS Service Simulation ---

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
}

class OrdersService {
  async findAll(userId?: string): Promise<Order[]> {
    const data = localStorage.getItem(DB_KEYS.ORDERS);
    const orders: Order[] = data ? JSON.parse(data) : [];
    if (userId) {
      return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return orders; // Admin sees all
  }

  async create(order: Order): Promise<Order> {
    const orders = await this.findAll();
    const newOrders = [order, ...orders];
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(newOrders));
    return order;
  }
}

// Export Singleton Instances
export const productsService = new ProductsService();
export const ordersService = new OrdersService();
