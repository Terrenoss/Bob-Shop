
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductSource, ProductVariant } from '../types';
import { Button } from './ui/Button';
import { X, Plus, Trash2, Globe, DollarSign, Package, LayoutGrid, Tag, Upload, Image as ImageIcon, Edit2, Plus as PlusCircleIcon, Percent, Zap, Download, Clock, Key, AlignLeft, Calendar, HelpCircle, Star } from 'lucide-react';
import { useApp } from '../app/providers';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { categories, settings } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'dropship' | 'advanced'>('general');
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

  // Local state for variant creator
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOptions, setNewVariantOptions] = useState(''); // Comma separated
  
  // Local state for required fields creator (comma separated string)
  const [requiredFieldsInput, setRequiredFieldsInput] = useState('');
  
  // Local state for image input
  const [newImageUrl, setNewImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
          ...initialData,
          images: initialData.images || (initialData.image ? [initialData.image] : [])
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
    setActiveTab('general');
  }, [initialData, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (!formData.title || !formData.price) {
        setIsLoading(false);
        return;
    }

    // Prepare images
    let finalImages = [...(formData.images || [])];
    
    // If main image is set but not in images array, add it to start
    if (formData.image && !finalImages.includes(formData.image)) {
        finalImages = [formData.image, ...finalImages];
    }
    
    // Ensure we have at least one image
    let mainImage = formData.image;
    if (finalImages.length > 0) {
        mainImage = finalImages[0];
    } else {
        // Fallback default
        mainImage = 'https://picsum.photos/400/400';
        finalImages = [mainImage];
    }
    
    // Parse required fields
    const parsedReqFields = requiredFieldsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          Array.from(files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setFormData(prev => ({ 
                      ...prev, 
                      images: [...(prev.images || []), reader.result as string] 
                  }));
              };
              reader.readAsDataURL(file as Blob);
          });
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageUrl = () => {
      if (newImageUrl.trim()) {
          setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), newImageUrl.trim()]
          }));
          setNewImageUrl('');
      }
  };

  const removeImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
      }));
  };

  const setMainImage = (index: number) => {
      if (!formData.images) return;
      const newImages = [...formData.images];
      const selected = newImages.splice(index, 1)[0];
      newImages.unshift(selected); // Move to front
      setFormData(prev => ({ ...prev, images: newImages, image: selected }));
  };

  const addVariant = () => {
      if (!newVariantName || !newVariantOptions) return;
      const optionsArray = newVariantOptions.split(',').map(s => s.trim()).filter(Boolean);
      
      const newVariant: ProductVariant = {
          name: newVariantName,
          options: optionsArray
      };

      setFormData(prev => ({
          ...prev,
          variants: [...(prev.variants || []), newVariant]
      }));

      setNewVariantName('');
      setNewVariantOptions('');
  };

  const removeVariant = (index: number) => {
      setFormData(prev => ({
          ...prev,
          variants: prev.variants?.filter((_, i) => i !== index)
      }));
  };

  const handleTypeChange = (isDigital: boolean) => {
      setFormData(prev => ({
          ...prev,
          isDigital,
          // If digital, default shipping to 0. If physical, clear override to use default
          shippingCost: isDigital ? 0 : undefined
      }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto border border-zinc-800">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {initialData ? <Edit2 size={18} /> : <PlusCircleIcon size={18} />} 
              {initialData ? 'Edit Product' : 'Create New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 overflow-x-auto">
                <button 
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap px-4 ${activeTab === 'general' ? 'border-purple-500 text-purple-400 bg-zinc-800/50' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Public Info
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('advanced')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap px-4 ${activeTab === 'advanced' ? 'border-purple-500 text-purple-400 bg-zinc-800/50' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Dates & Condition
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('dropship')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap px-4 ${activeTab === 'dropship' ? 'border-purple-500 text-purple-400 bg-zinc-800/50' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Config & Sourcing
                </button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* --- GENERAL TAB --- */}
                {activeTab === 'general' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                        
                        {/* Product Type Toggle */}
                        <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex mb-2">
                             <button
                                type="button"
                                onClick={() => handleTypeChange(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${!formData.isDigital ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                             >
                                 <Package size={16} /> Physical Product
                             </button>
                             <button
                                type="button"
                                onClick={() => handleTypeChange(true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${formData.isDigital ? 'bg-purple-900/50 text-purple-200 shadow-sm border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                             >
                                 <Zap size={16} /> Digital Product
                             </button>
                        </div>

                        {formData.isDigital && (
                            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-3 text-xs text-blue-300 flex items-center gap-2">
                                <Download size={14} />
                                This product will be marked for instant delivery. Shipping costs are disabled.
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Product Title</label>
                            <input 
                                required
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder={formData.isDigital ? "e.g. Windows 11 Pro Key" : "e.g. Wireless Headphones"}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                    <Tag size={14} /> Category
                                </label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700 appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="" disabled>Select a Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                    <Package size={14} /> {formData.isDigital ? 'Keys / Stock' : 'Stock Qty'}
                                </label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                    value={formData.stock}
                                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                    <DollarSign size={14} /> Selling Price ($)
                                </label>
                                <input 
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                    Compare At Price ($)
                                </label>
                                <input 
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                value={formData.originalPrice || ''}
                                onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                                placeholder="Optional"
                                />
                             </div>
                        </div>

                        {/* Digital Specific Fields */}
                        {formData.isDigital && (
                            <div className="bg-purple-900/10 border border-purple-900/30 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-bold text-purple-400 text-sm flex items-center gap-2">
                                    <Zap size={16} /> Digital Delivery Config
                                </h4>
                                
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                        <Clock size={14} /> Delivery Timeframe
                                    </label>
                                    <input 
                                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                        value={formData.deliveryTimeframe || ''}
                                        onChange={e => setFormData({...formData, deliveryTimeframe: e.target.value})}
                                        placeholder="e.g. Instant, 24 Hours, 7 Days"
                                    />
                                    <p className="text-xs text-gray-600">Displayed to customer on product page.</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                        <AlignLeft size={14} /> Required User Inputs
                                    </label>
                                    <input 
                                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                        value={requiredFieldsInput}
                                        onChange={e => setRequiredFieldsInput(e.target.value)}
                                        placeholder="e.g. Username, Server Region, BattleTag"
                                    />
                                    <p className="text-xs text-gray-600">Comma separated list. User must fill these before adding to cart.</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                        <Key size={14} /> Digital Content / Key to Reveal
                                    </label>
                                    <textarea 
                                        rows={3}
                                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                        value={formData.digitalContent || ''}
                                        onChange={e => setFormData({...formData, digitalContent: e.target.value})}
                                        placeholder="e.g. The activation key or secret download link. This is revealed to the user AFTER purchase."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Image Gallery Management */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Product Images</label>
                            
                            <div className="flex gap-4 items-start">
                                <div className="flex-grow space-y-3">
                                    {/* Upload Options */}
                                    <div 
                                        className="border-2 border-dashed border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-zinc-800/50 transition-all group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="text-gray-500 group-hover:text-purple-400 mb-2" size={24} />
                                        <p className="text-sm text-gray-400 font-medium group-hover:text-white">Click to Upload Images</p>
                                        <p className="text-xs text-gray-600">Supports JPG, PNG, WEBP</p>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-zinc-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-zinc-900 px-2 text-gray-500">Or add via URL</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-grow px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700 text-sm"
                                            value={newImageUrl}
                                            onChange={e => setNewImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addImageUrl(); }}}
                                        />
                                        <Button type="button" variant="secondary" onClick={addImageUrl}>Add</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnails Grid */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-3">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                                            <img src={img} className="w-full h-full object-cover" alt={`Product ${idx}`} />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                {idx !== 0 && (
                                                    <button type="button" onClick={() => setMainImage(idx)} className="text-xs bg-white text-black px-2 py-1 rounded-full font-bold hover:bg-gray-200">
                                                        Set Main
                                                    </button>
                                                )}
                                                {idx === 0 && <span className="text-xs font-bold text-green-400 flex items-center gap-1"><Star size={10} fill="currentColor"/> Main</span>}
                                                <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-500">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Description</label>
                            <textarea 
                                required
                                rows={4}
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {/* --- ADVANCED TAB (Dates & Condition) --- */}
                {activeTab === 'advanced' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                         
                         <div className="space-y-3">
                             <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                 <HelpCircle size={16} /> Item Condition
                             </label>
                             <div className="flex gap-4">
                                 <label className="flex-1 flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-900 transition-colors">
                                     <input 
                                        type="radio" 
                                        name="condition"
                                        checked={formData.condition === 'new'}
                                        onChange={() => setFormData({...formData, condition: 'new'})}
                                        className="accent-purple-500 w-4 h-4"
                                     />
                                     <div>
                                         <p className="font-bold text-white">New / Unused</p>
                                         <p className="text-xs text-gray-500">Brand new item in original packaging.</p>
                                     </div>
                                 </label>
                                 <label className="flex-1 flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-900 transition-colors">
                                     <input 
                                        type="radio" 
                                        name="condition"
                                        checked={formData.condition === 'used'}
                                        onChange={() => setFormData({...formData, condition: 'used'})}
                                        className="accent-purple-500 w-4 h-4"
                                     />
                                     <div>
                                         <p className="font-bold text-white">Used / Pre-owned</p>
                                         <p className="text-xs text-gray-500">Item has been opened or used.</p>
                                     </div>
                                 </label>
                             </div>
                         </div>

                         <div className="space-y-3">
                             <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                 <Calendar size={16} /> Availability Schedule
                             </h4>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-xs font-medium text-gray-500">Launch Date</label>
                                     <input 
                                        type="datetime-local"
                                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white"
                                        value={formData.launchDate ? new Date(formData.launchDate).toISOString().slice(0, 16) : ''}
                                        onChange={e => setFormData({...formData, launchDate: new Date(e.target.value).toISOString()})}
                                     />
                                     <p className="text-[10px] text-gray-600">Product visible but not purchasable until this date.</p>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-xs font-medium text-gray-500">End Date (Optional)</label>
                                     <input 
                                        type="datetime-local"
                                        className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white"
                                        value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                                        onChange={e => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                                     />
                                     <p className="text-[10px] text-gray-600">Leave empty for indefinite availability.</p>
                                 </div>
                             </div>
                         </div>

                     </div>
                )}

                {/* --- DROPSHIP & CONFIG TAB --- */}
                {activeTab === 'dropship' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-4 bg-purple-900/10 border border-purple-900/30 rounded-xl">
                            <h4 className="font-bold text-purple-400 mb-1">Profitability Calculator</h4>
                            <p className="text-xs text-gray-400 mb-3">Margins are calculated automatically based on Selling Price vs Cost.</p>
                            
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Selling Price</p>
                                    <p className="text-xl font-bold text-white">${Number(formData.price).toFixed(2)}</p>
                                </div>
                                <div className="text-gray-600">-</div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Product Cost</p>
                                    <p className="text-xl font-bold text-red-400">${Number(formData.costPrice || 0).toFixed(2)}</p>
                                </div>
                                <div className="text-gray-600">=</div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Gross Margin</p>
                                    <p className={`text-xl font-bold ${Number(formData.price) - Number(formData.costPrice || 0) > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                        ${(Number(formData.price) - Number(formData.costPrice || 0)).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Tax Config (Moved here as it's more config related) */}
                        <div className={`grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 ${formData.isDigital ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                    <DollarSign size={14} /> Shipping Cost ($)
                                </label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                    value={formData.shippingCost !== undefined ? formData.shippingCost : ''}
                                    onChange={e => setFormData({...formData, shippingCost: e.target.value ? Number(e.target.value) : undefined})}
                                    placeholder={formData.isDigital ? "0.00" : `Default: ${settings.shippingCost}`}
                                    disabled={formData.isDigital}
                                />
                                {formData.isDigital && <p className="text-[10px] text-blue-400">Disabled for digital products</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                    <Percent size={14} /> Tax Rate (Decimal)
                                </label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                    value={formData.taxRate !== undefined ? formData.taxRate : ''}
                                    onChange={e => setFormData({...formData, taxRate: e.target.value ? Number(e.target.value) : undefined})}
                                    placeholder={`Default: ${settings.taxRate}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                <DollarSign size={14} /> Supply Cost ($)
                            </label>
                            <input 
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                value={formData.costPrice || ''}
                                onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                                placeholder="Cost per unit from supplier"
                            />
                            <p className="text-xs text-gray-600">This is hidden from customers. Used for admin reporting.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                <Globe size={14} /> Supplier URL
                            </label>
                            <input 
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700"
                                value={formData.supplierUrl || ''}
                                onChange={e => setFormData({...formData, supplierUrl: e.target.value})}
                                placeholder="https://aliexpress.com/item/..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                <Tag size={14} /> SKU (Stock Keeping Unit)
                            </label>
                            <input 
                                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700 uppercase"
                                value={formData.sku || ''}
                                onChange={e => setFormData({...formData, sku: e.target.value})}
                                placeholder={formData.isDigital ? "DIG-KEY-001" : "e.g. TOY-001-RED"}
                            />
                        </div>

                         {/* Variants Section */}
                         <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mt-4">
                            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                                <LayoutGrid size={14} /> Product Variants
                            </h4>
                            
                            {/* Existing Variants List */}
                            <div className="space-y-2 mb-4">
                                {formData.variants?.map((v, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
                                        <div>
                                            <span className="font-bold text-gray-200">{v.name}:</span>
                                            <span className="text-gray-500 ml-2 text-sm">{v.options.join(', ')}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeVariant(idx)}
                                            className="text-gray-600 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Variant Form */}
                            <div className="grid grid-cols-5 gap-2">
                                <input 
                                    placeholder={formData.isDigital ? "Region (Global, EU)" : "Name (e.g. Size)"}
                                    className="col-span-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-purple-600"
                                    value={newVariantName}
                                    onChange={e => setNewVariantName(e.target.value)}
                                />
                                <input 
                                    placeholder="Options (S, M, L)" 
                                    className="col-span-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-purple-600"
                                    value={newVariantOptions}
                                    onChange={e => setNewVariantOptions(e.target.value)}
                                />
                                <Button 
                                    type="button" 
                                    size="sm"
                                    variant="secondary"
                                    onClick={addVariant}
                                    className="col-span-1"
                                    disabled={!newVariantName || !newVariantOptions}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3 rounded-b-2xl sticky bottom-0 z-10">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>Save Product</Button>
            </div>
        </form>
      </div>
    </div>
  );
}
