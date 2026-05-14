"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  CheckCircle2, 
  Clock, 
  Search, 
  Trash2, 
  MessageSquare, 
  ExternalLink,
  Loader2,
  Check,
  X,
  Edit2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isVerifiedPurchase: boolean;
  adminReply: string | null;
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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  async function fetchReviews() {
    try {
      setLoading(true);
      let url = `/api/admin/reviews`;
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);
      
      const res = await fetch(`${url}?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      toast.error("Yorumlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: string, adminReply?: string) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, adminReply }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Güncellendi");
        setEditingReview(null);
        fetchReviews();
      }
    } catch (err) {
      toast.error("Hata oluştu.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Silindi");
        fetchReviews();
      }
    } catch (err) {
      toast.error("Silinemedi.");
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-stone-900 italic">Yorum Yönetimi</h1>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">Müşteri geri bildirimlerini yönetin</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input 
                type="text"
                placeholder="Ara (Ürün, E-posta, Yorum)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchReviews()}
                className="pl-12 pr-6 py-3 bg-white border border-stone-100 rounded-full text-xs font-bold outline-none focus:border-stone-900 transition min-w-[300px]"
              />
           </div>

           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="px-6 py-3 bg-white border border-stone-100 rounded-full text-xs font-bold outline-none cursor-pointer focus:border-stone-900 transition"
           >
              <option value="ALL">TÜMÜ</option>
              <option value="PENDING">BEKLEYENLER</option>
              <option value="APPROVED">ONAYLANANLAR</option>
              <option value="REJECTED">REDDEDİLENLER</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-stone-200" />
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-stone-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/4 space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Müşteri</p>
                      <p className="text-sm font-black text-stone-900 uppercase italic">{review.user.firstName} {review.user.lastName}</p>
                      <p className="text-[10px] font-bold text-stone-400 lowercase">{review.user.email}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ürün</p>
                      <Link 
                        href={`/products/${review.product.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-2"
                      >
                        {review.product.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      {review.isVerifiedPurchase && (
                        <div className="bg-stone-900 text-white p-1 rounded-full" title="Satın Aldı">
                           <Check className="h-2 w-2" />
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                        review.status === "APPROVED" ? "bg-green-50 text-green-600" :
                        review.status === "REJECTED" ? "bg-red-50 text-red-600" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {review.status === "APPROVED" ? "ONAYLANDI" : review.status === "REJECTED" ? "REDDEDİLDİ" : "ONAY BEKLİYOR"}
                      </span>
                      <p className="text-[10px] font-bold text-stone-400 uppercase">
                        {format(new Date(review.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                      </p>
                   </div>

                   <div className="space-y-2">
                      {review.title && <h4 className="text-sm font-black uppercase italic text-stone-900">{review.title}</h4>}
                      <p className="text-sm font-medium text-stone-500 leading-relaxed">{review.comment}</p>
                   </div>

                   {review.adminReply && (
                     <div className="mt-6 bg-stone-50 rounded-2xl p-6 border border-stone-100 relative">
                        <MessageSquare className="absolute -left-3 -top-3 h-8 w-8 text-stone-200 fill-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 italic">Sizin Yanıtınız</p>
                        <p className="text-xs font-bold text-stone-600 italic">"{review.adminReply}"</p>
                     </div>
                   )}
                </div>

                <div className="lg:w-48 flex lg:flex-col gap-3 justify-center">
                   {review.status !== "APPROVED" && (
                     <button 
                       onClick={() => handleStatusUpdate(review.id, "APPROVED")}
                       className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-full py-3 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition"
                     >
                       <Check className="h-3 w-3" /> Onayla
                     </button>
                   )}
                   {review.status !== "REJECTED" && (
                     <button 
                       onClick={() => handleStatusUpdate(review.id, "REJECTED")}
                       className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-full py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition"
                     >
                       <X className="h-3 w-3" /> Reddet
                     </button>
                   )}
                   <button 
                     onClick={() => {
                       setEditingReview(review);
                       setReplyContent(review.adminReply || "");
                     }}
                     className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white rounded-full py-3 text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition"
                   >
                     <Edit2 className="h-3 w-3" /> Yanıtla
                   </button>
                   <button 
                     onClick={() => handleDelete(review.id)}
                     className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-100 text-stone-400 rounded-full py-3 text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition"
                   >
                     <Trash2 className="h-3 w-3" /> Sil
                   </button>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-32 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-100">
               <MessageSquare className="h-16 w-16 text-stone-200 mx-auto mb-6" />
               <p className="text-sm font-black uppercase tracking-widest text-stone-400 italic">Yorum bulunamadı</p>
            </div>
          )}
        </div>
      )}

      {/* Edit/Reply Modal */}
      <AnimatePresence>
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Yorumu Yönet</h2>
                    <button onClick={() => setEditingReview(null)} className="p-2 hover:bg-stone-100 rounded-full transition"><X className="h-6 w-6" /></button>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 italic">Admin Yanıtı</p>
                       <textarea 
                         value={replyContent}
                         onChange={(e) => setReplyContent(e.target.value)}
                         rows={4}
                         placeholder="Müşteriye yanıt yazın..."
                         className="w-full bg-stone-50 border border-stone-100 rounded-3xl px-6 py-6 text-xs font-bold focus:bg-white focus:border-stone-900 outline-none transition resize-none"
                       />
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={() => {
                           if (editingReview) {
                             handleStatusUpdate(editingReview.id, editingReview.status, replyContent);
                           }
                         }}
                         className="flex-1 bg-stone-900 text-white rounded-full py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition"
                       >
                         Kaydet ve Yanıtla
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
