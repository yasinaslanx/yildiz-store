"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  updatedAt: string;
  status: 'OPEN' | 'CLOSED';
  _count: { messages: number };
};

type Message = {
  id: string;
  text: string;
  sender: "USER" | "ADMIN" | "BOT";
  createdAt: string;
};

export default function AdminSupportPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Load sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/support");
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error("Load sessions error", err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
    const interval = setInterval(loadSessions, 10000); // refresh list every 10s
    return () => clearInterval(interval);
  }, []);

  // Load messages for selected session
  useEffect(() => {
    let interval: any;
    if (selectedSessionId) {
      const fetchMessages = async () => {
        const res = await fetch(`/api/support/${selectedSessionId}`);
        const data = await res.json();
        setMessages(data);
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedSessionId) return;

    const text = inputValue;
    setInputValue("");

    try {
      const res = await fetch(`/api/support/${selectedSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sender: "ADMIN" }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSessionId) return;
    
    try {
      // Create a specific update route or just use the sessions route with a PATCH
      // For simplicity, let's assume we can update the session
      const res = await fetch(`/api/support/sessions/${selectedSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === selectedSessionId ? {...s, status: "CLOSED"} : s));
        setSelectedSessionId(null);
      }
    } catch (err) {
      console.error("Close session error", err);
    }
  };

  return (
    <main className="flex h-[calc(100vh-80px)] bg-white overflow-hidden">
      {/* Sidebar: Session List */}
      <aside className="w-96 border-r border-stone-100 flex flex-col bg-white">
        <div className="p-10 border-b border-stone-100">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-stone-900 animate-pulse" />
              <h1 className="text-xl font-black text-stone-900 tracking-tighter uppercase">Destek Talepleri</h1>
           </div>
           <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mt-2">Müşteri Deneyimini Yönetin</p>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="p-8 text-center">
               <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
               <p className="text-xs font-black text-stone-300 uppercase tracking-widest leading-relaxed">Şu an aktif bir talep bulunmuyor.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`w-full text-left p-8 border-b border-stone-50 transition-all group ${
                  selectedSessionId === session.id 
                    ? "bg-stone-50/50 border-r-4 border-r-black" 
                    : "hover:bg-stone-50/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-sm font-black text-stone-900 truncate max-w-[150px] group-hover:underline underline-offset-4">{session.customerName}</p>
                   <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[10px] font-bold text-stone-400 truncate leading-relaxed">{session.lastMessage}</p>
                <div className="mt-4 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black px-3 py-1 rounded-full bg-white border border-stone-100 text-stone-500 uppercase tracking-widest">
                         {session._count.messages} İleti
                      </span>
                      {session.status === 'CLOSED' && (
                        <span className="text-[9px] font-black px-3 py-1 rounded-full bg-red-50 text-red-500 uppercase tracking-widest border border-red-100">Kapalı</span>
                      )}
                   </div>
                   {session.status === 'OPEN' && <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-100" />}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Content: Chat Area */}
      <section className="flex-1 flex flex-col bg-stone-50/30">
        {selectedSessionId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-8 border-b border-stone-100 flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-lg font-black">
                    {sessions.find(s => s.id === selectedSessionId)?.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                      {sessions.find(s => s.id === selectedSessionId)?.customerName}
                    </h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                      {sessions.find(s => s.id === selectedSessionId)?.customerEmail}
                    </p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={handleCloseSession}
                    className="text-[10px] font-black text-stone-400 hover:text-red-500 uppercase tracking-[0.2em] transition border-2 border-transparent hover:border-red-100 px-4 py-2 rounded-xl"
                  >
                    Talebi Sonlandır
                  </button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === "ADMIN" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-[2.5rem] px-8 py-5 shadow-2xl shadow-stone-100/50 ${
                       msg.sender === "ADMIN" 
                        ? "bg-stone-900 text-white rounded-tr-none" 
                        : "bg-white border border-stone-100 text-stone-900 rounded-tl-none"
                    }`}>
                       <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                       <p className={`mt-3 text-[8px] font-black uppercase opacity-40 tracking-widest ${msg.sender === "ADMIN" ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Input Area */}
            <div className="bg-white p-8 border-t border-stone-100">
               <form onSubmit={handleSendMessage} className="flex gap-4 max-w-5xl mx-auto">
                  <input 
                    type="text" 
                    placeholder="Yanıtınızı buraya yazın..." 
                    className="flex-1 rounded-[1.5rem] border border-stone-100 bg-stone-50 px-8 py-5 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="cursor-pointer bg-black text-white px-10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition shadow-xl shadow-stone-300"
                  >
                    Yanıtla
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in-95 duration-1000">
             <div className="h-24 w-24 rounded-[2rem] bg-white border-2 border-stone-100 flex items-center justify-center text-4xl shadow-2xl shadow-stone-100 mb-8 animate-float">💬</div>
             <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Bir Görüşme Seçin</h2>
             <p className="mt-4 text-stone-400 font-medium max-w-sm leading-relaxed">Müşterilerinize en iyi desteği sunmak için sol taraftaki listeden aktif bir talep seçerek sohbete başlayın.</p>
          </div>
        )}
      </section>
    </main>
  );
}
