import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Product, CartItem, User, Order } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { productsService, ordersService } from './services/mockNestService';

// --- Context Definitions ---

interface AppContextType {
  user: User | null;
  login: (role: 'admin' | 'customer') => void;
  logout: () => void;
  
  products: Product[];
  refreshProducts: () => Promise<void>;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Promise<void>;
  
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-16 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 text-gray-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold text-gray-900 mb-2">Bob-Shop Dropshipping Inc.</p>
          <p className="text-sm">Powered by React 19 & Simulated NestJS Backend</p>
          <div className="mt-4 text-xs text-gray-400">
             Disclaimer: This is a demo application. No real payments are processed.
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    refreshProducts();
    const savedCart = localStorage.getItem('bob-shop-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    // Check for saved user session
    const savedUser = localStorage.getItem('bob-shop-user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('bob-shop-cart', JSON.stringify(cart));
  }, [cart]);

  const refreshProducts = async () => {
    const fetched = await productsService.findAll();
    setProducts(fetched);
  };

  // Actions
  const login = (role: 'admin' | 'customer') => {
    const newUser: User = {
      id: role === 'admin' ? 'admin-01' : 'cust-01',
      name: role === 'admin' ? 'Bob The Admin' : 'Alex Shopper',
      email: role === 'admin' ? 'bob@shop.com' : 'alex@gmail.com',
      role
    };
    setUser(newUser);
    localStorage.setItem('bob-shop-user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    toast.success(`Welcome back, ${newUser.name}!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bob-shop-user');
    setCart([]);
    toast('Logged out successfully');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    toast.success('Added to cart');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart(prev => prev.map(p => p.id === productId ? { ...p, quantity } : p));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toISOString(),
      status: 'pending'
    };
    await ordersService.create(newOrder);
    clearCart();
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, refreshProducts,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      placeOrder,
      isCartOpen, setIsCartOpen,
      isAuthModalOpen, setIsAuthModalOpen
    }}>
      <HashRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={user ? <Orders /> : <Navigate to="/" />} />
          </Routes>
        </MainLayout>
        
        <CartDrawer />
        <AuthModal />
        <Toaster position="bottom-right" />
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
