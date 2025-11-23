

import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Contact } from './pages/Contact';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Product, CartItem, User, Order } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { productsService, ordersService, authService } from './services/mockNestService';

// --- Context Definitions ---

interface AppContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  
  products: Product[];
  refreshProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, variants?: Record<string, string>) => void;
  removeFromCart: (productId: string, variants?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variants?: Record<string, string>) => void;
  clearCart: () => void;
  
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'statusHistory'>) => Promise<void>;
  
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
      {/* Increased top padding from pt-16 to pt-28 to prevent navbar overlap */}
      <main className="flex-grow pt-28 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  const deleteProduct = async (id: string) => {
    await productsService.delete(id);
    await refreshProducts();
    toast.success('Product deleted');
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await productsService.update(id, updates);
    await refreshProducts();
    toast.success('Product updated');
  };

  // Actions
  const login = async (email: string) => {
    const foundUser = await authService.login(email);
    if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('bob-shop-user', JSON.stringify(foundUser));
        setIsAuthModalOpen(false);
        toast.success(`Welcome back, ${foundUser.name}!`);
        return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'>) => {
      try {
          const newUser = await authService.register(userData);
          setUser(newUser);
          localStorage.setItem('bob-shop-user', JSON.stringify(newUser));
          setIsAuthModalOpen(false);
          toast.success('Account created successfully!');
          return true;
      } catch (e) {
          toast.error("User already exists");
          return false;
      }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bob-shop-user');
    setCart([]);
    toast('Logged out successfully');
  };

  // Helper to ensure consistent variant keys (sorted alphabetically)
  const getVariantKey = (variants?: Record<string, string>) => {
      if (!variants) return '';
      // Sort entries by key to ensure {Color: "Red", Size: "M"} === {Size: "M", Color: "Red"}
      return JSON.stringify(Object.entries(variants).sort((a, b) => a[0].localeCompare(b[0])));
  };

  const addToCart = (product: Product, quantity = 1, variants?: Record<string, string>) => {
    setCart(prev => {
      const variantKey = getVariantKey(variants);
      
      const existingIndex = prev.findIndex(p => {
          const pKey = getVariantKey(p.selectedVariants);
          return p.id === product.id && pKey === variantKey;
      });

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { ...product, quantity, selectedVariants: variants }];
    });
    setIsCartOpen(true);
    toast.success('Added to cart');
  };

  const removeFromCart = (productId: string, variants?: Record<string, string>) => {
    const variantKey = getVariantKey(variants);
    setCart(prev => prev.filter(p => {
        const pKey = getVariantKey(p.selectedVariants);
        return !(p.id === productId && pKey === variantKey);
    }));
  };

  const updateQuantity = (productId: string, quantity: number, variants?: Record<string, string>) => {
    const variantKey = getVariantKey(variants);
    
    if (quantity < 1) {
        removeFromCart(productId, variants);
        return;
    }
    
    setCart(prev => prev.map(p => {
        const pKey = getVariantKey(p.selectedVariants);
        if (p.id === productId && pKey === variantKey) {
            return { ...p, quantity };
        }
        return p;
    }));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'statusHistory'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toISOString(),
      statusHistory: [{
          status: 'pending',
          date: new Date().toISOString(),
          note: 'Order placed'
      }]
    };
    await ordersService.create(newOrder);
    await refreshProducts(); // Update stock
    clearCart();
  };

  return (
    <AppContext.Provider value={{
      user, login, register, logout,
      products, refreshProducts, deleteProduct, updateProduct,
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
            <Route path="/contact" element={<Contact />} />
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