"use client";

import { motion } from "framer-motion";

type VariantOption = {
  value: string;
  inStock?: boolean;
};

type VariantSelectorProps = {
  label: string;
  options: (string | VariantOption)[];
  selected: string;
  onChange: (value: string) => void;
  type?: "color" | "text";
};

// Daha geniş ve doğru renk skalası
const colorMap: Record<string, string> = {
  "Siyah": "#1a1a1a",
  "Beyaz": "#f5f5f7",
  "Gümüş": "#e3e4e5",
  "Altın": "#f5e1c8",
  "Mavi": "#215e7c",
  "Yeşil": "#4f5a52",
  "Kırmızı": "#a50011",
  "Uzay Grisi": "#535150",
  "Titanyum": "#878681",
  "Naturel": "#bab5a1",
  "Gece Yarısı": "#1d2327",
  "Yıldız Işığı": "#faf7f2",
  "Mavi Titanyum": "#444e5e",
  "Siyah Titanyum": "#3c3c3d",
  "Beyaz Titanyum": "#f2f2f2",
  "Naturel Titanyum": "#bebbb4",
};

export function VariantSelector({
  label,
  options,
  selected,
  onChange,
  type = "text",
}: VariantSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</p>
        <p className="text-[10px] font-bold text-stone-900 uppercase tracking-tighter">{selected}</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const inStock = typeof opt === "string" ? true : opt.inStock !== false;
          const isActive = selected === value;
          const colorHex = type === "color" ? colorMap[value] || "#ccc" : null;

          return (
            <motion.button
              key={value}
              whileHover={inStock ? { y: -2 } : {}}
              whileTap={inStock ? { scale: 0.95 } : {}}
              onClick={() => inStock && onChange(value)}
              disabled={!inStock}
              className={`group relative flex items-center justify-center transition-all duration-500 ${
                type === "color" 
                  ? "h-14 w-14 rounded-full" 
                  : "min-w-[4rem] rounded-2xl px-6 py-4"
              } border ${
                isActive
                  ? "border-black bg-white shadow-2xl shadow-stone-200 ring-4 ring-black/5"
                  : !inStock
                  ? "border-stone-100 bg-stone-50/50 opacity-40 cursor-not-allowed"
                  : "border-stone-100 bg-white hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {type === "color" && (
                  <div 
                    className="h-4 w-4 rounded-full border border-stone-200 shadow-inner" 
                    style={{ backgroundColor: colorHex || "#ccc" }}
                  />
                )}
                {type === "text" && (
                  <span className={`text-xs font-black uppercase tracking-tighter ${isActive ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"}`}>
                    {value}
                  </span>
                )}
              </div>

              {isActive && (
                <motion.div 
                  layoutId={`${label}-active`}
                  className={`absolute inset-0 border-2 border-black ${type === "color" ? "rounded-full" : "rounded-2xl"}`}
                />
              )}
              
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-px w-8 bg-stone-300 rotate-45" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
