

'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { AuthModal } from '../components/AuthModal';
// ChatWidget removed as per request
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './globals.css'; 

export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 antialiased selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-grow pt-28 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-zinc-950 border-t border-zinc-900 text-gray-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold text-gray-200 mb-2">Bob-Shop France</p>
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <Link to="/legal/mentions" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link to="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Politique de Confidentialité</Link>
          </div>
          <p className="text-sm text-gray-600">Site de démonstration E-commerce</p>
        </div>
      </footer>
      
      <CartDrawer />
      <AuthModal />
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}
