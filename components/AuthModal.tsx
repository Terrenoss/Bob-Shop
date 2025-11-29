import React, { useState } from 'react';
import { useApp } from '../app/providers';
import { X, User, Lock, Mail } from 'lucide-react';
import { Button } from './ui/Button';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      let success = false;
      if (mode === 'login') {
          success = await login(formData.email);
      } else {
          success = await register({
              name: formData.name,
              email: formData.email,
              role: 'customer' // Default role
          });
      }
      setIsLoading(false);
  };

  // Pre-fill demo credentials
  const fillDemo = (role: 'admin' | 'customer') => {
      if (role === 'admin') {
          setFormData({ name: 'Bob Admin', email: 'bob@shop.com', password: 'admin' });
          setMode('login');
      } else {
          setFormData({ name: 'Alex Customer', email: 'alex@gmail.com', password: '123' });
          setMode('login');
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-800">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${mode === 'login' ? 'bg-zinc-800 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${mode === 'signup' ? 'bg-zinc-800 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  Sign Up
              </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input 
                            required 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none text-white placeholder-zinc-700" 
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>
              )}

              <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Email Address</label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                      <input 
                        required 
                        type="email" 
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none text-white placeholder-zinc-700" 
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Password</label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                      <input 
                        required 
                        type="password" 
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none text-white placeholder-zinc-700" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                  </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>
                  {mode === 'login' ? 'Login' : 'Create Account'}
              </Button>
          </form>

          <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900 text-gray-500">Quick Demo Access</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => fillDemo('customer')}
                className="px-4 py-2 border border-zinc-800 rounded-lg text-sm font-medium text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                  Demo Customer
              </button>
              <button 
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-4 py-2 border border-zinc-800 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-950/20 hover:border-amber-900 transition-colors"
              >
                  Demo Admin
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};