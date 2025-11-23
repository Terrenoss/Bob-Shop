import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Package, LogOut, LayoutDashboard } from 'lucide-react';
import { useApp } from '../App';

export const Navbar: React.FC = () => {
  const { user, cart, setIsCartOpen, setIsAuthModalOpen, logout } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 h-16 shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Bob-Shop</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.name}
              </span>
              <button 
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <User size={18} />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};