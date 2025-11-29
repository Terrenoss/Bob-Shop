
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from './providers';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { 
  Filter, Tag, X, ArrowRight, Zap, Gem, ChevronLeft, ChevronRight, 
  LayoutGrid, SlidersHorizontal, Menu, ChevronDown, 
  Shirt, Home, Smartphone, Gamepad2, Baby, Watch, Armchair, Car, Monitor,
  Laptop, Camera, Speaker, HardDrive, Cpu, Plug, 
  Utensils, Bed, Bath, Hammer, Shovel,
  Briefcase, Glasses, Footprints, Star, Check, Globe,
  Gamepad, Key, CreditCard, Coins, User, Ghost, Gift, Coffee,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Category Configuration
interface SubCategory { name: string; query: string; }
interface MegaCategory { id: string; label: string; icon: any; subcategories: SubCategory[]; }

const CATEGORY_TREE: MegaCategory[] = [
  { 
    id: 'Digital', 
    label: 'Digital & Gaming', 
    icon: Gamepad, 
    subcategories: [ 
      { name: 'Gift Cards', query: 'gift card' }, 
      { name: 'Games', query: 'game' }, 
      { name: 'Software & Apps', query: 'software' }, 
      { name: 'Payment Cards', query: 'payment card' }, 
      { name: 'Game Coins (RP, V-Bucks)', query: 'coin' }, 
      { name: 'In-Game Items', query: 'item' }, 
      { name: 'Accounts', query: 'account' }, 
      { name: 'Boosting Services', query: 'boosting' }, 
      { name: 'Skins', query: 'skin' } 
    ] 
  },
  { 
    id: 'High-Tech', 
    label: 'High-Tech & Computing', 
    icon: Smartphone, 
    subcategories: [ 
      { name: 'Laptops', query: 'laptop' }, 
      { name: 'Smartphones', query: 'smartphone' },
      { name: 'PC Components', query: 'component' },
      { name: 'Peripherals', query: 'keyboard mouse' },
      { name: 'Audio & Hifi', query: 'audio' },
      { name: 'Tablets', query: 'tablet' },
      { name: 'Wearables', query: 'watch' }
    ] 
  },
  { 
    id: 'Anime & Manga', 
    label: 'Anime, Manga & Cards', 
    icon: Sparkles, 
    subcategories: [ 
      { name: 'Figures', query: 'figure' },
      { name: 'Manga', query: 'manga' },
      { name: 'Trading Cards', query: 'card' },
      { name: 'Cosplay', query: 'cosplay' },
      { name: 'Apparel', query: 'anime shirt' },
      { name: 'Accessories', query: 'anime accessory' }
    ] 
  },
  { 
    id: 'Home', 
    label: 'Home & Decor', 
    icon: Home, 
    subcategories: [ 
      { name: 'Decor', query: 'decor' },
      { name: 'Furniture', query: 'furniture' },
      { name: 'Lighting', query: 'light' },
      { name: 'Kitchenware', query: 'kitchen' },
      { name: 'Bedding', query: 'bed' },
      { name: 'Garden', query: 'garden' },
      { name: 'DIY & Tools', query: 'tool' }
    ] 
  },
  { 
    id: 'Fashion', 
    label: 'Fashion', 
    icon: Shirt, 
    subcategories: [ 
      { name: 'Men', query: 'men' },
      { name: 'Women', query: 'women' },
      { name: 'Shoes', query: 'shoes' },
      { name: 'Bags & Luggage', query: 'bag' },
      { name: 'Jewelry', query: 'jewelry' },
      { name: 'Watches', query: 'watch' },
      { name: 'Sportswear', query: 'sport' }
    ] 
  },
  { 
    id: 'Toys', 
    label: 'Toys & Hobbies', 
    icon: Gamepad2, 
    subcategories: [ 
      { name: 'RC Vehicles', query: 'rc' },
      { name: 'Action Figures', query: 'figure' },
      { name: 'Board Games', query: 'board game' },
      { name: 'Building Blocks', query: 'block' },
      { name: 'Educational', query: 'education' },
      { name: 'Outdoor Play', query: 'outdoor' }
    ] 
  },
  { 
    id: 'Kids', 
    label: 'Baby & Kids', 
    icon: Baby, 
    subcategories: [ 
      { name: 'Baby Care', query: 'baby' },
      { name: 'Maternity', query: 'maternity' },
      { name: 'Strollers', query: 'stroller' },
      { name: 'Kids Clothing', query: 'kids clothes' },
      { name: 'School Supplies', query: 'school' }
    ] 
  },
  {
    id: 'Food',
    label: 'Food & Drink',
    icon: Utensils,
    subcategories: [
      { name: 'Snacks', query: 'snack' },
      { name: 'Beverages', query: 'drink' },
      { name: 'Coffee & Tea', query: 'coffee' },
      { name: 'Gourmet', query: 'gourmet' },
      { name: 'Organic', query: 'organic' },
      { name: 'Sweets', query: 'candy' }
    ]
  }
];

export default function HomePage() {
  const { products, isProductsLoading, categories } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';

  const [sortBy, setSortBy] = useState<string>("Recommended");
  const [priceRange, setPriceRange] = useState<{ min: string, max: string }>({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const productsAnchorRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Mobile Filter State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = useMemo(() => [
    {
      id: 'digital',
      subtitle: "DIGITAL MARKET",
      title: "Instant Digital Delivery",
      desc: "Get your Game Keys, Gift Cards, and Skins instantly. No waiting.",
      icon: Gamepad2,
      color: "from-blue-900/40 to-indigo-900/40",
      accent: "text-blue-400",
      border: "border-blue-500/30",
      tags: ['Gift Cards', 'Skins', 'Game Keys', 'Software'],
      featuredProducts: products.filter(p => p.category === 'Digital').slice(0, 4)
    },
    {
      id: 'anime',
      subtitle: "OTAKU COLLECTION",
      title: "Anime & Manga Import",
      desc: "Authentic figures, rare TCG cards, and exclusive manga from Japan.",
      icon: Sparkles,
      color: "from-pink-900/40 to-purple-900/40",
      accent: "text-pink-400",
      border: "border-pink-500/30",
      tags: ['Figures', 'TCG', 'Cosplay', 'Manga'],
      featuredProducts: products.filter(p => p.category === 'Anime & Manga').slice(0, 4)
    },
    {
      id: 'tech',
      subtitle: "NEXT-GEN TECH",
      title: "High-Performance Gear",
      desc: "Upgrade your setup with the latest noise-cancelling tech and gadgets.",
      icon: Smartphone,
      color: "from-emerald-900/40 to-cyan-900/40",
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      tags: ['Audio', 'Laptops', 'Gaming', 'Accessories'],
      featuredProducts: products.filter(p => p.category === 'High-Tech').slice(0, 4)
    }
  ], [products]);

  const activeSlide = heroSlides[heroIndex];

  const nextSlide = () => setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const horizontalCategories = useMemo(() => {
      const treeCats = CATEGORY_TREE.map(c => c.id);
      const productCats = products.map(p => p.category);
      const uniqueCats = Array.from(new Set(["All", ...treeCats, ...productCats]));
      return uniqueCats;
  }, [products]);

  const filteredProducts = useMemo(() => {
      let filtered = products;

      // Category Filter
      if (selectedCategory !== "All") {
          filtered = filtered.filter(p => p.category === selectedCategory);
      }

      // Search Filter
      if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
              p.title.toLowerCase().includes(lowerQ) || 
              p.description.toLowerCase().includes(lowerQ) || 
              p.category.toLowerCase().includes(lowerQ)
          );
      }

      // Price Filter
      if (priceRange.min !== '') {
          filtered = filtered.filter(p => p.price >= Number(priceRange.min));
      }
      if (priceRange.max !== '') {
          filtered = filtered.filter(p => p.price <= Number(priceRange.max));
      }

      // Stock Filter
      if (inStockOnly) {
          filtered = filtered.filter(p => p.stock > 0);
      }

      // Sort
      return filtered.sort((a, b) => {
          if (sortBy === 'Price: Low to High') return a.price - b.price;
          if (sortBy === 'Price: High to Low') return b.price - a.price;
          if (sortBy === 'Newest') {
             const dateA = a.launchDate ? new Date(a.launchDate).getTime() : 0;
             const dateB = b.launchDate ? new Date(b.launchDate).getTime() : 0;
             return dateB - dateA;
          }
          return 0;
      });
  }, [products, selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  // Click Outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
              setIsCategoryMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat === "All") params.delete('category');
      else params.set('category', cat);
      params.delete('q'); 
      navigate(`/?${params.toString()}`);
      setIsCategoryMenuOpen(false);
      setTimeout(() => productsAnchorRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubCategoryClick = (e: React.MouseEvent, categoryId: string, query: string) => {
      e.preventDefault();
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set('category', categoryId);
      params.set('q', query); 
      navigate(`/?${params.toString()}`);
      setIsCategoryMenuOpen(false);
      setTimeout(() => productsAnchorRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  const handleHeroTagClick = (tag: string) => {
      navigate(`/?q=${tag}`);
      setTimeout(() => productsAnchorRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const clearFilters = () => {
      setPriceRange({ min: '', max: '' });
      setInStockOnly(false);
      setCurrentPage(1);
      setMobileFiltersOpen(false); // Close mobile drawer
      navigate('/');
  };

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const ActiveIcon = activeSlide.icon;

  return (
    <div className="container mx-auto pb-12">
      {/* Category Bar */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 -mx-4 px-4 sm:mx-0 sm:rounded-xl sm:border mb-8 sticky top-[68px] z-40 shadow-md flex items-center">
          <div className="flex-shrink-0 py-3 pl-2" ref={categoryMenuRef}>
                 <button onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isCategoryMenuOpen ? 'bg-zinc-100 text-black shadow-sm' : 'bg-zinc-950 text-gray-300 border border-zinc-800 hover:bg-zinc-800 hover:text-white'}`}>
                     <Menu size={16} /> <span className="hidden sm:inline">All Categories</span> <span className="sm:hidden">Cats</span>
                 </button>
                 {isCategoryMenuOpen && (
                     <div className="absolute top-full left-0 w-[calc(100vw-32px)] sm:w-full bg-zinc-900 border-x border-b border-zinc-800 rounded-b-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 flex flex-col max-h-[80vh] overflow-y-auto mt-px">
                         <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full bg-zinc-900/95 backdrop-blur-md">
                             {CATEGORY_TREE.map(cat => {
                                 const Icon = cat.icon;
                                 return (
                                     <div key={cat.id} className="group/category flex flex-col gap-3 break-inside-avoid">
                                         <button onClick={() => handleCategoryChange(cat.id)} className="flex items-center gap-3 w-full text-left">
                                             <div className="p-2 bg-zinc-800 rounded-xl text-purple-400 group-hover/category:bg-purple-500 group-hover/category:text-white transition-all duration-300 shadow-sm ring-1 ring-zinc-700/50 group-hover/category:ring-purple-500"><Icon size={20} /></div>
                                             <span className="font-bold text-white text-base group-hover/category:text-purple-400 transition-colors">{cat.label}</span>
                                         </button>
                                         <div className="flex flex-col gap-1 pl-12 border-l border-zinc-800 ml-4">
                                             {cat.subcategories.map(sub => (
                                                 <button key={sub.name} onClick={(e) => handleSubCategoryClick(e, cat.id, sub.query)} className="text-left py-1 text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all">
                                                     {sub.name}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}
          </div>
          <div className="h-8 w-px bg-zinc-800 mx-4 flex-shrink-0 hidden sm:block"></div>
          <div className="flex-1 overflow-x-auto scrollbar-hide py-3 flex items-center gap-2 pr-2 ml-4 sm:ml-0">
             {horizontalCategories.map(cat => (
                 <button key={cat} onClick={() => handleCategoryChange(cat)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border whitespace-nowrap ${selectedCategory === cat ? 'bg-purple-600 text-white border-purple-500 shadow-lg' : 'border-transparent text-gray-400 hover:text-white hover:bg-zinc-800'}`}>
                     {cat}
                 </button>
             ))}
          </div>
      </div>

      {/* Dynamic Hero Carousel */}
      {selectedCategory === 'All' && !searchQuery && (
         <div className="mb-12 relative group/hero">
            <div className={`absolute inset-0 bg-gradient-to-r ${activeSlide.color} rounded-2xl transition-all duration-700`}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay rounded-2xl"></div>

            <div className={`relative z-10 border ${activeSlide.border} rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 transition-all duration-500 min-h-[400px]`}>
                
                {/* Left Side: Featured Info */}
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div>
                        <div className={`inline-flex items-center gap-2 ${activeSlide.accent} bg-zinc-900/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 mb-4`}>
                            <ActiveIcon size={14} /> {activeSlide.subtitle}
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                            {activeSlide.title}
                        </h2>
                        <p className="text-gray-200 text-base md:text-lg max-w-lg leading-relaxed shadow-black drop-shadow-md">
                            {activeSlide.desc}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        {activeSlide.tags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => handleHeroTagClick(tag)}
                                className="px-4 py-2 bg-zinc-900/40 hover:bg-white/10 border border-white/20 rounded-lg text-sm font-bold text-white hover:border-white/50 transition-all backdrop-blur-sm"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Featured Products Mini-Grid */}
                <div className="lg:w-[450px] flex-shrink-0 hidden sm:block">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-xs font-bold uppercase text-white/70 tracking-wider">Available Now</span>
                        <div className="flex gap-1">
                            <button onClick={prevSlide} className="p-1.5 rounded-lg bg-black/30 hover:bg-white/20 text-white transition-all"><ArrowLeft size={16}/></button>
                            <button onClick={nextSlide} className="p-1.5 rounded-lg bg-black/30 hover:bg-white/20 text-white transition-all"><ArrowRight size={16}/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {activeSlide.featuredProducts.length > 0 ? (
                            activeSlide.featuredProducts.map(p => (
                                <Link key={p.id} to={`/product/${p.id}`} className="group/card bg-black/40 p-3 rounded-xl border border-white/10 hover:border-white/30 hover:bg-black/60 transition-all backdrop-blur-sm">
                                    <div className="aspect-[4/3] bg-zinc-800 rounded-lg overflow-hidden mb-3 relative">
                                        <img src={p.image} className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity" />
                                        {(p.isDigital || p.category === 'Digital') && <div className="absolute top-1 right-1 bg-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase shadow-sm">Instant</div>}
                                        {p.condition === 'used' && <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">Used</div>}
                                    </div>
                                    <h4 className="font-bold text-gray-100 text-sm truncate group-hover/card:text-white">{p.title}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className={`${activeSlide.accent} font-bold text-xs`}>${p.price}</p>
                                        {p.originalPrice && <span className="text-[10px] text-gray-500 line-through">-${Math.round((1 - p.price/p.originalPrice)*100)}%</span>}
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 h-64 flex items-center justify-center text-white/50 text-sm border border-white/10 rounded-xl bg-black/20">
                                No featured items yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-8 flex gap-2 z-20">
                {heroSlides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setHeroIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === heroIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60'}`}
                    />
                ))}
            </div>
         </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start" ref={productsAnchorRef}>
        
        {/* Mobile Filter Toggle */}
        <div className="w-full lg:hidden mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight">{selectedCategory === 'All' ? 'Just For You' : selectedCategory}</h2>
            <Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)}>
                <Filter size={16} className="mr-2" /> Filters
            </Button>
        </div>

        {/* Sidebar Filters (Desktop Sticky / Mobile Drawer) */}
        <aside className={`
            lg:block lg:w-64 flex-shrink-0 bg-zinc-900 border border-zinc-800 lg:rounded-xl overflow-hidden shadow-sm lg:sticky lg:top-40
            ${mobileFiltersOpen ? 'fixed inset-0 z-[60] block w-full rounded-none h-full' : 'hidden'}
        `}>
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-purple-400" />
                    <h2 className="font-bold text-gray-100">Filters</h2>
                </div>
                {mobileFiltersOpen && (
                    <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>
            
            <div className="p-5 space-y-8 overflow-y-auto h-[calc(100%-60px)] lg:h-auto">
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort By</label>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-purple-500"
                    >
                        <option>Recommended</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest</option>
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Range</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-purple-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-purple-500"
                        />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-purple-600 border-purple-600' : 'bg-zinc-950 border-zinc-700'}`}>
                            {inStockOnly && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)}/>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">In Stock Only</span>
                    </label>
                 </div>
                 
                 <button onClick={clearFilters} className="w-full py-2.5 rounded-lg bg-zinc-800 text-xs font-bold text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 mt-4"><X size={14} /> Reset Filters</button>
            </div>
        </aside>

        <main className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between mb-6 hidden lg:flex">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{searchQuery ? `Results for "${searchQuery}"` : selectedCategory === 'All' ? 'Just For You' : selectedCategory}</h2>
                    {!isProductsLoading && <span className="text-xs font-medium text-gray-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">{filteredProducts.length} items</span>}
                </div>
            </div>
            {isProductsLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
            ) : paginatedProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedProducts.map(product => <ProductCard key={product.id} product={product} />)}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={20} /></button>
                            <span className="px-4 text-gray-400">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={20} /></button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600"><Tag size={32} /></div>
                    <h3 className="text-lg font-bold text-white">No products found</h3>
                    <Button variant="outline" className="rounded-full px-6 mt-4" onClick={clearFilters}>Reset Filters</Button>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
