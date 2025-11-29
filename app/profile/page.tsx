'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../providers';
import { Button } from '../../components/ui/Button';
import { User, Lock, MapPin, Save, Shield, Mail, MessageSquare, Send, Paperclip, Bold, Italic, Strikethrough, List, ListOrdered, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { chatService } from '../../lib/mockNestService';
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

  // Derived state for context display (prioritize session context for persistence, fallback to transient context)
  const displayContext = chatSession?.context || chatContext;

  useEffect(() => {
      const tab = searchParams.get('tab');
      if (tab === 'support') setActiveTab('support');
      if (user) {
          setGeneralForm({ name: user.name, email: user.email });
          setAddressForm(user.defaultAddress || { ...addressForm, name: user.name });
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
      <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>
      <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-400 hover:text-white'}`}><User size={18} /> General</button>
              <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-400 hover:text-white'}`}><Lock size={18} /> Security</button>
              <button onClick={() => setActiveTab('address')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'address' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-400 hover:text-white'}`}><MapPin size={18} /> Address</button>
              <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'support' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-gray-400 hover:text-white'}`}><MessageSquare size={18} /> Support Chat</button>
          </div>

          <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-sm min-h-[500px] flex flex-col">
              {activeTab === 'general' && <form onSubmit={handleGeneralSubmit} className="space-y-6"><div className="space-y-1"><label className="text-sm text-gray-400">Name</label><input required value={generalForm.name} onChange={e => setGeneralForm({...generalForm, name: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white" /></div><div className="space-y-1"><label className="text-sm text-gray-400">Email</label><input type="email" required value={generalForm.email} onChange={e => setGeneralForm({...generalForm, email: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white" /></div><Button type="submit" isLoading={loading}>Save</Button></form>}
              {activeTab === 'security' && <form onSubmit={handleSecuritySubmit} className="space-y-6"><div className="space-y-1"><label className="text-sm text-gray-400">New Password</label><input type="password" required value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white" /></div><Button type="submit" isLoading={loading}>Update</Button></form>}
              {activeTab === 'address' && <form onSubmit={handleAddressSubmit} className="space-y-6"><div className="space-y-1"><label className="text-sm text-gray-400">Address</label><input required value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white" /></div><Button type="submit" isLoading={loading}>Save</Button></form>}
              
              {activeTab === 'support' && (
                  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                      <div className="flex-1 flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                          <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                              {displayContext?.type === 'order' && displayContext.data && (
                                  <div className="mb-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-800">
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
                                      <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${!msg.isAdmin ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-200'}`}>
                                          <FormattedText text={msg.content} />
                                          <p className="text-[10px] mt-1 text-right opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
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
                              <div className="bg-[#2d2d30] rounded-lg border border-zinc-700 overflow-hidden">
                                  <div className="flex items-center gap-1 p-1.5 bg-[#2d2d30] border-b border-zinc-700">
                                      <button onClick={() => handleInsertText('**', '**')} className="p-1.5 text-gray-400 hover:text-white"><Bold size={14}/></button>
                                      <button onClick={() => handleInsertText('_', '_')} className="p-1.5 text-gray-400 hover:text-white"><Italic size={14}/></button>
                                      <button onClick={() => handleInsertText('~~', '~~')} className="p-1.5 text-gray-400 hover:text-white"><Strikethrough size={14}/></button>
                                      <button onClick={() => handleInsertText('\n- ')} className="p-1.5 text-gray-400 hover:text-white"><List size={14}/></button>
                                  </div>
                                  <textarea ref={chatInputRef} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="w-full bg-[#1e1e21] text-gray-200 text-sm p-4 outline-none resize-none h-24" onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} />
                                  <div className="flex justify-between items-center p-3 bg-[#2d2d30] border-t border-zinc-700">
                                      <button className="text-gray-500 hover:text-white p-2 hover:bg-zinc-700 rounded-full" onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></button>
                                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                      <button onClick={() => handleSendMessage()} disabled={!chatInput.trim()} className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 px-6 transition-colors"><Send size={18} /></button>
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
