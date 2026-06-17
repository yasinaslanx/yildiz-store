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
  category: ProductCategory | any;
  description: string;
  featured?: boolean;
  active?: boolean;
  price?: number;
  image?: string;
  stock?: number;
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
        color: "Kozmik Turuncu",
        storage: "256 GB",
        price: 132999,
        stock: 7,
        sku: "IPH17PM-KOZ-256GB",
        images: [
          "/images/iphone17/iphone17promax.avif"
        ],
      },
      {
        id: "p1-v2",
        color: "Gümüş",
        storage: "512 GB",
        price: 146999,
        stock: 5,
        sku: "IPH17PM-GUM-512GB",
        images: [
          "/images/iphone17/İphone17ProMaxBeyaz.avif"
        ],
      },
      {
        id: "p1-v3",
        color: "Derin Mavi",
        storage: "1 TB",
        price: 160999,
        stock: 4,
        sku: "IPH17PM-DER-1TB",
        images: [
          "/images/iphone17/İphone17ProMaxMavi.webp"
        ],
      },
      {
        id: "p1-v4",
        color: "Gümüş",
        storage: "2 TB",
        price: 188999,
        stock: 3,
        sku: "IPH17PM-GUM-2TB",
        images: [
          "/images/iphone17/İphone17ProMaxBeyaz.avif"
        ],
      },
    ],
  },
  {
    id: "p2",
    slug: "iphone-16-pro-max-kilif",
    name: "iPhone 16 Pro Max Deri Kılıf",
    brand: "Apple",
    category: "kilif",
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
  {
    id: "p4",
    slug: "apple-magsafe-sarj-cihazi",
    name: "Apple MagSafe Şarj Cihazı",
    brand: "Apple",
    category: "sarj-aleti",
    description: "Hızlı ve güvenilir kablosuz şarj deneyimi sunan orijinal MagSafe şarj cihazı.",
    variants: [
      {
        id: "p4-v1",
        color: "Beyaz",
        price: 1299,
        stock: 50,
        sku: "APL-MGSF-WHT",
        images: ["https://placehold.co/600x600/f5f5f4/a8a29e?text=MagSafe"],
      },
    ],
  },
  {
    id: "p5",
    slug: "spigen-ekran-koruyucu",
    name: "Spigen Glas.tR EZ Fit Ekran Koruyucu",
    brand: "Spigen",
    category: "ekran-koruyucu",
    description: "Kolay kurulum aparatı ile gelen, çizilmelere karşı ultra dayanıklı kırılmaz cam ekran koruyucu.",
    variants: [
      {
        id: "p5-v1",
        color: "Şeffaf",
        price: 499,
        stock: 100,
        sku: "SPG-GLS-EZ",
        images: ["https://placehold.co/600x600/f5f5f4/a8a29e?text=Ekran+Koruyucu"],
      },
    ],
  },
  {
    id: "p6",
    slug: "anker-20w-hizli-sarj",
    name: "Anker PowerPort III 20W Hızlı Şarj Adaptörü",
    brand: "Anker",
    category: "sarj-aleti",
    description: "Kompakt boyutlu, telefonunuzu ve tabletinizi güvenle şarj edebilen 20W hızlı şarj adaptörü.",
    variants: [
      {
        id: "p6-v1",
        color: "Beyaz",
        price: 349,
        stock: 35,
        sku: "ANK-PPRT-20W",
        images: ["https://placehold.co/600x600/f5f5f4/a8a29e?text=Sarz+Adaptoru"],
      },
    ],
  }
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
