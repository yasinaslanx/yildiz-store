"use client";

import { useState } from "react";
import { ChevronDown, Truck, RotateCcw, ShieldCheck, Box, CreditCard, CheckCircle2 } from "lucide-react";

type SectionProps = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
};

function AccordionSection({ title, children, icon, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-10 text-left outline-none transition-all group"
      >
        <div className="flex items-center gap-6">
          {icon && <div className="text-stone-400 group-hover:text-stone-900 transition-colors">{icon}</div>}
          <h3 className="text-2xl font-black uppercase tracking-tighter text-stone-900 leading-none italic">
            {title}
          </h3>
        </div>
        <ChevronDown 
          className={`h-6 w-6 text-stone-300 transition-transform duration-500 ease-out ${isOpen ? "rotate-180 text-stone-900" : ""}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[1000px] pb-12 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="text-stone-500 text-sm font-medium leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ProductInfoSections({ product }: { product: any }) {
  // Kategoriye göre teknik özellikleri belirle
  const getTechnicalSpecs = () => {
    const categorySlug = product.category?.slug;

    if (categorySlug === "phones") {
      return [
        { label: "Ekran", value: "Yüksek Çözünürlüklü Ekran" },
        { label: "İşlemci", value: "Gelişmiş Mobil Çip" },
        { label: "Kamera", value: "Profesyonel Kamera Sistemi" },
        { label: "Bağlantı", value: "5G Desteği" },
        { label: "Suya Dayanıklılık", value: "IP68" },
      ];
    }

    if (categorySlug === "phone-accessories" || product.name.toLowerCase().includes("power bank")) {
      return [
        { label: "Kapasite", value: "Yüksek Kapasiteli Batarya" },
        { label: "Giriş Portu", value: "USB-C" },
        { label: "Çıkış Portu", value: "USB-C / USB-A" },
        { label: "Hızlı Şarj", value: "PD 3.0 Desteği" },
        { label: "Güvenlik", value: "Çok Katmanlı Koruma" },
      ];
    }

    if (categorySlug === "computers") {
      return [
        { label: "İşlemci", value: "Yüksek Performanslı İşlemci" },
        { label: "Bellek", value: "Hızlı DDR Bellek" },
        { label: "Depolama", value: "Yüksek Hızlı SSD" },
        { label: "Ekran", value: "Canlı Renkler & Yüksek Çözünürlük" },
        { label: "Batarya Ömrü", value: "Uzun Süreli Kullanım" },
      ];
    }

    return [
      { label: "Kalite", value: "Premium Malzeme" },
      { label: "Garanti", value: "2 Yıl Distribütör" },
      { label: "Durum", value: "Sıfır Ürün" },
    ];
  };

  // Kategoriye göre kutu içeriğini belirle
  const getBoxContent = () => {
    const nameLower = product.name.toLowerCase();
    
    if (nameLower.includes("iphone")) {
      return ["iPhone", "USB-C Şarj Kablosu", "Belgeler", "SIM İğnesi"];
    }
    if (nameLower.includes("samsung") && product.category?.slug === "phones") {
      return ["Samsung Galaxy", "USB-C Kablo", "Hızlı Başlangıç Kılavuzu", "SIM İğnesi"];
    }
    if (nameLower.includes("macbook")) {
      return ["MacBook", "Güç Adaptörü", "USB-C Şarj Kablosu", "Kullanım Kılavuzu"];
    }
    if (nameLower.includes("power bank")) {
      return ["Power Bank", "USB-C Şarj Kablosu", "Taşıma Kılıfı", "Kullanım Kılavuzu"];
    }
    if (nameLower.includes("sony") || nameLower.includes("buds") || nameLower.includes("airpods")) {
      return ["Kulaklık", "Şarj Kutusu (varsa)", "Şarj Kablosu", "Yedek Silikonlar"];
    }
    
    return [product.name, "Şarj Kablosu", "Garanti Belgesi", "Kullanım Kılavuzu"];
  };

  const specs = getTechnicalSpecs();
  const boxContent = getBoxContent();

  return (
    <div className="mt-20 lg:mt-32 space-y-20 lg:space-y-32">
      {/* 1. Güven & Öne Çıkanlar Barı */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Truck className="h-6 w-6" />, title: "Ücretsiz Kargo", desc: "Tüm siparişlerde geçerli" },
          { icon: <RotateCcw className="h-6 w-6" />, title: "14 Gün İade", desc: "Koşulsuz iade garantisi" },
          { icon: <CreditCard className="h-6 w-6" />, title: "Taksit Seçenekleri", desc: "Tüm kartlara 12 taksit" },
          { icon: <ShieldCheck className="h-6 w-6" />, title: "Orijinal Ürün", desc: "Resmi distribütör garantili" },
        ].map((item, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[2.5rem] bg-stone-50/50 border border-stone-100 p-8 transition-all hover:bg-stone-50 hover:shadow-2xl hover:shadow-stone-100">
            <div className="text-stone-900 mb-6 transition-transform group-hover:scale-110 duration-500">{item.icon}</div>
            <h4 className="text-sm font-black uppercase tracking-widest text-stone-900 italic">{item.title}</h4>
            <p className="mt-2 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_0.4fr] gap-20">
        {/* Sol Taraf: Özellikler & Bilgiler */}
        <div className="space-y-4">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-stone-900 italic">Ürün Bilgileri</h2>
            <div className="h-px flex-1 bg-stone-100" />
          </div>

          <AccordionSection 
            title="Teknik Özellikler" 
            icon={<Box className="h-6 w-6" />}
            defaultOpen={true}
          >
            <div className="divide-y divide-stone-50 border-t border-stone-50">
              {specs.map((spec, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-6 group hover:bg-stone-50/30 transition-colors px-4 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 group-hover:text-stone-900 transition-colors mb-2 sm:mb-0">
                    {spec.label}
                  </span>
                  <span className="text-sm font-black text-stone-900 uppercase tracking-tighter italic">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Kutu İçeriği" icon={<Box className="h-6 w-6" />}>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
              {boxContent.map((item, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 group-hover:bg-stone-900 transition-colors">
                     <CheckCircle2 className="h-4 w-4 text-stone-400 group-hover:text-white" />
                  </div>
                  <span className="text-xs font-black text-stone-900 uppercase tracking-tight italic">{item}</span>
                </li>
              ))}
            </ul>
          </AccordionSection>


          <AccordionSection title="Teslimat & İade" icon={<Truck className="h-6 w-6" />}>
            <div className="space-y-6 p-4">
               <p className="text-sm font-medium text-stone-500 leading-relaxed italic border-l-4 border-stone-100 pl-6">
                 Siparişiniz, ödeme onayından sonra <span className="text-stone-900 font-black">24 saat içinde</span> kargoya verilir. 
                 Teslimat süresi bulunduğunuz bölgeye göre 1-3 iş günü arasında değişebilir.
               </p>
               <p className="text-sm font-medium text-stone-500 leading-relaxed italic border-l-4 border-stone-100 pl-6">
                 Ürünü teslim aldığınız tarihten itibaren <span className="text-stone-900 font-black">14 gün içerisinde</span> orijinal kutusu ve tüm aksesuarları ile birlikte 
                 koşulsuz iade edebilirsiniz.
               </p>
            </div>
          </AccordionSection>
        </div>

        {/* Sağ Taraf: Güven Kartı */}
        <div className="h-fit lg:sticky lg:top-32">
          <div className="rounded-[3rem] bg-stone-900 p-10 text-white shadow-2xl shadow-stone-200 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <ShieldCheck className="h-32 w-32" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Güvenli Alışveriş</h3>
                <p className="mt-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">
                  YıldızStore üzerinden yapacağınız tüm işlemler <span className="text-white">SSL sertifikası</span> ile uçtan uca korunmaktadır.
                </p>
              </div>

              <div className="space-y-6">
                 {[
                   "Resmi Distribütör Garantisi",
                   "Aynı Gün Kargo Desteği",
                   "Mağazadan Teslimat Seçeneği"
                 ].map((text, i) => (
                   <div key={i} className="flex items-center gap-4">
                     <div className="h-1.5 w-1.5 rounded-full bg-stone-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-stone-100">{text}</span>
                   </div>
                 ))}
              </div>

              <button className="w-full bg-white text-stone-900 rounded-full py-6 text-xs font-black uppercase tracking-[0.2em] hover:bg-stone-100 transition active:scale-95 shadow-xl">
                Bize Ulaşın
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
