"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export function ImageUpload({ onUploadSuccess, label = "Görsel Yükle" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu çok büyük (Maks 5MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onUploadSuccess(data.url);
        toast.success("Görsel başarıyla yüklendi.");
      } else {
        toast.error(data.message || "Yükleme hatası");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">{label}</label>
       <div className="relative group">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleUpload}
            className="hidden" 
            id={`upload-${label.replace(/\s+/g, '-')}`}
            disabled={uploading}
          />
          <label 
            htmlFor={`upload-${label.replace(/\s+/g, '-')}`}
            className={`flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 px-6 py-4 transition-all hover:border-black hover:bg-white ${uploading ? 'opacity-50' : ''}`}
          >
             {uploading ? (
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-black" />
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
             )}
             <span className="text-xs font-black uppercase tracking-widest text-stone-900">
                {uploading ? "Yükleniyor..." : "Bilgisayardan Seç"}
             </span>
          </label>
       </div>
    </div>
  );
}
