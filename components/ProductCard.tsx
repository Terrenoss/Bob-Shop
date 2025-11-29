
'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../app/providers';
import { Button } from './ui/Button';
import { ShoppingBag, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, user, deleteProduct, formatPrice } = useApp();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin?editProduct=${product.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(product.id);
    }
  };

  return (
    <div className="group bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300 flex flex-col h-full relative">
      
      {user?.role === 'admin' && (
          <div className="absolute top-2 left-2 z-10 flex gap-2">
              <button onClick={handleEdit} className="bg-black/80 backdrop-blur p-2 rounded-full shadow-sm text-gray-400 hover:text-amber-400 hover:scale-105 transition-all">
                  <Edit2 size={16} />
              </button>
              <button onClick={handleDelete} className="bg-black/80 backdrop-blur p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:scale-105 transition-all">
                  <Trash2 size={16} />
              </button>
          </div>
      )}

      <Link to={`/product/${product.id}`} className="aspect-square relative overflow-hidden bg-zinc-800 block">
        <img 
          src={product.image} 
          alt={product.title}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${isImageLoaded ? 'opacity-90 group-hover:opacity-100 blur-0' : 'opacity-0 blur-sm scale-110'}`}
        />
        
        <div className="absolute bottom-2 right-2 flex flex-row gap-1 items-end">
            {(product.isDigital || product.category === 'Digital') && (
                <div className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur shadow-sm">
                    DIGITAL
                </div>
            )}
            {product.condition === 'used' && (
                <div className="bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur shadow-sm flex items-center gap-1">
                    <AlertCircle size={10} /> USED
                </div>
            )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <div className="flex-grow">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-gray-100 line-clamp-2 group-hover:text-purple-400 transition-colors mb-1">
              {product.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{product.category}</p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-amber-400">{formatPrice(product.price)}</span>
            {product.originalPrice !== undefined && product.originalPrice > 0 && (
                <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => addToCart(product, 1)}
            className="rounded-full !p-2.5 bg-zinc-800 hover:bg-purple-600 hover:text-white transition-all text-gray-400"
            disabled={product.stock <= 0}
          >
            <ShoppingBag size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};