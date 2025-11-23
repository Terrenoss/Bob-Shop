
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../App';
import { ProductCard } from '../components/ProductCard';
import { generateMarketingBlurb } from '../services/geminiService';
import { Sparkles, Filter, Tag, X } from 'lucide-react';
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-200 mb-4 border border-white/10 uppercase tracking-wider">
            <Sparkles size={12} />
            AI-Curated Dropshipping
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Bob-Shop <span className="text-blue-400">Global</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed opacity-90 max-w-lg">
            {slogan}
          </p>
          <div className="flex gap-4">
              <button className="bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Shop Now
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Inventory Sync
              </div>
          </div>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
                <div className="flex items-center justify-between font-bold text-gray-900 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter size={20} />
                        <span>Filters</span>
                    </div>
                    {(selectedCategory !== 'All' || priceRange.min || priceRange.max) && (
                        <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                            Clear
                        </button>
                    )}
                </div>
                
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</p>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                selectedCategory === cat 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {cat}
                            {cat !== 'All' && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                    {products.filter(p => p.category === cat).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <input 
                            type="number" 
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                            type="number" 
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
            {searchQuery && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                    <span>Search results for: <strong>"{searchQuery}"</strong></span>
                    <Link to="/" className="text-blue-500 hover:text-blue-700"><X size={16}/></Link>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedCategory} Products
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{filteredProducts.length}</span>
                </h2>
                
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border-none bg-transparent font-medium focus:ring-0 cursor-pointer text-gray-900 outline-none"
                    >
                        <option>Recommended</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest</option>
                    </select>
                </div>
            </div>
            
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Tag className="mx-auto text-gray-400 mb-3" size={48} />
                    <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">Try adjusting your filters, price range, or category selection.</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear all filters</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};