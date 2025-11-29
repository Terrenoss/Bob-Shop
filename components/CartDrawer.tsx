

'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, Tag, Ticket, User, Gamepad2 } from 'lucide-react';
import { useApp } from '../app/providers';
import { Button } from './ui/Button';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, coupon, applyCoupon, removeCoupon, formatPrice } = useApp();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (coupon) {
      if (coupon.type === 'percent') {
          discount = (subtotal * coupon.value) / 100;
      } else {
          discount = coupon.value;
      }
      discount = Math.min(discount, subtotal);
  }

  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
      if (!promoCode) return;
      setIsValidating(true);
      await applyCoupon(promoCode);
      setIsValidating(false);
      setPromoCode('');
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                <Tag size={40} />
              </div>
              <p className="text-gray-500">Your cart is empty.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-gray-200 line-clamp-1">{item.title}</h3>
                        
                        {/* Selected Variants */}
                        {item.selectedVariants && (
                            <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.selectedVariants).map(([key, val]) => (
                                    <span key={key} className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-gray-400">
                                        {key}: {val}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {/* Custom Fields */}
                        {item.customFieldValues && Object.keys(item.customFieldValues).length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                                {Object.entries(item.customFieldValues).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                                        <span className="uppercase font-bold text-gray-500">{key}:</span>
                                        <span className="text-gray-300">{val}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(item.isDigital || item.category === 'Digital') && (
                            <div className="text-[10px] text-blue-400 mt-1 uppercase font-bold tracking-wide">
                                {item.deliveryTimeframe ? item.deliveryTimeframe : "Instant Delivery"}
                            </div>
                        )}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedVariants, item.customFieldValues)}
                      className="text-gray-600 hover:text-red-500 ml-2 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-amber-400">{formatPrice(item.price * item.quantity)}</span>
                    <div className="flex items-center gap-3 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariants, item.customFieldValues)}
                        className="p-1 hover:bg-zinc-800 rounded-md shadow-sm text-gray-400 hover:text-white transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center text-gray-200">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariants, item.customFieldValues)}
                        className="p-1 hover:bg-zinc-800 rounded-md shadow-sm text-gray-400 hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-zinc-800 bg-zinc-900/50">
            <div className="mb-4">
               {coupon ? (
                   <div className="flex items-center justify-between bg-green-900/20 border border-green-800 p-2.5 rounded-lg text-sm text-green-400">
                       <div className="flex items-center gap-2">
                           <Ticket size={16} />
                           <span className="font-bold">{coupon.code}</span>
                           <span className="text-xs opacity-75">
                               ({coupon.type === 'percent' ? `-${coupon.value}%` : `-${formatPrice(coupon.value)}`})
                           </span>
                       </div>
                       <button onClick={removeCoupon} className="hover:text-green-300 transition-colors p-1">
                           <X size={14} />
                       </button>
                   </div>
               ) : (
                   <div className="flex gap-2">
                       <input 
                           placeholder="Promo Code" 
                           value={promoCode}
                           onChange={(e) => setPromoCode(e.target.value)}
                           className="flex-grow px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none focus:border-purple-500 transition-all uppercase placeholder-zinc-700 text-white"
                           onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                       />
                       <Button 
                           size="sm" 
                           variant="secondary" 
                           onClick={handleApplyCoupon}
                           disabled={!promoCode || isValidating}
                       >
                           Apply
                       </Button>
                   </div>
               )}
            </div>

            <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex items-center justify-between text-green-400 font-medium">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-xl font-bold text-white pt-2 border-t border-zinc-800">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            <Button 
              className="w-full h-12 text-lg" 
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              Checkout Now
            </Button>
          </div>
        )}
      </div>
    </>
  );
};