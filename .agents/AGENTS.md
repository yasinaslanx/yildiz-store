# Yildizstore Proje Kuralları

## Buton ve Tıklanabilir Kart Stilleri

Bu projede (yildizstore) buton ve tıklanabilir kart stillerinde **asla** `bg-stone-900` veya koyu arka plan kullanma. Admin panelinin arka planı koyu/siyah olduğu için siyah buton üzerinde görünmez.

**Her zaman şu stili kullan:**
- Normal: `bg-white text-stone-900 border-2 border-stone-900`
- Hover: `hover:bg-stone-100`
- Animasyon: `hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200`
- Cursor: `cursor-pointer`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

**Yasak:** `bg-stone-900`, `hover:bg-stone-700`, `hover:bg-stone-800` buton/kart arka planı olarak kullanmak.
