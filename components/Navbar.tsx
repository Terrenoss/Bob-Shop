import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Package, Search } from 'lucide-react';
import { useApp } from '../App';

export const Navbar: React.FC = () => {
  const { user, cart, setIsCartOpen, setIsAuthModalOpen, logout } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 h-16 transition-all">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors">Bob-Shop</span>
        </Link>

        {/* Search Bar (Visual Only) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
           <Search className="absolute left-3 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Search products..." 
             className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full text-sm outline-none transition-all"
           />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <LayoutDashboard size={18} />
              Admin
            </Link>
          )}

          {user && (
            <Link to="/orders" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Package size={18} />
              My Orders
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 text-gray-700 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <ShoppingCart size={22} className="group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900 leading-none">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">{user.role}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
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