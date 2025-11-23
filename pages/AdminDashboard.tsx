import React, { useState } from 'react';
import { useApp } from '../App';
import { SupplierProduct, ProductSource } from '../types';
import { optimizeProductListing } from '../services/geminiService';
import { productsService } from '../services/mockNestService';
import { Button } from '../components/ui/Button';
import { Download, RefreshCw, TrendingUp, Globe, DollarSign, Sparkles } from 'lucide-react';
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
  const { refreshProducts } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleImport = async (supplierProduct: SupplierProduct) => {
    setProcessingId(supplierProduct.id);
    toast.loading('AI Agent analyzing market fit...', { id: 'import-toast' });

    try {
      // 1. Call Gemini to optimize the listing
      const optimized = await optimizeProductListing(supplierProduct);

      // 2. Add to store (Simulate backend sync)
      const newProduct = {
        id: `local-${Date.now()}`,
        title: optimized.title,
        description: optimized.description,
        price: optimized.recommendedPrice,
        originalPrice: supplierProduct.wholesalePrice,
        image: supplierProduct.image,
        category: 'Imported',
        source: supplierProduct.source,
        isPublished: true,
        stock: 100 // Default stock
      };

      // Call simulated NestJS service
      await productsService.create(newProduct);
      
      // Update global state
      await refreshProducts();

      toast.success('Product Synced & Optimized!', { id: 'import-toast' });
    } catch (error) {
      toast.error('Failed to import', { id: 'import-toast' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
        {/* Stats */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Auto-Sync</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Active</p>
          <p className="text-xs text-gray-500 mt-1">Checking suppliers every 15m</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Sparkles size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">AI Copywriter</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Ready</p>
          <p className="text-xs text-gray-500 mt-1">Gemini 2.5 Flash connected</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Trending Items</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{MOCK_SUPPLIER_PRODUCTS.length} Found</p>
          <p className="text-xs text-gray-500 mt-1">From global suppliers</p>
        </div>
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Supplier Feed (AliExpress / Alibaba)</h2>
        </div>
        
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
      </div>
    </div>
  );
};
