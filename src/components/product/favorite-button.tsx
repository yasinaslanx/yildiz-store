"use client";

import { useFavorites } from "@/store/favorites-store";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FavoriteButtonProps = {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  slug: string;
  image: string;
  price: number;
};

export function FavoriteButton(props: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const active = isFavorite(props.id);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => toggleFavorite(props)}
      className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500 shadow-xl ${
        active
          ? "border-stone-900 bg-stone-900 text-white shadow-stone-900/20"
          : "border-stone-100 bg-white text-stone-300 hover:border-stone-900 hover:text-stone-900 shadow-stone-100"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active ? "active" : "inactive"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Heart 
            className={`h-6 w-6 ${active ? "fill-current" : ""}`} 
            strokeWidth={active ? 0 : 2}
          />
        </motion.div>
      </AnimatePresence>
      
      {active && (
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-stone-900/20"
        />
      )}
    </motion.button>
  );
}
