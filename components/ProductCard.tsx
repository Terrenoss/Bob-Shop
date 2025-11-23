import React from 'react';
import { Product } from '../types';
import { useApp } from '../App';
import { Button } from './ui/Button';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useApp();

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="aspect-square relative overflow-hidden bg-gray-100 block">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.source !== 'Bob-Shop Inventory' && (
           <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
             Dropship
           </span>
        )}
      </Link>
      
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <div className="flex-grow">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
              {product.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{product.category}</p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => addToCart(product, 1)}
            className="rounded-full !p-2.5 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <ShoppingBag size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};