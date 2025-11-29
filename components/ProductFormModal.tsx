
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductSource, ProductVariant, ProductSection } from '../types';
import { Button } from './ui/Button';
import { X, Plus, Trash2, Globe, DollarSign, Package, LayoutGrid, Tag, Upload, Image as ImageIcon, Edit2, Plus as PlusCircleIcon, Percent, Zap, Download, Clock, Key, AlignLeft, Calendar, HelpCircle, Star, FileText, ArrowUp, ArrowDown, Box, Layers, Settings, ChevronRight, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useApp } from '../app/providers';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { categories, settings } = useApp();
  // Renamed tabs for better clarity in the new UI
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'delivery' | 'content'>('overview');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    costPrice: 0,
    stock: 0,
    sku: '',
    category: '',
    image: '',
    images: [],
    source: ProductSource.LOCAL,
    supplierUrl: '',
    variants: [],
    sections: [],
    shippingCost: undefined,
    taxRate: undefined,
    isDigital: false,
    digitalDownloadLink: '',
    deliveryTimeframe: '',
    requiredFields: [],
    digitalContent: '',
    condition: 'new',
    launchDate: '',
    endDate: undefined
  });

  // Local state for interactions
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOptions, setNewVariantOptions] = useState(''); 
  const [requiredFieldsInput, setRequiredFieldsInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSection, setNewSection] = useState<ProductSection>({ title: '', content: '', image: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
          ...initialData,
          images: initialData.images || (initialData.image ? [initialData.image] : []),
          sections: initialData.sections || []
      });
      setRequiredFieldsInput(initialData.requiredFields?.join(', ') || '');
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        originalPrice: 0,
        costPrice: 0,
        stock: 0,
        sku: '',
        category: categories.length > 0 ? categories[0].name : '', 
        image: '',
        images: [],
        source: ProductSource.LOCAL,
        supplierUrl: '',
        variants: [],
        sections: [],
        shippingCost: undefined,
        taxRate: undefined,
        isDigital: false,
        digitalDownloadLink: '',
        deliveryTimeframe: '',
        requiredFields: [],
        digitalContent: '',
        condition: 'new',
        launchDate: new Date().toISOString().slice(0, 16),
        endDate: undefined
      });
      setRequiredFieldsInput('');
    }
    setActiveTab('overview');
  }, [initialData, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Prepare images logic
    let finalImages = [...(formData.images || [])];
    if (formData.image && !finalImages.includes(formData.image)) {
        finalImages = [formData.image, ...finalImages];
    }
    let mainImage = formData.image;
    if (finalImages.length > 0) {
        mainImage = finalImages[0];
    } else {
        mainImage = 'https://picsum.photos/400/400';
        finalImages = [mainImage];
    }
    
    const parsedReqFields = requiredFieldsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const finalData = {
        ...formData,
        image: mainImage,
        images: finalImages,
        requiredFields: parsedReqFields
    };

    await onSubmit(finalData);
    setIsLoading(false);
    onClose();
  };

  // Image Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          Array.from(files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setFormData(prev => ({ ...prev, images: [...(prev.images || []), reader.result as string] }));
              };
              reader.readAsDataURL(file);
          });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageUrl = () => {
      if (newImageUrl.trim()) {
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), newImageUrl.trim()] }));
          setNewImageUrl('');
      }
  };

  const removeImage = (index: number) => {
      setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
  };

  const setMainImage = (index: number) => {
      if (!formData.images) return;
      const newImages = [...formData.images];
      const selected = newImages.splice(index, 1)[0];
      newImages.unshift(selected); 
      setFormData(prev => ({ ...prev, images: newImages, image: selected }));
  };

  // Variant Handlers
  const addVariant = () => {
      if (!newVariantName || !newVariantOptions) return;
      const optionsArray = newVariantOptions.split(',').map(s => s.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), { name: newVariantName, options: optionsArray }] }));
      setNewVariantName('');
      setNewVariantOptions('');
  };

  const removeVariant = (index: number) => {
      setFormData(prev => ({ ...prev, variants: prev.variants?.filter((_, i) => i !== index) }));
  };

  // Type Handler
  const handleTypeChange = (isDigital: boolean) => {
      setFormData(prev => ({ ...prev, isDigital, shippingCost: isDigital ? 0 : undefined }));
  };

  // Section Handlers
  const handleSectionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => { setNewSection(prev => ({ ...prev, image: reader.result as string })); };
          reader.readAsDataURL(file);
      }
  };

  const addSection = () => {
      if (newSection.title && newSection.content) {
          setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
          setNewSection({ title: '', content: '', image: '' });
      }
  };

  const removeSection = (index: number) => {
      setFormData(prev => ({ ...prev, sections: prev.sections?.filter((_, i) => i !== index) }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
      if (!formData.sections) return;
      const newSections = [...formData.sections];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < newSections.length) {
          [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
          setFormData(prev => ({ ...prev, sections: newSections }));
      }
  };

  if (!isOpen) return null;

  // Render Helpers
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
      <button 
          type="button"
          onClick={() => setActiveTab(id)}
          className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === id ? 'border-blue-500 text-blue-400 bg-zinc-800/50' : 'border-transparent text-gray-500 hover:text-white hover:bg-zinc-800/30'}`}
      >
          <Icon size={16} /> {label}
      </button>
  );

  return (
    <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-zinc-950 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center rounded-t-2xl">
          <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  {initialData ? <Edit2 size={24} className="text-blue-500" /> : <PlusCircleIcon size={24} className="text-green-500" />} 
                  {initialData ? 'Edit Product' : 'New Product'}
              </h3>
              <p className="text-gray-500 text-sm mt-1">Configure product details, pricing, and inventory.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Tabs Navigation */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                <TabButton id="overview" label="Overview" icon={LayoutGrid} />
                <TabButton id="pricing" label="Pricing & Inventory" icon={DollarSign} />
                <TabButton id="delivery" label="Delivery & Advanced" icon={Settings} />
                <TabButton id="content" label="Rich Content" icon={FileText} />
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-950/50">
                
                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2">
                        
                        {/* Left Col: Basic Info */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Type Selector */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div 
                                    onClick={() => handleTypeChange(false)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${!formData.isDigital ? 'border-blue-600 bg-blue-900/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}
                                >
                                    <div className={`p-3 rounded-full ${!formData.isDigital ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-500'}`}><Box size={24} /></div>
                                    <div>
                                        <h4 className={`font-bold ${!formData.isDigital ? 'text-white' : 'text-gray-400'}`}>Physical Product</h4>
                                        <p className="text-xs text-gray-500">Shipped items requiring delivery.</p>
                                    </div>
                                    {!formData.isDigital && <CheckCircle2 size={24} className="ml-auto text-blue-500" />}
                                </div>

                                <div 
                                    onClick={() => handleTypeChange(true)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${formData.isDigital ? 'border-purple-600 bg-purple-900/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}
                                >
                                    <div className={`p-3 rounded-full ${formData.isDigital ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-500'}`}><Zap size={24} /></div>
                                    <div>
                                        <h4 className={`font-bold ${formData.isDigital ? 'text-white' : 'text-gray-400'}`}>Digital Product</h4>
                                        <p className="text-xs text-gray-500">Keys, links, or downloadable content.</p>
                                    </div>
                                    {formData.isDigital && <CheckCircle2 size={24} className="ml-auto text-purple-500" />}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Product Title</label>
                                    <input 
                                        required
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-white placeholder-zinc-600 font-medium"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        placeholder="e.g. Wireless Noise Cancelling Headphones"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Short Description</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-white placeholder-zinc-600"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="Brief summary shown on the product card and top of page..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-3.5 text-gray-500" size={16} />
                                        <select 
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-white appearance-none"
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="" disabled>Select Category...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-3.5 text-gray-500 rotate-90" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Media */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-full">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <ImageIcon size={18} /> Media Gallery
                                </h4>
                                
                                <div 
                                    className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-zinc-800 transition-all group mb-6"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors text-gray-400">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium">Click to upload images</p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP supported</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-grow px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-blue-600 outline-none"
                                            value={newImageUrl}
                                            onChange={e => setNewImageUrl(e.target.value)}
                                            placeholder="Or paste image URL..."
                                            onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addImageUrl(); }}}
                                        />
                                        <Button type="button" size="sm" variant="secondary" onClick={addImageUrl}>Add</Button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.images?.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-black">
                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                    {idx !== 0 && (
                                                        <button type="button" onClick={() => setMainImage(idx)} className="text-[10px] bg-white text-black px-2 py-1 rounded font-bold hover:bg-gray-200">
                                                            Main
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-500">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                {idx === 0 && <div className="absolute top-1 left-1 bg-green-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">MAIN</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PRICING & INVENTORY TAB --- */}
                {activeTab === 'pricing' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        
                        {/* Pricing Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                                <label className="text-sm font-bold text-gray-400 mb-2 block">Selling Price</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input 
                                        type="number" step="0.01" required
                                        className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-xl font-bold text-white focus:border-green-500 outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                                <label className="text-sm font-bold text-gray-400 mb-2 block">Compare At Price</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-xl font-bold text-gray-400 focus:border-gray-500 outline-none line-through"
                                        value={formData.originalPrice || ''}
                                        onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                                <label className="text-sm font-bold text-gray-400 mb-2 block flex justify-between">
                                    Cost Per Item <span className="text-xs font-normal text-gray-600 bg-zinc-950 px-2 rounded">Private</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-xl font-bold text-white focus:border-blue-500 outline-none"
                                        value={formData.costPrice || ''}
                                        onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profit Calculator */}
                        <div className="bg-gradient-to-r from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-900/20 rounded-full text-green-500"><TrendingUp size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Profit Margin</h4>
                                    <p className="text-sm text-gray-500">Calculated automatically based on inputs</p>
                                </div>
                            </div>
                            <div className="flex gap-8 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Profit</p>
                                    <p className={`text-2xl font-bold ${Number(formData.price) - Number(formData.costPrice || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${(Number(formData.price) - Number(formData.costPrice || 0)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="w-px bg-zinc-800 h-10 self-center"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Margin</p>
                                    <p className="text-2xl font-bold text-white">
                                        {formData.price ? (((Number(formData.price) - Number(formData.costPrice || 0)) / Number(formData.price)) * 100).toFixed(0) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Shipping */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="font-bold text-white border-b border-zinc-800 pb-2">Inventory Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">SKU</label>
                                        <input 
                                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono uppercase focus:border-blue-600 outline-none"
                                            value={formData.sku || ''}
                                            onChange={e => setFormData({...formData, sku: e.target.value})}
                                            placeholder="PROD-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Stock Quantity</label>
                                        <input 
                                            type="number"
                                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"
                                            value={formData.stock}
                                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Supplier URL (Private)</label>
                                    <div className="relative">
                                        <Globe size={14} className="absolute left-3 top-2.5 text-gray-600"/>
                                        <input 
                                            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:border-blue-600 outline-none"
                                            value={formData.supplierUrl || ''}
                                            onChange={e => setFormData({...formData, supplierUrl: e.target.value})}
                                            placeholder="https://aliexpress.com/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={`space-y-6 ${formData.isDigital ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h4 className="font-bold text-white border-b border-zinc-800 pb-2">Shipping & Tax</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Shipping Cost ($)</label>
                                        <input 
                                            type="number" step="0.01"
                                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"
                                            value={formData.shippingCost !== undefined ? formData.shippingCost : ''}
                                            onChange={e => setFormData({...formData, shippingCost: e.target.value ? Number(e.target.value) : undefined})}
                                            placeholder={`Default: ${settings.shippingCost}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tax Rate (Decimal)</label>
                                        <input 
                                            type="number" step="0.01"
                                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"
                                            value={formData.taxRate !== undefined ? formData.taxRate : ''}
                                            onChange={e => setFormData({...formData, taxRate: e.target.value ? Number(e.target.value) : undefined})}
                                            placeholder={`Default: ${settings.taxRate}`}
                                        />
                                    </div>
                                </div>
                                {formData.isDigital && (
                                    <div className="flex items-center gap-2 text-blue-400 text-xs bg-blue-900/10 p-2 rounded border border-blue-900/30">
                                        <AlertCircle size={14} /> Shipping disabled for digital products.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- DELIVERY & ADVANCED TAB --- */}
                {activeTab === 'delivery' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        
                        {/* Digital Configuration */}
                        {formData.isDigital && (
                            <div className="bg-purple-900/10 border border-purple-500/30 rounded-2xl p-6">
                                <h4 className="font-bold text-purple-400 mb-4 flex items-center gap-2"><Zap size={20}/> Digital Delivery Setup</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-purple-300 uppercase mb-1 block">Delivery Timeframe Label</label>
                                            <input 
                                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 outline-none"
                                                value={formData.deliveryTimeframe || ''}
                                                onChange={e => setFormData({...formData, deliveryTimeframe: e.target.value})}
                                                placeholder="e.g. Instant, 24 Hours"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-purple-300 uppercase mb-1 block">Required User Inputs</label>
                                            <input 
                                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 outline-none"
                                                value={requiredFieldsInput}
                                                onChange={e => setRequiredFieldsInput(e.target.value)}
                                                placeholder="e.g. Username, Region (Comma separated)"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-purple-300 uppercase mb-1 block">Digital Content / Secret Key</label>
                                        <textarea 
                                            rows={3}
                                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 outline-none font-mono text-sm"
                                            value={formData.digitalContent || ''}
                                            onChange={e => setFormData({...formData, digitalContent: e.target.value})}
                                            placeholder="The code, link, or content revealed to the user AFTER purchase."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Variants Config */}
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Layers size={20}/> Product Variants</h4>
                            
                            <div className="flex gap-3 items-end mb-6">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Variant Name</label>
                                    <input 
                                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:border-blue-600 outline-none"
                                        placeholder={formData.isDigital ? "Region" : "Size"}
                                        value={newVariantName}
                                        onChange={e => setNewVariantName(e.target.value)}
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Options (Comma Separated)</label>
                                    <input 
                                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:border-blue-600 outline-none"
                                        placeholder="S, M, L, XL"
                                        value={newVariantOptions}
                                        onChange={e => setNewVariantOptions(e.target.value)}
                                    />
                                </div>
                                <Button type="button" size="sm" variant="secondary" onClick={addVariant} className="h-10 px-6">Add</Button>
                            </div>

                            <div className="space-y-2">
                                {formData.variants?.map((v, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-white bg-zinc-800 px-2 py-1 rounded text-xs uppercase">{v.name}</span>
                                            <div className="flex gap-1">
                                                {v.options.map(opt => (
                                                    <span key={opt} className="text-xs text-gray-400 border border-zinc-800 px-2 py-0.5 rounded-full">{opt}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {(!formData.variants || formData.variants.length === 0) && (
                                    <p className="text-sm text-gray-600 text-center py-4 italic">No variants added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Condition & Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><HelpCircle size={18}/> Condition</h4>
                                <div className="flex gap-4">
                                    <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.condition === 'new' ? 'border-green-600 bg-green-900/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'}`}>
                                        <input type="radio" name="condition" checked={formData.condition === 'new'} onChange={() => setFormData({...formData, condition: 'new'})} className="hidden" />
                                        <div className="font-bold text-white">New</div>
                                        <div className="text-xs text-gray-500">Brand new, unused</div>
                                    </label>
                                    <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.condition === 'used' ? 'border-yellow-600 bg-yellow-900/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'}`}>
                                        <input type="radio" name="condition" checked={formData.condition === 'used'} onChange={() => setFormData({...formData, condition: 'used'})} className="hidden" />
                                        <div className="font-bold text-white">Used</div>
                                        <div className="text-xs text-gray-500">Pre-owned item</div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Calendar size={18}/> Schedule</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Launch Date</label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white text-sm"
                                            value={formData.launchDate ? new Date(formData.launchDate).toISOString().slice(0, 16) : ''}
                                            onChange={e => setFormData({...formData, launchDate: new Date(e.target.value).toISOString()})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">End Date (Optional)</label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white text-sm"
                                            value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                                            onChange={e => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTENT BUILDER TAB --- */}
                {activeTab === 'content' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <h4 className="font-bold text-white mb-4">Detailed Product Sections</h4>
                            <p className="text-sm text-gray-500 mb-6">Create rich content blocks displayed below the main product info.</p>

                            <div className="space-y-4 mb-8">
                                {formData.sections?.map((section, idx) => (
                                    <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex gap-4 items-start group relative">
                                        <div className="w-24 h-24 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                                            {section.image ? (
                                                <img src={section.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon size={24}/></div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h5 className="font-bold text-white text-base mb-1">{section.title}</h5>
                                            <p className="text-sm text-gray-400 line-clamp-3">{section.content}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 p-1 rounded-lg border border-zinc-800 shadow-sm">
                                            <button type="button" onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 hover:text-white disabled:opacity-30"><ArrowUp size={16}/></button>
                                            <button type="button" onClick={() => moveSection(idx, 'down')} disabled={idx === (formData.sections?.length || 0) - 1} className="p-1 hover:text-white disabled:opacity-30"><ArrowDown size={16}/></button>
                                            <button type="button" onClick={() => removeSection(idx)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-4">Add New Section</h5>
                                <div className="space-y-4">
                                    <input 
                                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none"
                                        placeholder="Section Title (e.g. Premium Materials)"
                                        value={newSection.title}
                                        onChange={e => setNewSection({...newSection, title: e.target.value})}
                                    />
                                    <textarea 
                                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-600 outline-none h-24"
                                        placeholder="Section description paragraph..."
                                        value={newSection.content}
                                        onChange={e => setNewSection({...newSection, content: e.target.value})}
                                    />
                                    <div className="flex gap-4">
                                        <div 
                                            className="flex-1 border-2 border-dashed border-zinc-800 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-zinc-900 transition-colors h-12"
                                            onClick={() => sectionImageInputRef.current?.click()}
                                        >
                                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                                <Upload size={16} /> {newSection.image ? 'Image Selected' : 'Upload Image'}
                                            </span>
                                            <input type="file" ref={sectionImageInputRef} className="hidden" accept="image/*" onChange={handleSectionImageUpload} />
                                        </div>
                                        <Button type="button" onClick={addSection} disabled={!newSection.title || !newSection.content} className="px-8">
                                            Add Section
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-4 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={onClose} className="h-12 px-6">Cancel</Button>
                <Button type="submit" isLoading={isLoading} className="h-12 px-8 text-lg font-bold">
                    {initialData ? 'Save Changes' : 'Create Product'}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
