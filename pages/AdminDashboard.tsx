
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { SupplierProduct, ProductSource, Order, Product } from '../types';
import { optimizeProductListing } from '../services/geminiService';
import { productsService, ordersService } from '../services/mockNestService';
import { Button } from '../components/ui/Button';
import { ProductFormModal } from '../components/ProductFormModal';
import { Download, RefreshCw, TrendingUp, Globe, DollarSign, Sparkles, Package, ClipboardList, Trash2, Edit2, CheckSquare, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock Supplier Data (AliExpress/Alibaba Simulation)
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
  const { refreshProducts, products } = useApp();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory' | 'orders'>('suppliers');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Product Edit State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
      fetchData();
  }, [activeTab]);

  const fetchData = async () => {
      if (activeTab === 'orders') {
          const allOrders = await ordersService.findAll();
          setOrders(allOrders);
      }
      if (activeTab === 'inventory') {
          refreshProducts();
      }
  };

  const handleImport = async (supplierProduct: SupplierProduct) => {
    setProcessingId(supplierProduct.id);
    toast.loading('AI Agent analyzing market fit...', { id: 'import-toast' });

    try {
      // 1. Call Gemini to optimize the listing
      const optimized = await optimizeProductListing(supplierProduct);

      // 2. Add to store (Simulate backend sync)
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
        stock: 50, // Default stock
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
          await productsService.delete(id);
          refreshProducts();
          toast.success('Product deleted');
      }
  };

  const handleEditProduct = (product: Product) => {
      setEditingProduct(product);
      setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: Partial<Product>) => {
      if (editingProduct) {
          await productsService.update(editingProduct.id, updatedProduct);
          toast.success("Product updated");
      } else {
          // Logic for creating new product manually could go here
      }
      refreshProducts();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
      let tracking = undefined;
      
      if (status === 'shipped') {
          const trackingNum = prompt("Enter tracking number:");
          if (!trackingNum) return; // Cancel if no tracking number
          tracking = { number: trackingNum, carrier: 'Global Post' };
      }

      await ordersService.updateStatus(orderId, status, tracking);
      fetchData();
      toast.success(`Order marked as ${status}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="text-blue-600" />
            Dropshipping Command Center
          </h1>
          <p className="text-gray-500">Manage suppliers, sync inventory, and optimize listings with AI.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm border border-green-200">
            <DollarSign size={16} />
            Profit Margin: +240%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><RefreshCw size={20} /></div>
            <h3 className="font-semibold text-gray-700">Auto-Sync</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Active</p>
          <p className="text-xs text-gray-500 mt-1">Checking suppliers every 15m</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Sparkles size={20} /></div>
            <h3 className="font-semibold text-gray-700">AI Agent</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Ready</p>
          <p className="text-xs text-gray-500 mt-1">Gemini 2.5 Flash connected</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="font-semibold text-gray-700">Trending</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{MOCK_SUPPLIER_PRODUCTS.length} Found</p>
          <p className="text-xs text-gray-500 mt-1">Global supply chain</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
          <button 
             onClick={() => setActiveTab('suppliers')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'suppliers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <Globe size={16} /> Dropship Feed
          </button>
          <button 
             onClick={() => setActiveTab('inventory')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inventory' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <Package size={16} /> Inventory ({products.length})
          </button>
          <button 
             onClick={() => setActiveTab('orders')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              <ClipboardList size={16} /> Customer Orders
          </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        
        {activeTab === 'suppliers' && (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Supplier</th>
                        <th className="p-4">Cost</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {MOCK_SUPPLIER_PRODUCTS.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                            <div className="flex gap-3">
                            <img src={product.image} alt="" className="w-12 h-12 rounded-md object-cover bg-gray-100" />
                            <div className="max-w-xs">
                                <p className="font-medium text-gray-900 truncate">{product.rawTitle}</p>
                                <p className="text-xs text-gray-500 truncate">{product.rawDescription}</p>
                            </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col">
                                <span className="font-medium">{product.supplierName}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">{product.source}</span>
                            </div>
                        </td>
                        <td className="p-4 font-mono font-medium text-gray-700">
                            ${product.wholesalePrice.toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                            <Button 
                            size="sm" 
                            onClick={() => handleImport(product)}
                            isLoading={processingId === product.id}
                            disabled={processingId !== null}
                            >
                            <Download size={16} className="mr-2" />
                            Import
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
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Price</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <img src={p.image} className="w-10 h-10 rounded object-cover" alt="" />
                                    <div>
                                        <p className="font-medium text-gray-900">{p.title}</p>
                                        <p className="text-xs text-gray-500">{p.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {p.stock} units
                                </span>
                            </td>
                            <td className="p-4">${p.price.toFixed(2)}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => handleEditProduct(p)} className="p-2 text-gray-400 hover:text-blue-600 mr-2">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Tracking</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                             <tr key={order.id} className="hover:bg-gray-50">
                                <td className="p-4 font-mono font-medium">{order.id}</td>
                                <td className="p-4">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="p-4 font-bold">${order.total.toFixed(2)}</td>
                                <td className="p-4 font-mono text-xs">
                                    {order.trackingNumber || <span className="text-gray-400">-</span>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {order.status === 'pending' && (
                                        <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}>
                                            <Truck size={14} className="mr-1" /> Ship
                                        </Button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <Button size="sm" variant="secondary" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                                            <CheckSquare size={14} className="mr-1" /> Complete
                                        </Button>
                                    )}
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>
        )}

      </div>

      <ProductFormModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
};
