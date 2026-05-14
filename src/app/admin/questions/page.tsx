"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MessageCircle, CheckCircle, XCircle, Reply, Trash2, User, Package, Clock, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: string;
  question: string;
  answer: string | null;
  status: "PENDING" | "ANSWERED" | "REJECTED";
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    name: string;
    slug: string;
  };
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      toast.error("Sorular yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(id: string) {
    if (!answerText.trim()) {
      toast.error("Lütfen bir cevap yazın.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText, status: "ANSWERED" }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Cevap başarıyla yayınlandı.");
        setReplyingTo(null);
        setAnswerText("");
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Cevap iletilemedi.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Soru silindi.");
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 space-y-8">
        <div className="h-10 w-64 bg-stone-100 rounded-full animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-[2.5rem] bg-stone-50 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Yönetim Paneli</p>
           <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase italic">Soru Yönetimi</h1>
           <p className="mt-4 text-stone-500 max-w-lg font-medium leading-relaxed">Ürünlere gelen soruları buradan yanıtlayabilir veya silebilirsiniz.</p>
        </div>
      </div>

      <div className="grid gap-8">
        {questions.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-stone-100 p-20 text-center">
             <HelpCircle className="mx-auto h-16 w-16 text-stone-100 mb-6" />
             <p className="text-sm font-black text-stone-300 uppercase tracking-widest">Henüz gelen bir soru yok.</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="group relative rounded-[3rem] border border-stone-100 bg-white p-10 shadow-sm transition hover:shadow-xl">
               <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
                  {/* Sol: Soru ve Cevap Alanı */}
                  <div className="space-y-8">
                     <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center">
                           <MessageCircle className="h-6 w-6 text-stone-900" />
                        </div>
                        <div className="space-y-3">
                           <div className="flex items-center gap-4">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                q.status === "ANSWERED" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                              }`}>
                                {q.status === "ANSWERED" ? "Cevaplandı" : "Bekliyor"}
                              </span>
                              <div className="h-1 w-1 rounded-full bg-stone-200" />
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest italic">{new Date(q.createdAt).toLocaleString("tr-TR")}</p>
                           </div>
                           <p className="text-xl font-black text-stone-900 tracking-tight leading-relaxed italic">"{q.question}"</p>
                        </div>
                     </div>

                     {/* Cevap Bölümü */}
                     {q.answer ? (
                       <div className="ml-16 rounded-3xl bg-stone-50 p-8 border border-stone-100">
                          <div className="flex items-center gap-2 text-stone-900 mb-4">
                             <CheckCircle className="h-4 w-4" />
                             <p className="text-[10px] font-black uppercase tracking-widest italic">YıldızStore Yanıtı</p>
                          </div>
                          <p className="text-sm font-bold text-stone-800 leading-relaxed italic">{q.answer}</p>
                       </div>
                     ) : (
                       replyingTo === q.id ? (
                         <div className="ml-16 space-y-6 animate-in slide-in-from-top-4 duration-500">
                            <textarea
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              placeholder="Cevabınızı buraya yazın..."
                              className="w-full rounded-3xl border-2 border-stone-100 bg-white p-6 text-sm focus:border-stone-900 focus:ring-0 min-h-[120px] transition-all"
                            />
                            <div className="flex gap-3">
                               <button
                                 onClick={() => handleAnswer(q.id)}
                                 className="rounded-full bg-stone-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition"
                               >
                                 Yayınla
                               </button>
                               <button
                                 onClick={() => setReplyingTo(null)}
                                 className="rounded-full bg-stone-100 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:bg-stone-200 transition"
                               >
                                 Vazgeç
                               </button>
                            </div>
                         </div>
                       ) : (
                         <div className="ml-16">
                            <button
                              onClick={() => setReplyingTo(q.id)}
                              className="flex items-center gap-2 rounded-full border-2 border-stone-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-stone-900 hover:bg-stone-900 hover:text-white transition"
                            >
                              <Reply className="h-4 w-4" />
                              Cevapla
                            </button>
                         </div>
                       )
                     )}
                  </div>

                  {/* Sağ: Bilgi Paneli */}
                  <div className="border-t lg:border-t-0 lg:border-l border-stone-100 pt-8 lg:pt-0 lg:pl-10 space-y-8">
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <User className="h-4 w-4 text-stone-400" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{q.user.firstName} {q.user.lastName}</p>
                              <p className="text-[10px] font-medium text-stone-400">{q.user.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <Package className="h-4 w-4 text-stone-400" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 underline underline-offset-4">{q.product.name}</p>
                        </div>
                     </div>

                     <div className="flex justify-end pt-8">
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
