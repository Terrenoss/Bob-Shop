

import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { SupplierProduct, ProductSource, Order, Product } from '../types';
import { optimizeProductListing } from '../services/geminiService';
import { productsService, ordersService } from '../services/mockNestService';
import { Button } from '../components/ui/Button';
import { ProductFormModal } from '../components/ProductFormModal';
import { OrderTimeline } from '../components/OrderTimeline';
import { Download, RefreshCw, TrendingUp, Globe, DollarSign, Package, ClipboardList, Trash2, Edit2, CheckSquare, Truck, AlertTriangle, X, Search, Filter, Calendar, MapPin, Save, Printer, BarChart3, ArrowUpRight, RotateCcw, Mail, FileText, Ban } from 'lucide-react';
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
  },
  {
    id: 'sup-003',
    rawTitle: 'Anti-Gravity Air Humidifier Water Droplet Backflow Levitation',
    rawDescription: 'Innovative anti-gravity design. Visual illusion of water droplets flowing upwards. 800ml tank capacity. LED display clock.',
    wholesalePrice: 18.00,
    supplierName: 'Global Dropship Direct',
    source: ProductSource.ALIEXPRESS,
    image: 'https://picsum.photos/400/400?random=12'
  }
];

export const AdminDashboard: React.FC = () => {
  const { refreshProducts, products, deleteProduct, updateProduct } = useApp();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory' | 'orders'>('suppliers');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Product Edit State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Order Management State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  
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
      const editId = searchParams.get('editProduct');
      if (editId) {
          const productToEdit = products.find(p => p.id === editId);
          if (productToEdit) {
              setEditingProduct(productToEdit);
              setIsProductModalOpen(true);
          }
      }
  }, [searchParams, products]);

  const fetchData = async () => {
      const allOrders = await ordersService.findAll();
      const allProducts = await productsService.findAll();
      
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

  const handleDeleteProduct = async (id: string) => {
      if (confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(id);
      }
  };

  const handleEditProduct = (product: Product) => {
      setEditingProduct(product);
      setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (updatedData: Partial<Product>) => {
      if (editingProduct) {
          await updateProduct(editingProduct.id, updatedData);
          setSearchParams({}); // Clear URL param
      } else {
          // Create new logic if needed
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
  };

  const handleCloseModal = () => {
      setIsProductModalOpen(false);
      setSearchParams({}); // Clear URL param
      setEditingProduct(null);
  };

  // --- Order Drawer Logic ---

  const openOrderDrawer = (order: Order) => {
      setSelectedOrder(order);
      setIsOrderDrawerOpen(true);
  };

  const closeOrderDrawer = () => {
      setIsOrderDrawerOpen(false);
      setTimeout(() => setSelectedOrder(null), 300); // Wait for animation
  };

  const handleSaveOrderChanges = async (updatedFields: Partial<Order>) => {
      if (!selectedOrder) return;
      await ordersService.update(selectedOrder.id, updatedFields);
      
      // Update local state
      setSelectedOrder(prev => prev ? ({ ...prev, ...updatedFields }) : null);
      await fetchData();
      toast.success('Order details updated');
  };

  const handleRefund = async () => {
      if(!selectedOrder) return;
      if(!confirm(`Are you sure you want to refund Order #${selectedOrder.id}? This will restore stock and mark order as cancelled.`)) return;
      
      await ordersService.refund(selectedOrder.id);
      await fetchData();
      toast.success("Refund processed & Inventory restored.");
      closeOrderDrawer();
  };

  const handleResendInvoice = () => {
      toast.success(`Invoice sent to ${selectedOrder?.shippingAddress.name}`);
  };

  const handlePrintPackingSlip = () => {
      toast.success("Generating Packing Slip PDF...");
      // Mock print action
  };

  // Filter Orders
  const filteredOrders = orders.filter(o => {
      const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
      const term = orderSearch.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(term) || 
        o.shippingAddress.name.toLowerCase().includes(term) ||
        o.trackingNumber?.toLowerCase().includes(term);
      
      return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center gap-3">
            <Globe className="text-blue-600" size={32} />
            Admin Command Center
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Overview of your dropshipping operations.</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={fetchData} className="bg-white hover:bg-gray-50">
                 <RefreshCw size={14} className="mr-2" /> Refresh Data
             </Button>
        </div>
      </div>

      {/* KPI Cards & Charts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">${stats.revenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-700 flex items-center gap-1 bg-emerald-100/50 px-2 py-1 rounded w-fit">
              <TrendingUp size={12} /> +12.5% this week
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Orders</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Package size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-blue-700 flex items-center gap-1 bg-blue-100/50 px-2 py-1 rounded w-fit">
              <ArrowUpRight size={12} /> +5 new today
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Avg. Order Value</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">${stats.avgOrderValue.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-white text-purple-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
            </div>
          </div>
          <div className="text-xs font-medium text-purple-700 flex items-center gap-1 bg-purple-100/50 px-2 py-1 rounded w-fit">
              Steady
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Stock Alerts</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.lowStockCount}</p>
            </div>
            <div className={`p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-amber-500'}`}>
                <AlertTriangle size={24} />
            </div>
          </div>
          {stats.lowStockCount > 0 ? (
              <div className="text-xs font-medium text-red-700 flex items-center gap-1 bg-red-100/50 px-2 py-1 rounded w-fit">
                  Action Needed
              </div>
          ) : (
              <div className="text-xs font-medium text-amber-700 flex items-center gap-1 bg-amber-100/50 px-2 py-1 rounded w-fit">
                  All Good
              </div>
          )}
        </div>
      </div>

      {/* Sales Visualization (Mock) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-gray-400" /> Sales Performance (Last 7 Days)
              </h3>
              <div className="flex gap-2 text-xs font-medium">
                  <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Online Store</span>
                  <span className="flex items-center gap-1 text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Dropship Direct</span>
              </div>
          </div>
          <div className="flex items-end gap-2 h-32 w-full">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
                      <div className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-200 transition-all" style={{ height: `${h * 0.6}%` }}></div>
                      <div className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all relative" style={{ height: `${h}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              ${h * 10}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-1">
          <button 
             onClick={() => setActiveTab('suppliers')}
             className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'suppliers' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
              <Globe size={18} /> Global Suppliers
          </button>
          <button 
             onClick={() => setActiveTab('inventory')}
             className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
              <Package size={18} /> Inventory ({products.length})
          </button>
          <button 
             onClick={() => setActiveTab('orders')}
             className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
              <ClipboardList size={18} /> Orders ({orders.length})
          </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] relative">
        
        {activeTab === 'suppliers' && (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-600 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                    <tr>
                        <th className="p-5">Product Discovery</th>
                        <th className="p-5">Supplier Info</th>
                        <th className="p-5">Wholesale Cost</th>
                        <th className="p-5 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {MOCK_SUPPLIER_PRODUCTS.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-5">
                            <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shadow-sm border border-gray-200">
                                <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="max-w-xs">
                                <p className="font-bold text-gray-900 line-clamp-2">{product.rawTitle}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.rawDescription}</p>
                            </div>
                            </div>
                        </td>
                        <td className="p-5">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{product.supplierName}</span>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1.5">{product.source}</span>
                            </div>
                        </td>
                        <td className="p-5">
                            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">${product.wholesalePrice.toFixed(2)}</span>
                        </td>
                        <td className="p-5 text-right">
                            <Button 
                            size="sm" 
                            onClick={() => handleImport(product)}
                            isLoading={processingId === product.id}
                            disabled={processingId !== null}
                            className="shadow-sm hover:shadow-md transition-all"
                            >
                            <Download size={16} className="mr-2" />
                            Import to Store
                            </Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'inventory' && (
            <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-600 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                    <tr>
                        <th className="p-5">Product</th>
                        <th className="p-5">Stock Level</th>
                        <th className="p-5">Selling Price</th>
                        <th className="p-5 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{p.title}</p>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">{p.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    <span className={`font-medium ${p.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                                        {p.stock} units
                                    </span>
                                </div>
                            </td>
                            <td className="p-5 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                            <td className="p-5 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEditProduct(p)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="flex flex-col h-full">
                {/* Order Filters & Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setOrderFilter(status)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                                    orderFilter === status 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                         <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                         <input 
                            type="text" 
                            placeholder="Search Order ID or Customer..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                    </div>
                </div>

                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-5">Order ID</th>
                            <th className="p-5">Customer</th>
                            <th className="p-5">Date</th>
                            <th className="p-5">Total</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Manage</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                 <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => openOrderDrawer(order)}>
                                    <td className="p-5 font-mono font-bold text-blue-600 group-hover:underline">
                                        #{order.id.replace('ord-', '')}
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-gray-900">{order.shippingAddress.name}</div>
                                        <div className="text-xs text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                                    </td>
                                    <td className="p-5 text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="p-5 font-bold text-gray-900">${order.total.toFixed(2)}</td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openOrderDrawer(order); }}>
                                            Manage
                                        </Button>
                                    </td>
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p>No orders found matching this filter.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* --- Order Management Drawer --- */}
      {isOrderDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeOrderDrawer}></div>
            <div className={`relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto transform transition-transform duration-300 flex flex-col ${selectedOrder ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedOrder && (
                    <>
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20 flex justify-between items-center shadow-sm">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Manage Order</h2>
                                <p className="text-sm text-gray-500 font-mono">ID: {selectedOrder.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={handlePrintPackingSlip}>
                                    <Printer size={16} />
                                </Button>
                                <button onClick={closeOrderDrawer} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-gray-50/50">
                            
                            {/* Workflow Actions */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                     <RotateCcw size={14}/> Workflow Actions
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button 
                                        onClick={() => handleSaveOrderChanges({ status: 'processing' })}
                                        disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Package size={20} className="mb-2 text-gray-400" /> Mark Processing
                                    </button>
                                    <button 
                                        onClick={() => handleSaveOrderChanges({ status: 'shipped' })}
                                        disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Truck size={20} className="mb-2 text-gray-400" /> Mark Shipped
                                    </button>
                                    <button 
                                        onClick={handleResendInvoice}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-sm font-medium"
                                    >
                                        <Mail size={20} className="mb-2 text-gray-400" /> Email Invoice
                                    </button>
                                    <button 
                                        onClick={handleRefund}
                                        disabled={selectedOrder.status === 'cancelled'}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Ban size={20} className="mb-2 text-gray-400" /> Refund & Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Visual Timeline (Integrated) */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Timeline History</h3>
                                <OrderTimeline order={selectedOrder} />
                            </div>

                            {/* Fulfillment Section */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Truck size={16} /> Fulfillment Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Carrier</label>
                                        <input 
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="e.g. DHL, USPS"
                                            value={selectedOrder.carrier || ''}
                                            onChange={(e) => handleSaveOrderChanges({ carrier: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Tracking Number</label>
                                        <input 
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all font-mono shadow-sm"
                                            placeholder="TRK-000000"
                                            value={selectedOrder.trackingNumber || ''}
                                            onChange={(e) => handleSaveOrderChanges({ trackingNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Internal Notes */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <ClipboardList size={16} /> Internal Admin Notes
                                </h3>
                                <textarea 
                                    className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg focus:border-yellow-400 outline-none text-sm text-gray-800 min-h-[100px] shadow-inner"
                                    placeholder="Add notes about supplier delays, customer requests, etc. (Not visible to customer)"
                                    value={selectedOrder.internalNotes || ''}
                                    onChange={(e) => handleSaveOrderChanges({ internalNotes: e.target.value })}
                                />
                            </div>

                            {/* Shipping Info Editable */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Shipping Destination
                                </h3>
                                <div className="space-y-3 p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Recipient Name</label>
                                        <input 
                                            className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-blue-500"
                                            value={selectedOrder.shippingAddress.name}
                                            onChange={(e) => handleSaveOrderChanges({ shippingAddress: { ...selectedOrder.shippingAddress, name: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 1</label>
                                        <input 
                                            className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-blue-500"
                                            value={selectedOrder.shippingAddress.line1}
                                            onChange={(e) => handleSaveOrderChanges({ shippingAddress: { ...selectedOrder.shippingAddress, line1: e.target.value } })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
                                            <input 
                                                className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-blue-500"
                                                value={selectedOrder.shippingAddress.city}
                                                onChange={(e) => handleSaveOrderChanges({ shippingAddress: { ...selectedOrder.shippingAddress, city: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Postal Code</label>
                                            <input 
                                                className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-blue-500"
                                                value={selectedOrder.shippingAddress.postalCode}
                                                onChange={(e) => handleSaveOrderChanges({ shippingAddress: { ...selectedOrder.shippingAddress, postalCode: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Order Items Preview */}
                             <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Package size={16} /> Items ({selectedOrder.items.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <img src={item.image} className="w-14 h-14 rounded-md object-cover bg-gray-100" />
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                                                    <p className="font-bold text-sm">${item.price}</p>
                                                </div>
                                                <div className="flex justify-between items-end mt-1">
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    {item.selectedVariants && (
                                                        <div className="flex gap-1">
                                                             {Object.values(item.selectedVariants).map(v => (
                                                                 <span key={v} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{v}</span>
                                                             ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>

                        </div>
                        
                        <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-20 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                             <Button onClick={closeOrderDrawer} className="w-full h-12 text-lg">
                                <CheckSquare className="mr-2" size={18} /> Save & Close
                             </Button>
                        </div>
                    </>
                )}
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
};
