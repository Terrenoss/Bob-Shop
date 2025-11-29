'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../providers';
import { SupplierProduct, ProductSource, Order, Product, Coupon, User, Category, Review, ChatSession, ChatMessage, CartItem, CarouselSlide } from '../../types';
import { optimizeProductListing } from '../../lib/geminiService';
import { productsService, ordersService, couponsService, authService, categoriesService, reviewsService, settingsService, chatService } from '../../lib/mockNestService';
import { Button } from '../../components/ui/Button';
import { ProductFormModal } from '../../components/ProductFormModal';
import { OrderTimeline } from '../../components/OrderTimeline';
import { FormattedText } from '../../components/FormattedText';
import { Download, RefreshCw, TrendingUp, Globe, DollarSign, Package, ClipboardList, Trash2, Edit2, CheckSquare, Truck, AlertTriangle, X, Search, Filter, Calendar, MapPin, Save, Printer, BarChart3, ArrowUpRight, RotateCcw, Mail, FileText, Ban, MessageSquarePlus, History, CheckCircle, Ticket, Plus, Users, Shield, Clock, ExternalLink, Grid, Tag, KeyRound, Radio, Send, Star, Image as ImageIcon, MessageSquare, Settings, Upload, Eye, List, Key, ShieldCheck, User as UserIcon, Lock, ChevronRight, Layout, ArrowUp, ArrowDown, Paperclip, Check, Euro } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

// Mock Supplier Data
const MOCK_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  {
    id: 'sup-001',
    rawTitle: '2024 New Fashion Smart Watch Men Women Bluetooth Call Waterproof Wireless Charging 1.99 inch HD Screen',
    rawDescription: 'Features: Custom dial wallpaper, Bluetooth call, music control, social APP message reminder, incoming call reminder, text message reminder, heart rate monitoring...',
    wholesalePrice: 15.50,
    supplierName: 'Shenzhen Tech Factory',
    source: ProductSource.ALIEXPRESS,
    image: 'https://picsum.photos/400/400?random=10'
  },
  {
    id: 'sup-002',
    rawTitle: 'Portable Neck Fan Bladeless 4000mAh Rechargeable Silent Personal Fan for Home Outdoor',
    rawDescription: 'Hands free fan was designed as a headphone to free your hands anywhere; Fashion style makes you look so cool. Hanging around your neck...',
    wholesalePrice: 8.20,
    supplierName: 'Yiwu Gadgets Co.',
    source: ProductSource.ALIBABA,
    image: 'https://picsum.photos/400/400?random=11'
  }
];

// Color Presets for Carousel
const COLOR_THEMES = [
    { label: 'Digital Blue', from: 'from-blue-900/40', to: 'to-indigo-900/40', accent: 'text-blue-400', border: 'border-blue-500/30' },
    { label: 'Anime Pink', from: 'from-pink-900/40', to: 'to-purple-900/40', accent: 'text-pink-400', border: 'border-pink-500/30' },
    { label: 'Tech Emerald', from: 'from-emerald-900/40', to: 'to-cyan-900/40', accent: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Home Orange', from: 'from-orange-900/40', to: 'to-red-900/40', accent: 'text-orange-400', border: 'border-orange-500/30' },
    { label: 'Fashion Purple', from: 'from-purple-900/40', to: 'to-fuchsia-900/40', accent: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'Dark Zinc', from: 'from-zinc-900', to: 'to-black', accent: 'text-white', border: 'border-zinc-700' },
];

const AVAILABLE_ICONS = ['Gamepad2', 'Sparkles', 'Smartphone', 'Shirt', 'Home', 'Baby', 'Utensils', 'Gift', 'Zap', 'Star', 'Percent'];

export default function AdminPage() {
  const { 
      refreshProducts, products, deleteProduct, updateProduct, 
      user: currentUser, 
      createCoupon, updateCoupon, deleteCoupon,
      categories, createCategory, updateCategory, deleteCategory,
      carouselSlides, createSlide, updateSlide, deleteSlide,
      settings, updateSettings, deleteOrder, formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory' | 'orders' | 'coupons' | 'users' | 'categories' | 'reviews' | 'settings' | 'support' | 'carousel'>('orders');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Inventory Filter State
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low_stock'>('all');

  // Product Edit State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Order Management State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  
  // Local state for managing items inside the modal (Keys/Proofs/Location)
  const [localOrderItems, setLocalOrderItems] = useState<CartItem[]>([]);
  const [trackingLocation, setTrackingLocation] = useState(''); // Country/City code

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<Order[]>([]); // New: Store orders for selected user
  const [manualPassword, setManualPassword] = useState('');
  // Enhanced User Edit Fields
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  // Coupon Form State
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({ 
      code: '', type: 'percent', value: 0, minOrder: 0, startDate: '', endDate: '' 
  });
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  
  // Category Form State
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({ name: '', description: '' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Carousel Form State
  const [editingSlide, setEditingSlide] = useState<Partial<CarouselSlide>>({ 
      title: '', subtitle: '', description: '', iconName: 'Star', 
      colorClass: COLOR_THEMES[0].from + ' ' + COLOR_THEMES[0].to,
      accentClass: COLOR_THEMES[0].accent,
      borderClass: COLOR_THEMES[0].border,
      tags: [], categoryFilter: '' 
  });
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [slideTagInput, setSlideTagInput] = useState('');
  const [selectedColorTheme, setSelectedColorTheme] = useState(0);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({ shippingCost: 0, taxRate: 0, carouselInterval: 5000 });

  // Stats
  const [stats, setStats] = useState({
      revenue: 0,
      totalOrders: 0,
      lowStockCount: 0,
      avgOrderValue: 0
  });

  useEffect(() => {
      fetchData();
  }, [activeTab]);

  useEffect(() => {
    setSettingsForm({
        shippingCost: settings.shippingCost,
        taxRate: settings.taxRate,
        carouselInterval: settings.carouselInterval
    });
  }, [settings]);

  useEffect(() => {
      const editId = searchParams.get('editProduct');
      if (editId) {
          const productToEdit = products.find(p => p.id === editId);
          if (productToEdit) {
              setEditingProduct(productToEdit);
              setIsProductModalOpen(true);
          }
      }
  }, [searchParams, products]);

  // Fetch User Orders when selected user changes
  useEffect(() => {
      const fetchUserHistory = async () => {
          if (selectedUser) {
              const userOrders = await ordersService.findAll(selectedUser.id);
              setSelectedUserOrders(userOrders);
          } else {
              setSelectedUserOrders([]);
          }
      };
      fetchUserHistory();
  }, [selectedUser]);

  // Order Item Local State Sync
  useEffect(() => {
      if (selectedOrder) {
          setLocalOrderItems(JSON.parse(JSON.stringify(selectedOrder.items)));
          // Find latest location from history if available
          const lastLoc = selectedOrder.statusHistory?.slice().reverse().find(h => h.location)?.location || '';
          setTrackingLocation(lastLoc);
      }
  }, [selectedOrder]);

  // Chat Polling
  useEffect(() => {
      if (activeTab === 'support') {
          const interval = setInterval(async () => {
              const sessions = await chatService.getSessions();
              setChatSessions(sessions);
              
              if (activeChatSession) {
                  const msgs = await chatService.getMessages(activeChatSession.id);
                  if (msgs.length > activeChatMessages.length) {
                      setActiveChatMessages(msgs);
                  }
                  const currentSession = sessions.find(s => s.id === activeChatSession.id);
                  if (currentSession && currentSession.status !== activeChatSession.status) {
                      setActiveChatSession(currentSession);
                  }
              }
          }, 3000);
          return () => clearInterval(interval);
      }
  }, [activeTab, activeChatSession, activeChatMessages.length]);

  useEffect(() => {
      if (activeChatMessages.length && chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [activeChatMessages]);

  const fetchData = async () => {
      const allOrders = await ordersService.findAll();
      const allProducts = await productsService.findAll();
      const allCoupons = await couponsService.findAll();
      const usersList = await authService.findAll();
      const allReviews = await reviewsService.findAll();
      const chats = await chatService.getSessions();
      
      setAllUsers(usersList);
      setCoupons(allCoupons);
      setReviews(allReviews);
      setChatSessions(chats);

      // Calculate Stats
      const revenue = allOrders.filter(o => o.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
      const lowStock = allProducts.filter(p => p.stock < 10).length;
      const validOrders = allOrders.filter(o => o.status !== 'cancelled');
      const avgOrderValue = validOrders.length > 0 ? revenue / validOrders.length : 0;

      setStats({
          revenue,
          totalOrders: allOrders.length,
          lowStockCount: lowStock,
          avgOrderValue
      });
      setOrders(allOrders);
      
      if (activeTab === 'inventory') {
          refreshProducts();
      }
  };

  const handleImport = async (supplierProduct: SupplierProduct) => {
    setProcessingId(supplierProduct.id);
    toast.loading('AI Agent analyzing market fit...', { id: 'import-toast' });
    try {
      const optimized = await optimizeProductListing(supplierProduct);
      const newProduct: Product = {
        id: `local-${Date.now()}`,
        title: optimized.title,
        description: optimized.description,
        price: optimized.recommendedPrice,
        originalPrice: supplierProduct.wholesalePrice,
        image: supplierProduct.image,
        category: 'Imported',
        source: supplierProduct.source,
        isPublished: true,
        stock: 50, 
        variants: [{ name: 'Option', options: ['Default'] }]
      };
      await productsService.create(newProduct);
      await refreshProducts();
      toast.success('Product Synced & Optimized!', { id: 'import-toast' });
    } catch (error) {
      toast.error('Failed to import', { id: 'import-toast' });
    } finally {
      setProcessingId(null);
    }
  };

  // Product Handlers
  const handleDeleteProduct = async (id: string) => { if (confirm('Delete?')) await deleteProduct(id); };
  const handleCreateManualProduct = () => { setEditingProduct(null); setIsProductModalOpen(true); };
  const handleEditProduct = (p: Product) => { setEditingProduct(p); setIsProductModalOpen(true); };
  const handleSaveProduct = async (u: Partial<Product>) => { 
      if (editingProduct) await updateProduct(editingProduct.id, u);
      else {
          const newProduct: Product = { id: `prod-${Date.now()}`, isPublished: true, source: ProductSource.LOCAL, ...u as any };
          await productsService.create(newProduct);
          await refreshProducts();
      }
      setIsProductModalOpen(false); setEditingProduct(null); 
  };
  const handleCloseModal = () => { setIsProductModalOpen(false); setSearchParams({}); setEditingProduct(null); };
  const handleSaveSettings = async (e: React.FormEvent) => { e.preventDefault(); await updateSettings(settingsForm); };
  
  const saveCarouselSettings = async () => {
        await updateSettings({ carouselInterval: settingsForm.carouselInterval });
  };

  // Chat Handlers
  const handleSelectChatSession = async (session: ChatSession) => {
      setActiveChatSession(session);
      const msgs = await chatService.getMessages(session.id);
      setActiveChatMessages(msgs);
      if (session.unreadCount > 0) {
          await chatService.markAsRead(session.id, true);
          setChatSessions(prev => prev.map(s => s.id === session.id ? { ...s, unreadCount: 0 } : s));
      }
  };
  const handleSendAdminMessage = async (contentToSend?: string) => {
      const text = contentToSend || chatInput;
      if (!text.trim() || !activeChatSession || !currentUser) return;
      if (!contentToSend) setChatInput('');
      const tempMsg: ChatMessage = { id: 'temp-' + Date.now(), sessionId: activeChatSession.id, senderId: currentUser.id, content: text, timestamp: new Date().toISOString(), isAdmin: true };
      setActiveChatMessages(prev => [...prev, tempMsg]);
      await chatService.sendMessage(activeChatSession.id, currentUser.id, text, true);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { toast.error('Only images supported'); return; }
      const reader = new FileReader();
      reader.onload = () => { handleSendAdminMessage(`![${file.name}](${reader.result})`); };
      reader.readAsDataURL(file);
      if(fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleInsertText = (startTag: string, endTag: string = '') => {
      const textarea = chatInputRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);
      if (endTag) {
          const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end);
          setChatInput(newText);
          setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, end + startTag.length); }, 0);
      } else {
          const newText = text.substring(0, start) + startTag + text.substring(end);
          setChatInput(newText);
          setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, start + startTag.length); }, 0);
      }
  };
  const handleResolveSession = async () => {
      if (!activeChatSession) return;
      const newStatus = activeChatSession.status === 'resolved' ? 'open' : 'resolved';
      await chatService.updateSessionStatus(activeChatSession.id, newStatus);
      setActiveChatSession({ ...activeChatSession, status: newStatus });
      setChatSessions(prev => prev.map(s => s.id === activeChatSession.id ? { ...s, status: newStatus } : s));
      toast.success(newStatus === 'resolved' ? 'Chat marked as resolved' : 'Chat re-opened');
  };
  const handleDeleteSession = async () => {
      if (!activeChatSession) return;
      if (confirm('Delete chat?')) {
          await chatService.deleteSession(activeChatSession.id);
          setActiveChatSession(null); setActiveChatMessages([]);
          const sessions = await chatService.getSessions();
          setChatSessions(sessions);
          toast.success('Chat deleted');
      }
  };

  // Other Tab Handlers
  const handleOpenCouponModal = (c?: Coupon) => { setEditingCoupon(c || { code: '', type: 'percent', value: 0, minOrder: 0, startDate: '', endDate: '' }); setIsCouponModalOpen(true); };
  const handleSaveCoupon = async (e: React.FormEvent) => { e.preventDefault(); if (editingCoupon.id) await updateCoupon(editingCoupon.id, editingCoupon); else await createCoupon(editingCoupon as any); setIsCouponModalOpen(false); fetchData(); };
  const handleDeleteCoupon = async (id: string) => { if (confirm('Delete?')) { await deleteCoupon(id); fetchData(); } };
  const handleOpenCategoryModal = (c?: Category) => { setEditingCategory(c || { name: '', description: '' }); setIsCategoryModalOpen(true); };
  const handleSaveCategory = async (e: React.FormEvent) => { e.preventDefault(); if (editingCategory.id) await updateCategory(editingCategory.id, editingCategory); else await createCategory(editingCategory as any); setIsCategoryModalOpen(false); };
  const handleDeleteCategory = async (id: string) => { if (confirm('Delete?')) { await deleteCategory(id); } };
  const handleDeleteReview = async (id: string) => { if(confirm('Delete review?')) { await reviewsService.delete(id); fetchData(); } };
  
  // Carousel Handlers
  const handleOpenSlideModal = (s?: CarouselSlide) => {
      if (s) {
          setEditingSlide(s);
          setSlideTagInput(s.tags.join(', '));
          // Try to match theme
          const themeIdx = COLOR_THEMES.findIndex(t => t.from === s.colorClass.split(' ')[0]);
          setSelectedColorTheme(themeIdx !== -1 ? themeIdx : 0);
      } else {
          setEditingSlide({ 
              title: '', subtitle: '', description: '', iconName: 'Star', 
              colorClass: COLOR_THEMES[0].from + ' ' + COLOR_THEMES[0].to,
              accentClass: COLOR_THEMES[0].accent,
              borderClass: COLOR_THEMES[0].border,
              tags: [], categoryFilter: categories.length > 0 ? categories[0].name : '' 
          });
          setSlideTagInput('');
          setSelectedColorTheme(0);
      }
      setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const theme = COLOR_THEMES[selectedColorTheme];
      const finalSlide = {
          ...editingSlide,
          tags: slideTagInput.split(',').map(t => t.trim()).filter(Boolean),
          colorClass: `${theme.from} ${theme.to}`,
          accentClass: theme.accent,
          borderClass: theme.border
      };

      if (editingSlide.id) {
          await updateSlide(editingSlide.id, finalSlide);
      } else {
          await createSlide(finalSlide as any);
      }
      setIsSlideModalOpen(false);
  };

  const handleDeleteSlide = async (id: string) => {
      if (confirm('Delete slide?')) await deleteSlide(id);
  };

  // --- Order Modal Logic ---
  const openOrderModal = (o: Order) => { setSelectedOrder(o); setIsOrderModalOpen(true); };
  const closeOrderModal = () => { setIsOrderModalOpen(false); setTimeout(() => setSelectedOrder(null), 300); };

  const handleSaveOrderChanges = async (updatedFields: Partial<Order>) => {
      if (!selectedOrder) return;
      // Merge local items with updates
      const updates = { ...updatedFields, items: localOrderItems };
      await ordersService.update(selectedOrder.id, updates);
      
      setSelectedOrder(prev => prev ? ({ ...prev, ...updates }) : null);
      await fetchData();
      toast.success('Order saved successfully');
  };

  const handleItemFieldChange = (index: number, field: keyof CartItem, value: string) => {
      const newItems = [...localOrderItems];
      newItems[index] = { ...newItems[index], [field]: value };
      setLocalOrderItems(newItems);
  };

  const handleItemProofUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleItemFieldChange(index, 'fulfillmentProofImage', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddNoteToHistory = async () => {
      if (!selectedOrder || (!newNoteText.trim() && !trackingLocation.trim())) return;
      
      await ordersService.addNoteToHistory(
          selectedOrder.id, 
          newNoteText || 'Update', 
          !!trackingLocation, // mark as tracking update if location present
          trackingLocation
      );
      
      const updated = await ordersService.findOne(selectedOrder.id);
      if (updated) setSelectedOrder(updated);
      
      setNewNoteText('');
      setTrackingLocation(''); // Reset location field after adding
      await fetchData();
      toast.success('Timeline updated');
  };

  const handleRefund = async () => {
      if(!selectedOrder) return;
      if(!confirm(`Refund order #${selectedOrder.id}?`)) return;
      await ordersService.refund(selectedOrder.id);
      await fetchData();
      toast.success("Order refunded and inventory restored.");
      closeOrderModal();
  };

  const handleResendInvoice = () => { toast.success(`Invoice sent to ${selectedOrder?.shippingAddress.name}`); };

  // User Mgmt Handlers
  const handleOpenUserModal = (u: User) => { 
      setSelectedUser(u); 
      setEditingUser(u); // Initialize edit form with user data
      setManualPassword(''); 
      setIsUserModalOpen(true); 
  };
  
  const handleSaveUser = async () => {
      if (!selectedUser) return;
      try {
          await authService.update(selectedUser.id, editingUser);
          
          if (manualPassword) {
              await authService.resetPassword(selectedUser.id, manualPassword);
          }
          
          toast.success("User updated successfully");
          setIsUserModalOpen(false);
          fetchData();
      } catch (error) {
          toast.error("Failed to update user");
      }
  };

  const handleSendResetEmail = async (u: User) => { toast.loading("Sending..."); await new Promise(r => setTimeout(r, 1000)); toast.dismiss(); toast.success(`Reset email sent to ${u.email}`); };
  const handleDeleteUser = async (id: string) => {
      if(confirm('Delete user?')) {
          await authService.delete(id);
          fetchData();
          setIsUserModalOpen(false);
      }
  };

  const filteredOrders = orders.filter(o => (orderFilter === 'all' || o.status === orderFilter) && o.id.includes(orderSearch));

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-900/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 flex items-center gap-3">
            <Globe className="text-blue-500" size={28} />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1 font-medium text-sm md:text-base">Manage your store, products, and orders.</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={fetchData} className="bg-zinc-800 border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-700 w-full sm:w-auto">
                 <RefreshCw size={14} className="mr-2" /> Refresh Data
             </Button>
        </div>
      </div>

      {/* KPI Cards & Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-4 md:p-6 rounded-2xl border border-emerald-900/30 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">€{stats.revenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-zinc-800 text-emerald-400 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Euro size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-900/30 px-2 py-1 rounded w-fit">
              <TrendingUp size={12} /> +12.5% this week
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-4 md:p-6 rounded-2xl border border-blue-900/30 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Total Orders</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-zinc-800 text-blue-400 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Package size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-blue-400 flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded w-fit">
              <ArrowUpRight size={12} /> +5 new today
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 md:p-6 rounded-2xl border border-purple-900/30 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wide">Avg. Order Value</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">€{stats.avgOrderValue.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-zinc-800 text-purple-400 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-purple-400 flex items-center gap-1 bg-purple-900/30 px-2 py-1 rounded w-fit">
              Steady
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 p-4 md:p-6 rounded-2xl border border-amber-900/30 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Stock Alerts</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{stats.lowStockCount}</p>
            </div>
            <div className={`p-3 bg-zinc-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform ${stats.lowStockCount > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                <AlertTriangle size={24} />
            </div>
          </div>
          {stats.lowStockCount > 0 ? (
              <div className="text-xs font-medium text-red-400 flex items-center gap-1 bg-red-900/30 px-2 py-1 rounded w-fit">
                  Action Needed
              </div>
          ) : (
              <div className="text-xs font-medium text-amber-400 flex items-center gap-1 bg-amber-900/30 px-2 py-1 rounded w-fit">
                  All Good
              </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-1 flex gap-1 overflow-x-auto">
          {['orders', 'inventory', 'users', 'coupons', 'categories', 'reviews', 'carousel', 'suppliers', 'settings', 'support'].map((tab: any) => (
              <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
            <div className="p-4">
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input className="w-full md:w-64 pl-10 pr-4 py-2 border border-zinc-800 bg-zinc-950 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Search orders..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <button key={s} onClick={() => setOrderFilter(s)} className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors whitespace-nowrap ${orderFilter === s ? 'bg-white text-black' : 'bg-zinc-800 text-gray-400 hover:text-white'}`}>{s}</button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[700px]">
                        <thead className="bg-zinc-950 text-gray-400 font-bold uppercase text-xs border-b border-zinc-800">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-zinc-800/50 cursor-pointer transition-colors" onClick={() => openOrderModal(order)}>
                                        <td className="p-4 font-mono font-bold text-blue-400">#{order.id.replace('ord-', '')}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{order.shippingAddress.name}</div>
                                            <div className="text-xs text-gray-500">{order.shippingAddress.city}</div>
                                        </td>
                                        <td className="p-4 text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-white">€{order.total.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                                                order.status === 'delivered' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 
                                                order.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 
                                                'bg-yellow-900/20 text-yellow-400 border-yellow-900/50'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openOrderModal(order); }}>
                                                Manage
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package size={48} className="mb-4 opacity-20" />
                                            <p>No orders found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
            <div className="p-4">
                <div className="flex justify-end mb-4">
                    <Button onClick={handleCreateManualProduct}><Plus size={16} className="mr-2"/> Add Product</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-zinc-950 text-gray-400 font-bold uppercase text-xs border-b border-zinc-800">
                            <tr><th className="p-4">Product</th><th className="p-4">Stock</th><th className="p-4">Price</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={p.image} className="w-10 h-10 rounded bg-zinc-800 object-cover border border-zinc-700" />
                                        <span className="font-medium line-clamp-1 text-white">{p.title}</span>
                                    </td>
                                    <td className="p-4 text-gray-300">{p.stock}</td>
                                    <td className="p-4 text-white">€{p.price.toFixed(2)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"><Edit2 size={16}/></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* CAROUSEL TAB */}
        {activeTab === 'carousel' && (
            <div className="p-4 space-y-6">
                
                {/* Global Settings */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-xs font-bold mb-1 text-gray-400 uppercase">Auto-Play Interval (Seconds)</label>
                        <input 
                            type="number" step="1" min="0" 
                            value={settingsForm.carouselInterval / 1000} 
                            onChange={e => setSettingsForm({...settingsForm, carouselInterval: Number(e.target.value) * 1000})} 
                            className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Set to 0 to disable auto-play.</p>
                    </div>
                    <Button onClick={saveCarouselSettings} size="sm">Save Config</Button>
                </div>

                {/* Slides List Header */}
                <div className="flex justify-between items-center">
                    <div className="text-gray-400 text-sm">
                        Manage slides displayed on the homepage.
                    </div>
                    <Button onClick={() => handleOpenSlideModal()}><Plus size={16} className="mr-2"/> Add Slide</Button>
                </div>
                
                <div className="space-y-4">
                    {carouselSlides.map((slide) => (
                        <div key={slide.id} className="border border-zinc-800 bg-zinc-950 rounded-xl p-4 flex gap-4 items-center">
                            <div className={`w-24 h-16 rounded-lg bg-gradient-to-r ${slide.colorClass} flex-shrink-0 flex items-center justify-center border ${slide.borderClass}`}>
                                <span className={`text-xs font-bold ${slide.accentClass} uppercase`}>{slide.iconName}</span>
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-white text-lg">{slide.title}</h4>
                                <p className="text-sm text-gray-400 line-clamp-1">{slide.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-gray-400 flex items-center gap-1">
                                        <span className="text-gray-500">Icon:</span> {slide.iconName}
                                    </span>
                                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-gray-400 flex items-center gap-1">
                                        <span className="text-gray-500">Cat:</span> {slide.categoryFilter}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenSlideModal(slide)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"><Edit2 size={18}/></button>
                                <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
            <div className="p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-zinc-950 text-gray-400 font-bold uppercase text-xs border-b border-zinc-800">
                            <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 font-bold text-white">{u.name}</td>
                                    <td className="p-4 text-gray-400">{u.email}</td>
                                    <td className="p-4"><span className="bg-zinc-800 text-gray-300 px-2 py-1 rounded text-xs uppercase border border-zinc-700">{u.role}</span></td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenUserModal(u)}>Manage</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* SUPPLIERS TAB */}
        {activeTab === 'suppliers' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_SUPPLIER_PRODUCTS.map(p => (
                    <div key={p.id} className="border border-zinc-800 bg-zinc-950 rounded-xl p-4 flex flex-col gap-4">
                        <img src={p.image} className="w-full h-40 object-cover rounded-lg border border-zinc-800" />
                        <div>
                            <h4 className="font-bold line-clamp-2 text-white">{p.rawTitle}</h4>
                            <p className="text-sm text-gray-500 mt-1">{p.supplierName}</p>
                            <p className="font-bold text-lg mt-2 text-green-400">€{p.wholesalePrice.toFixed(2)}</p>
                        </div>
                        <Button onClick={() => handleImport(p)} isLoading={processingId === p.id} disabled={!!processingId}>Import Product</Button>
                    </div>
                ))}
            </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
            <div className="p-4">
                <div className="flex justify-end mb-4"><Button onClick={() => handleOpenCouponModal()}><Plus size={16} className="mr-2"/> Add Coupon</Button></div>
                <div className="space-y-2">
                    {coupons.map(c => (
                        <div key={c.id} className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg flex justify-between items-center">
                            <div className="text-white font-mono font-bold text-lg">{c.code} <span className="text-sm font-sans font-normal text-gray-400 ml-2">({c.value}{c.type === 'percent' ? '%' : '€'})</span></div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenCouponModal(c)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-400 hover:text-red-300">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
            <div className="p-4">
                <div className="flex justify-end mb-4"><Button onClick={() => handleOpenCategoryModal()}><Plus size={16} className="mr-2"/> Add Category</Button></div>
                <div className="space-y-2">
                    {categories.map(c => (
                        <div key={c.id} className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg flex justify-between items-center">
                            <span className="text-white font-bold">{c.name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenCategoryModal(c)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
            <div className="p-4 space-y-2">
                {reviews.map(r => (
                    <div key={r.id} className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">{r.userName}</span>
                                <div className="flex text-yellow-500 text-xs">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < r.rating ? "currentColor" : "none"} />)}
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">{r.comment}</p>
                        </div>
                        <button onClick={() => handleDeleteReview(r.id)} className="text-red-400 hover:bg-red-900/20 p-2 rounded transition-colors"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div className="p-8 max-w-lg">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Shipping Cost (€)</label>
                        <input type="number" step="0.01" value={settingsForm.shippingCost} onChange={e => setSettingsForm({...settingsForm, shippingCost: Number(e.target.value)})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Tax Rate (Decimal, e.g. 0.20)</label>
                        <input type="number" step="0.01" value={settingsForm.taxRate} onChange={e => setSettingsForm({...settingsForm, taxRate: Number(e.target.value)})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"/>
                    </div>
                    <Button type="submit">Save Settings</Button>
                </form>
            </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === 'support' && (
            <div className="h-[600px] flex flex-col md:flex-row">
                <div className="w-full md:w-64 border-r border-zinc-800 overflow-y-auto bg-zinc-950 h-1/3 md:h-auto">
                    {chatSessions.map(s => (
                        <div key={s.id} onClick={() => handleSelectChatSession(s)} className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors ${activeChatSession?.id === s.id ? 'bg-zinc-900' : ''}`}>
                            <div className="font-bold text-white">{s.userName}</div>
                            <div className="text-xs text-gray-500 truncate">{s.lastMessage}</div>
                            {s.unreadCount > 0 && <span className="text-xs bg-red-600 text-white px-1.5 rounded-full mt-1 inline-block">{s.unreadCount}</span>}
                        </div>
                    ))}
                </div>
                <div className="flex-1 flex flex-col bg-zinc-900 h-2/3 md:h-auto">
                    {activeChatSession ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {activeChatSession.context?.type === 'order' && activeChatSession.context.data && (
                                    <div className="mb-4 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 mx-4 mt-2">
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-700/50">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Related Order (#{(activeChatSession.context.data as Order).id})</span>
                                            <button 
                                                onClick={() => openOrderModal(activeChatSession.context!.data as Order)}
                                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                View Order Details <ExternalLink size={10} />
                                            </button>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                                                <img src={(activeChatSession.context.data as Order).items[0].image} className="w-full h-full object-cover opacity-80" alt="" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-bold text-white text-sm line-clamp-1">{(activeChatSession.context.data as Order).items[0].title}</h4>
                                                <div className="text-xs text-gray-500 mt-1">{(activeChatSession.context.data as Order).items[0].category} &bull; #{(activeChatSession.context.data as Order).items[0].sku || 'NOSKU'}</div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="font-bold text-white">{formatPrice((activeChatSession.context.data as Order).total)}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                                        (activeChatSession.context.data as Order).status === 'delivered' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                                        (activeChatSession.context.data as Order).status === 'cancelled' ? 'bg-red-900/30 text-red-400 border-red-800' :
                                                        'bg-blue-900/30 text-blue-400 border-blue-800'
                                                    }`}>
                                                        {(activeChatSession.context.data as Order).status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeChatMessages.map(m => (
                                    <div key={m.id} className={`p-3 rounded-lg max-w-[80%] text-sm ${m.isAdmin ? 'bg-blue-600 text-white self-end ml-auto' : 'bg-zinc-800 border border-zinc-700 text-gray-200 self-start'}`}>
                                        <FormattedText text={m.content} />
                                    </div>
                                ))}
                                <div ref={chatEndRef}></div>
                            </div>
                            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex gap-2">
                                <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none" placeholder="Reply..." onKeyDown={e => e.key === 'Enter' && handleSendAdminMessage()} />
                                <Button onClick={() => handleSendAdminMessage()}><Send size={16}/></Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start</div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* --- CAROUSEL SLIDE MODAL --- */}
      {isSlideModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl h-[100dvh] md:h-auto md:rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Layout size={20} /> {editingSlide.id ? 'Edit Slide' : 'Add Slide'}
                      </h3>
                      <button onClick={() => setIsSlideModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSaveSlide} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                              <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.title} onChange={e => setEditingSlide({...editingSlide, title: e.target.value})} placeholder="e.g. Summer Sale" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label>
                              <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.subtitle} onChange={e => setEditingSlide({...editingSlide, subtitle: e.target.value})} placeholder="e.g. LIMITED OFFER" />
                          </div>
                      </div>
                      
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea required rows={2} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.description} onChange={e => setEditingSlide({...editingSlide, description: e.target.value})} placeholder="Brief text describing the promotion..." />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Icon</label>
                              <select 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none"
                                  value={editingSlide.iconName}
                                  onChange={e => setEditingSlide({...editingSlide, iconName: e.target.value})}
                              >
                                  {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Category Filter</label>
                              <select 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none"
                                  value={editingSlide.categoryFilter}
                                  onChange={e => setEditingSlide({...editingSlide, categoryFilter: e.target.value})}
                              >
                                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Color Theme</label>
                              <select 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none"
                                  value={selectedColorTheme}
                                  onChange={e => setSelectedColorTheme(Number(e.target.value))}
                              >
                                  {COLOR_THEMES.map((theme, idx) => <option key={idx} value={idx}>{theme.label}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Background Image URL (Optional)</label>
                          <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none text-sm" value={editingSlide.backgroundImage || ''} onChange={e => setEditingSlide({...editingSlide, backgroundImage: e.target.value})} placeholder="https://..." />
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Tags (Comma Separated)</label>
                          <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={slideTagInput} onChange={e => setSlideTagInput(e.target.value)} placeholder="Sale, New, Hot" />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-4">
                          <Button variant="secondary" type="button" onClick={() => setIsSlideModalOpen(false)}>Cancel</Button>
                          <Button type="submit">Save Slide</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- ORDER MANAGER MODAL (Centered & Enhanced) --- */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-6xl h-[100dvh] md:h-auto md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-800 animate-in fade-in zoom-in duration-200 my-auto">
                
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Order #{selectedOrder.id}</h2>
                        <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs font-bold uppercase border border-blue-900/50">{selectedOrder.status}</span>
                            <span className="text-sm text-gray-500">{new Date(selectedOrder.date).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                        <Button variant="secondary" size="sm" onClick={() => toast.success('Printing...')}><Printer size={16} className="mr-2"/> Print</Button>
                        <button onClick={closeOrderModal} className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/20 custom-scrollbar md:max-h-[80vh]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT COLUMN: Items & Fulfillment */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Items List with Digital Fulfillment Console */}
                            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 overflow-hidden">
                                <div className="p-4 border-b border-zinc-800 bg-zinc-950 font-bold text-gray-300 flex justify-between">
                                    <span>Ordered Items ({localOrderItems.length})</span>
                                    <span className="text-xs text-purple-400 font-normal">Fulfillment Console</span>
                                </div>
                                <div className="divide-y divide-zinc-800">
                                    {localOrderItems.map((item, idx) => (
                                        <div key={idx} className="p-4 flex flex-col gap-4">
                                            {/* Item Info */}
                                            <div className="flex gap-4">
                                                <img src={item.image} className="w-16 h-16 rounded-lg object-cover border border-zinc-700 bg-zinc-800" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                                                        <span className="font-bold text-gray-300 text-sm">€{item.price} x {item.quantity}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.selectedVariants && Object.values(item.selectedVariants).join(', ')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fulfillment Console (Keys & Proofs) */}
                                            <div className="bg-blue-900/10 p-4 rounded-lg border border-blue-900/30 grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1"><Key size={10}/> Digital Key / Content</label>
                                                    <input 
                                                        className="w-full text-sm p-2 border border-blue-900/50 rounded bg-black/50 text-white font-mono focus:border-blue-500 outline-none" 
                                                        placeholder="Enter code/link/key here..."
                                                        value={item.digitalContent || ''}
                                                        onChange={(e) => handleItemFieldChange(idx, 'digitalContent', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1"><Upload size={10}/> Proof of Delivery (Image)</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input type="file" className="text-xs text-gray-500 w-full" onChange={(e) => handleItemProofUpload(idx, e)} />
                                                        {item.fulfillmentProofImage && (
                                                            <a href={item.fulfillmentProofImage} target="_blank" className="text-xs text-blue-400 underline flex items-center gap-1 flex-shrink-0"><Eye size={10}/> View</a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline & Manual Tracking Updates */}
                            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
                                <h3 className="font-bold text-gray-200 mb-4">Tracking & History</h3>
                                <OrderTimeline order={selectedOrder} />
                                
                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Add Tracking Update / Note</h4>
                                    <div className="flex flex-col gap-3">
                                        <input 
                                            className="border border-zinc-700 bg-zinc-950 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-600 outline-none" 
                                            placeholder="Status Note (e.g. Arrived in local country)" 
                                            value={newNoteText}
                                            onChange={e => setNewNoteText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-1 border border-zinc-700 bg-zinc-950 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-600 outline-none" 
                                                placeholder="Location (e.g. Paris, FR)" 
                                                value={trackingLocation}
                                                onChange={e => setTrackingLocation(e.target.value)}
                                            />
                                            <Button size="sm" onClick={handleAddNoteToHistory} disabled={!newNoteText && !trackingLocation}>Add Update</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Customer & Actions */}
                        <div className="space-y-6">
                            
                            {/* Customer Info */}
                            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-200 flex items-center gap-2"><UserIcon size={16}/> Customer</h3>
                                    <button 
                                        onClick={() => {
                                            const user = allUsers.find(u => u.id === selectedOrder.userId);
                                            if (user) {
                                                closeOrderModal();
                                                handleOpenUserModal(user);
                                            } else {
                                                toast.error("User profile not found");
                                            }
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wide flex items-center gap-1"
                                    >
                                        View Profile <ArrowUpRight size={10} />
                                    </button>
                                </div>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-white">{selectedOrder.shippingAddress.name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">User ID:</span> <span className="font-mono text-xs text-gray-400">{selectedOrder.userId}</span></div>
                                    <div className="pt-2 border-t border-zinc-800 mt-2">
                                        <span className="text-gray-500 block mb-1">Shipping Address:</span>
                                        <div className="bg-zinc-950 p-3 rounded text-gray-300 border border-zinc-800">
                                            {selectedOrder.shippingAddress.line1}<br/>
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics Config */}
                            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
                                <h3 className="font-bold text-gray-200 mb-3 flex items-center gap-2"><Truck size={16}/> Shipping Info</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Carrier</label>
                                        <input 
                                            className="w-full border border-zinc-700 bg-zinc-950 rounded px-2 py-1.5 text-sm text-white focus:border-blue-600 outline-none" 
                                            value={selectedOrder.carrier || ''} 
                                            onChange={e => handleSaveOrderChanges({ carrier: e.target.value })}
                                            placeholder="e.g. DHL"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Tracking Number</label>
                                        <input 
                                            className="w-full border border-zinc-700 bg-zinc-950 rounded px-2 py-1.5 text-sm font-mono text-white focus:border-blue-600 outline-none" 
                                            value={selectedOrder.trackingNumber || ''} 
                                            onChange={e => handleSaveOrderChanges({ trackingNumber: e.target.value })}
                                            placeholder="e.g. 1Z999..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
                                <h3 className="font-bold text-gray-200 mb-3 flex items-center gap-2"><DollarSign size={16}/> Payment</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span> <span className="text-gray-300">€{selectedOrder.subtotal?.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Shipping</span> <span className="text-gray-300">€{selectedOrder.shippingCost?.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-zinc-800"><span className="text-white">Total</span> <span className="text-white">€{selectedOrder.total.toFixed(2)}</span></div>
                                    <div className="mt-2 text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded text-center font-medium border border-green-900/30">
                                        Paid via {selectedOrder.paymentMethod || 'Credit Card'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 space-y-3">
                                <h3 className="font-bold text-gray-200 mb-3">Workflow Actions</h3>
                                <Button variant="secondary" className="w-full justify-start border-zinc-700 hover:bg-zinc-800" onClick={() => handleSaveOrderChanges({ status: 'processing' })} disabled={selectedOrder.status === 'processing'}><Package size={16} className="mr-2"/> Mark Processing</Button>
                                <Button variant="secondary" className="w-full justify-start border-zinc-700 hover:bg-zinc-800" onClick={() => handleSaveOrderChanges({ status: 'shipped' })} disabled={selectedOrder.status === 'shipped'}><Truck size={16} className="mr-2"/> Mark Shipped</Button>
                                <Button variant="secondary" className="w-full justify-start border-zinc-700 hover:bg-zinc-800" onClick={() => handleSaveOrderChanges({ status: 'delivered' })} disabled={selectedOrder.status === 'delivered'}><CheckCircle size={16} className="mr-2"/> Mark Delivered</Button>
                                <div className="border-t border-zinc-800 my-2 pt-2">
                                    <button onClick={handleResendInvoice} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 rounded flex items-center transition-colors"><Mail size={16} className="mr-2"/> Resend Invoice</button>
                                    <button onClick={handleRefund} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded flex items-center mt-1 transition-colors"><Ban size={16} className="mr-2"/> Refund Order</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Save Bar */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
                    <Button variant="secondary" onClick={closeOrderModal}>Cancel</Button>
                    <Button onClick={() => handleSaveOrderChanges({})}>Save All Changes</Button>
                </div>
            </div>
        </div>
      )}

      {/* --- USER MANAGEMENT MODAL --- */}
      {isUserModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg h-[100dvh] md:h-auto md:rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto custom-scrollbar flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <UserIcon size={20} /> Manage User
                      </h3>
                      <button onClick={() => setIsUserModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-6 flex-grow">
                      {/* Edit Fields */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" 
                                value={editingUser.name || ''} 
                                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                            <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" 
                                value={editingUser.email || ''} 
                                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                            <select 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none"
                                value={editingUser.role || 'customer'}
                                onChange={e => setEditingUser({...editingUser, role: e.target.value as 'admin'|'customer'})}
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                      </div>

                      {/* Purchase Statistics */}
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                              <History size={16} /> Purchase History
                          </h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                  <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Total Orders</span>
                                  <span className="text-xl font-bold text-white">{selectedUserOrders.length}</span>
                              </div>
                              <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                  <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Total Spent</span>
                                  <span className="text-xl font-bold text-green-400">
                                      {formatPrice(selectedUserOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0))}
                                  </span>
                              </div>
                          </div>
                          
                          <div className="max-h-40 overflow-y-auto custom-scrollbar border-t border-zinc-800 pt-2">
                              {selectedUserOrders.length > 0 ? (
                                  <table className="w-full text-left text-xs">
                                      <tbody className="divide-y divide-zinc-800">
                                          {selectedUserOrders.slice(0, 10).map(order => (
                                              <tr key={order.id} className="hover:bg-zinc-900/50 cursor-pointer" onClick={() => { setIsUserModalOpen(false); openOrderModal(order); }}>
                                                  <td className="py-2 text-blue-400 font-mono">#{order.id.replace('ord-', '')}</td>
                                                  <td className="py-2 text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                                                  <td className="py-2 text-white font-bold">{formatPrice(order.total)}</td>
                                                  <td className="py-2 text-right">
                                                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                          order.status === 'delivered' ? 'text-green-400 bg-green-900/20' : 
                                                          order.status === 'cancelled' ? 'text-red-400 bg-red-900/20' : 
                                                          'text-yellow-400 bg-yellow-900/20'
                                                      }`}>{order.status}</span>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              ) : (
                                  <p className="text-xs text-gray-500 text-center py-2">No purchase history found.</p>
                              )}
                          </div>
                      </div>

                      <div className="border-t border-zinc-800 pt-4">
                          <label className="block text-sm font-bold mb-2 text-gray-300 flex items-center gap-2">
                              <Lock size={14} /> Password Reset
                          </label>
                          <div className="flex gap-2 mb-2">
                              <input 
                                  className="flex-1 border border-zinc-700 bg-zinc-950 rounded px-3 py-2 text-white focus:border-blue-600 outline-none text-sm" 
                                  placeholder="New Password (Optional)" 
                                  value={manualPassword} 
                                  onChange={e => setManualPassword(e.target.value)} 
                              />
                          </div>
                          <Button variant="outline" size="sm" className="w-full border-zinc-700 text-gray-400 hover:text-white text-xs" onClick={() => handleSendResetEmail(selectedUser)}>
                              <Mail size={12} className="mr-2"/> Send Reset Email Instead
                          </Button>
                      </div>

                      <div className="border-t border-zinc-800 pt-4">
                          <button onClick={() => handleDeleteUser(selectedUser.id)} className="text-red-500 text-sm hover:underline w-full text-center hover:text-red-400 flex items-center justify-center gap-2">
                              <Trash2 size={14} /> Delete User Account permanently
                          </button>
                      </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                      <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveUser}>Save Changes</Button>
                  </div>
              </div>
          </div>
      )}

      {/* --- COUPON MODAL --- */}
      {isCouponModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md h-[100dvh] md:h-auto md:rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-200 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Ticket size={20} /> {editingCoupon.id ? 'Edit Coupon' : 'Create Coupon'}
                      </h3>
                      <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSaveCoupon} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
                          <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white uppercase font-mono tracking-wider focus:border-blue-600 outline-none" value={editingCoupon.code} onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value})} placeholder="CODE123" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingCoupon.type} onChange={e => setEditingCoupon({...editingCoupon, type: e.target.value as any})}>
                                  <option value="percent">Percentage (%)</option>
                                  <option value="fixed">Fixed Amount (€)</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Value</label>
                              <input required type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingCoupon.value} onChange={e => setEditingCoupon({...editingCoupon, value: Number(e.target.value)})} />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Minimum Order (€)</label>
                          <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingCoupon.minOrder} onChange={e => setEditingCoupon({...editingCoupon, minOrder: Number(e.target.value)})} />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                          <Button variant="secondary" type="button" onClick={() => setIsCouponModalOpen(false)}>Cancel</Button>
                          <Button type="submit">Save Coupon</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md h-[100dvh] md:h-auto md:rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-200 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Grid size={20} /> {editingCategory.id ? 'Edit Category' : 'Create Category'}
                      </h3>
                      <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
                          <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} placeholder="e.g. Electronics" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingCategory.description} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} placeholder="Category description..." />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                          <Button variant="secondary" type="button" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                          <Button type="submit">Save Category</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <ProductFormModal 
        isOpen={isProductModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
}