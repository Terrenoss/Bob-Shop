import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../app/providers';
import { ChatMessage, ChatSession, Order } from '../types';
import { chatService } from '../lib/mockNestService';
import { MessageSquare, X, Send, Minus, Bold, Italic, Strikethrough, List, ListOrdered, Paperclip } from 'lucide-react';
import { Button } from './ui/Button';
import { FormattedText } from './FormattedText';
import { toast } from 'react-hot-toast';

export const ChatWidget: React.FC = () => {
    const { user, isChatOpen, setIsChatOpen, chatContext, formatPrice } = useApp();
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [session, setSession] = useState<ChatSession | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Setup
    useEffect(() => {
        if (!user) return;
        
        let interval: any;

        const initSession = async () => {
            const sess = await chatService.createSession(user.id, user.name);
            setSession(sess);
            setUnreadCount(sess.userUnreadCount || 0);
            
            const loadMsgs = async () => {
                const msgs = await chatService.getMessages(sess.id);
                setMessages(msgs);
                const updatedSessions = await chatService.getSessions(user.id);
                const current = updatedSessions.find(s => s.id === sess.id);
                if (current) setUnreadCount(current.userUnreadCount || 0);
            };
            loadMsgs();

            interval = setInterval(loadMsgs, 3000); 
        };

        initSession();
        return () => clearInterval(interval);
    }, [user]);

    // Handle initial context message (auto-fill)
    useEffect(() => {
        if (isChatOpen && chatContext?.type === 'order') {
            const order = chatContext.data as Order;
            if (!messages.some(m => m.content.includes(`I have a question about my order #${order.id}`))) {
                setInput('I have a question about my order.');
            }
        }
    }, [isChatOpen, chatContext, messages]);

    useEffect(() => {
        if (isChatOpen && !isMinimized && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChatOpen, isMinimized]);

    useEffect(() => {
        if (isChatOpen && !isMinimized && session && unreadCount > 0) {
            chatService.markAsRead(session.id, false);
            setUnreadCount(0);
        }
    }, [isChatOpen, isMinimized, messages]);

    const handleSend = async (contentToSend?: string) => {
        const text = contentToSend || input;
        if (!text.trim() || !session || !user) return;
        
        if (!contentToSend) setInput('');
        
        const tempMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            sessionId: session.id,
            senderId: user.id,
            content: text,
            timestamp: new Date().toISOString(),
            isAdmin: false
        };
        setMessages(prev => [...prev, tempMsg]);

        await chatService.sendMessage(session.id, user.id, text, false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            toast.error('Only image uploads are supported');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            // Markdown image syntax
            handleSend(`![${file.name}](${base64})`);
        };
        reader.readAsDataURL(file);
        
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!user) return null;

    if (!isChatOpen) {
        return (
            <button 
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center z-[60] transition-transform hover:scale-105"
            >
                <MessageSquare size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-black">
                        {unreadCount}
                    </span>
                )}
            </button>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 w-72 bg-zinc-900 border border-zinc-800 rounded-t-xl shadow-2xl z-[60] overflow-hidden">
                <div 
                    className="bg-zinc-800 p-3 flex justify-between items-center cursor-pointer hover:bg-zinc-700"
                    onClick={() => setIsMinimized(false)}
                >
                    <span className="font-bold text-white text-sm">Support Chat</span>
                    <div className="flex gap-2">
                         {unreadCount > 0 && <span className="text-xs bg-red-500 px-1.5 rounded-full text-white">{unreadCount}</span>}
                         <button onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }} className="text-gray-400 hover:text-white"><X size={16} /></button>
                    </div>
                </div>
            </div>
        );
    }

    const renderOrderCard = (order: Order) => {
        const item = order.items[0]; // Show first item as context
        return (
            <div className="bg-zinc-800 rounded-lg p-3 mb-4 border border-zinc-700 shadow-lg">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-700">
                    <span className="text-xs font-bold text-gray-300">Purchase order (#{order.id})</span>
                    <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white"><X size={14}/></button>
                </div>
                <div className="flex gap-3">
                    <div className="w-12 h-12 bg-black rounded-md overflow-hidden flex-shrink-0 border border-zinc-700">
                        <img src={item.image} className="w-full h-full object-cover opacity-80" alt="" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-white truncate pr-2">{item.title}</h4>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">#{item.sku || item.id}</div>
                        <div className="text-xs text-gray-500 mb-1">Items - {item.category}</div>
                        
                        <div className="flex justify-between items-end mt-1">
                            <span className="font-bold text-white">{formatPrice(order.total)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                order.status === 'delivered' ? 'bg-green-900/30 text-green-400' :
                                order.status === 'cancelled' ? 'bg-red-900/30 text-red-400' :
                                'bg-blue-900/30 text-blue-400'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-[#1e1e21] border border-zinc-800 rounded-lg shadow-2xl z-[60] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 font-sans">
            {/* Header */}
            {!chatContext && (
                <div className="bg-[#2d2d30] p-3 border-b border-black flex justify-between items-center h-12 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200 text-sm">Support Team</span>
                    </div>
                    <div className="flex gap-2 text-gray-400">
                        <button onClick={() => setIsMinimized(true)} className="hover:text-white"><Minus size={16} /></button>
                        <button onClick={() => setIsChatOpen(false)} className="hover:text-white"><X size={16} /></button>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#1e1e21] custom-scrollbar">
                
                {chatContext?.type === 'order' && renderOrderCard(chatContext.data)}

                {messages.length === 0 && !chatContext && (
                    <div className="text-center text-gray-500 text-sm mt-10">
                        <p>How can we help you today?</p>
                    </div>
                )}
                
                {messages.map(msg => {
                    const isMe = !msg.isAdmin;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                isMe 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-[#2d2d30] text-gray-200'
                            }`}>
                                <FormattedText text={msg.content} />
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Editor Input Area */}
            <div className="bg-[#1e1e21] border-t border-zinc-800 p-2 flex-shrink-0">
                <div className="bg-[#2d2d30] rounded-lg border border-zinc-700 overflow-hidden flex flex-col">
                    
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-[#2d2d30] border-b border-zinc-700">
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><Bold size={14}/></button>
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><Italic size={14}/></button>
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><Strikethrough size={14}/></button>
                        <div className="w-px h-4 bg-zinc-600 mx-1"></div>
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><List size={14}/></button>
                        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><ListOrdered size={14}/></button>
                    </div>

                    {/* Text Area */}
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-[#1e1e21] text-gray-200 text-sm p-3 outline-none resize-none min-h-[80px] placeholder-zinc-600 font-sans"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center p-2 bg-[#2d2d30] border-t border-zinc-700">
                        <button 
                            className="text-gray-500 hover:text-white p-1 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload} 
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-md p-1.5 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};