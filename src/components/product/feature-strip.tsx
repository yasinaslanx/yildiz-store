export function FeatureStrip() {
  const items = [
    {
      title: "Hızlı Kargo",
      text: "Saat 16'ya kadar verilen siparişler aynı gün kargoda.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
          <rect x="9" y="11" width="14" height="10" rx="2"/>
          <circle cx="12" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
        </svg>
      ),
    },
    {
      title: "Güvenli Ödeme",
      text: "256-bit SSL ve 3D Secure ile korunan ödeme altyapısı.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      ),
    },
    {
      title: "Taksit İmkanı",
      text: "Tüm kredi kartlarına vade farksız taksit seçenekleri.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      title: "Orijinal Ürün",
      text: "%100 Orijinal ürün ve resmi distribütör garantisi.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="border-y-2 border-stone-100 bg-white">
      <div className="mx-auto max-w-[1440px] divide-x-2 divide-stone-100 grid md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="group flex items-center gap-5 px-10 py-10 hover:bg-stone-50 transition-all duration-300 cursor-default border-b-4 border-transparent hover:border-stone-900"
          >
            <div className="flex-shrink-0 h-14 w-14 rounded-2xl border-2 border-stone-200 bg-stone-50 group-hover:border-stone-900 group-hover:bg-white flex items-center justify-center text-stone-600 group-hover:text-stone-900 transition-all duration-300">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight text-stone-900">{item.title}</p>
              <p className="mt-1 text-[11px] font-bold text-stone-400 leading-snug">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}