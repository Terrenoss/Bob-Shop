import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../app/providers';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { ShoppingBag, ArrowLeft, Truck, ShieldCheck, Star, AlertCircle } from 'lucide-react';
import { productsService } from '../services/mockNestService';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const found = await productsService.findOne(id);
      setProduct(found || null);
      
      // Select first option for each variant by default
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

  if (loading) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/')}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to results
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
          
          {/* Image Section */}
          <div className="bg-gray-100 relative aspect-square md:aspect-auto">
             <img 
               src={product.image} 
               alt={product.title} 
               className="w-full h-full object-cover mix-blend-multiply" 
             />
             {product.source !== 'Bob-Shop Inventory' && (
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                     Global Import
                 </div>
             )}
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-auto">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">
                    {product.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {product.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <span className="text-gray-500 text-sm">(42 verified reviews)</span>
                </div>

                <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                        <span className="text-xl text-gray-400 line-through decoration-gray-400/50">
                            ${product.originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {product.description}
                </p>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                    <div className="space-y-4 mb-8">
                        {product.variants.map(variant => (
                            <div key={variant.name}>
                                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                    {variant.name}: <span className="font-normal text-gray-500">{selectedVariants[variant.name]}</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {variant.options.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleVariantChange(variant.name, option)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                selectedVariants[variant.name] === option
                                                ? 'bg-gray-900 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

                {/* Stock Indicator */}
                <div className="flex items-center gap-2 mb-8 text-sm">
                    {product.stock > 0 ? (
                        <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                             <div className="w-2 h-2 rounded-full bg-green-600"></div> In Stock ({product.stock})
                        </span>
                    ) : (
                        <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                             <AlertCircle size={14} /> Out of Stock
                        </span>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Truck className="text-green-600 mt-1" size={20} />
                        <div>
                            <p className="font-semibold text-gray-900">Free Shipping Worldwide</p>
                            <p className="text-sm text-gray-500">Estimated delivery: 7-15 days</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="text-blue-600 mt-1" size={20} />
                        <div>
                            <p className="font-semibold text-gray-900">Buyer Protection</p>
                            <p className="text-sm text-gray-500">Full refund if item is not as described</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => addToCart(product, 1, selectedVariants)} 
                  className="flex-grow text-lg h-14"
                  disabled={product.stock <= 0}
                >
                   <ShoppingBag className="mr-2" /> {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};