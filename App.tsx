import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Shop } from './pages/Shop';
import { AdminDashboard } from './pages/AdminDashboard';
import { Checkout } from './pages/Checkout';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Product, CartItem, User, SupplierProduct, ProductSource } from './types';
import { Toaster, toast } from 'react-hot-toast';

// --- Context Definitions ---

interface AppContextType {
  user: User | null;
  login: (role: 'admin' | 'customer') => void;
  logout: () => void;
  
  products: Product[];
  addProduct: (product: Product) => void;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
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

// --- Mock Data ---

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Smart LED Sunset Lamp',
    description: 'Create the perfect golden hour vibe in your room anytime. 16 color modes controlled via app.',
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
    description: 'Ultra-lightweight aerospace grade titanium. Sapphire crystal glass. Water resistant.',
    price: 129.00,
    originalPrice: 45.00,
    category: 'Accessories',
    image: 'https://picsum.photos/400/400?random=2',
    source: ProductSource.LOCAL,
    isPublished: true,
    stock: 12
  }
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>© 2024 Bob-Shop Dropshipping Inc. Powered by NestJS (Simulated) & Gemini AI.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hydrate from localStorage (Mock Persistence)
  useEffect(() => {
    const savedCart = localStorage.getItem('bob-shop-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('bob-shop-cart', JSON.stringify(cart));
  }, [cart]);

  // Actions
  const login = (role: 'admin' | 'customer') => {
    setUser({
      id: 'u-123',
      name: role === 'admin' ? 'Bob The Admin' : 'Happy Customer',
      email: role === 'admin' ? 'bob@shop.com' : 'user@gmail.com',
      role
    });
    setIsAuthModalOpen(false);
    toast.success(`Welcome back, ${role === 'admin' ? 'Boss' : 'Friend'}!`);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    toast('Logged out successfully');
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    toast.success('Product imported to catalog');
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

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, addProduct,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, setIsCartOpen,
      isAuthModalOpen, setIsAuthModalOpen
    }}>
      <HashRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/checkout" element={<Checkout />} />
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