"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setSubmitted(true);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Section */}
      <section className="text-center mb-20">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">İletişim & Destek</p>
         <h1 className="mt-4 text-5xl lg:text-6xl font-black tracking-tighter text-stone-900">
            Size Nasıl Yardımcı<br className="hidden lg:block" /> Olabiliriz?
         </h1>
         <p className="mt-6 mx-auto max-w-2xl text-lg font-medium text-stone-500">
            Siparişleriniz, ürünlerimiz veya iş birlikleri hakkında merak ettiğiniz her şey için uzman ekibimiz yanınızda.
         </p>
      </section>

      <div className="grid gap-16 lg:grid-cols-12">
        {/* Contact Info Cards */}
        <aside className="lg:col-span-5 space-y-6">
           <div className="group rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm transition-all hover:border-black hover:shadow-2xl hover:shadow-stone-100">
              <div className="flex items-center gap-6">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 text-2xl group-hover:bg-white group-hover:shadow-lg transition-all">📞</div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Destek Hattı</p>
                    <p className="mt-1 text-xl font-black text-stone-900">+90 543 210 93 77</p>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">Hafta içi 09:00 - 18:00</p>
                 </div>
              </div>
           </div>

           <div className="group rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm transition-all hover:border-black hover:shadow-2xl hover:shadow-stone-100">
              <div className="flex items-center gap-6">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 text-2xl group-hover:bg-white group-hover:shadow-lg transition-all">💬</div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Canlı Destek</p>
                    <p className="mt-1 text-xl font-black text-stone-900">WhatsApp Hattımız</p>
                    <a 
                      href="https://wa.me/905432109377" 
                      target="_blank" 
                      className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-stone-900 underline underline-offset-4"
                    >
                      Mesaj Gönder
                    </a>
                 </div>
              </div>
           </div>

           <div className="group rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm transition-all hover:border-black hover:shadow-2xl hover:shadow-stone-100">
              <div className="flex items-center gap-6">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 text-2xl group-hover:bg-white group-hover:shadow-lg transition-all">✉️</div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">E-Posta</p>
                    <p className="mt-1 text-xl font-black text-stone-900">info@yildizstore.com</p>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">24 Saat İçinde Yanıt</p>
                 </div>
              </div>
           </div>

           <div className="group rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm transition-all hover:border-black hover:shadow-2xl hover:shadow-stone-100">
              <div className="flex items-center gap-6">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 text-2xl group-hover:bg-white group-hover:shadow-lg transition-all">📍</div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Merkez Ofis</p>
                    <p className="mt-1 text-sm font-bold text-stone-900">Yıldız Teknoloji Merkezi, Siverek / Şanlıurfa</p>
                 </div>
              </div>
           </div>
        </aside>

        {/* Contact Form */}
        <section className="lg:col-span-7">
           <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100 lg:p-16">
              {!submitted ? (
                <>
                   <h2 className="text-2xl font-black tracking-tight text-stone-900 uppercase">Mesaj Gönderin</h2>
                   <p className="mt-2 text-sm font-medium text-stone-500">Sorularınızı ve geri bildirimlerinizi bekliyoruz.</p>

                   <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Ad Soyad</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Yasin Yıldız"
                              className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all"
                              value={form.name}
                              onChange={e => setForm(prev => ({...prev, name: e.target.value}))}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">E-Posta</label>
                            <input 
                              type="email" 
                              required 
                              placeholder="yasinyildiz@ornek.com"
                              className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all"
                              value={form.email}
                              onChange={e => setForm(prev => ({...prev, email: e.target.value}))}
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Konu</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Sipariş Durumu, Ürün Bilgisi vb."
                          className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all"
                          value={form.subject}
                          onChange={e => setForm(prev => ({...prev, subject: e.target.value}))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Mesajınız</label>
                        <textarea 
                          rows={5}
                          required 
                          placeholder="Size nasıl yardımcı olabiliriz?"
                          className="w-full rounded-3xl border border-stone-100 bg-stone-50/50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all resize-none"
                          value={form.message}
                          onChange={e => setForm(prev => ({...prev, message: e.target.value}))}
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full cursor-pointer rounded-full border-2 border-black bg-white py-5 text-sm font-black uppercase tracking-widest text-stone-900 shadow-xl shadow-stone-100 transition-all hover:bg-stone-50 active:scale-95"
                      >
                         Mesajı Gönder
                      </button>
                   </form>
                </>
              ) : (
                <div className="py-12 text-center">
                   <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                   </div>
                   <h2 className="text-3xl font-black tracking-tight text-stone-900">Mesajınız Alındı!</h2>
                   <p className="mt-4 text-sm font-medium text-stone-500">Ekibimiz en kısa sürede size dönüş yapacaktır.</p>
                   <button 
                     onClick={() => setSubmitted(false)}
                     className="mt-10 rounded-full border-2 border-black bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-stone-900 hover:bg-stone-50"
                   >
                     Yeni Mesaj
                   </button>
                </div>
              )}
           </div>
        </section>
      </div>
    </main>
  );
}
