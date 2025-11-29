



'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Product, CartItem, User, Order, Coupon, Category, StoreSettings, Notification, ChatContext, CarouselSlide } from '../types';
import { productsService, ordersService, authService, couponsService, categoriesService, settingsService, notificationsService, carouselService } from '../lib/mockNestService';
import { toast } from 'react-hot-toast';

interface AppContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  updateUser: (updates: Partial<User> & { oldPassword?: string, newPassword?: string }) => Promise<boolean>;
  logout: () => void;
  
  products: Product[];
  isProductsLoading: boolean;
  refreshProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, variants?: Record<string, string>, customFields?: Record<string, string>) => void;
  removeFromCart: (productId: string, variants?: Record<string, string>, customFields?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variants?: Record<string, string>, customFields?: Record<string, string>) => void;
  clearCart: () => void;
  
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  createCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  categories: Category[];
  createCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  settings: StoreSettings;
  updateSettings: (settings: Partial<StoreSettings>) => Promise<void>;

  carouselSlides: CarouselSlide[];
  createSlide: (slide: Omit<CarouselSlide, 'id'>) => Promise<void>;
  updateSlide: (id: string, slide: Partial<CarouselSlide>) => Promise<void>;
  deleteSlide: (id: string) => Promise<void>;

  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'statusHistory'>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  notifications: Notification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;

  currency: 'USD' | 'EUR';
  toggleCurrency: () => void;
  formatPrice: (amount: number) => string;

  // Chat State
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  chatContext: ChatContext | null;
  setChatContext: (context: ChatContext | null) => void;
  openSupportChat: (context?: ChatContext) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({ shippingCost: 4.99, taxRate: 0.08, carouselInterval: 5000 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);

  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

  // Initial Data Fetch
  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshSettings();
    refreshSlides();
    const savedCart = localStorage.getItem('bob-shop-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    // Check for saved user session
    const savedUser = localStorage.getItem('bob-shop-user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        refreshNotifications(parsedUser.id);
    }
  }, []);

  // Poll Notifications
  useEffect(() => {
      if (!user) {
          setNotifications([]);
          return;
      }
      refreshNotifications(user.id);
      const interval = setInterval(() => refreshNotifications(user.id), 5000);
      return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bob-shop-cart', JSON.stringify(cart));
  }, [cart]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'EUR' : 'USD');
  };

  const formatPrice = (amount: number) => {
    const rate = currency === 'EUR' ? 0.92 : 1;
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${(amount * rate).toFixed(2)}`;
  };

  const refreshProducts = async () => {
    setIsProductsLoading(true);
    // Simulate a small network delay for realistic skeleton viewing
    await new Promise(resolve => setTimeout(resolve, 800));
    const fetched = await productsService.findAll();
    setProducts(fetched);
    setIsProductsLoading(false);
  };

  const refreshCategories = async () => {
    const fetched = await categoriesService.findAll();
    setCategories(fetched);
  };

  const refreshSettings = async () => {
    const fetched = await settingsService.getSettings();
    setSettings(fetched);
  };

  const refreshSlides = async () => {
    const fetched = await carouselService.findAll();
    setCarouselSlides(fetched);
  };

  const refreshNotifications = async (userId: string) => {
      const fetched = await notificationsService.findAll(userId);
      setNotifications(fetched);
  };

  const markNotificationRead = async (id: string) => {
      await notificationsService.markAsRead(id);
      if (user) refreshNotifications(user.id);
  };

  const markAllNotificationsRead = async () => {
      if (user) {
          await notificationsService.markAllAsRead(user.id);
          refreshNotifications(user.id);
      }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await settingsService.updateSettings(newSettings);
    setSettings(updated);
    toast.success('Store settings updated');
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

  // Category Actions
  const createCategory = async (cat: Omit<Category, 'id'>) => {
    await categoriesService.create(cat);
    await refreshCategories();
    toast.success('Category created');
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await categoriesService.update(id, updates);
    await refreshCategories();
    toast.success('Category updated');
  };

  const deleteCategory = async (id: string) => {
    await categoriesService.delete(id);
    await refreshCategories();
    toast.success('Category deleted');
  };

  // Carousel Actions
  const createSlide = async (slide: Omit<CarouselSlide, 'id'>) => {
    await carouselService.create(slide);
    await refreshSlides();
    toast.success('Slide created');
  };

  const updateSlide = async (id: string, slide: Partial<CarouselSlide>) => {
    await carouselService.update(id, slide);
    await refreshSlides();
    toast.success('Slide updated');
  };

  const deleteSlide = async (id: string) => {
    await carouselService.delete(id);
    await refreshSlides();
    toast.success('Slide deleted');
  };

  // Actions
  const login = async (email: string) => {
    const foundUser = await authService.login(email);
    if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('bob-shop-user', JSON.stringify(foundUser));
        setIsAuthModalOpen(false);
        toast.success(`Welcome back, ${foundUser.name}!`);
        refreshNotifications(foundUser.id);
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
          refreshNotifications(newUser.id);
          return true;
      } catch (e) {
          toast.error("User already exists");
          return false;
      }
  };

  const updateUser = async (updates: Partial<User> & { oldPassword?: string, newPassword?: string }) => {
      if (!user) return false;
      try {
          const updated = await authService.update(user.id, updates);
          if (updated) {
              setUser(updated);
              localStorage.setItem('bob-shop-user', JSON.stringify(updated));
              toast.success('Profile updated successfully');
              return true;
          }
      } catch (e: any) {
          toast.error(e.message || 'Update failed');
      }
      return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bob-shop-user');
    setCart([]);
    setCoupon(null);
    setNotifications([]);
    setChatContext(null); // Clear context on logout
    toast('Logged out successfully');
  };

  // Helper to ensure consistent variant keys (sorted alphabetically)
  const getVariantKey = (variants?: Record<string, string>, customFields?: Record<string, string>) => {
      const vKey = variants ? JSON.stringify(Object.entries(variants).sort((a, b) => a[0].localeCompare(b[0]))) : '';
      const cKey = customFields ? JSON.stringify(Object.entries(customFields).sort((a, b) => a[0].localeCompare(b[0]))) : '';
      return `${vKey}|${cKey}`;
  };

  const addToCart = (product: Product, quantity = 1, variants?: Record<string, string>, customFields?: Record<string, string>) => {
    setCart(prev => {
      const variantKey = getVariantKey(variants, customFields);
      
      const existingIndex = prev.findIndex(p => {
          const pKey = getVariantKey(p.selectedVariants, p.customFieldValues);
          return p.id === product.id && pKey === variantKey;
      });

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { ...product, quantity, selectedVariants: variants, customFieldValues: customFields }];
    });
    setIsCartOpen(true);
    toast.success('Added to cart');
  };

  const removeFromCart = (productId: string, variants?: Record<string, string>, customFields?: Record<string, string>) => {
    const variantKey = getVariantKey(variants, customFields);
    setCart(prev => prev.filter(p => {
        const pKey = getVariantKey(p.selectedVariants, p.customFieldValues);
        return !(p.id === productId && pKey === variantKey);
    }));
  };

  const updateQuantity = (productId: string, quantity: number, variants?: Record<string, string>, customFields?: Record<string, string>) => {
    const variantKey = getVariantKey(variants, customFields);
    
    if (quantity < 1) {
        removeFromCart(productId, variants, customFields);
        return;
    }
    
    setCart(prev => prev.map(p => {
        const pKey = getVariantKey(p.selectedVariants, p.customFieldValues);
        if (p.id === productId && pKey === variantKey) {
            return { ...p, quantity };
        }
        return p;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
      const validCoupon = await couponsService.validate(code);
      if (!validCoupon) {
          toast.error("Invalid coupon or expired");
          return false;
      }
      
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      if (validCoupon.minOrder && subtotal < validCoupon.minOrder) {
          toast.error(`Minimum order of ${formatPrice(validCoupon.minOrder)} required`);
          return false;
      }

      setCoupon(validCoupon);
      toast.success("Coupon applied successfully!");
      return true;
  };

  const removeCoupon = () => {
      setCoupon(null);
      toast.success("Coupon removed");
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id'>) => {
      await couponsService.create(couponData);
      toast.success('Coupon created');
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
      await couponsService.update(id, couponData);
      toast.success('Coupon updated');
  };

  const deleteCoupon = async (id: string) => {
      await couponsService.delete(id);
      toast.success('Coupon deleted');
  };

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
    // Notification
    if (user) {
        await notificationsService.create({
            userId: user.id,
            message: `Order #${newOrder.id} placed successfully.`,
            type: 'order',
            link: '/orders'
        });
        refreshNotifications(user.id);
    }
  };

  const deleteOrder = async (id: string) => {
      await ordersService.delete(id);
      toast.success("Order deleted permanently");
  };

  const openSupportChat = (context?: ChatContext) => {
      setChatContext(context || null);
      setIsChatOpen(true);
  };

  return (
    <AppContext.Provider value={{
      user, login, register, updateUser, logout,
      products, isProductsLoading, refreshProducts, deleteProduct, updateProduct,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      coupon, applyCoupon, removeCoupon, createCoupon, updateCoupon, deleteCoupon,
      categories, createCategory, updateCategory, deleteCategory,
      settings, updateSettings,
      carouselSlides, createSlide, updateSlide, deleteSlide,
      placeOrder, deleteOrder,
      notifications, markNotificationRead, markAllNotificationsRead,
      isCartOpen, setIsCartOpen,
      isAuthModalOpen, setIsAuthModalOpen,
      currency, toggleCurrency, formatPrice,
      isChatOpen, setIsChatOpen, chatContext, setChatContext, openSupportChat
    }}>
      {children}
    </AppContext.Provider>
  );
};