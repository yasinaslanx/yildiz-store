export type ProductCategory = "phones" | "phone-accessories" | "audio";

export type ProductVariant = {
  id: string;
  color: string;
  storage?: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  sku: string;
  images: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  featured?: boolean;
  variants: ProductVariant[];
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    brand: "Apple",
    category: "phones",
    featured: true,
    description:
      "Titanyum gövde, güçlü kamera sistemi ve üst düzey performans sunan premium amiral gemisi telefon.",
    variants: [
      {
        id: "p1-v1",
        color: "Blue Titanium",
        storage: "256 GB",
        price: 99999,
        stock: 7,
        sku: "APL-17PM-BLU-256",
        images: [
          "/images/iphone17/blue-1.webp",
          "/images/iphone17/blue-2.webp",
          "/images/iphone17/blue-3.webp",
        ],
      },
      {
        id: "p1-v2",
        color: "Blue Titanium",
        storage: "512 GB",
        price: 109999,
        stock: 5,
        sku: "APL-17PM-BLU-512",
        images: [
          "/images/iphone17/blue-1.webp",
          "/images/iphone17/blue-2.webp",
          "/images/iphone17/blue-3.webp",
        ],
      },
      {
        id: "p1-v3",
        color: "White Titanium",
        storage: "256 GB",
        price: 99999,
        stock: 4,
        sku: "APL-17PM-WHT-256",
        images: [
          "/images/iphone17/white-1.avif",
          "/images/iphone17/white-2.avif",
        ],
      },
      {
        id: "p1-v4",
        color: "Desert Titanium",
        storage: "1 TB",
        price: 124999,
        stock: 3,
        sku: "APL-17PM-DSR-1TB",
        images: [
          "/images/iphone17/desert-1.avif",
          "/images/iphone17/desert-2.avif",
        ],
      },
    ],
  },
  {
    id: "p2",
    slug: "iphone-16-pro-max-kilif",
    name: "iPhone 16 Pro Max Deri Kılıf",
    brand: "Apple",
    category: "phone-accessories",
    description: "Premium yüzeyli, cihaz uyumlu koruyucu deri kılıf.",
    variants: [
      {
        id: "p2-v1",
        color: "Siyah",
        price: 349,
        stock: 20,
        sku: "APL-CSE-16PM-BLK",
        images: ["/images/accessories/case-1.webp"],
      },
    ],
  },
  {
    id: "p3",
    slug: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "audio",
    description: "Gürültü engelleme özellikli premium kulaklık.",
    variants: [
      {
        id: "p3-v1",
        color: "Black",
        price: 3999,
        stock: 12,
        sku: "SNY-XM5-BLK",
        images: ["/images/audio/sony-xm5.webp"],
      },
    ],
  },
];

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter((product) => product.category === category);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
