import React, { useState } from 'react';
import { useApp } from '../app/providers';
import { Button } from '../components/ui/Button';
import { CheckCircle, CreditCard, Shield, Truck, Ticket, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Checkout: React.FC = () => {
  const { cart, user, placeOrder, setIsAuthModalOpen, coupon, applyCoupon, removeCoupon } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Local coupon input state (global state is in AppContext)
  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 4.99;
  const taxRate = 0.08;
  const estimatedTax = subtotal * taxRate;
  
  // Calculate Discount using global coupon
  let discountAmount = 0;
  if (coupon) {
      if (coupon.type === 'percent') {
          discountAmount = (subtotal * coupon.value) / 100;
      } else {
          discountAmount = coupon.value;
      }
  }
  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  const total = subtotal + shipping + estimatedTax - discountAmount;

  const handleApplyCoupon = async () => {
      if (!couponInput) return;
      setIsValidatingCoupon(true);
      await applyCoupon(couponInput);
      setIsValidatingCoupon(false);
      setCouponInput('');
  };

  const handlePayment = async () => {
    if (!user) {
        toast.error("Please login to complete purchase");
        setIsAuthModalOpen(true);
        return;
    }

    if (!formData.address || !formData.city || !formData.postalCode) {
        toast.error("Please complete shipping details");
        setStep('shipping');
        return;
    }

    setLoading(true);
    // Simulate Stripe processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create Order in Mock Backend with full details
    await placeOrder({
        userId: user.id,
        items: [...cart], 
        total: total,
        subtotal: subtotal,
        shippingCost: shipping,
        tax: estimatedTax,
        discount: discountAmount,
        couponCode: coupon?.code,
        status: 'pending',
        shippingAddress: {
            name: `${formData.firstName} ${formData.lastName}`,
            line1: formData.address,
            city: formData.city,
            postalCode: formData.postalCode
        },
        billingAddress: {
            // Reusing shipping for billing for MVP
            name: `${formData.firstName} ${formData.lastName}`,
            line1: formData.address,
            city: formData.city,
            postalCode: formData.postalCode
        },
        paymentMethod: 'Credit Card (Simulated)'
    });

    setLoading(false);
    setStep('success');
    toast.success('Order placed successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Go Shopping</Button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle size={48} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 max-w-xs mx-auto">
                Thank you for your purchase. We've sent the order details to our dropshipping partners.
            </p>
        </div>
        
        <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/orders')}>View Order</Button>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Steps Indicator */}
        <div className="flex items-center gap-4 mb-8">
           <div className={`flex items-center gap-2 font-bold ${step === 'shipping' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                Shipping
           </div>
           <div className="h-px w-12 bg-gray-200"></div>
           <div className={`flex items-center gap-2 font-bold ${step === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                Payment
           </div>
        </div>

        {step === 'shipping' ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="text-gray-400" /> Shipping Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">First Name</label>
                   <input name="firstName" value={formData.firstName} onChange={handleChange} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">Last Name</label>
                   <input name="lastName" value={formData.lastName} onChange={handleChange} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                   <input name="city" value={formData.city} onChange={handleChange} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">Postal Code</label>
                   <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>
            </div>
            <Button className="w-full mt-4 h-12 text-lg" onClick={() => setStep('payment')}>Continue to Payment</Button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
            </h2>
            
            <div className="p-4 border-2 border-blue-600 bg-blue-50 rounded-xl flex items-center justify-between cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-[5px] border-blue-600 bg-white"></div>
                    <span className="font-bold text-blue-900">Credit Card</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Card Number</label>
                    <input placeholder="4242 4242 4242 4242" className="p-3 border rounded-lg w-full font-mono bg-gray-50" readOnly />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Expiry</label>
                        <input placeholder="12/25" className="p-3 border rounded-lg w-full bg-gray-50" readOnly />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">CVC</label>
                        <input placeholder="123" className="p-3 border rounded-lg w-full bg-gray-50" readOnly />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 bg-gray-100 p-3 rounded-lg">
                <Shield size={14} className="text-green-600" />
                Payments are securely processed (Simulated Stripe Integration)
            </div>

            <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep('shipping')} className="flex-1">Back</Button>
                <Button className="flex-1" onClick={handlePayment} isLoading={loading}>Pay ${total.toFixed(2)}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map(item => (
                <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex justify-between">
                        <div>
                            <p className="font-medium text-gray-900 line-clamp-2">{item.title}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
            ))}
            </div>
            
            {/* Coupon Code Input */}
            <div className="mb-6">
                {!coupon ? (
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Promo Code (e.g. WELCOME10)" 
                        className="flex-grow p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 uppercase"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput}
                    >
                        Apply
                    </Button>
                  </div>
                ) : (
                    <div className="flex items-center justify-between mt-2 text-xs text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                            <Ticket size={14} />
                            <span className="font-bold">{coupon.code}</span>
                            <span className="opacity-75">
                                ({coupon.type === 'percent' ? `-${coupon.value}%` : `-$${coupon.value}`})
                            </span>
                        </div>
                        <button onClick={removeCoupon} className="hover:text-green-800 font-bold p-1">✕</button>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">Estimated Tax <Info size={12}/></span>
                    <span>${estimatedTax.toFixed(2)}</span>
                </div>
                {coupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-xl text-gray-900 pt-4 border-t border-gray-100 mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};