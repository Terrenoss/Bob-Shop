
import React from 'react';
import { Order } from '../types';
import { Check, Clock, Truck, Package, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const steps = [
    { key: 'pending', label: 'Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Check },
  ];

  const isCancelled = order.status === 'cancelled';
  
  // Find the index of the current status in our defined steps
  const currentStatusIndex = steps.findIndex(s => s.key === order.status);

  if (isCancelled) {
      return (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-center gap-3 text-red-700 w-full">
              <XCircle size={24} />
              <div className="flex flex-col">
                  <span className="font-bold">Order Cancelled</span>
                  {order.statusHistory?.find(h => h.status === 'cancelled')?.date && (
                     <span className="text-sm opacity-75">
                       on {new Date(order.statusHistory.find(h => h.status === 'cancelled')!.date).toLocaleDateString()}
                     </span>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="w-full py-4 px-2">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute left-0 top-5 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
        
        {/* Active Progress Line */}
        <div 
            className="absolute left-0 top-5 h-1 bg-green-500 -z-10 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(0, (currentStatusIndex / (steps.length - 1)) * 100)}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const Icon = step.icon;
          
          // Find the specific history entry for this step
          const historyEntry = order.statusHistory?.find(h => h.status === step.key);
          
          let dateStr = '';
          let timeStr = '';
          
          if (historyEntry) {
              const dateObj = new Date(historyEntry.date);
              dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          }

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 relative group cursor-default">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-white transition-all duration-300 z-10 ${
                  isActive 
                    ? 'border-green-500 text-green-600 shadow-sm' 
                    : 'border-gray-200 text-gray-300'
                } ${isCurrent ? 'scale-110 ring-4 ring-green-50' : ''}`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <div className="text-center flex flex-col items-center min-w-[80px]">
                  <span className={`text-xs font-bold uppercase tracking-wide mt-2 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  
                  {historyEntry ? (
                      <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-1 mt-1">
                          <span className="text-[10px] text-gray-600 font-medium leading-tight">
                              {dateStr}
                          </span>
                          <span className="text-[10px] text-gray-400">
                              {timeStr}
                          </span>
                      </div>
                  ) : isActive && !historyEntry ? (
                      // Fallback for older orders or skipped steps
                      <span className="text-[10px] text-gray-400 mt-1">Done</span>
                  ) : (
                      <span className="text-[10px] text-transparent mt-1 select-none">Pending</span>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
