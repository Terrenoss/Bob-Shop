


'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../providers';
import { Product } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { ShoppingBag, ArrowLeft, Truck, ShieldCheck, Star, AlertCircle, Minus, Plus, Share2, ChevronRight, Home, Clock, Info, Calendar } from 'lucide-react';
import { productsService } from '../../../lib/mockNestService';
import { ReviewSection } from '../../../components/ReviewSection';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, formatPrice, settings } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      const found = await productsService.findOne(id);
      setProduct(found || null);
      if (found) setActiveImage(found.image);
      
      if (found && found.variants) {
          const defaults: Record<string, string> = {};
          found.variants.forEach(v => {
              if (v.options.length > 0) defaults[v.name] = v.options[0];
          });
          setSelectedVariants(defaults);
      }
      
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleVariantChange = (name: string, value: string) => {
      setSelectedVariants(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (field: string, value: string) => {
      setCustomFields(prev => ({ ...prev, [field]: value }));
  };

  const adjustQuantity = (delta: number) => {
      if (!product) return;
      setQuantity(prev => {
          const newVal = prev + delta;
          if (newVal < 1) return 1;
          if (newVal > product.stock) return product.stock;
          return newVal;
      });
  };

  const handleAddToCart = () => {
      if (!product) return;
      
      if (product.requiredFields && product.requiredFields.length > 0) {
          for (const field of product.requiredFields) {
              if (!customFields[field] || customFields[field].trim() === '') {
                  toast.error(`Please fill in ${field}`);
                  return;
              }
          }
      }
      
      addToCart(product, quantity, selectedVariants, customFields);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const canShare = navigator.share && (shareUrl.startsWith('http://') || shareUrl.startsWith('https://'));

    if (canShare) {
      try {
        await navigator.share({
          title: product?.title || 'Bob-Shop',
          text: `Découvrez ce produit : ${product?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
        if ((err as Error).name !== 'AbortError') {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Lien copié !');
            } catch (clipboardErr) {
                toast.error('Impossible de partager le lien');
            }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Lien copié !');
      } catch (err) {
        toast.error('Impossible de copier le lien');
      }
    }
  };

  if (loading) {
      return (
          <div className="max-w-6xl mx-auto pt-8 space-y-12">
               <Skeleton className="h-6 w-32" />
               <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                       <div className="aspect-square bg-zinc-800 animate-pulse" />
                       <div className="p-8 md:p-12 flex flex-col gap-6">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-12 w-3/4" />
                           <Skeleton className="h-6 w-48" />
                           <div className="flex gap-4">
                               <Skeleton className="h-10 w-32" />
                               <Skeleton className="h-8 w-24 rounded-full" />
                           </div>
                           <div className="space-y-3 mt-4">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-2/3" />
                           </div>
                           <div className="mt-8 space-y-4">
                               <Skeleton className="h-14 w-full rounded-lg" />
                           </div>
                       </div>
                   </div>
               </div>
          </div>
      );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-white">Produit Introuvable</h2>
        <Button onClick={() => navigate('/')}>Retour à la boutique</Button>
      </div>
    );
  }

  const effectiveShippingCost = product.shippingCost !== undefined ? product.shippingCost : settings.shippingCost;
  const isFreeShipping = effectiveShippingCost === 0;

  // Date Logic
  const now = new Date();
  const isLaunched = !product.launchDate || new Date(product.launchDate) <= now;
  const isExpired = product.endDate && new Date(product.endDate) <= now;
  const isAvailable = isLaunched && !isExpired;

  // Gallery Logic
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultipleImages = galleryImages.length > 1;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Breadcrumbs & Back Nav */}
      <div className="flex flex-col gap-4">
        <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-purple-400 transition-colors flex items-center gap-1">
                <Home size={14} /> Accueil
            </Link>
            <ChevronRight size={14} className="mx-2 text-zinc-700" />
            <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-purple-400 transition-colors">
                {product.category}
            </Link>
            <ChevronRight size={14} className="mx-2 text-zinc-700" />
            <span className="text-gray-200 font-medium truncate max-w-[200px] sm:max-w-md">
                {product.title}
            </span>
        </nav>

        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 hover:text-white transition-colors w-fit"
        >
            <ArrowLeft size={18} className="mr-2" /> Retour
        </button>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
          
          {/* Image Section */}
          <div className={`flex flex-col relative ${hasMultipleImages ? 'gap-2 bg-zinc-800 p-2 md:p-0' : 'h-full p-0'}`}>
             <div className={`relative w-full group overflow-hidden ${hasMultipleImages ? 'aspect-square bg-black' : 'h-full min-h-[400px] md:min-h-full'}`}>
                 <img 
                   src={activeImage} 
                   alt={product.title} 
                   className={`w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500 ${hasMultipleImages ? 'object-contain md:object-cover' : 'object-cover absolute inset-0'}`} 
                 />
                 {product.condition === 'used' && (
                     <div className="absolute top-4 left-4 bg-yellow-600/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                         Used / Pre-Owned
                     </div>
                 )}
             </div>
             
             {/* Thumbnail Gallery */}
             {hasMultipleImages && (
                 <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
                     {galleryImages.map((img, idx) => (
                         <button 
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                         >
                             <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
                         </button>
                     ))}
                 </div>
             )}
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-auto">
                <div className="flex items-center gap-2 text-sm text-purple-400 font-bold uppercase tracking-wider mb-2">
                    {product.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {product.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <span className="text-gray-500 text-sm">(Avis vérifiés ci-dessous)</span>
                </div>

                <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-4xl font-bold text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice !== undefined && product.originalPrice > 0 && (
                        <span className="text-xl text-gray-600 line-through decoration-gray-600/50">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
                
                {/* Condition & Delivery Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {product.deliveryTimeframe && (
                        <div className="flex items-center gap-2 p-2 bg-blue-900/20 border border-blue-900/40 rounded-lg text-blue-300 text-xs font-bold">
                            <Clock size={14} />
                            <span>{product.deliveryTimeframe}</span>
                        </div>
                    )}
                    {product.condition && (
                        <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold border ${product.condition === 'new' ? 'bg-green-900/20 border-green-900/40 text-green-300' : 'bg-yellow-900/20 border-yellow-900/40 text-yellow-300'}`}>
                            <Info size={14} />
                            <span>Condition: {product.condition === 'new' ? 'Brand New' : 'Used'}</span>
                        </div>
                    )}
                </div>
                
                {/* Date Warnings */}
                {!isLaunched && (
                    <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/50 rounded-xl text-purple-200 flex items-center gap-3">
                        <Calendar size={20} />
                        <div>
                            <p className="font-bold">Coming Soon!</p>
                            <p className="text-sm opacity-80">Launches on {new Date(product.launchDate!).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
                {isExpired && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <div>
                            <p className="font-bold">No Longer Available</p>
                            <p className="text-sm opacity-80">Sale ended on {new Date(product.endDate!).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}

                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    {product.description}
                </p>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                    <div className="space-y-4 mb-8">
                        {product.variants.map(variant => (
                            <div key={variant.name}>
                                <label className="text-sm font-semibold text-gray-200 mb-2 block">
                                    {variant.name}: <span className="font-normal text-gray-500">{selectedVariants[variant.name]}</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {variant.options.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleVariantChange(variant.name, option)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                selectedVariants[variant.name] === option
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Required Custom Fields */}
                {product.requiredFields && product.requiredFields.length > 0 && isAvailable && (
                    <div className="space-y-4 mb-8 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <h4 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Info size={14} className="text-purple-500" /> Required Information
                        </h4>
                        {product.requiredFields.map(field => (
                            <div key={field} className="space-y-1">
                                <label className="text-sm font-medium text-gray-400">{field}</label>
                                <input 
                                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-white placeholder-zinc-700 transition-all"
                                    placeholder={`Enter your ${field}`}
                                    value={customFields[field] || ''}
                                    onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Stock Indicator */}
                <div className="flex items-center gap-2 mb-8 text-sm">
                    {product.stock > 0 ? (
                        <span className="text-green-400 font-medium bg-green-900/20 px-2 py-1 rounded flex items-center gap-1 border border-green-900/30">
                             <div className="w-2 h-2 rounded-full bg-green-500"></div> En Stock ({product.stock})
                        </span>
                    ) : (
                        <span className="text-red-400 font-medium bg-red-900/20 px-2 py-1 rounded flex items-center gap-1 border border-red-900/30">
                             <AlertCircle size={14} /> Rupture de stock
                        </span>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Truck className="text-green-500 mt-1" size={20} />
                        <div>
                            <p className="font-semibold text-gray-200">
                                {isFreeShipping ? 'Livraison Gratuite' : `Livraison: ${formatPrice(effectiveShippingCost)}`}
                            </p>
                            <p className="text-sm text-gray-500">
                                {product.deliveryTimeframe ? `Estimated delivery: ${product.deliveryTimeframe}` : "Délais estimés: 7-15 jours ouvrés"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="text-purple-500 mt-1" size={20} />
                        <div>
                            <p className="font-semibold text-gray-200">Garantie Acheteur</p>
                            <p className="text-sm text-gray-500">Satisfait ou remboursé</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                     <span className="font-semibold text-gray-200">Quantité</span>
                     <div className="flex items-center gap-3 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                        <button 
                            onClick={() => adjustQuantity(-1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 shadow-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            disabled={quantity <= 1 || product.stock === 0 || !isAvailable}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold text-white">{quantity}</span>
                        <button 
                            onClick={() => adjustQuantity(1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 shadow-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            disabled={quantity >= product.stock || product.stock === 0 || !isAvailable}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button 
                      size="lg" 
                      onClick={handleAddToCart} 
                      className="flex-grow text-lg h-14"
                      disabled={product.stock <= 0 || !isAvailable}
                    >
                       <ShoppingBag className="mr-2" /> 
                       {!isLaunched ? 'Coming Soon' : isExpired ? 'Unavailable' : product.stock > 0 ? 'Ajouter au panier' : 'Épuisé'}
                    </Button>

                    <Button 
                        variant="secondary"
                        size="lg"
                        onClick={handleShare}
                        className="h-14 w-14 !px-0 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white border border-zinc-700"
                        title="Partager"
                    >
                        <Share2 size={24} />
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW: DETAILED CONTENT SECTIONS --- */}
      {product.sections && product.sections.length > 0 && (
          <div className="space-y-12 py-8">
              {product.sections.map((section, idx) => (
                  <div key={idx} className={`flex flex-col md:flex-row gap-8 items-center ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="flex-1 w-full">
                          {section.image && (
                              <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-lg aspect-video bg-zinc-900">
                                  <img 
                                    src={section.image} 
                                    alt={section.title} 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                                  />
                              </div>
                          )}
                      </div>
                      <div className="flex-1 space-y-4">
                          <h3 className="text-2xl md:text-3xl font-bold text-white">{section.title}</h3>
                          <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
                              {section.content}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <ReviewSection productId={product.id} />
    </div>
  );
}