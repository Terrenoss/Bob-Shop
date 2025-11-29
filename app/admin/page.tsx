

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
import { Download, RefreshCw, TrendingUp, Globe, DollarSign, Package, ClipboardList, Trash2, Edit2, CheckSquare, Truck, AlertTriangle, X, Search, Filter, Calendar, MapPin, Save, Printer, BarChart3, ArrowUpRight, RotateCcw, Mail, FileText, Ban, MessageSquarePlus, History, CheckCircle, Ticket, Plus, Users, Shield, Clock, ExternalLink, Grid, Tag, KeyRound, Radio, Send, Star, Image as ImageIcon, MessageSquare, Settings, Upload, Eye, List, Key, ShieldCheck, User as UserIcon, Lock, ChevronRight, Layout, ArrowUp, ArrowDown } from 'lucide-react';
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

const AVAILABLE_ICONS = ['Gamepad2', 'Sparkles', 'Smartphone', 'Zap', 'Gift', 'Star', 'Flame', 'Rocket', 'Globe'];
const COLOR_PRESETS = [
    { name: 'Digital Blue', colorClass: 'from-blue-900/40 to-indigo-900/40', accentClass: 'text-blue-400' },
    { name: 'Anime Pink', colorClass: 'from-pink-900/40 to-purple-900/40', accentClass: 'text-pink-400' },
    { name: 'Tech Green', colorClass: 'from-emerald-900/40 to-cyan-900/40', accentClass: 'text-emerald-400' },
    { name: 'Golden Hour', colorClass: 'from-amber-900/40 to-orange-900/40', accentClass: 'text-amber-400' },
    { name: 'Dark Mode', colorClass: 'from-zinc-900 to-black', accentClass: 'text-white' },
];

export default function AdminPage() {
  const { 
      refreshProducts, products, deleteProduct, updateProduct, 
      user: currentUser, 
      createCoupon, updateCoupon, deleteCoupon,
      categories, createCategory, updateCategory, deleteCategory,
      settings, updateSettings, deleteOrder, formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory' | 'orders' | 'coupons' | 'users' | 'categories' | 'reviews' | 'settings' | 'support'>('orders');
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
  const [selectedUserOrders, setSelectedUserOrders] = useState<Order[]>([]); 
  const [manualPassword, setManualPassword] = useState('');
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  // Coupon Form State
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({ 
      code: '', type: 'percent', value: 0, minOrder: 0, startDate: '', endDate: '' 
  });
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  
  // Category Form State
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({ name: '', description: '' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Settings & Carousel Form State
  const [settingsForm, setSettingsForm] = useState({ shippingCost: 0, taxRate: 0, carouselInterval: 5000 });
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<CarouselSlide>>({
      title: '', subtitle: '', desc: '', iconName: 'Sparkles', colorClass: 'from-blue-900/40 to-indigo-900/40', accentClass: 'text-blue-400', categoryFilter: '', tags: []
  });
  const [slideTagsInput, setSlideTagsInput] = useState('');

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

  // ... (Keep existing product/order/user handlers) ...
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

  // --- Carousel Handlers ---
  const handleOpenSlideModal = (slide?: CarouselSlide) => {
      if (slide) {
          setEditingSlide(slide);
          setSlideTagsInput(slide.tags.join(', '));
      } else {
          setEditingSlide({
              title: '', subtitle: '', desc: '', iconName: 'Sparkles', 
              colorClass: 'from-blue-900/40 to-indigo-900/40', accentClass: 'text-blue-400', 
              categoryFilter: categories.length > 0 ? categories[0].name : '', 
              tags: []
          });
          setSlideTagsInput('');
      }
      setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
      e.preventDefault();
      const tags = slideTagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const newSlide = { ...editingSlide, tags } as CarouselSlide;
      
      let newSlides = [...(settings.carouselSlides || [])];
      
      if (editingSlide.id) {
          // Update existing
          newSlides = newSlides.map(s => s.id === editingSlide.id ? newSlide : s);
      } else {
          // Create new
          newSlide.id = `slide-${Date.now()}`;
          newSlides.push(newSlide);
      }
      
      await updateSettings({ carouselSlides: newSlides });
      setIsSlideModalOpen(false);
      toast.success('Carousel updated successfully');
  };

  const handleDeleteSlide = async (id: string) => {
      if (!confirm('Delete this slide?')) return;
      const newSlides = settings.carouselSlides.filter(s => s.id !== id);
      await updateSettings({ carouselSlides: newSlides });
      toast.success('Slide removed');
  };

  // ... (Keep existing chat/coupon/category handlers) ...
  const handleSelectChatSession = async (session: ChatSession) => { setActiveChatSession(session); const msgs = await chatService.getMessages(session.id); setActiveChatMessages(msgs); if (session.unreadCount > 0) { await chatService.markAsRead(session.id, true); setChatSessions(prev => prev.map(s => s.id === session.id ? { ...s, unreadCount: 0 } : s)); } };
  const handleSendAdminMessage = async (contentToSend?: string) => { const text = contentToSend || chatInput; if (!text.trim() || !activeChatSession || !currentUser) return; if (!contentToSend) setChatInput(''); const tempMsg: ChatMessage = { id: 'temp-' + Date.now(), sessionId: activeChatSession.id, senderId: currentUser.id, content: text, timestamp: new Date().toISOString(), isAdmin: true }; setActiveChatMessages(prev => [...prev, tempMsg]); await chatService.sendMessage(activeChatSession.id, currentUser.id, text, true); };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { toast.error('Only images supported'); return; } const reader = new FileReader(); reader.onload = () => { handleSendAdminMessage(`![${file.name}](${reader.result})`); }; reader.readAsDataURL(file); if(fileInputRef.current) fileInputRef.current.value = ''; };
  const handleInsertText = (startTag: string, endTag: string = '') => { const textarea = chatInputRef.current; if (!textarea) return; const start = textarea.selectionStart; const end = textarea.selectionEnd; const text = textarea.value; const selectedText = text.substring(start, end); if (endTag) { const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end); setChatInput(newText); setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, end + startTag.length); }, 0); } else { const newText = text.substring(0, start) + startTag + text.substring(end); setChatInput(newText); setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, start + startTag.length); }, 0); } };
  const handleResolveSession = async () => { if (!activeChatSession) return; const newStatus = activeChatSession.status === 'resolved' ? 'open' : 'resolved'; await chatService.updateSessionStatus(activeChatSession.id, newStatus); setActiveChatSession({ ...activeChatSession, status: newStatus }); setChatSessions(prev => prev.map(s => s.id === activeChatSession.id ? { ...s, status: newStatus } : s)); toast.success(newStatus === 'resolved' ? 'Chat marked as resolved' : 'Chat re-opened'); };
  const handleDeleteSession = async () => { if (!activeChatSession) return; if (confirm('Delete chat?')) { await chatService.deleteSession(activeChatSession.id); setActiveChatSession(null); setActiveChatMessages([]); const sessions = await chatService.getSessions(); setChatSessions(sessions); toast.success('Chat deleted'); } };
  const handleOpenCouponModal = (c?: Coupon) => { setEditingCoupon(c || { code: '', type: 'percent', value: 0, minOrder: 0, startDate: '', endDate: '' }); setIsCouponModalOpen(true); };
  const handleSaveCoupon = async (e: React.FormEvent) => { e.preventDefault(); if (editingCoupon.id) await updateCoupon(editingCoupon.id, editingCoupon); else await createCoupon(editingCoupon as any); setIsCouponModalOpen(false); fetchData(); };
  const handleDeleteCoupon = async (id: string) => { if (confirm('Delete?')) { await deleteCoupon(id); fetchData(); } };
  const handleOpenCategoryModal = (c?: Category) => { setEditingCategory(c || { name: '', description: '' }); setIsCategoryModalOpen(true); };
  const handleSaveCategory = async (e: React.FormEvent) => { e.preventDefault(); if (editingCategory.id) await updateCategory(editingCategory.id, editingCategory); else await createCategory(editingCategory as any); setIsCategoryModalOpen(false); };
  const handleDeleteCategory = async (id: string) => { if (confirm('Delete?')) { await deleteCategory(id); } };
  const handleDeleteReview = async (id: string) => { if(confirm('Delete review?')) { await reviewsService.delete(id); fetchData(); } };
  const openOrderModal = (o: Order) => { setSelectedOrder(o); setIsOrderModalOpen(true); };
  const closeOrderModal = () => { setIsOrderModalOpen(false); setTimeout(() => setSelectedOrder(null), 300); };
  const handleSaveOrderChanges = async (updatedFields: Partial<Order>) => { if (!selectedOrder) return; const updates = { ...updatedFields, items: localOrderItems }; await ordersService.update(selectedOrder.id, updates); setSelectedOrder(prev => prev ? ({ ...prev, ...updates }) : null); await fetchData(); toast.success('Order saved successfully'); };
  const handleItemFieldChange = (index: number, field: keyof CartItem, value: string) => { const newItems = [...localOrderItems]; newItems[index] = { ...newItems[index], [field]: value }; setLocalOrderItems(newItems); };
  const handleItemProofUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { handleItemFieldChange(index, 'fulfillmentProofImage', reader.result as string); }; reader.readAsDataURL(file); } };
  const handleAddNoteToHistory = async () => { if (!selectedOrder || (!newNoteText.trim() && !trackingLocation.trim())) return; await ordersService.addNoteToHistory(selectedOrder.id, newNoteText || 'Update', !!trackingLocation, trackingLocation); const updated = await ordersService.findOne(selectedOrder.id); if (updated) setSelectedOrder(updated); setNewNoteText(''); setTrackingLocation(''); await fetchData(); toast.success('Timeline updated'); };
  const handleRefund = async () => { if(!selectedOrder) return; if(!confirm(`Refund order #${selectedOrder.id}?`)) return; await ordersService.refund(selectedOrder.id); await fetchData(); toast.success("Order refunded and inventory restored."); closeOrderModal(); };
  const handleResendInvoice = () => { toast.success(`Invoice sent to ${selectedOrder?.shippingAddress.name}`); };
  const handleOpenUserModal = (u: User) => { setSelectedUser(u); setEditingUser(u); setManualPassword(''); setIsUserModalOpen(true); };
  const handleSaveUser = async () => { if (!selectedUser) return; try { await authService.update(selectedUser.id, editingUser); if (manualPassword) { await authService.resetPassword(selectedUser.id, manualPassword); } toast.success("User updated successfully"); setIsUserModalOpen(false); fetchData(); } catch (error) { toast.error("Failed to update user"); } };
  const handleSendResetEmail = async (u: User) => { toast.loading("Sending..."); await new Promise(r => setTimeout(r, 1000)); toast.dismiss(); toast.success(`Reset email sent to ${u.email}`); };
  const handleDeleteUser = async (id: string) => { if(confirm('Delete user?')) { await authService.delete(id); fetchData(); setIsUserModalOpen(false); } };

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
        {/* ... (Keep existing KPI Cards) ... */}
        {/* Revenue */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-4 md:p-6 rounded-2xl border border-emerald-900/30 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">${stats.revenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-zinc-800 text-emerald-400 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-900/30 px-2 py-1 rounded w-fit">
              <TrendingUp size={12} /> +12.5% this week
          </div>
        </div>
        {/* ... Other stats ... */}
      </div>

      {/* Tabs */}
      <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-1 flex gap-1 overflow-x-auto">
          {['orders', 'inventory', 'users', 'coupons', 'categories', 'reviews', 'suppliers', 'settings', 'support'].map((tab: any) => (
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
        
        {/* ... (Other Tabs Content) ... */}
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
            <div className="p-4">
                {/* ... (Keep Order Tab Content) ... */}
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
                            {orders.filter(o => (orderFilter === 'all' || o.status === orderFilter) && o.id.includes(orderSearch)).map(order => (
                                <tr key={order.id} className="hover:bg-zinc-800/50 cursor-pointer transition-colors" onClick={() => openOrderModal(order)}>
                                    <td className="p-4 font-mono font-bold text-blue-400">#{order.id.replace('ord-', '')}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{order.shippingAddress.name}</div>
                                        <div className="text-xs text-gray-500">{order.shippingAddress.city}</div>
                                    </td>
                                    <td className="p-4 text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-white">${order.total.toFixed(2)}</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ... (Inventory, Users, Coupons, Categories, Reviews, Suppliers, Support - Keep as is) ... */}
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
                                    <td className="p-4 text-white">${p.price.toFixed(2)}</td>
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

        {/* ... (Other Tabs Omitted for brevity in this response but would be here) ... */}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div className="p-4 md:p-8 space-y-8">
                {/* General Settings */}
                <div className="max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">General Configuration</h3>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Shipping Cost ($)</label>
                                <input type="number" step="0.01" value={settingsForm.shippingCost} onChange={e => setSettingsForm({...settingsForm, shippingCost: Number(e.target.value)})} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Tax Rate (Decimal)</label>
                                <input type="number" step="0.01" value={settingsForm.taxRate} onChange={e => setSettingsForm({...settingsForm, taxRate: Number(e.target.value)})} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">Carousel Interval (Seconds)</label>
                            <input type="number" step="1" min="0" value={settingsForm.carouselInterval / 1000} onChange={e => setSettingsForm({...settingsForm, carouselInterval: Number(e.target.value) * 1000})} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"/>
                            <p className="text-xs text-gray-500 mt-1">Time between auto-sliding. Set to 0 to disable.</p>
                        </div>
                        <Button type="submit">Save General Settings</Button>
                    </form>
                </div>

                {/* Hero Carousel Management */}
                <div className="max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <div>
                            <h3 className="text-lg font-bold text-white">Hero Carousel</h3>
                            <p className="text-sm text-gray-500">Manage slides displayed on the homepage.</p>
                        </div>
                        <Button size="sm" onClick={() => handleOpenSlideModal()}>
                            <Plus size={16} className="mr-2"/> Add Slide
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {settings.carouselSlides?.map((slide, idx) => (
                            <div key={slide.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                {/* Preview Color/Image */}
                                <div className={`w-full md:w-32 h-20 rounded-lg bg-gradient-to-r ${slide.colorClass} relative overflow-hidden flex-shrink-0 border border-zinc-700`}>
                                    {slide.backgroundImage && <img src={slide.backgroundImage} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-xs font-bold bg-black/50 px-2 py-1 rounded text-white`}>Slide {idx + 1}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-white text-lg truncate">{slide.title}</h4>
                                    <p className="text-sm text-gray-400 truncate">{slide.desc}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-gray-300 border border-zinc-700">Icon: {slide.iconName}</span>
                                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-gray-300 border border-zinc-700">Cat: {slide.categoryFilter}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 self-end md:self-center">
                                    <button onClick={() => handleOpenSlideModal(slide)} className="p-2 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 rounded-lg transition-colors"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* --- SLIDE EDITOR MODAL --- */}
      {isSlideModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Layout size={20} /> {editingSlide.id ? 'Edit Slide' : 'New Slide'}
                      </h3>
                      <button onClick={() => setIsSlideModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                  </div>
                  
                  <form onSubmit={handleSaveSlide} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Title</label>
                              <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.title} onChange={e => setEditingSlide({...editingSlide, title: e.target.value})} placeholder="Main Headline" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subtitle</label>
                              <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.subtitle} onChange={e => setEditingSlide({...editingSlide, subtitle: e.target.value})} placeholder="Small label above title" />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Description</label>
                          <textarea required rows={2} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.desc} onChange={e => setEditingSlide({...editingSlide, desc: e.target.value})} placeholder="Short description text" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Icon</label>
                              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.iconName} onChange={e => setEditingSlide({...editingSlide, iconName: e.target.value})}>
                                  {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Category Filter</label>
                              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.categoryFilter} onChange={e => setEditingSlide({...editingSlide, categoryFilter: e.target.value})}>
                                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Color Theme</label>
                              <select 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" 
                                value={COLOR_PRESETS.find(p => p.colorClass === editingSlide.colorClass)?.name || 'Custom'}
                                onChange={e => {
                                    const preset = COLOR_PRESETS.find(p => p.name === e.target.value);
                                    if(preset) setEditingSlide({...editingSlide, colorClass: preset.colorClass, accentClass: preset.accentClass});
                                }}
                              >
                                  {COLOR_PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Background Image URL (Optional)</label>
                          <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={editingSlide.backgroundImage || ''} onChange={e => setEditingSlide({...editingSlide, backgroundImage: e.target.value})} placeholder="https://..." />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tags (Comma separated)</label>
                          <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:border-blue-600 outline-none" value={slideTagsInput} onChange={e => setSlideTagsInput(e.target.value)} placeholder="New, Sale, Exclusive" />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                          <Button variant="secondary" type="button" onClick={() => setIsSlideModalOpen(false)}>Cancel</Button>
                          <Button type="submit">Save Slide</Button>
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