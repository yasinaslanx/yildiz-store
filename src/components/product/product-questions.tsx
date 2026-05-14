"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronDown, ChevronUp, User, ShieldCheck, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";

type Question = {
  id: string;
  question: string;
  answer: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export function ProductQuestions({ 
  productSlug, 
  productId 
}: { 
  productSlug: string; 
  productId: string 
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [productSlug]);

  async function fetchQuestions() {
    try {
      const res = await fetch(`/api/products/${productSlug}/questions`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || newQuestion.length < 10) {
      toast.error("Lütfen en az 10 karakterlik bir soru girin.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Sorunuz iletildi! Admin onayından sonra görünecektir.");
        setNewQuestion("");
        setShowForm(false);
      } else {
        toast.error(data.message || "Bir hata oluştu.");
      }
    } catch (error) {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-100 pb-10">
        <div className="flex items-center gap-4">
           <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-900">
              <HelpCircle className="h-7 w-7" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-stone-900 tracking-tighter uppercase italic">Soru & Cevap</h2>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Ürün hakkında merak ettiklerinizi sorun</p>
           </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-stone-900 px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-stone-800 active:scale-95 shadow-xl shadow-stone-200"
        >
          {showForm ? "Vazgeç" : "Soru Sor"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="rounded-[2.5rem] bg-stone-50 p-10 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-4">Sorunuz</label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ürün hakkında neyi merak ediyorsunuz? (Örn: Stok durumu, teknik özellikler...)"
                  className="w-full rounded-3xl border-none bg-white p-8 text-sm focus:ring-2 focus:ring-stone-900 min-h-[150px] shadow-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-3 rounded-full bg-stone-900 px-12 py-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-50"
                >
                  {submitting ? "Gönderiliyor..." : "Soru Gönder"}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-[2.5rem] bg-stone-50 animate-pulse" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-stone-100 p-20 text-center">
             <MessageCircle className="mx-auto h-12 w-12 text-stone-200 mb-6" />
             <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Henüz soru sorulmamış.</p>
             <p className="text-[10px] text-stone-300 uppercase tracking-widest mt-2 font-medium">İlk soruyu siz soran olun!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {questions.map((q) => (
              <div key={q.id} className="group relative rounded-[2.5rem] border border-stone-100 bg-white p-10 transition hover:border-stone-900">
                 <div className="space-y-8">
                    {/* Soru */}
                    <div className="flex gap-6">
                       <div className="flex-shrink-0 h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-stone-400" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-4">
                             <p className="text-xs font-black text-stone-900 uppercase">{q.user.firstName} {q.user.lastName[0]}.</p>
                             <div className="h-1 w-1 rounded-full bg-stone-200" />
                             <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                               {new Date(q.createdAt).toLocaleDateString("tr-TR")}
                             </p>
                          </div>
                          <p className="text-sm font-medium text-stone-600 leading-relaxed">{q.question}</p>
                       </div>
                    </div>

                    {/* Cevap */}
                    {q.answer && (
                      <div className="relative ml-16 rounded-3xl bg-stone-50 p-8">
                         <div className="absolute -left-3 top-6 h-6 w-6 rotate-45 bg-stone-50" />
                         <div className="space-y-3">
                            <div className="flex items-center gap-2 text-stone-900">
                               <ShieldCheck className="h-4 w-4" />
                               <p className="text-[9px] font-black uppercase tracking-widest italic">YıldızStore Yanıtı</p>
                            </div>
                            <p className="text-sm font-bold text-stone-900 leading-relaxed italic">{q.answer}</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
