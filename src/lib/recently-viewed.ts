"use client";

const STORAGE_KEY = "ys_recently_viewed";
const CATEGORY_STORAGE_KEY = "ys_recent_category";
const MAX_ITEMS = 10;

export function addRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;

  const existing = getRecentlyViewed();
  const filtered = existing.filter(id => id !== productId);
  const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentCategory(slug: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORY_STORAGE_KEY, slug);
}

export function getRecentCategory(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CATEGORY_STORAGE_KEY);
}
