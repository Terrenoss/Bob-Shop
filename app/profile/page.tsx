'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../providers';
import { Button } from '../../components/ui/Button';
import { User, Lock, MapPin, Save, Shield, Mail, MessageSquare, Send, Paperclip, Bold, Italic, Strikethrough, List, ListOrdered, X, Camera, Upload, ShoppingBag, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { chatService, ordersService } from '../../lib/mockNestService';
import { ChatMessage, ChatSession, Order } from '../../types';
import { FormattedText } from '../../components/FormattedText';

export default function Page() {
  const { user, updateUser, chatContext, formatPrice, setChatContext } = useApp();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'address' | 'support'>('general');
  const [loading, setLoading] = useState(false);
  const [generalForm, setGeneralForm] = useState({ name: '', email: '' });
  const [securityForm, setSecurityForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [addressForm, setAddressForm] = useState({ line1: '', city: '', postalCode: '', name: '' });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  
  // Fake Avatar State
  const [avatar, setAvatar] = useState<string | null>(null);

  // Derived state for context display (prioritize session context for persistence, fallback to transient context)
  const displayContext = chatSession?.context || chatContext;

  useEffect(() => {
      const tab = searchParams.get('tab');
      if (tab === 'support') setActiveTab('support');
      if (user) {
          setGeneralForm({ name: user.name, email: user.email });
          setAddressForm(user.defaultAddress || { ...addressForm, name: user.name });
          
          // Fetch orders for stats
          const fetchStats = async () => {
              const orders = await ordersService.findAll(user.id);
              setUserOrders(orders);
          };
          fetchStats();
      }
  }, [user, searchParams]);

  useEffect(() => {
      if (activeTab === 'support' && user) {
          let interval: any;
          const initChat = async () => {
              const sess = await chatService.createSession(user.id, user.name);
              setChatSession(sess);
              const fetchMsgs = async () => {
                  const msgs = await chatService.getMessages(sess.id);
                  if (msgs.length > chatMessages.length) setChatMessages(msgs);
                  
                  // Refresh session for status update
                  const sessions = await chatService.getSessions(user.id);
                  const current = sessions.find(s => s.id === sess.id);
                  if (current) setChatSession(current);
              };
              fetchMsgs();
              interval = setInterval(fetchMsgs, 3000);
          };
          initChat();
          return () => clearInterval(interval);
      }
  }, [activeTab, user]);

  useEffect(() => {
      if (activeTab === 'support' && chatContext && chatSession) {
          chatService.updateSessionContext(chatSession.id, chatContext);
          if (chatContext.type === 'order') {
              const order = chatContext.data as Order;
              const hasAsked = chatMessages.some(m => !m.isAdmin && m.content.includes(order.id));
              if (!hasAsked && !chatInput) setChatInput('I have a question about my order.');
          }
      }
  }, [activeTab, chatContext, chatSession]);

  useEffect(() => {
      if (activeTab === 'support' && chatEndRef.current && chatMessages.length > 0) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages.length, activeTab]);

  const handleGeneralSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await updateUser(generalForm); setLoading(false); };
  const handleSecuritySubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await updateUser({ oldPassword: securityForm.oldPassword, newPassword: securityForm.newPassword }); setLoading(false); };
  const handleAddressSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await updateUser({ defaultAddress: addressForm }); setLoading(false); };
  
  const handleSendMessage = async (contentToSend?: string) => {
      const text = contentToSend || chatInput;
      if (!text.trim() || !chatSession || !user) return;
      
      if (!contentToSend) setChatInput('');
      const tempMsg: ChatMessage = { id: 'temp-'+Date.now(), sessionId: chatSession.id, senderId: user.id, content: text, timestamp: new Date().toISOString(), isAdmin: false };
      setChatMessages(prev => [...prev, tempMsg]);
      await chatService.sendMessage(chatSession.id, user.id, text, false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { toast.error('Only images supported'); return; }
      const reader = new FileReader();
      reader.onload = () => handleSendMessage(`![${file.name}](${reader.result})`);
      reader.readAsDataURL(file);
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onload = () => {
              setAvatar(reader.result as string);
              toast.success("Profile picture updated");
          };
          reader.readAsDataURL(file);
      }
  };

  const handleInsertText = (startTag: string, endTag: string = '') => {
      const textarea = chatInputRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);
      if (endTag) {
          const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end);
          setChatInput(newText);
          setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, end + startTag.length); }, 0);
      } else {
          const newText = text.substring(0, start) + startTag + text.substring(end);
          setChatInput(newText);
          setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + startTag.length, start + startTag.length); }, 0);
      }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden border-2 border-zinc-800">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
          </div>
          <div>
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
              <p className="text-gray-400 text-sm">Manage your profile and preferences</p>
          </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-gray-400 hover:text-white hover:bg-zinc-900'}`}><User size={18} /> General</button>
              <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-gray-400 hover:text-white hover:bg-zinc-900'}`}><Lock size={18} /> Security</button>
              <button onClick={() => setActiveTab('address')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'address' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-gray-400 hover:text-white hover:bg-zinc-900'}`}><MapPin size={18} /> Address</button>
              <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'support' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-gray-400 hover:text-white hover:bg-zinc-900'}`}><MessageSquare size={18} /> Support Chat</button>
          </div>

          <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
              
              {activeTab === 'general' && (
                  <form onSubmit={handleGeneralSubmit} className="space-y-8 max-w-xl animate-in fade-in slide-in-from-right-4">
                      
                      {/* Stats Section */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
                              <div className="p-2 bg-purple-900/20 text-purple-400 rounded-lg">
                                  <ShoppingBag size={20} />
                              </div>
                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-bold">Total Orders</p>
                                  <p className="text-xl font-bold text-white">{userOrders.length}</p>
                              </div>
                          </div>
                          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
                              <div className="p-2 bg-green-900/20 text-green-400 rounded-lg">
                                  <DollarSign size={20} />
                              </div>
                              <div>
                                  <p className="text-xs text-gray-500 uppercase font-bold">Total Spent</p>
                                  <p className="text-xl font-bold text-white">
                                      {formatPrice(userOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0))}
                                  </p>
                              </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-lg font-bold text-white mb-1">Profile Information</h3>
                          <p className="text-sm text-gray-500 mb-6">Update your public profile details.</p>
                          
                          <div className="flex items-center gap-6 mb-6">
                              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <User size={32} className="text-zinc-600" />}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Camera size={24} className="text-white" />
                                  </div>
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarUpload} />
                              </div>
                              <div>
                                  <Button type="button" size="sm" variant="secondary" className="relative">
                                      Upload New Picture
                                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarUpload} />
                                  </Button>
                                  <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                  <input required value={generalForm.name} onChange={e => setGeneralForm({...generalForm, name: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                                  <input type="email" required value={generalForm.email} onChange={e => setGeneralForm({...generalForm, email: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" />
                              </div>
                          </div>
                      </div>
                      <div className="pt-6 border-t border-zinc-800">
                          <Button type="submit" isLoading={loading}>Save Changes</Button>
                      </div>
                  </form>
              )}

              {activeTab === 'security' && (
                  <form onSubmit={handleSecuritySubmit} className="space-y-8 max-w-xl animate-in fade-in slide-in-from-right-4">
                      <div>
                          <h3 className="text-lg font-bold text-white mb-1">Security Settings</h3>
                          <p className="text-sm text-gray-500 mb-6">Manage your password and security preferences.</p>
                          
                          <div className="space-y-4">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase">Current Password</label>
                                  <input type="password" required value={securityForm.oldPassword} onChange={e => setSecurityForm({...securityForm, oldPassword: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase">New Password</label>
                                  <input type="password" required value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" />
                              </div>
                          </div>
                      </div>
                      <div className="pt-6 border-t border-zinc-800">
                          <Button type="submit" isLoading={loading}>Update Password</Button>
                      </div>
                  </form>
              )}

              {activeTab === 'address' && (
                  <form onSubmit={handleAddressSubmit} className="space-y-8 max-w-xl animate-in fade-in slide-in-from-right-4">
                      <div>
                          <h3 className="text-lg font-bold text-white mb-1">Shipping Address</h3>
                          <p className="text-sm text-gray-500 mb-6">This address will be used as default for checkout.</p>
                          
                          <div className="space-y-4">
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-gray-400 uppercase">Address Line</label>
                                  <input required value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" placeholder="123 Main St" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                      <label className="text-xs font-bold text-gray-400 uppercase">City</label>
                                      <input required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-xs font-bold text-gray-400 uppercase">Postal Code</label>
                                      <input required value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-blue-600 outline-none transition-all" />
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="pt-6 border-t border-zinc-800">
                          <Button type="submit" isLoading={loading}>Save Address</Button>
                      </div>
                  </form>
              )}
              
              {activeTab === 'support' && (
                  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 absolute inset-0">
                      <div className="flex-1 flex flex-col bg-zinc-900 overflow-hidden">
                          <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#18181b]">
                              {displayContext?.type === 'order' && displayContext.data && (
                                  <div className="mb-4 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-700/50">
                                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Related Order (#{(displayContext.data as Order).id})</span>
                                          {/* Context locked once active to preserve history */}
                                      </div>
                                      <div className="flex gap-4">
                                          <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                                              <img src={(displayContext.data as Order).items[0].image} className="w-full h-full object-cover opacity-80" alt="" />
                                          </div>
                                          <div className="flex-grow min-w-0">
                                              <h4 className="font-bold text-white text-sm line-clamp-1">{(displayContext.data as Order).items[0].title}</h4>
                                              <div className="text-xs text-gray-500 mt-1">{(displayContext.data as Order).items[0].category} &bull; #{(displayContext.data as Order).items[0].sku || 'NOSKU'}</div>
                                              <div className="flex justify-between items-end mt-2">
                                                  <span className="font-bold text-white">{formatPrice((displayContext.data as Order).total)}</span>
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                                      (displayContext.data as Order).status === 'delivered' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                                      (displayContext.data as Order).status === 'cancelled' ? 'bg-red-900/30 text-red-400 border-red-800' :
                                                      'bg-blue-900/30 text-blue-400 border-blue-800'
                                                  }`}>
                                                      {(displayContext.data as Order).status}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              )}
                              {chatMessages.map(msg => (
                                  <div key={msg.id} className={`flex ${!msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm shadow-sm ${!msg.isAdmin ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-200 border border-zinc-700'}`}>
                                          <FormattedText text={msg.content} />
                                          <p className={`text-[10px] mt-1 text-right ${!msg.isAdmin ? 'text-purple-200' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                      </div>
                                  </div>
                              ))}
                              <div ref={chatEndRef} />
                          </div>
                          
                          {/* Chat Input Area */}
                          <div className="bg-[#1e1e21] border-t border-zinc-800 p-4 relative">
                              {chatSession?.status === 'resolved' && (
                                  <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-blur-sm">
                                      <span className="text-sm font-bold text-white bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700">
                                          This conversation has been marked as resolved.
                                      </span>
                                  </div>
                              )}
                              <div className="bg-[#2d2d30] rounded-lg border border-zinc-700 overflow-hidden shadow-inner">
                                  <div className="flex items-center gap-1 p-1.5 bg-[#252528] border-b border-zinc-700">
                                      <button onClick={() => handleInsertText('**', '**')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-zinc-700"><Bold size={14}/></button>
                                      <button onClick={() => handleInsertText('_', '_')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-zinc-700"><Italic size={14}/></button>
                                      <button onClick={() => handleInsertText('~~', '~~')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-zinc-700"><Strikethrough size={14}/></button>
                                      <button onClick={() => handleInsertText('\n- ')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-zinc-700"><List size={14}/></button>
                                  </div>
                                  <textarea ref={chatInputRef} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="w-full bg-[#1e1e21] text-gray-200 text-sm p-4 outline-none resize-none h-24" onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} />
                                  <div className="flex justify-between items-center p-3 bg-[#252528] border-t border-zinc-700">
                                      <div className="relative">
                                          <button className="text-gray-500 hover:text-white p-2 hover:bg-zinc-700 rounded-full transition-colors" onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></button>
                                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                      </div>
                                      <button onClick={() => handleSendMessage()} disabled={!chatInput.trim()} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg p-2 px-6 transition-all shadow-lg hover:shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"><Send size={18} /></button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}