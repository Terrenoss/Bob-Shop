

'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../providers';
import { Order } from '../../types';
import { ordersService } from '../../lib/mockNestService';
import { Package, Truck, FileText, MapPin, CreditCard, ChevronDown, ExternalLink, Hash, Clock, XCircle, Check, ArrowRight, List, Key, Eye, EyeOff, Copy, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { OrderTimeline } from '../../components/OrderTimeline';
import { toast } from 'react-hot-toast';

export default function Page() {
  const { user, formatPrice, setChatContext } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        // STRICT ISOLATION: Always pass user.id to findAll to ensure I only see MY orders,
        // even if I am an admin. Admin dashboard is for seeing all orders.
        const data = await ordersService.findAll(user.id);
        setOrders(data);
        if (data.length > 0) setExpandedOrderId(data[0].id); // Auto expand first order
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const toggleExpand = (id: string) => {
      setExpandedOrderId(prev => prev === id ? null : id);
  };

  const toggleKeyReveal = (itemKey: string) => {
      setRevealedKeys(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
  };

  const handleDownloadInvoice = (e: React.MouseEvent, orderId: string) => {
      e.stopPropagation();
      toast.success(`Downloading Invoice for ${orderId}...`);
      // In a real app, this would trigger a PDF generation backend endpoint
  };

  const handleGetHelp = (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      // Set context and navigate to the new Profile Support tab
      setChatContext({ type: 'order', data: order });
      navigate('/profile?tab=support');
  };

  if (loading) return (
      <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-zinc-800 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-zinc-800 rounded"></div>
          </div>
      </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white">Order History</h1>
            <p className="text-gray-400 mt-1">Track your packages and manage your purchases.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm">
            Total Orders: <span className="font-bold text-purple-500">{orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-zinc-800 text-zinc-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <Package size={48} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No orders placed yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Your order history will appear here once you make your first purchase.</p>
          <Button onClick={() => navigate('/')} size="lg" className="px-8">Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            
            return (
              <div key={order.id} className={`bg-zinc-900 rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-purple-500/50 shadow-lg shadow-purple-900/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
                
                {/* Order Summary Header */}
                <div 
                    className="p-6 cursor-pointer flex flex-col lg:flex-row gap-6 lg:items-center justify-between bg-zinc-900 hover:bg-zinc-800/50 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                >
                    <div className="flex flex-wrap gap-x-4 md:gap-x-12 gap-y-4 items-center">
                        {/* Order Number - Prominent */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Hash size={12} /> Order Number
                            </p>
                            <p className="font-mono text-lg font-bold text-purple-400">#{order.id}</p>
                        </div>
                        
                        {/* Date */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date Placed</p>
                            <p className="font-medium text-gray-200">{new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        {/* Payment Method - Summary View */}
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                            <p className="font-medium text-gray-200 flex items-center gap-1.5">
                                <CreditCard size={14} className="text-gray-400" />
                                {order.paymentMethod || 'Credit Card'}
                            </p>
                        </div>
                        
                        {/* Total */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="font-semibold text-white text-lg">{formatPrice(order.total)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                         <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 ${
                                order.status === 'delivered' ? 'bg-green-900/20 text-green-400 border-green-800' :
                                order.status === 'shipped' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                                order.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-800' :
                                'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                     order.status === 'delivered' ? 'bg-green-500' :
                                     order.status === 'shipped' ? 'bg-blue-500' :
                                     order.status === 'cancelled' ? 'bg-red-500' :
                                     'bg-yellow-500'
                                }`}></span>
                                {order.status}
                            </span>
                         </div>
                         <div className={`p-2 rounded-full bg-zinc-800 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-zinc-700 text-white' : ''}`}>
                             <ChevronDown size={20} />
                         </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-zinc-800 animate-in slide-in-from-top-2">
                        
                        {/* Status Timeline Section */}
                        <div className="p-6 md:p-8 bg-zinc-950/30 border-b border-zinc-800">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Truck size={16} /> Order Status
                            </h4>
                            <OrderTimeline order={order} />
                        </div>

                         {/* DETAILED TRACKING HISTORY LOG (Updated) */}
                         <div className="p-6 md:p-8 border-b border-zinc-800 bg-zinc-900">
                             <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <List size={16} /> Detailed Tracking History
                            </h4>
                            <div className="space-y-4 relative border-l-2 border-zinc-800 ml-2 pl-6">
                                {order.statusHistory?.slice().reverse().map((history, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[29px] top-1.5 w-3 h-3 bg-zinc-700 rounded-full border-2 border-zinc-900"></div>
                                        <p className="text-sm text-gray-300 font-medium">
                                            {history.note}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>{new Date(history.date).toLocaleString()}</span>
                                            {history.location && (
                                                <span className="flex items-center gap-1"><MapPin size={10} /> {history.location}</span>
                                            )}
                                            {history.isTrackingUpdate && (
                                                <span className="bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Carrier Update</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                                {order.trackingNumber ? (
                                    order.trackingUrl ? (
                                        <a 
                                            href={order.trackingUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center gap-3 bg-blue-900/10 border border-blue-900/30 px-4 py-2 rounded-lg hover:bg-blue-900/20 transition-colors group/tracking"
                                        >
                                            <Truck size={18} className="text-blue-400" />
                                            <div>
                                                <p className="text-xs text-blue-400 font-bold uppercase flex items-center gap-1">
                                                    Tracking Number <ExternalLink size={10} />
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-medium text-gray-200 group-hover/tracking:text-white underline decoration-blue-500/50 underline-offset-2">{order.trackingNumber}</span>
                                                    <span className="text-xs text-gray-500">({order.carrier || 'Standard'})</span>
                                                </div>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-blue-900/10 border border-blue-900/30 px-4 py-2 rounded-lg">
                                            <Truck size={18} className="text-blue-400" />
                                            <div>
                                                <p className="text-xs text-blue-400 font-bold uppercase">Tracking Number</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-medium text-gray-200">{order.trackingNumber}</span>
                                                    <span className="text-xs text-gray-500">({order.carrier || 'Standard'})</span>
                                                    <ExternalLink size={12} className="text-blue-400 opacity-50" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 italic bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                                        <Truck size={16} />
                                        Tracking information not yet available
                                    </div>
                                )}
                             </div>
                             
                             <div className="flex gap-3">
                                <Button variant="secondary" size="sm" onClick={(e) => handleDownloadInvoice(e, order.id)}>
                                    <FileText size={16} className="mr-2" /> Invoice
                                </Button>
                                <Button size="sm" onClick={(e) => handleGetHelp(e, order)} className="bg-purple-600 hover:bg-purple-500 text-white">
                                    Get Help with Order
                                </Button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-zinc-800">
                            {/* Order Items */}
                            <div className="lg:col-span-2 p-6 md:p-8 space-y-6">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <Package size={18} className="text-gray-400" /> Package Contents
                                </h4>
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 group items-start">
                                            <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-semibold text-gray-200 line-clamp-2 pr-4">{item.title}</h5>
                                                    <p className="font-bold text-white">{formatPrice(item.price)}</p>
                                                </div>
                                                
                                                {/* Variants */}
                                                {item.selectedVariants && (
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                                                            <span key={k} className="text-xs font-medium bg-zinc-800 text-gray-400 px-2 py-0.5 rounded border border-zinc-700">
                                                                {k}: {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Custom User Inputs Display */}
                                                {item.customFieldValues && Object.keys(item.customFieldValues).length > 0 && (
                                                    <div className="mt-2 text-xs bg-zinc-950 p-2 rounded border border-zinc-800">
                                                        {Object.entries(item.customFieldValues).map(([k, v]) => (
                                                            <div key={k} className="flex items-center gap-1.5 mb-1 last:mb-0">
                                                                <span className="text-gray-500 font-bold uppercase">{k}:</span>
                                                                <span className="text-gray-300 font-mono">{v}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Digital Key Reveal Logic */}
                                                {item.digitalContent && (order.status === 'processing' || order.status === 'delivered' || order.status === 'shipped') && (
                                                    <div className="mt-3 p-3 bg-purple-900/10 border border-purple-900/30 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase">
                                                                <Key size={12} /> Digital License / Content
                                                            </div>
                                                            <button 
                                                                onClick={() => toggleKeyReveal(`${order.id}-${idx}`)}
                                                                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                                            >
                                                                {revealedKeys[`${order.id}-${idx}`] ? <EyeOff size={12} /> : <Eye size={12} />}
                                                                {revealedKeys[`${order.id}-${idx}`] ? 'Hide' : 'Reveal'}
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <code className="flex-grow p-2 bg-black rounded border border-purple-900/20 font-mono text-sm text-gray-300 break-all">
                                                                {revealedKeys[`${order.id}-${idx}`] ? item.digitalContent : '••••-••••-••••-••••'}
                                                            </code>
                                                            {revealedKeys[`${order.id}-${idx}`] && (
                                                                <button 
                                                                    onClick={() => copyToClipboard(item.digitalContent!)}
                                                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-gray-400 hover:text-white transition-colors"
                                                                    title="Copy"
                                                                >
                                                                    <Copy size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Fulfillment Proof Image */}
                                                {item.fulfillmentProofImage && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><ShieldCheck size={12} className="text-green-500"/> Proof of Delivery</p>
                                                        <img 
                                                            src={item.fulfillmentProofImage} 
                                                            className="w-32 h-20 object-cover rounded-lg border border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity" 
                                                            onClick={() => window.open(item.fulfillmentProofImage, '_blank')} 
                                                            title="Click to view full image"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>&bull;</span>
                                                    <span>SKU: {item.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Addresses & Payment Details */}
                            <div className="p-6 md:p-8 bg-zinc-950/20 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" /> Shipping Address
                                        </h4>
                                        <div className="text-sm text-gray-400 pl-6 border-l-2 border-zinc-700">
                                            <p className="font-semibold text-gray-200">{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.line1}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                        </div>
                                    </div>
                                    
                                    {order.billingAddress && (
                                        <div>
                                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                                <FileText size={16} className="text-gray-400" /> Billing Address
                                            </h4>
                                            <div className="text-sm text-gray-400 pl-6 border-l-2 border-zinc-700">
                                                <p className="font-semibold text-gray-200">{order.billingAddress.name}</p>
                                                <p>{order.billingAddress.line1}</p>
                                                <p>{order.billingAddress.city}, {order.billingAddress.postalCode}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <CreditCard size={16} className="text-gray-400" /> Payment Method
                                        </h4>
                                        <div className="text-sm text-gray-400 pl-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-5 bg-zinc-800 rounded border border-zinc-700"></div>
                                                <span className="font-medium text-gray-200">{order.paymentMethod || 'Credit Card'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-sm space-y-2.5 text-sm">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Shipping</span>
                                        <span>{formatPrice(order.shippingCost || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Tax</span>
                                        <span>{formatPrice(order.tax || 0)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-400 font-medium">
                                            <span>Discount</span>
                                            <span>-{formatPrice(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-zinc-800 my-2"></div>
                                    <div className="flex justify-between font-bold text-lg text-white">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}