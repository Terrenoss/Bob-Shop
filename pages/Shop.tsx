import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { ProductCard } from '../components/ProductCard';
import { generateMarketingBlurb } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

export const Shop: React.FC = () => {
  const { products } = useApp();
  const [slogan, setSlogan] = useState<string>("Discover trending products shipped globally.");

  useEffect(() => {
    // Generate a fresh slogan on mount for "Fresh Finds"
    generateMarketingBlurb("Latest Trends").then(setSlogan);
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium text-blue-100 mb-4 border border-white/20">
            <Sparkles size={14} />
            <span>AI-Curated Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Bob-Shop Global
          </h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed opacity-90">
            {slogan}
          </p>
          <button className="bg-white text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Shop Now
          </button>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <span className="text-sm text-gray-500">{products.length} items</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};