import React, { useState } from 'react';
import { useApp } from '../App';
import { Button } from '../components/ui/Button';
import { CheckCircle, CreditCard, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Checkout: React.FC = () => {
  const { cart, clearCart, user } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 4.99;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate Stripe processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setStep('success');
    clearCart();
    toast.success('Order placed successfully!');
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
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-500">
            Thank you for your purchase, {user?.name || 'Guest'}. 
            We have sent the dropshipping order to our suppliers automatically.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            Order ID: #{Math.floor(Math.random() * 1000000)}
        </div>
        <Button onClick={() => navigate('/')}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Form */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'shipping' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {step === 'shipping' ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
            <div className="grid grid-cols-2 gap-4">
               <input placeholder="First Name" className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={user?.name?.split(' ')[0]} />
               <input placeholder="Last Name" className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={user?.name?.split(' ')[1]} />
            </div>
            <input placeholder="Address Line 1" className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="grid grid-cols-2 gap-4">
               <input placeholder="City" className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
               <input placeholder="Postal Code" className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <Button className="w-full mt-4" onClick={() => setStep('payment')}>Continue to Payment</Button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
            </h2>
            
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span className="font-medium text-blue-900">Credit Card (Stripe Simulator)</span>
            </div>

            <div className="space-y-3 pt-4">
                <input placeholder="Card Number" className="p-3 border rounded-lg w-full font-mono" defaultValue="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="MM/YY" className="p-3 border rounded-lg w-full" defaultValue="12/25" />
                    <input placeholder="CVC" className="p-3 border rounded-lg w-full" defaultValue="123" />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <Shield size={12} />
                Payments are securely processed (Simulated)
            </div>

            <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep('shipping')} className="flex-1">Back</Button>
                <Button className="flex-1" onClick={handlePayment} isLoading={loading}>Pay ${total.toFixed(2)}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Order Summary */}
      <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
        <div className="space-y-4 mb-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
               <span className="text-gray-600">{item.quantity}x {item.title}</span>
               <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};