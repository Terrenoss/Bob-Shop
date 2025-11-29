
'use client';

import React from 'react';
import { Button } from '../../components/ui/Button';
import { Mail, MessageSquare, Phone, HelpCircle, Clock, Zap } from 'lucide-react';
import { useApp } from '../providers';
import { useNavigate } from 'react-router-dom';

export default function Page() {
    const { user, setIsAuthModalOpen } = useApp();
    const navigate = useNavigate();

    const handleStartChat = () => {
        if (!user) {
            setIsAuthModalOpen(true);
        } else {
            navigate('/profile?tab=support');
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 py-12">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                    <Zap size={14} /> 24/7 Priority Support
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Support Center</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Need help with an order? Have a question about a product? <br/>
                    Our dedicated team is ready to assist you instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Live Chat Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-[1px]">
                    <div className="bg-[#18181b] rounded-[23px] h-full p-8 md:p-12 flex flex-col items-center text-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl border border-zinc-700 relative z-10">
                            <MessageSquare size={40} className="text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Live Chat Support</h2>
                        <p className="text-gray-400 mb-8 max-w-md relative z-10">
                            The fastest way to get help. Connect with a real human agent in seconds for order issues or product questions.
                        </p>
                        <Button 
                            size="lg" 
                            onClick={handleStartChat}
                            className="relative z-10 h-14 px-8 text-lg bg-white text-black hover:bg-gray-200"
                        >
                            <MessageSquare size={20} className="mr-2" /> Start Conversation
                        </Button>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 relative z-10">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Agents available now
                        </div>
                    </div>
                </div>

                {/* Email Support Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center justify-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 mb-6">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        For non-urgent inquiries or partnership proposals. We usually reply within 24 hours.
                    </p>
                    <a href="mailto:support@bob-shop.com" className="text-purple-400 hover:text-purple-300 font-bold underline">
                        support@bob-shop.com
                    </a>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <HelpCircle size={24} className="text-purple-500" /> Frequently Asked Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                        <h4 className="font-bold text-white mb-2">Where is my order?</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            You can track your order in real-time by visiting the <span className="text-white cursor-pointer hover:underline" onClick={() => user ? navigate('/orders') : null}>Orders</span> page. 
                            If you need more details, simply click "Get Help" on your order card.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-2">Do you ship internationally?</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Yes, we ship to over 100 countries worldwide. Shipping times may vary depending on your location.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-2">What payment methods do you accept?</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            We accept all major Credit Cards, PayPal, and Bitcoin/Crypto. We also offer cash payments for local pickups.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-2">How do digital products work?</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Digital keys and codes are delivered instantly to your email and Order History page immediately after payment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
