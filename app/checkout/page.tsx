'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../providers';
import { Button } from '../../components/ui/Button';
import { CheckCircle, CreditCard, Shield, Truck, Ticket, Info, Wallet, Bitcoin, Banknote, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const { cart, user, placeOrder, setIsAuthModalOpen, coupon, applyCoupon, removeCoupon, settings, formatPrice, currency } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | 'cash'>('card');

  // Local coupon input state
  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Check if order is fully digital
  const isDigitalOrder = cart.length > 0 && cart.every(item => item.isDigital || item.category === 'Digital');

  // Pre-fill user data
  useEffect(() => {
      if (user) {
          setFormData(prev => ({
              ...prev,
              firstName: user.name.split(' ')[0] || prev.firstName,
              lastName: user.name.split(' ')[1] || prev.lastName,
              address: user.defaultAddress?.line1 || prev.address,
              city: user.defaultAddress?.city || prev.city,
              postalCode: user.defaultAddress?.postalCode || prev.postalCode
          }));
      }
  }, [user]);

  // Skip shipping step if digital order
  useEffect(() => {
    if (isDigitalOrder && step === 'shipping') {
        setStep('payment');
    }
  }, [isDigitalOrder, step]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate Shipping (0 for digital)
  const shipping = isDigitalOrder ? 0 : cart.reduce((acc, item) => {
      if (item.isDigital || item.category === 'Digital') return acc;
      return acc + ((item.shippingCost !== undefined ? item.shippingCost : settings.shippingCost) * item.quantity);
  }, 0);

  // Calculate Tax
  const estimatedTax = cart.reduce((acc, item) => {
      const rate = item.taxRate !== undefined ? item.taxRate : settings.taxRate;
      return acc + (item.price * item.quantity * rate);
  }, 0);
  
  // Calculate Discount
  let discountAmount = 0;
  if (coupon) {
      if (coupon.type === 'percent') {
          discountAmount = (subtotal * coupon.value) / 100;
      } else {
          discountAmount = coupon.value;
      }
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const total = Math.max(0, subtotal + shipping + estimatedTax - discountAmount);

  // Convert for PayPal
  const exchangeRate = currency === 'EUR' ? 0.92 : 1;
  const totalInCurrency = (total * exchangeRate).toFixed(2);

  const handleApplyCoupon = async () => {
      if (!couponInput) return;
      setIsValidatingCoupon(true);
      await applyCoupon(couponInput);
      setIsValidatingCoupon(false);
      setCouponInput('');
  };

  const finalizeOrder = async (method: string, details?: any) => {
    if (!user) return;
    setLoading(true);
    
    // Status Logic
    const initialStatus = method.includes('Cash') ? 'pending' : 'processing';

    // Address handling for Digital Orders
    const finalShippingAddress = isDigitalOrder ? {
        name: user.name,
        line1: 'Digital Delivery (Email)',
        city: 'Internet',
        postalCode: '00000'
    } : {
        name: `${formData.firstName} ${formData.lastName}`,
        line1: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
    };

    await placeOrder({
        userId: user.id,
        items: [...cart], 
        total: total,
        subtotal: subtotal,
        shippingCost: shipping,
        tax: estimatedTax,
        discount: discountAmount,
        couponCode: coupon?.code,
        status: initialStatus,
        shippingAddress: finalShippingAddress,
        billingAddress: finalShippingAddress,
        paymentMethod: method,
        internalNotes: details ? `Transaction ID: ${details.id}` : (method.includes('Cash') ? 'Payment required in person to complete order.' : undefined)
    });

    setLoading(false);
    setStep('success');
    toast.success(method.includes('Cash') ? 'Order placed! Waiting for payment.' : 'Payment successful! Order placed.');
  };

  const validateCheckout = () => {
    if (!user) {
        toast.error("Please login to complete purchase");
        setIsAuthModalOpen(true);
        return false;
    }

    if (!isDigitalOrder) {
        if (!formData.address || !formData.city || !formData.postalCode) {
            toast.error("Please complete shipping details");
            setStep('shipping');
            return false;
        }
    }
    return true;
  };

  const handleFreeOrder = async () => {
      if (!validateCheckout()) return;
      await finalizeOrder('Free Order (Discount)');
  };

  const handleCashPayment = async () => {
      if (!validateCheckout()) return;
      await finalizeOrder('Cash / In-Person');
  };

  const handleCryptoPayment = async () => {
      if (!validateCheckout()) return;
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await finalizeOrder('Cryptocurrency (BTC)');
  };

  // PayPal Handlers
  const onPayPalClick = (data: any, actions: any) => {
      if (!validateCheckout()) {
          return actions.reject();
      }
      return actions.resolve();
  };

  const createPayPalOrder = (data: any, actions: any) => {
      if (parseFloat(totalInCurrency) <= 0) {
          toast.error("Invalid order amount.");
          return Promise.reject(new Error("Invalid amount"));
      }
      return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [{
              amount: {
                  value: totalInCurrency,
                  currency_code: currency
              }
          }]
      });
  };

  const onPayPalApprove = async (data: any, actions: any) => {
      try {
        const details = await actions.order.capture();
        if (details.status === "COMPLETED") {
             await finalizeOrder(`PayPal (${details.payer.name.given_name})`, details);
        } else {
            toast.error("Payment not completed.");
        }
      } catch (err: any) {
        console.error("PayPal Capture Error", err);
        toast.error("Failed to capture PayPal payment.");
      }
  };

  const onPayPalError = (err: any) => {
      console.error("PayPal Error:", err);
      // Suppress transient iframe errors
      if (String(err).includes("Script error") || String(err).includes("window") || String(err) === "[object Object]") return; 
      toast.error("Payment failed. Please try again.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-white">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Go Shopping</Button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-900/30">
          <CheckCircle size={48} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-gray-400 max-w-xs mx-auto">
                {isDigitalOrder 
                    ? "Check your email for your digital codes/items." 
                    : paymentMethod === 'cash' 
                        ? "Please meet us to complete the cash payment. Your order is reserved."
                        : "Thank you for your purchase. We've sent the order details to our system."}
            </p>
        </div>
        
        <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/orders')}>View Order</Button>
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
           {!isDigitalOrder && (
               <>
                <div className={`flex items-center gap-2 font-bold ${step === 'shipping' ? 'text-blue-500' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-blue-600 text-white' : 'bg-zinc-800'}`}>1</div>
                        Shipping
                </div>
                <div className="h-px w-12 bg-zinc-800"></div>
               </>
           )}
           <div className={`flex items-center gap-2 font-bold ${step === 'payment' ? 'text-blue-500' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-zinc-800'}`}>{isDigitalOrder ? '1' : '2'}</div>
                Payment
           </div>
        </div>

        {step === 'shipping' && !isDigitalOrder ? (
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="text-gray-400" /> Shipping Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">First Name</label>
                   <input name="firstName" value={formData.firstName} onChange={handleChange} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white" />
               </div>
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">Last Name</label>
                   <input name="lastName" value={formData.lastName} onChange={handleChange} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white" />
               </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                   <input name="city" value={formData.city} onChange={handleChange} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white" />
               </div>
               <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase">Postal Code</label>
                   <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white" />
               </div>
            </div>
            <Button className="w-full mt-4 h-12 text-lg" onClick={() => setStep('payment')}>Continue to Payment</Button>
          </div>
        ) : (
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <CreditCard size={20} className="text-gray-400" /> Payment Method
            </h2>

            {total <= 0 ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-xl text-green-400 font-medium text-center">
                        Total covered by discount. No payment required.
                    </div>
                    <Button className="w-full h-12" onClick={handleFreeOrder} isLoading={loading}>
                        Complete Order (Free)
                    </Button>
                    {!isDigitalOrder && (
                        <Button variant="secondary" onClick={() => setStep('shipping')} className="w-full">
                            Back
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button 
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                                paymentMethod === 'card' 
                                ? 'border-blue-600 bg-blue-900/20 text-white' 
                                : 'border-zinc-800 bg-zinc-950 text-gray-400 hover:border-zinc-700'
                            }`}
                        >
                            <CreditCard size={24} />
                            <span className="font-bold text-xs text-center">Card</span>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('paypal')}
                            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                                paymentMethod === 'paypal' 
                                ? 'border-blue-600 bg-blue-900/20 text-white' 
                                : 'border-zinc-800 bg-zinc-950 text-gray-400 hover:border-zinc-700'
                            }`}
                        >
                            <Wallet size={24} />
                            <span className="font-bold text-xs text-center">PayPal</span>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('crypto')}
                            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                                paymentMethod === 'crypto' 
                                ? 'border-blue-600 bg-blue-900/20 text-white' 
                                : 'border-zinc-800 bg-zinc-950 text-gray-400 hover:border-zinc-700'
                            }`}
                        >
                            <Bitcoin size={24} />
                            <span className="font-bold text-xs text-center">Crypto</span>
                        </button>
                         <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                                paymentMethod === 'cash' 
                                ? 'border-green-600 bg-green-900/20 text-white' 
                                : 'border-zinc-800 bg-zinc-950 text-gray-400 hover:border-zinc-700'
                            }`}
                        >
                            <Banknote size={24} />
                            <span className="font-bold text-xs text-center">Cash</span>
                        </button>
                    </div>

                    <div className="pt-4 animate-in fade-in slide-in-from-top-2">
                        {/* Only initialize PayPal Script Provider if card or paypal selected to avoid unnecessary script load/errors */}
                        {(paymentMethod === 'card' || paymentMethod === 'paypal') && (
                            <PayPalScriptProvider 
                                options={{ 
                                    clientId: "sb", // Using 'sb' (sandbox) instead of 'test' for better compatibility
                                    currency: currency,
                                    intent: "capture",
                                    components: "buttons",
                                    "enable-funding": "card"
                                }}
                                key={currency}
                            >
                                {paymentMethod === 'card' && (
                                    <div className="space-y-4">
                                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-sm text-gray-400 mb-4 flex items-center gap-3">
                                            <Shield className="text-green-500" size={16} />
                                            <span>Secure Credit/Debit Card payment processed by PayPal.</span>
                                        </div>
                                        <PayPalButtons 
                                            style={{ layout: "vertical", shape: "rect", height: 48 }}
                                            fundingSource={FUNDING.CARD}
                                            forceReRender={[totalInCurrency, currency, 'card']}
                                            onClick={onPayPalClick}
                                            createOrder={createPayPalOrder}
                                            onApprove={onPayPalApprove}
                                            onError={onPayPalError}
                                        />
                                    </div>
                                )}

                                {paymentMethod === 'paypal' && (
                                    <div className="space-y-4">
                                         <PayPalButtons 
                                            style={{ layout: "vertical", shape: "rect", height: 48 }}
                                            fundingSource={FUNDING.PAYPAL}
                                            forceReRender={[totalInCurrency, currency, 'paypal']}
                                            onClick={onPayPalClick}
                                            createOrder={createPayPalOrder}
                                            onApprove={onPayPalApprove}
                                            onError={onPayPalError}
                                        />
                                    </div>
                                )}
                            </PayPalScriptProvider>
                        )}

                        {paymentMethod === 'crypto' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                                        <span className="text-gray-400">Total to pay:</span>
                                        <span className="text-xl font-bold text-white">{totalInCurrency} {currency}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-400">Send Bitcoin (BTC) to the address below:</p>
                                        <div className="flex items-center gap-2 bg-black p-3 rounded border border-zinc-800 font-mono text-xs md:text-sm break-all text-gray-300">
                                            <span>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span>
                                            <Button size="sm" variant="secondary" onClick={() => toast.success("Address copied")} className="ml-auto flex-shrink-0 h-8">Copy</Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
                                        <Info size={14} />
                                        <span>Payment will be detected automatically after 1 confirmation.</span>
                                    </div>
                                </div>
                                
                                <Button className="w-full h-12" onClick={handleCryptoPayment} isLoading={loading}>
                                    I have sent the payment
                                </Button>
                                <p className="text-xs text-center text-gray-500">Order will be placed after verification.</p>
                            </div>
                        )}

                        {paymentMethod === 'cash' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-lg space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-green-900/30">
                                        <span className="text-green-400">Total due:</span>
                                        <span className="text-xl font-bold text-white">{totalInCurrency} {currency}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-900/20 rounded-lg text-green-400">
                                            <Banknote size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Pay In-Person (Cash Only)</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Place your order now. Payment must be made in cash when we meet.
                                                Your items will be reserved.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button className="w-full h-12 bg-green-600 hover:bg-green-500 text-white" onClick={handleCashPayment} isLoading={loading}>
                                    Place Order (Pay later)
                                </Button>
                            </div>
                        )}
                        
                        {!isDigitalOrder && (
                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setStep('shipping')} className="w-full">Back</Button>
                            </div>
                        )}
                    </div>
                </>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Order Summary (Unchanged) */}
      <div className="lg:col-span-1">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-white">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map(item => (
                <div key={item.id} className="flex flex-col gap-2 border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex gap-3 text-sm">
                        <div className="w-12 h-12 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="flex-grow flex justify-between">
                            <div>
                                <p className="font-medium text-gray-200 line-clamp-2">{item.title}</p>
                                <p className="text-gray-500">Qty: {item.quantity}</p>
                                {(item.isDigital || item.category === 'Digital') ? (
                                    <p className="text-xs text-blue-400 flex items-center gap-1"><Download size={10} /> Instant DL</p>
                                ) : (
                                    item.shippingCost !== undefined && item.shippingCost > 0 && (
                                        <p className="text-xs text-gray-500">+{formatPrice(item.shippingCost)} ship</p>
                                    )
                                )}
                            </div>
                            <span className="font-medium text-gray-300">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    </div>
                    {item.customFieldValues && Object.keys(item.customFieldValues).length > 0 && (
                        <div className="pl-14 text-xs text-gray-500 space-y-1">
                            {Object.entries(item.customFieldValues).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-1">
                                    <span className="font-bold uppercase text-[10px]">{k}:</span>
                                    <span>{v}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            </div>
            
            {/* Coupon Code Input */}
            <div className="mb-6">
                {!coupon ? (
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Promo Code" 
                        className="flex-grow p-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg outline-none focus:border-blue-500 uppercase text-white placeholder-zinc-600"
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
                    <div className="flex items-center justify-between mt-2 text-xs text-green-400 bg-green-900/20 p-2.5 rounded-lg border border-green-900/30">
                        <div className="flex items-center gap-2">
                            <Ticket size={14} />
                            <span className="font-bold">{coupon.code}</span>
                            <span className="opacity-75">
                                ({coupon.type === 'percent' ? `-${coupon.value}%` : `-${formatPrice(coupon.value)}`})
                            </span>
                        </div>
                        <button onClick={removeCoupon} className="hover:text-green-300 font-bold p-1">✕</button>
                    </div>
                )}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>{isDigitalOrder ? 'Free (Digital)' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span className="flex items-center gap-1">Estimated Tax <Info size={12}/></span>
                    <span>{formatPrice(estimatedTax)}</span>
                </div>
                {coupon && (
                    <div className="flex justify-between text-green-400 font-medium">
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-xl text-white pt-4 border-t border-zinc-800 mt-2">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}