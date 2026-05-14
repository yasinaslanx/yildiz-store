"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
      <Link 
        href="/" 
        className="flex items-center gap-2 transition hover:text-stone-900"
      >
        <Home size={12} />
        <span>Ana Sayfa</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <ChevronRight size={10} className="text-stone-200" />
          {item.href ? (
            <Link 
              href={item.href}
              className="transition hover:text-stone-900"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-stone-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
