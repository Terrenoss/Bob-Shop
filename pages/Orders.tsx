
import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { Order } from '../types';
import { ordersService } from '../services/mockNestService';
import { Package, Clock, CheckCircle, Truck, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const Orders: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const data = await ordersService.findAll(user.role === 'customer' ? user.id : undefined);
        setOrders(data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <span className="text-gray-500">{orders.length} total</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Package className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to fill your history.</p>
          <Button onClick={() => navigate('/')}>Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-4 text-sm">
                   <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">Placed</p>
                      <p className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">Total</p>
                      <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">Order #</p>
                      <p className="font-medium text-gray-900">{order.id}</p>
                   </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                </div>
              </div>

              {/* Order Tracking Info */}
              {order.trackingNumber && (
                  <div className="bg-blue-50 px-4 py-2 text-sm text-blue-800 flex items-center gap-2">
                      <Truck size={16} />
                      <span className="font-semibold">Tracking:</span> {order.trackingNumber} ({order.carrier || 'Global Post'})
                  </div>
              )}
              
              <div className="p-4">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-2 first:pt-0">
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                        <div className="flex-grow">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                            <div className="mt-1 flex justify-between text-sm">
                                <span className="text-gray-600">Qty: {item.quantity}</span>
                                <span className="font-medium">${item.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
              </div>

              {/* Order Footer with breakdown */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                   <div className="text-sm text-right space-y-1">
                       <p className="text-gray-500">Subtotal: ${order.subtotal?.toFixed(2) || '0.00'}</p>
                       <p className="text-gray-500">Shipping: ${order.shippingCost?.toFixed(2) || '0.00'}</p>
                       {order.discount > 0 && <p className="text-green-600">Discount: -${order.discount.toFixed(2)}</p>}
                       <p className="font-bold text-gray-900 pt-1 border-t border-gray-200 mt-1">Total: ${order.total.toFixed(2)}</p>
                   </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
