"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, MessageSquare, AlertCircle, Loader2, User, CornerDownRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "@/lib/validations/review";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  adminReply: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

type Stats = {
  averageRating: number;
  totalCount: number;
  distribution: { rating: number; _count: { id: number } }[];
};

export function ProductReviews({ productSlug, productId }: { productSlug: string; productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userReviewStatus, setUserReviewStatus] = useState<"NONE" | "PENDING" | "APPROVED">("NONE");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: "",
      comment: ""
    }
  });

  const selectedRating = watch("rating");

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        reset();
        setShowForm(false);
        setUserReviewStatus("PENDING");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Yorum gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
      </div>
    );
  }

  return (
    <div className="mt-32 space-y-20">
      <div className="flex items-center gap-6">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-stone-900 italic">Değerlendirmeler</h2>
        <div className="h-px flex-1 bg-stone-100" />
      </div>

      <div className="grid lg:grid-cols-[0.4fr_1fr] gap-20">
        {/* Left: Stats & Action */}
        <div className="space-y-12">
          <div className="rounded-[3rem] bg-stone-900 p-10 text-white shadow-2xl shadow-stone-200">
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 italic">Ortalama Puan</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-7xl font-black italic">{stats?.averageRating.toFixed(1)}</span>
                <div className="flex flex-col items-start">
                   <div className="flex text-amber-400">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`h-4 w-4 ${i < Math.round(stats?.averageRating || 0) ? "fill-current" : ""}`} />
                     ))}
                   </div>
                   <p className="text-[10px] font-bold text-stone-400 uppercase mt-1">{stats?.totalCount} Yorum</p>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-3">
               {[5, 4, 3, 2, 1].map((rating) => {
                 const count = stats?.distribution.find(d => d.rating === rating)?._count.id || 0;
                 const percentage = stats?.totalCount ? (count / stats.totalCount) * 100 : 0;
                 return (
                   <div key={rating} className="flex items-center gap-4 group">
                      <span className="text-[10px] font-black w-4">{rating}</span>
                      <div className="h-1.5 flex-1 bg-stone-800 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${percentage}%` }}
                           className="h-full bg-white group-hover:bg-amber-400 transition-colors"
                         />
                      </div>
                      <span className="text-[10px] font-bold text-stone-500 w-8">{count}</span>
                   </div>
                 );
               })}
            </div>

            <button 
              onClick={() => setShowForm(!showForm)}
              className="w-full mt-12 bg-white text-stone-900 rounded-full py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-stone-100 transition active:scale-95"
            >
              {showForm ? "Vazgeç" : "Yorum Yaz"}
            </button>
          </div>

          <div className="rounded-3xl border border-stone-100 p-8 space-y-4 bg-stone-50/50">
             <div className="flex items-center gap-3 text-stone-400">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Doğrulanmış Alışveriş</p>
             </div>
             <p className="text-[10px] font-medium text-stone-400 leading-relaxed uppercase">
                Sadece ürünü satın alan kullanıcıların yorumları "Doğrulanmış Alışveriş" rozeti ile gösterilir.
             </p>
          </div>
        </div>

        {/* Right: List & Form */}
        <div className="space-y-12">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-[3rem] border-2 border-stone-900 p-12 bg-white shadow-2xl shadow-stone-100"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Puanınız</p>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setValue("rating", star)}
                          className={`group relative p-2 transition-all ${selectedRating >= star ? "text-amber-400" : "text-stone-200"}`}
                        >
                          <Star className={`h-10 w-10 ${selectedRating >= star ? "fill-current" : ""}`} />
                        </motion.button>
                      ))}
                    </div>
                    {errors.rating && <p className="text-xs font-bold text-red-500 uppercase">{String(errors.rating.message)}</p>}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Başlık (Opsiyonel)</p>
                    <input 
                      {...register("title")}
                      placeholder="Örn: Harika bir ürün"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-xs font-bold focus:bg-white focus:border-stone-900 outline-none transition"
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Yorumunuz</p>
                    <textarea 
                      {...register("comment")}
                      rows={5}
                      placeholder="Ürün hakkındaki deneyimlerinizi paylaşın..."
                      className="w-full bg-stone-50 border border-stone-100 rounded-3xl px-6 py-6 text-xs font-bold focus:bg-white focus:border-stone-900 outline-none transition resize-none"
                    />
                    {errors.comment && <p className="text-xs font-bold text-red-500 uppercase">{String(errors.comment.message)}</p>}
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 text-white rounded-full py-6 text-sm font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Yorumu Gönder"}
                  </button>
                </form>
              </motion.div>
            ) : reviews.length > 0 ? (
              <div className="space-y-12">
                {reviews.map((review, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={review.id} 
                    className="group relative pb-12 border-b border-stone-100 last:border-0"
                  >
                    <div className="flex gap-8">
                       <div className="hidden sm:flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-300">
                             <User className="h-8 w-8" />
                          </div>
                          {review.isVerifiedPurchase && (
                             <div className="bg-stone-900 text-white p-1.5 rounded-full shadow-lg" title="Doğrulanmış Alışveriş">
                                <CheckCircle2 className="h-3 w-3" />
                             </div>
                          )}
                       </div>

                       <div className="flex-1 space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                   <p className="text-sm font-black uppercase tracking-tight text-stone-900 italic">
                                      {review.user.firstName} {review.user.lastName[0]}.
                                   </p>
                                   <div className="flex text-amber-400">
                                      {[...Array(5)].map((_, star) => (
                                        <Star key={star} className={`h-3 w-3 ${star < review.rating ? "fill-current" : ""}`} />
                                      ))}
                                   </div>
                                </div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                   {format(new Date(review.createdAt), "d MMMM yyyy", { locale: tr })}
                                </p>
                             </div>
                          </div>

                          <div className="space-y-3">
                             {review.title && <h4 className="text-base font-black uppercase tracking-tight text-stone-900 italic">{review.title}</h4>}
                             <p className="text-sm font-medium leading-relaxed text-stone-500 max-w-3xl">
                                {review.comment}
                             </p>
                          </div>

                          {review.adminReply && (
                            <div className="mt-8 relative pl-12 pt-6">
                               <CornerDownRight className="absolute left-0 top-6 h-6 w-6 text-stone-300" />
                               <div className="rounded-[2.5rem] bg-stone-50 p-8 border border-stone-100">
                                  <div className="flex items-center gap-3 mb-4">
                                     <span className="bg-stone-900 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">YıldızStore Ekibi</span>
                                  </div>
                                  <p className="text-xs font-bold text-stone-600 leading-relaxed italic">
                                     "{review.adminReply}"
                                  </p>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center rounded-[3rem] border-2 border-dashed border-stone-100">
                 <MessageSquare className="h-16 w-16 text-stone-100" />
                 <div className="space-y-2">
                    <p className="text-lg font-black uppercase tracking-tighter text-stone-900 italic">Henüz yorum yok</p>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">İlk yorumu siz yapmak ister misiniz?</p>
                 </div>
                 <button 
                   onClick={() => setShowForm(true)}
                   className="bg-stone-900 text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition shadow-xl shadow-stone-100"
                 >
                   Hemen Yorum Yaz
                 </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
