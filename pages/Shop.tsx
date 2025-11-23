

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../App';
import { ProductCard } from '../components/ProductCard';
import { generateMarketingBlurb } from '../services/geminiService';
import { Sparkles, Filter, Tag, X, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Shop: React.FC = () => {
  const { products } = useApp();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [slogan, setSlogan] = useState<string>("Discover trending products shipped globally.");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Recommended");
  const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });

  useEffect(() => {
    generateMarketingBlurb("Latest Trends").then(setSlogan);
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
      let filtered = products;

      // 1. Filter by Category
      if (selectedCategory !== "All") {
          filtered = filtered.filter(p => p.category === selectedCategory);
      }

      // 2. Filter by Search Query
      if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
              p.title.toLowerCase().includes(lowerQ) || 
              p.description.toLowerCase().includes(lowerQ) ||
              p.category.toLowerCase().includes(lowerQ)
          );
      }

      // 3. Filter by Price Range
      if (priceRange.min !== '') {
          filtered = filtered.filter(p => p.price >= Number(priceRange.min));
      }
      if (priceRange.max !== '') {
          filtered = filtered.filter(p => p.price <= Number(priceRange.max));
      }

      // 4. Sort
      return filtered.sort((a, b) => {
          if (sortBy === 'Price: Low to High') return a.price - b.price;
          if (sortBy === 'Price: High to Low') return b.price - a.price;
          if (sortBy === 'Newest') return b.id.localeCompare(a.id); // Assuming simple string ID or simple timestamp logic
          return 0; // Default order
      });
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const clearFilters = () => {
      setSelectedCategory("All");
      setPriceRange({ min: '', max: '' });
      setSortBy("Recommended");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pt-8">
      {/* Hero Section */}
      <div className="relative bg-black rounded-3xl p-10 md:p-16 text-white shadow-2xl overflow-hidden group">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white mb-6 border border-white/20 uppercase tracking-widest hover:bg-white/30 transition-colors cursor-default">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            Next-Gen Dropshipping
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Curated.<br/>Global.<br/>Yours.
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg font-light">
            {slogan}
          </p>
          <div className="flex flex-wrap gap-4">
              <button className="bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2">
                Explore Collection <ArrowRight size={20} />
              </button>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-blue-600 to-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-emerald-500 to-teal-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28 shadow-sm">
                <div className="flex items-center justify-between font-bold text-gray-900 mb-6">
                    <div className="flex items-center gap-2 text-lg">
                        <Filter size={20} />
                        <span>Refine</span>
                    </div>
                    {(selectedCategory !== 'All' || priceRange.min || priceRange.max) && (
                        <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                            Reset
                        </button>
                    )}
                </div>
                
                <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                                selectedCategory === cat 
                                ? 'bg-black text-white shadow-lg' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span className="font-medium">{cat}</span>
                            {cat !== 'All' && (
                                <span className={`text-xs px-2 py-0.5 rounded-md ${
                                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                                }`}>
                                    {products.filter(p => p.category === cat).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</p>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            placeholder="0"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        />
                        <span className="text-gray-300">-</span>
                        <input 
                            type="number" 
                            placeholder="MAX"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
            {searchQuery && (
                <div className="bg-blue-50 border border-blue-100 text-blue-900 px-6 py-4 rounded-xl mb-8 flex items-center justify-between">
                    <span className="font-medium">Search results for: <strong className="text-blue-700">"{searchQuery}"</strong></span>
                    <Link to="/" className="text-blue-400 hover:text-blue-700 transition-colors"><X size={20}/></Link>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    {selectedCategory}
                    <span className="text-lg font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filteredProducts.length} items</span>
                </h2>
                
                <div className="flex items-center gap-3 bg-white px-4 py-2 border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-sm font-medium text-gray-500">Sort by</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border-none bg-transparent font-bold focus:ring-0 cursor-pointer text-gray-900 outline-none pr-8"
                    >
                        <option>Recommended</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest</option>
                    </select>
                </div>
            </div>
            
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <Tag size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">Try adjusting your filters, price range, or category selection.</p>
                    <Button variant="outline" className="mt-8 rounded-full px-8" onClick={clearFilters}>Clear all filters</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
