import React from 'react';
import { useApp } from '../App';
import { X, Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useApp();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Login to Bob-Shop</h3>
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
            <p className="font-semibold mb-1">Demo Mode Activated</p>
            <p>Select a persona to explore the app functionality.</p>
          </div>

          <button 
            onClick={() => login('customer')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                <User className="text-gray-600 group-hover:text-blue-700" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Customer</p>
                <p className="text-sm text-gray-500">Shop products, cart & checkout</p>
              </div>
            </div>
            <span className="text-blue-600 opacity-0 group-hover:opacity-100 text-sm font-medium">Select &rarr;</span>
          </button>

          <button 
            onClick={() => login('admin')}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-200">
                <ShieldCheck className="text-gray-600 group-hover:text-purple-700" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Dropship Admin</p>
                <p className="text-sm text-gray-500">Manage suppliers, sync & AI</p>
              </div>
            </div>
            <span className="text-purple-600 opacity-0 group-hover:opacity-100 text-sm font-medium">Select &rarr;</span>
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-500">
          Secure Login powered by Simulated NestJS AuthGuard
        </div>
      </div>
    </div>
  );
};