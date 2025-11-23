
import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { Order } from '../types';
import { ordersService } from '../services/mockNestService';
import { Package, Truck, FileText, MapPin, CreditCard, ChevronDown, ExternalLink, Hash } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { OrderTimeline } from '../components/OrderTimeline';
import { toast } from 'react-hot-toast';

export const Orders: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const data = await ordersService.findAll(user.role === 'customer' ? user.id : undefined);
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

  const handleDownloadInvoice = (e: React.MouseEvent, orderId: string) => {
      e.stopPropagation();
      toast.success(`Downloading Invoice for ${orderId}...`);
      // In a real app, this would trigger a PDF generation backend endpoint
  };

  if (loading) return (
      <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
      </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-500 mt-1">Track your packages and manage your purchases.</p>
        </div>
        <div className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm">
            Total Orders: <span className="font-bold text-blue-600">{orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <Package size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders placed yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Your order history will appear here once you make your first purchase.</p>
          <Button onClick={() => navigate('/')} size="lg" className="px-8">Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            
            return (
              <div key={order.id} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-gray-200 hover:border-blue-200'}`}>
                
                {/* Order Summary Header */}
                <div 
                    className="p-6 cursor-pointer flex flex-col lg:flex-row gap-6 lg:items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                >
                    <div className="flex flex-wrap gap-x-12 gap-y-4 items-center">
                        {/* Order Number - Prominent */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Hash size={12} /> Order Number
                            </p>
                            <p className="font-mono text-lg font-bold text-gray-900">#{order.id}</p>
                        </div>
                        
                        {/* Date */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Placed</p>
                            <p className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        {/* Payment Method - Summary View */}
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                            <p className="font-medium text-gray-900 flex items-center gap-1.5">
                                <CreditCard size={14} className="text-gray-500" />
                                {order.paymentMethod || 'Credit Card'}
                            </p>
                        </div>
                        
                        {/* Total */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="font-semibold text-gray-900 text-lg">${order.total.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                         <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 ${
                                order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
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
                         <div className={`p-2 rounded-full bg-gray-100 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-200 text-gray-800' : ''}`}>
                             <ChevronDown size={20} />
                         </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-100 animate-in slide-in-from-top-2">
                        
                        {/* Status Timeline Section */}
                        <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Truck size={16} /> Order Status
                            </h4>
                            <OrderTimeline order={order} />
                        </div>

                        {/* Action Bar */}
                        <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                                {order.trackingNumber ? (
                                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
                                        <Truck size={18} className="text-blue-600" />
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold uppercase">Tracking Number</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-medium text-gray-900">{order.trackingNumber}</span>
                                                <span className="text-xs text-gray-500">({order.carrier || 'Standard'})</span>
                                                <ExternalLink size={12} className="text-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        <Truck size={16} />
                                        Tracking information not yet available
                                    </div>
                                )}
                             </div>
                             
                             <div className="flex gap-3">
                                <Button variant="outline" size="sm" onClick={(e) => handleDownloadInvoice(e, order.id)}>
                                    <FileText size={16} className="mr-2" /> Invoice
                                </Button>
                                <Button size="sm" onClick={() => navigate(`/contact?order=${order.id}`)}>
                                    Get Help
                                </Button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
                            {/* Order Items */}
                            <div className="lg:col-span-2 p-6 md:p-8 space-y-6">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Package size={18} className="text-gray-400" /> Package Contents
                                </h4>
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-semibold text-gray-900 line-clamp-2 pr-4">{item.title}</h5>
                                                    <p className="font-bold text-gray-900">${item.price.toFixed(2)}</p>
                                                </div>
                                                {item.selectedVariants && (
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                                                            <span key={k} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                                {k}: {v}
                                                            </span>
                                                        ))}
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
                            <div className="p-6 md:p-8 bg-gray-50/30 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" /> Shipping Address
                                        </h4>
                                        <div className="text-sm text-gray-600 pl-6 border-l-2 border-gray-200">
                                            <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.line1}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                        </div>
                                    </div>
                                    
                                    {order.billingAddress && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <FileText size={16} className="text-gray-400" /> Billing Address
                                            </h4>
                                            <div className="text-sm text-gray-600 pl-6 border-l-2 border-gray-200">
                                                <p className="font-semibold text-gray-900">{order.billingAddress.name}</p>
                                                <p>{order.billingAddress.line1}</p>
                                                <p>{order.billingAddress.city}, {order.billingAddress.postalCode}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <CreditCard size={16} className="text-gray-400" /> Payment Method
                                        </h4>
                                        <div className="text-sm text-gray-600 pl-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                <span className="font-medium text-gray-900">{order.paymentMethod || 'Credit Card'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2.5 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${order.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>${order.shippingCost?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>${(order.tax || 0).toFixed(2)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Discount</span>
                                            <span>-${order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <div className="flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>${order.total.toFixed(2)}</span>
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
};
