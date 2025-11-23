
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Mail, MessageSquare, Send, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Contact: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setSending(false);
        setFormData({ name: '', email: '', message: '' });
        toast.success("Message sent! We'll reply shortly.");
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">How can we help?</h1>
                <p className="text-gray-500">Our support team is here for you 24/7.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                        <p className="text-blue-100 mb-8">Fill up the form and our team will get back to you within 24 hours.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone size={20} className="text-blue-200" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={20} className="text-blue-200" />
                                <span>support@bob-shop.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <p className="font-bold">Live Chat</p>
                                <p className="text-sm text-blue-200">Available Mon-Fri, 9am - 5pm EST</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Message</label>
                            <textarea 
                                required
                                rows={4}
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Tell us about your order or inquiry..."
                            />
                        </div>
                        <Button type="submit" isLoading={sending} className="w-full">
                            <Send size={18} className="mr-2" /> Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
