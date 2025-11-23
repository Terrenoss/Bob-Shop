

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Package, Search, HelpCircle, Menu } from 'lucide-react';
import { useApp } from '../App';

export const Navbar: React.FC = () => {
  const { user, cart, setIsCartOpen, setIsAuthModalOpen, logout } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-4 left-4 right-4 bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl z-50 h-16 transition-all max-w-7xl mx-auto">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors">Bob-Shop</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-12 relative group">
           <Search className="absolute left-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
           <input 
             type="text" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search for premium products..." 
             className="w-full pl-11 pr-4 py-2.5 bg-gray-100/50 border border-transparent hover:bg-white focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-100 rounded-full text-sm outline-none transition-all duration-300"
           />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          
          <Link to="/contact" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all">
            Contact
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all border border-indigo-100">
              <LayoutDashboard size={18} />
              Admin
            </Link>
          )}

          {user && (
            <Link to="/orders" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
              Orders
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <ShoppingCart size={22} className="group-hover:text-blue-600 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900 leading-none">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user.role}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
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
