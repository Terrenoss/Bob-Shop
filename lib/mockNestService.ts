




import { Product, Order, User, ProductSource, Coupon, OrderStatusHistory, Review, Category, StoreSettings, Notification, ChatSession, ChatMessage, ChatContext } from '../types';

// --- Simulated Database (LocalStorage) ---

const DB_KEYS = {
  PRODUCTS: 'bob-shop-db-products',
  ORDERS: 'bob-shop-db-orders',
  USERS: 'bob-shop-db-users',
  REVIEWS: 'bob-shop-db-reviews',
  COUPONS: 'bob-shop-db-coupons',
  CATEGORIES: 'bob-shop-db-categories',
  SETTINGS: 'bob-shop-db-settings',
  NOTIFICATIONS: 'bob-shop-db-notifications',
  CHATS: 'bob-shop-db-chats',
  MESSAGES: 'bob-shop-db-messages',
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'High-Tech', description: 'Gadgets, Computers & Phones' },
  { id: 'cat-2', name: 'Home', description: 'Home Decor & Furniture' },
  { id: 'cat-3', name: 'Fashion', description: 'Clothing & Fashion' },
  { id: 'cat-4', name: 'Toys', description: 'Toys & Games' },
  { id: 'cat-5', name: 'Kids', description: 'Baby & Kids Care' },
  { id: 'cat-6', name: 'Anime & Manga', description: 'Figures, Cards, Manga & Cosplay' }, // Replaced Auto
  { id: 'cat-7', name: 'Digital', description: 'Gift Cards, Games, Software & Services' },
  { id: 'cat-8', name: 'Food', description: 'Snacks, Drinks & Gourmet Food' },
];

const INITIAL_SETTINGS: StoreSettings = {
    shippingCost: 0, 
    taxRate: 0 
};

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  // Anime & Manga (New)
  {
    id: 'ANIME-FIG-001',
    sku: 'ANI-GOKU-SSJ',
    title: 'Dragon Ball Z - Goku SSJ Figure (25cm)',
    description: 'High quality PVC figure. Detailed sculpting and painting. Comes with display stand.',
    price: 49.99,
    originalPrice: 65.00,
    costPrice: 20.00,
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 20,
    variants: [],
    condition: 'new',
    launchDate: new Date().toISOString(),
    sections: [
        {
            title: "Detailed Sculpting",
            content: "Every muscle and strand of hair is meticulously sculpted to capture Goku's Super Saiyan transformation in dynamic detail.",
            image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Premium Collector's Box",
            content: "Arrives in a beautiful window display box, perfect for keeping mint in box or displaying on your shelf.",
            image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop"
        }
    ]
  },
  {
    id: 'ANIME-CARD-001',
    sku: 'PKM-BOOSTER-BOX',
    title: 'Pokemon TCG: Obsidian Flames Booster Box',
    description: 'Factory sealed booster box containing 36 packs. Chance to pull rare Charizard cards.',
    price: 119.99,
    originalPrice: 140.00,
    costPrice: 90.00,
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 10,
    variants: [],
    condition: 'new',
    launchDate: new Date().toISOString()
  },

  // --- Digital & Gaming ---
  {
    id: 'DIG-GC-001',
    sku: 'DIG-STEAM-50',
    title: 'Steam Wallet Gift Card - $50 USD',
    description: 'Instant digital delivery code for Steam Wallet. Access thousands of games.',
    price: 50.00,
    originalPrice: 50.00,
    costPrice: 48.00,
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 999,
    variants: [{ name: 'Region', options: ['Global', 'US', 'EU'] }],
    shippingCost: 0,
    taxRate: 0,
    isDigital: true,
    deliveryTimeframe: 'Instant',
    digitalContent: 'STEAM-XXXX-YYYY-ZZZZ',
    condition: 'new'
  },
  {
    id: 'DIG-LOL-RP',
    sku: 'DIG-RIOT-RP',
    title: 'League of Legends - Skin Gift',
    description: 'We will gift you a skin of your choice (up to 1350 RP). Requires adding our bot as a friend.',
    price: 10.99,
    originalPrice: 15.00,
    costPrice: 9.50,
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 999,
    variants: [],
    shippingCost: 0,
    taxRate: 0,
    isDigital: true,
    deliveryTimeframe: '7 Days (Friendship Period)',
    requiredFields: ['Summoner Name', 'Server Region', 'Skin Name'],
    digitalContent: 'Order processed manually. Confirmation will be sent via email.',
    condition: 'new'
  },
  {
    id: 'DIG-WIN-11',
    sku: 'SOFT-WIN-11',
    title: 'Windows 11 Pro - Retail Key',
    description: 'Genuine license key for Windows 11 Professional. Instant delivery via email.',
    price: 14.99,
    originalPrice: 199.00,
    costPrice: 5.00,
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 50,
    variants: [],
    shippingCost: 0,
    taxRate: 0,
    isDigital: true,
    deliveryTimeframe: 'Instant',
    digitalContent: 'W11-PRO-XXXXX-YYYYY-ZZZZZ-12345',
    condition: 'new'
  },
  {
    id: 'DIG-SKIN-CS',
    sku: 'SKIN-AK47',
    title: 'CS2 Skin - AK-47 | Asiimov (Field-Tested)',
    description: 'Rare CS2 skin. Trade delivered via Steam Trade Link within 1 hour.',
    price: 45.00,
    originalPrice: 55.00,
    costPrice: 40.00,
    category: 'Digital',
    image: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 1,
    variants: [],
    shippingCost: 0,
    taxRate: 0,
    isDigital: true,
    deliveryTimeframe: '1-2 Hours',
    requiredFields: ['Steam Trade Link'],
    condition: 'used'
  },
  
  // Home (Maison)
  {
    id: '1',
    sku: 'HOME-LED-001',
    title: 'Smart LED Sunset Lamp',
    description: 'Create the perfect golden hour vibe in your room anytime. 16 color modes controlled via app.',
    price: 34.99,
    originalPrice: 49.99,
    costPrice: 8.50,
    supplierUrl: 'https://aliexpress.com/item/example1',
    category: 'Home',
    image: 'https://picsum.photos/400/400?random=1',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 50,
    variants: [{ name: 'Color', options: ['Sunset Red', 'Rainbow', 'Sunlight'] }],
    shippingCost: 0,
    taxRate: 0.20,
    condition: 'new',
    sections: [
        {
            title: "Golden Hour, Every Hour",
            content: "Transform your living space with the warm, calming glow of a sunset. Perfect for photography, relaxation, or setting a romantic mood.",
            image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "App Controlled Colors",
            content: "Choose from 16 million colors and various dynamic modes directly from your smartphone via Bluetooth.",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
        }
    ]
  },
  {
    id: '5',
    sku: 'HOME-DIFF-002',
    title: 'Zen Essential Oil Diffuser',
    description: 'Silent ultrasonic humidifier with soothing LED lighting. Perfect for yoga and meditation.',
    price: 29.99,
    originalPrice: 45.00,
    costPrice: 6.20,
    category: 'Home',
    image: 'https://picsum.photos/400/400?random=5',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 45,
    variants: [{ name: 'Finish', options: ['Light Wood', 'Dark Wood'] }],
    shippingCost: 4.99,
    condition: 'new'
  },
  // Fashion (Mode)
  {
    id: '7',
    sku: 'FASH-COAT-001',
    title: 'Waterproof Winter Coat',
    description: 'Warm parka with fleece lining. Water and wind resistant. Stylish design for the city.',
    price: 89.99,
    originalPrice: 120.00,
    costPrice: 35.00,
    category: 'Fashion',
    image: 'https://picsum.photos/400/400?random=7',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 15,
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Black', 'Navy', 'Khaki'] }],
    condition: 'new'
  },
  {
    id: '10',
    sku: 'FASH-DRSS-002',
    title: 'Bohemian Summer Dress',
    description: 'Lightweight dress with floral patterns. Breathable fabric and comfortable fit. Perfect for sunny days.',
    price: 39.99,
    originalPrice: 59.99,
    costPrice: 12.00,
    category: 'Fashion',
    image: 'https://picsum.photos/400/400?random=10',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 30,
    variants: [{ name: 'Size', options: ['S', 'M', 'L'] }],
    condition: 'new'
  },
  {
    id: '2',
    sku: 'ACC-WATCH-001',
    title: 'Minimalist Titanium Watch',
    description: 'Ultra-lightweight aerospace grade titanium. Sapphire crystal glass. An essential accessory to complete your style.',
    price: 149.00,
    originalPrice: 199.00,
    costPrice: 45.00,
    category: 'Fashion',
    image: 'https://picsum.photos/400/400?random=2',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 12,
    variants: [{ name: 'Strap', options: ['Black Leather', 'Brown Leather', 'Metal'] }],
    condition: 'new'
  },
  // Toys (Jouets)
  {
    id: '6',
    sku: 'TOY-RC-001',
    title: 'Off-Road RC Car',
    description: 'High-speed 4x4 RC vehicle, shock resistant. Long-lasting rechargeable battery. Ideal for outdoors.',
    price: 45.00,
    originalPrice: 89.00,
    costPrice: 18.50,
    category: 'Toys',
    image: 'https://picsum.photos/400/400?random=6',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 20,
    variants: [{ name: 'Color', options: ['Red', 'Blue', 'Green'] }],
    condition: 'new'
  },
  {
    id: '9',
    sku: 'TOY-ROBOT-002',
    title: 'Programmable Educational Robot',
    description: 'STEM robotics kit to learn coding while having fun. Compatible with tablet and smartphone.',
    price: 69.99,
    originalPrice: 99.00,
    costPrice: 28.00,
    category: 'Toys',
    image: 'https://picsum.photos/400/400?random=9',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 25,
    variants: [],
    condition: 'new'
  },
  {
    id: '12',
    sku: 'TOY-MAG-003',
    title: 'Magnetic Construction Set',
    description: '64 colorful magnetic pieces to develop creativity. Durable and safe ABS plastic.',
    price: 29.99,
    originalPrice: 45.00,
    costPrice: 11.00,
    category: 'Toys',
    image: 'https://picsum.photos/400/400?random=13',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 40,
    variants: [],
    condition: 'new'
  },
  // Kids (Enfants)
  {
    id: '8',
    sku: 'KID-LITE-001',
    title: 'Silicone Bear Night Light',
    description: 'Soft touch silicone night light, BPA free. 7 changing colors. USB rechargeable, perfect for the nursery.',
    price: 19.99,
    originalPrice: 35.00,
    costPrice: 6.00,
    category: 'Kids',
    image: 'https://picsum.photos/400/400?random=8',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 40,
    variants: [],
    condition: 'new'
  },
  {
    id: '11',
    sku: 'KID-BAG-002',
    title: 'Plush Bunny Backpack',
    description: 'Ultra-soft small backpack in the shape of a bunny for daycare or kindergarten. Adjustable straps.',
    price: 24.99,
    originalPrice: 30.00,
    costPrice: 8.50,
    category: 'Kids',
    image: 'https://picsum.photos/400/400?random=11',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 20,
    variants: [{ name: 'Color', options: ['Pink', 'Grey', 'White'] }],
    condition: 'new'
  },
  // High-Tech (Keep existing)
  {
    id: '3',
    sku: 'TECH-EAR-001',
    title: 'Pro Noise Cancelling Earbuds',
    description: 'Active noise cancellation, transparency mode, and spatial audio. 24-hour battery life with charging case.',
    price: 99.99,
    originalPrice: 150.00,
    costPrice: 25.00,
    category: 'High-Tech',
    image: 'https://picsum.photos/400/400?random=3',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 100,
    variants: [{ name: 'Color', options: ['White', 'Black'] }],
    shippingCost: 0,
    condition: 'new',
    sections: [
        {
            title: "Immersive Sound Experience",
            content: "Equipped with 11mm dynamic drivers and advanced noise cancellation, these earbuds deliver deep bass and crystal clear highs.",
            image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "All-Day Battery Life",
            content: "Enjoy up to 8 hours of listening time on a single charge, and up to 24 hours with the charging case.",
            image: "https://images.unsplash.com/photo-1605218457229-376bc89b4f91?q=80&w=800&auto=format&fit=crop"
        }
    ]
  },
  {
    id: '4',
    sku: 'TECH-BAG-002',
    title: 'Anti-Theft Urban Backpack',
    description: 'Ergonomic design with hidden zipper and integrated USB port. Ideal for daily commutes with your laptop.',
    price: 49.99,
    originalPrice: 75.00,
    costPrice: 15.00,
    category: 'High-Tech',
    image: 'https://picsum.photos/400/400?random=4',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 30,
    variants: [{ name: 'Color', options: ['Grey', 'Black', 'Navy'] }],
    condition: 'new'
  },
  // Food & Drink (New)
  {
    id: 'FOOD-COFFEE-001',
    sku: 'FOOD-BEAN-001',
    title: 'Artisan Espresso Beans (1kg)',
    description: 'Premium Arabica coffee beans roasted in Italy. Rich crema and chocolate notes.',
    price: 24.99,
    originalPrice: 32.00,
    costPrice: 10.00,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 100,
    variants: [{ name: 'Roast', options: ['Medium', 'Dark'] }],
    condition: 'new'
  }
];

const INITIAL_USERS: User[] = [
  { id: 'admin-01', name: 'Bob Admin', email: 'bob@shop.com', role: 'admin', password: 'admin' },
  { id: 'cust-01', name: 'Alex Customer', email: 'alex@gmail.com', role: 'customer', password: '123' },
  { id: 'cust-02', name: 'Marie Martin', email: 'marie@example.com', role: 'customer', password: '123' }
];

const INITIAL_REVIEWS: Review[] = [
  { 
      id: 'rev-1', 
      productId: '1', 
      userName: 'Sarah J.', 
      rating: 5, 
      comment: 'I love the lighting effect! The app is super easy to use.', 
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      variant: 'Color: Sunset Red',
      images: ['https://picsum.photos/200/200?random=101']
  },
  { 
      id: 'rev-2', 
      productId: '1', 
      userName: 'Mike T.', 
      rating: 4, 
      comment: 'Great lamp, but the USB cable is a bit short.', 
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      variant: 'Color: Rainbow'
  },
  { 
      id: 'rev-3', 
      productId: '3', 
      userName: 'Alex C.', 
      rating: 5, 
      comment: 'Better than the big brands. The bass is incredible.', 
      date: new Date(Date.now() - 86400000 * 10).toISOString(),
      variant: 'Color: Black'
  },
];

const INITIAL_COUPONS: Coupon[] = [
  { id: 'cpn-1', code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, startDate: new Date().toISOString() },
  { id: 'cpn-2', code: 'VIP20', type: 'fixed', value: 20, minOrder: 100, startDate: new Date().toISOString() },
  { id: 'cpn-3', code: 'BOBSHOP', type: 'percent', value: 15, minOrder: 50, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 30).toISOString() },
];

// --- NestJS Service Simulation ---

class SettingsService {
    async getSettings(): Promise<StoreSettings> {
        const data = localStorage.getItem(DB_KEYS.SETTINGS);
        return data ? JSON.parse(data) : INITIAL_SETTINGS;
    }

    async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
        const current = await this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    }
}

class AuthService {
  async findAll(): Promise<User[]> {
      const data = localStorage.getItem(DB_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
  }

  async findOne(email: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(u => u.email === email);
  }

  async login(email: string): Promise<User | undefined> {
    return this.findOne(email);
  }

  async register(user: Omit<User, 'id'>): Promise<User> {
    const users = await this.findAll();
    
    if (users.find(u => u.email === user.email)) {
      throw new Error('User already exists');
    }

    const newUser = { ...user, id: `user-${Date.now()}` };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  async update(id: string, updates: Partial<User> & { oldPassword?: string, newPassword?: string }): Promise<User | undefined> {
    const users = await this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    const currentUser = users[index];

    // Handle Password Change
    if (updates.newPassword) {
        if (currentUser.password !== updates.oldPassword && currentUser.role !== 'admin') { 
             throw new Error("Incorrect old password");
        }
        currentUser.password = updates.newPassword;
        delete updates.oldPassword;
        delete updates.newPassword;
    }
    
    const updatedUser = { ...currentUser, ...updates };
    users[index] = updatedUser;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return updatedUser;
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const users = await this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");
    
    users[index].password = newPassword;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  async delete(id: string): Promise<void> {
    const users = await this.findAll();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(newUsers));
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

class ReviewsService {
  async findAll(): Promise<Review[]> {
    const data = localStorage.getItem(DB_KEYS.REVIEWS);
    return data ? JSON.parse(data) : INITIAL_REVIEWS;
  }

  async findByProductId(productId: string): Promise<Review[]> {
    const reviews = await this.findAll();
    return reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async create(review: Omit<Review, 'id' | 'date'> & { date?: string }): Promise<Review> {
    const reviews = await this.findAll();
    
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: review.date || new Date().toISOString(),
      variant: review.variant,
      images: review.images
    };

    const newReviews = [newReview, ...reviews];
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(newReviews));
    return newReview;
  }

  async delete(id: string): Promise<void> {
      const reviews = await this.findAll();
      const newReviews = reviews.filter(r => r.id !== id);
      localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(newReviews));
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
    
    if (!order.statusHistory) {
      order.statusHistory = [{
        status: order.status,
        date: new Date().toISOString(),
        note: 'Order placed'
      }];
    }

    const newOrders = [order, ...orders];
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(newOrders));
    
    const prodService = new ProductsService();
    const allProducts = await prodService.findAll();
    
    for (const item of order.items) {
        const pIndex = allProducts.findIndex(p => p.id === item.id);
        if (pIndex !== -1) {
            allProducts[pIndex].stock = Math.max(0, allProducts[pIndex].stock - item.quantity);
        }
    }
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(allProducts));

    // NOTIFY ADMIN
    const notifService = new NotificationsService();
    await notifService.create({
        userId: 'admin-01',
        message: `New order #${order.id} placed.`,
        type: 'order',
        link: '/admin'
    });

    return order;
  }

  async update(orderId: string, updates: Partial<Order>): Promise<Order | undefined> {
    const orders = await this.findAll();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return undefined;

    const currentOrder = orders[index];
    const updatedOrder = { ...currentOrder, ...updates };

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

  async addNoteToHistory(orderId: string, note: string, isTrackingUpdate?: boolean, location?: string): Promise<Order | undefined> {
    const orders = await this.findAll();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return undefined;

    const currentOrder = orders[index];
    
    if (!currentOrder.statusHistory) {
        currentOrder.statusHistory = [];
    }

    currentOrder.statusHistory.push({
        status: currentOrder.status,
        date: new Date().toISOString(),
        note: note,
        isTrackingUpdate,
        location
    });

    orders[index] = currentOrder;
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return currentOrder;
  }

  async refund(orderId: string): Promise<Order | undefined> {
      const orders = await this.findAll();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) return undefined;

      const currentOrder = orders[index];
      
      currentOrder.status = 'cancelled';
      currentOrder.statusHistory.push({
          status: 'cancelled',
          date: new Date().toISOString(),
          note: 'Refund processed by Admin'
      });
      
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

  async delete(orderId: string): Promise<void> {
    const orders = await this.findAll();
    const newOrders = orders.filter(o => o.id !== orderId);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(newOrders));
  }
}

class CouponsService {
    async findAll(): Promise<Coupon[]> {
        const data = localStorage.getItem(DB_KEYS.COUPONS);
        return data ? JSON.parse(data) : INITIAL_COUPONS;
    }

    async create(couponData: Omit<Coupon, 'id'>): Promise<Coupon> {
        const coupons = await this.findAll();
        if (coupons.find(c => c.code.toUpperCase() === couponData.code.toUpperCase())) {
            throw new Error('Coupon code already exists');
        }
        
        const newCoupon: Coupon = {
            ...couponData,
            id: `cpn-${Date.now()}`,
            startDate: couponData.startDate || new Date().toISOString()
        };

        const newCoupons = [...coupons, newCoupon];
        localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(newCoupons));
        return newCoupon;
    }

    async update(id: string, updates: Partial<Coupon>): Promise<Coupon | undefined> {
        const coupons = await this.findAll();
        const index = coupons.findIndex(c => c.id === id);
        if (index === -1) return undefined;

        if (updates.code && updates.code.toUpperCase() !== coupons[index].code.toUpperCase()) {
             if (coupons.find(c => c.code.toUpperCase() === updates.code!.toUpperCase())) {
                throw new Error('Coupon code already exists');
            }
        }

        const updatedCoupon = { ...coupons[index], ...updates };
        coupons[index] = updatedCoupon;
        localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(coupons));
        return updatedCoupon;
    }

    async delete(id: string): Promise<void> {
        const coupons = await this.findAll();
        const newCoupons = coupons.filter(c => c.id !== id);
        localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(newCoupons));
    }

    async validate(code: string): Promise<Coupon | null> {
        const coupons = await this.findAll();
        const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
        
        if (!coupon) return null;

        const now = new Date();
        if (coupon.startDate && new Date(coupon.startDate) > now) {
            return null;
        }
        if (coupon.endDate && new Date(coupon.endDate) < now) {
            return null;
        }

        return coupon;
    }
}

class CategoriesService {
  async findAll(): Promise<Category[]> {
    const data = localStorage.getItem(DB_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  }

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const categories = await this.findAll();
    const newCategory: Category = { ...category, id: `cat-${Date.now()}` };
    const newCategories = [...categories, newCategory];
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(newCategories));
    return newCategory;
  }

  async update(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const categories = await this.findAll();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updated = { ...categories[index], ...updates };
    categories[index] = updated;
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
    return updated;
  }

  async delete(id: string): Promise<void> {
    const categories = await this.findAll();
    const newCategories = categories.filter(c => c.id !== id);
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(newCategories));
  }
}

class NotificationsService {
  async findAll(userId: string): Promise<Notification[]> {
      const data = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
      const all: Notification[] = data ? JSON.parse(data) : [];
      return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async create(notification: Omit<Notification, 'id' | 'date' | 'read'>): Promise<Notification> {
      const data = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
      const all: Notification[] = data ? JSON.parse(data) : [];
      
      const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          date: new Date().toISOString(),
          read: false
      };
      
      all.push(newNotification);
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(all));
      return newNotification;
  }

  async markAsRead(id: string): Promise<void> {
      const data = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
      if (!data) return;
      const all: Notification[] = JSON.parse(data);
      const index = all.findIndex(n => n.id === id);
      if (index !== -1) {
          all[index].read = true;
          localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(all));
      }
  }

  async markAllAsRead(userId: string): Promise<void> {
      const data = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
      if (!data) return;
      const all: Notification[] = JSON.parse(data);
      const updated = all.map(n => n.userId === userId ? { ...n, read: true } : n);
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }
}

class ChatService {
  async getSessions(userId?: string): Promise<ChatSession[]> {
      const data = localStorage.getItem(DB_KEYS.CHATS);
      const sessions: ChatSession[] = data ? JSON.parse(data) : [];
      if (userId) {
          return sessions.filter(s => s.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
      return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
      const data = localStorage.getItem(DB_KEYS.MESSAGES);
      const messages: ChatMessage[] = data ? JSON.parse(data) : [];
      return messages.filter(m => m.sessionId === sessionId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createSession(userId: string, userName: string): Promise<ChatSession> {
      const sessions = await this.getSessions();
      let session = sessions.find(s => s.userId === userId);
      if (!session) {
          session = {
              id: `sess-${Date.now()}`,
              userId,
              userName,
              lastMessage: 'Welcome to Support!',
              updatedAt: new Date().toISOString(),
              unreadCount: 0,
              userUnreadCount: 0,
              status: 'open'
          };
          sessions.push(session);
          localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(sessions));
      }
      return session;
  }

  async updateSessionContext(sessionId: string, context: ChatContext): Promise<void> {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
          sessions[index].context = context;
          localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(sessions));
      }
  }

  async updateSessionStatus(sessionId: string, status: 'open' | 'resolved'): Promise<void> {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
          sessions[index].status = status;
          localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(sessions));
      }
  }

  async deleteSession(sessionId: string): Promise<void> {
      const sessions = await this.getSessions();
      const newSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(newSessions));

      // Also delete messages associated with this session
      const data = localStorage.getItem(DB_KEYS.MESSAGES);
      if (data) {
          const messages: ChatMessage[] = JSON.parse(data);
          const newMessages = messages.filter(m => m.sessionId !== sessionId);
          localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(newMessages));
      }
  }

  async sendMessage(sessionId: string, senderId: string, content: string, isAdmin: boolean): Promise<ChatMessage> {
      const data = localStorage.getItem(DB_KEYS.MESSAGES);
      const messages: ChatMessage[] = data ? JSON.parse(data) : [];
      
      const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sessionId,
          senderId,
          content,
          timestamp: new Date().toISOString(),
          isAdmin
      };
      
      messages.push(newMessage);
      localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));

      // Update Session
      const sessions = await this.getSessions();
      const sIndex = sessions.findIndex(s => s.id === sessionId);
      if (sIndex !== -1) {
          sessions[sIndex].lastMessage = content;
          sessions[sIndex].updatedAt = new Date().toISOString();
          // If a new message is sent, re-open the chat if it was resolved
          if (sessions[sIndex].status === 'resolved') {
              sessions[sIndex].status = 'open';
          }

          if (isAdmin) {
              sessions[sIndex].userUnreadCount = (sessions[sIndex].userUnreadCount || 0) + 1;
              
              // Notify User
              const notifService = new NotificationsService();
              await notifService.create({
                  userId: sessions[sIndex].userId,
                  message: 'New support message received',
                  type: 'chat',
                  link: '/profile?tab=support'
              });
          } else {
              sessions[sIndex].unreadCount = (sessions[sIndex].unreadCount || 0) + 1;
              
              // Notify Admin
              const notifService = new NotificationsService();
              await notifService.create({
                  userId: 'admin-01',
                  message: `New message from ${sessions[sIndex].userName}`,
                  type: 'chat',
                  link: '/admin'
              });
          }
          localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(sessions));
      }

      return newMessage;
  }
  
  async markAsRead(sessionId: string, isAdminViewing: boolean): Promise<void> {
      const sessions = await this.getSessions();
      const sIndex = sessions.findIndex(s => s.id === sessionId);
      if (sIndex !== -1) {
          if (isAdminViewing) {
              sessions[sIndex].unreadCount = 0;
          } else {
              sessions[sIndex].userUnreadCount = 0;
          }
          localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(sessions));
      }
  }
}

export const productsService = new ProductsService();
export const ordersService = new OrdersService();
export const authService = new AuthService();
export const couponsService = new CouponsService();
export const reviewsService = new ReviewsService();
export const categoriesService = new CategoriesService();
export const settingsService = new SettingsService();
export const notificationsService = new NotificationsService();
export const chatService = new ChatService();