"use client";

import { useState, useRef, useEffect } from "react";
import { useUi } from "@/store/ui-store";
import { usePathname } from "next/navigation";

type Message = {
  id: string;
  text: string;
  sender: "USER" | "ADMIN" | "BOT";
  createdAt: string;
};

export function LiveSupport() {
  const pathname = usePathname();
  const { isCartOpen } = useUi();
  const [isOpen, setIsOpen] = useState(false);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages if chat is open and session started
  useEffect(() => {
    let interval: any;
    if (isOpen && sessionId && !isFinished) {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`/api/support/${sessionId}`);
          const data = await res.json();
          setMessages(data);
        } catch (err) {
          console.error("Polling error", err);
        }
      };
      
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, sessionId, isFinished]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Sunucudan geçersiz yanıt geldi (HTML). Lütfen birazdan tekrar deneyin.");
      }
      
      if (!res.ok) {
        throw new Error(data.details || data.error || "Başlatılamadı");
      }

      setSessionId(data.id);
      setMessages(data.messages);
      setIsFinished(false);
    } catch (err) {
      console.error("Start chat error", err);
      import("react-hot-toast").then(t => t.toast.error("Bağlantı hatası oluştu. Lütfen tekrar deneyin."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId) return;

    const text = inputValue;
    setInputValue("");

    try {
      const res = await fetch(`/api/support/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sender: "USER" }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  const handleEndChat = () => {
    setIsFinished(true);
  };

  const handleResetChat = () => {
    setSessionId(null);
    setMessages([]);
    setIsFinished(false);
    setForm({ name: "", email: "", message: "" });
  };

  // Admin sayfalarında hiçbir şey döndürme
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] max-w-[95vw] overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="bg-stone-50 p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center">
                 <span className="text-xl">★</span>
                 {!isFinished && <span className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 animate-pulse" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Yıldız Destek</h3>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {isFinished ? "Görüşme Sonlandı" : "Şu an çevrimiçi"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               {sessionId && !isFinished && (
                 <button 
                   onClick={handleEndChat}
                   className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
                   title="Görüşmeyi Sonlandır"
                 >
                   Sonlandır
                 </button>
               )}
               <button 
                 onClick={() => setIsOpen(false)}
                 className="text-stone-400 hover:text-stone-900 transition p-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>
          </div>

          {/* Body */}
          <div className="h-[480px] overflow-y-auto bg-white p-6 scrollbar-hide">
            {!sessionId ? (
              <div className="space-y-8 animate-in fade-in duration-700">
                 <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Merhaba!</h2>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Size nasıl yardımcı olabiliriz?</p>
                 </div>
                 
                 <form onSubmit={handleStartChat} className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Ad Soyad</label>
                       <input 
                         required
                         type="text"
                         className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                         placeholder="Yasin Yıldız"
                         value={form.name}
                         onChange={e => setForm(prev => ({...prev, name: e.target.value}))}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">E-posta</label>
                       <input 
                         required
                         type="email"
                         className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                         placeholder="destek@yildizstore.com"
                         value={form.email}
                         onChange={e => setForm(prev => ({...prev, email: e.target.value}))}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Mesajınız</label>
                       <textarea 
                         required
                         rows={3}
                         className="w-full rounded-3xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all resize-none shadow-inner"
                         placeholder="Hangi ürün hakkında bilgi almak istersiniz?"
                         value={form.message}
                         onChange={e => setForm(prev => ({...prev, message: e.target.value}))}
                       />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full cursor-pointer rounded-full border-2 border-black bg-white py-5 text-[11px] font-black uppercase tracking-[0.2em] text-stone-900 shadow-xl shadow-stone-100 transition hover:bg-stone-50 active:scale-95 disabled:opacity-50"
                    >
                       {isLoading ? "Bağlanıyor..." : "Görüşmeyi Başlat"}
                    </button>
                 </form>
              </div>
            ) : isFinished ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                 <div className="h-20 w-20 rounded-full bg-stone-50 flex items-center justify-center text-3xl shadow-xl shadow-stone-100">👋</div>
                 <div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">Teşekkürler!</h2>
                    <p className="mt-2 text-sm font-medium text-stone-500">Görüşmeniz sonlandırıldı. Başka bir sorunuz olursa her zaman buradayız.</p>
                 </div>
                 <button 
                   onClick={handleResetChat}
                   className="rounded-full border-2 border-black bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg shadow-stone-100 transition hover:bg-stone-50 active:scale-95"
                 >
                   Yeni Görüşme Başlat
                 </button>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`max-w-[85%] rounded-[1.8rem] px-5 py-4 text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender === "USER" 
                        ? "bg-stone-900 text-white rounded-tr-none" 
                        : "bg-stone-50 text-stone-900 rounded-tl-none border border-stone-100"
                    }`}>
                      {msg.text}
                      <p className={`mt-2 text-[8px] font-bold uppercase opacity-50 ${msg.sender === "USER" ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input (Only when session started and not finished) */}
          {sessionId && !isFinished && (
            <div className="bg-stone-50 p-6 border-t border-stone-100">
               <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Yanıtınızı yazın..." 
                    className="flex-1 rounded-2xl border border-stone-200 bg-white px-6 py-3.5 text-xs font-bold text-stone-900 outline-none focus:border-black transition-all shadow-sm"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="cursor-pointer flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white hover:bg-stone-800 transition shadow-xl shadow-stone-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
               </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isCartOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-16 w-16 items-center justify-center rounded-[1.5rem] border-2 border-black bg-white text-3xl shadow-2xl transition-all hover:scale-110 hover:bg-stone-50 active:scale-95 group"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <>
              <span className="relative z-10">💬</span>
              <span className="absolute -left-40 top-1/2 -translate-y-1/2 rounded-xl border border-stone-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-900 opacity-0 shadow-2xl transition-all group-hover:-left-44 group-hover:opacity-100">
                 Canlı Destek
              </span>
              <div className="absolute inset-0 animate-ping rounded-[1.5rem] bg-black opacity-10" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
