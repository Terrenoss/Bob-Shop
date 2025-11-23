import React from 'react';
import { Product } from '../types';
import { useApp } from '../App';
import { Button } from './ui/Button';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useApp();

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.source !== 'Bob-Shop Inventory' && (
           <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
             Dropship
           </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5em]">
            {product.description}
            </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => addToCart(product)}
            className="rounded-full !p-2.5"
          >
            <ShoppingBag size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};