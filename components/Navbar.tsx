

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Search, UserCog, DollarSign, Euro, Bell, Check, MessageSquare } from 'lucide-react';
import { useApp } from '../app/providers';
import { Product } from '../types';

export const Navbar: React.FC = () => {
  const { user, cart, setIsCartOpen, setIsAuthModalOpen, logout, products, currency, toggleCurrency, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(cartCount);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = products.filter(p => 
            p.title.toLowerCase().includes(lowerTerm) || 
            p.category.toLowerCase().includes(lowerTerm)
        ).slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(true);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
          if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
              setIsUserMenuOpen(false);
          }
          if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
              setIsNotifMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
  };

  const handleSuggestionClick = (productId: string) => {
      setSearchTerm('');
      setShowSuggestions(false);
      navigate(`/product/${productId}`);
  };

  const handleNotifClick = (notifId: string, link?: string) => {
      markNotificationRead(notifId);
      if (link) {
          navigate(link);
          setIsNotifMenuOpen(false);
      }
  };

  return (
    <nav className="fixed top-4 left-4 right-4 bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl z-50 h-16 transition-all max-w-7xl mx-auto">
      <div className="h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1 mr-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-700 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-red-400 transition-all hidden sm:block">
            Bob-Shop
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 mr-6">
           <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
             Accueil
           </Link>
        </div>

        <form 
            ref={searchContainerRef}
            onSubmit={handleSearch} 
            className="hidden md:flex items-center flex-1 max-w-md mx-4 relative group" 
            role="search"
        >
           <Search className="absolute left-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} aria-hidden="true" />
           <input 
             type="text" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             onFocus={() => { if(searchTerm.length >= 2) setShowSuggestions(true); }}
             placeholder="Rechercher..." 
             className="w-full pl-11 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 focus:bg-zinc-950 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-900/20 rounded-full text-sm text-gray-200 placeholder-gray-600 outline-none transition-all duration-300"
           />
           {showSuggestions && suggestions.length > 0 && (
               <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                   <div className="py-2">
                       <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                           Suggestions
                       </div>
                       {suggestions.map((product) => (
                           <button
                               key={product.id}
                               type="button"
                               onClick={() => handleSuggestionClick(product.id)}
                               className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-3 group/item"
                           >
                               <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                                   <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100" />
                               </div>
                               <div className="flex-grow min-w-0">
                                   <p className="text-sm font-medium text-gray-200 truncate group-hover/item:text-purple-400 transition-colors">
                                       {product.title}
                                   </p>
                                   <p className="text-xs text-gray-500 truncate">
                                       {product.category}
                                   </p>
                               </div>
                           </button>
                       ))}
                   </div>
               </div>
           )}
        </form>

        <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
          <button 
             onClick={toggleCurrency}
             className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors"
          >
              {currency === 'USD' ? <DollarSign size={18} /> : <Euro size={18} />}
          </button>

          <Link to="/contact" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-full hover:bg-zinc-800 transition-all">
            Contact
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-400 bg-amber-950/30 hover:bg-amber-900/40 rounded-full transition-all border border-amber-900/50">
              <LayoutDashboard size={18} />
              Admin
            </Link>
          )}

          {user && (
            <Link to="/orders" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
              Orders
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 text-gray-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors group"
          >
            <ShoppingCart 
                size={22} 
                className={`transition-all duration-300 ${isAnimating ? 'text-purple-400 scale-125' : 'group-hover:text-purple-400'}`} 
            />
            {cartCount > 0 && (
              <span className={`absolute top-1 right-1 h-5 w-5 bg-gradient-to-r from-red-600 to-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 border-2 border-black`}>
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block"></div>

          {user ? (
            <>
                <div className="relative" ref={notifMenuRef}>
                    <button 
                        onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                        className="p-2 text-gray-400 hover:text-white relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></span>
                        )}
                    </button>
                    {isNotifMenuOpen && (
                         <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                             <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                                 <h4 className="text-sm font-bold text-white">Notifications</h4>
                                 {unreadCount > 0 && (
                                     <button onClick={markAllNotificationsRead} className="text-xs text-purple-400 hover:text-purple-300">Mark all read</button>
                                 )}
                             </div>
                             <div className="max-h-64 overflow-y-auto">
                                 {notifications.length === 0 ? (
                                     <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                                 ) : (
                                     notifications.map(n => (
                                         <button 
                                            key={n.id}
                                            onClick={() => handleNotifClick(n.id, n.link)}
                                            className={`w-full text-left p-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800 transition-colors flex gap-3 ${!n.read ? 'bg-zinc-800/50' : ''}`}
                                         >
                                             <div className={`mt-1 flex-shrink-0 ${!n.read ? 'text-purple-400' : 'text-gray-500'}`}>
                                                 {n.type === 'order' && <ShoppingCart size={16} />}
                                                 {n.type === 'chat' && <MessageSquare size={16} />}
                                                 {n.type === 'info' && <Bell size={16} />}
                                             </div>
                                             <div>
                                                 <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-gray-400'}`}>{n.message}</p>
                                                 <p className="text-xs text-gray-600 mt-1">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                             </div>
                                         </button>
                                     ))
                                 )}
                             </div>
                         </div>
                    )}
                </div>

                <div className="relative" ref={userMenuRef}>
                <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 pl-2 focus:outline-none group"
                >
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-200 leading-none group-hover:text-white">{user.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user.role}</span>
                    </div>
                    <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center text-purple-400 border border-zinc-700 group-hover:border-purple-500 transition-colors">
                        <UserIcon size={18} />
                    </div>
                </button>

                {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <Link 
                            to="/profile" 
                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <UserCog size={16} /> My Profile
                        </Link>
                        <Link 
                            to="/orders" 
                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <ShoppingCart size={16} /> My Orders
                        </Link>
                        <div className="h-px bg-zinc-800 my-1"></div>
                        <button 
                            onClick={() => { logout(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors text-left"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
                </div>
            </>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300"
            >
              <UserIcon size={18} />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};