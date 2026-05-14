import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Ek ürünler ekleniyor...");

  const phonesCat = await prisma.category.findUnique({ where: { slug: "phones" } });
  const computersCat = await prisma.category.findUnique({ where: { slug: "computers" } });
  const accessoriesCat = await prisma.category.findUnique({ where: { slug: "phone-accessories" } });

  if (!phonesCat || !computersCat || !accessoriesCat) {
    console.error("Kategoriler bulunamadı. Lütfen önce ana seed dosyasını çalıştırın.");
    return;
  }

  const additionalProducts = [
    // --- TELEFONLAR ---
    {
      categoryId: phonesCat.id,
      name: "iPhone 15",
      slug: "iphone-15",
      brand: "Apple",
      featured: false,
      description: "Gelişmiş çift kamera sistemi, A16 Bionic çip ve gün boyu süren pil ömrü.",
      images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200"],
      variants: [
        { sku: "IPH15-BLACK-128", color: "Siyah", storage: "128 GB", price: 54999, stock: 20, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200" },
        { sku: "IPH15-BLUE-128", color: "Mavi", storage: "128 GB", price: 54999, stock: 15, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200" }
      ]
    },
    {
      categoryId: phonesCat.id,
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      brand: "Samsung",
      featured: false,
      description: "Yapay zeka ile güçlendirilmiş kamera, akıcı ekran ve üstün performans.",
      images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200"],
      variants: [
        { sku: "S24-GRAY-128", color: "Mermer Grisi", storage: "128 GB", price: 42999, stock: 25, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200" }
      ]
    },
    {
      categoryId: phonesCat.id,
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      brand: "Google",
      featured: true,
      description: "En iyi Google deneyimi, Tensor G3 çip ve profesyonel seviye kamera.",
      images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1200"],
      variants: [
        { sku: "PIXEL8PRO-OBSIDIAN", color: "Obsidyen", storage: "256 GB", price: 48000, stock: 10, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1200" }
      ]
    },
    {
      categoryId: phonesCat.id,
      name: "Xiaomi 14 Pro",
      slug: "xiaomi-14-pro",
      brand: "Xiaomi",
      featured: false,
      description: "Leica optik lensler, Snapdragon 8 Gen 3 ve ultra hızlı şarj.",
      images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200"],
      variants: [
        { sku: "XIAOMI14PRO-BLACK", color: "Siyah", storage: "512 GB", price: 45000, stock: 12, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200" }
      ]
    },
    {
      categoryId: phonesCat.id,
      name: "OnePlus 12",
      slug: "oneplus-12",
      brand: "OnePlus",
      featured: false,
      description: "Akıcılığın yeni tanımı, Hasselblad kamera ve devasa pil.",
      images: ["https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=1200"],
      variants: [
        { sku: "OP12-GREEN", color: "Zümrüt Yeşili", storage: "512 GB", price: 39000, stock: 8, image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=1200" }
      ]
    },

    // --- BILGISAYARLAR ---
    {
      categoryId: computersCat.id,
      name: "MacBook Pro M3 Pro 14 inç",
      slug: "macbook-pro-m3-pro-14",
      brand: "Apple",
      featured: true,
      description: "Profesyoneller için en üst düzey performans, M3 Pro çip ve muazzam ekran.",
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200"],
      variants: [
        { sku: "MBP14-M3PRO-SPACEBLACK", color: "Uzay Siyahı", storage: "512 GB SSD", price: 79999, stock: 5, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200" }
      ]
    },
    {
      categoryId: computersCat.id,
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      brand: "Dell",
      featured: true,
      description: "İş ve yaratıcılık için mükemmel denge, OLED ekran ve güçlü grafikler.",
      images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1200"],
      variants: [
        { sku: "XPS15-PLATINUM", color: "Platin Gümüş", storage: "1 TB SSD", price: 65000, stock: 7, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1200" }
      ]
    },
    {
      categoryId: computersCat.id,
      name: "ASUS ROG Zephyrus G14",
      slug: "asus-rog-g14",
      brand: "ASUS",
      featured: false,
      description: "Dünyanın en güçlü 14 inç oyuncu bilgisayarı, hafif ve yüksek performanslı.",
      images: ["https://images.unsplash.com/photo-1544117518-e79632142bb6?q=80&w=1200"],
      variants: [
        { sku: "ROG-G14-WHITE", color: "Beyaz", storage: "1 TB SSD", price: 58000, stock: 4, image: "https://images.unsplash.com/photo-1544117518-e79632142bb6?q=80&w=1200" }
      ]
    },
    {
      categoryId: computersCat.id,
      name: "HP Spectre x360",
      slug: "hp-spectre-x360",
      brand: "HP",
      featured: false,
      description: "Zarafet ve esneklik, 2'si 1 arada tasarım ve üstün batarya ömrü.",
      images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1200"],
      variants: [
        { sku: "SPECTRE-BLUE", color: "Gece Mavisi", storage: "512 GB SSD", price: 52000, stock: 6, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1200" }
      ]
    },
    {
      categoryId: computersCat.id,
      name: "Lenovo Yoga 9i",
      slug: "lenovo-yoga-9i",
      brand: "Lenovo",
      featured: false,
      description: "Üst düzey taşınabilirlik ve ses kalitesi, dönebilir ekran yapısı.",
      images: ["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=1200"],
      variants: [
        { sku: "YOGA9I-GOLD", color: "Yulaf Sarısı", storage: "1 TB SSD", price: 49000, stock: 9, image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=1200" }
      ]
    },

    // --- AKSESUARLAR ---
    {
      categoryId: accessoriesCat.id,
      name: "Apple Watch Series 9",
      slug: "apple-watch-series-9",
      brand: "Apple",
      featured: true,
      description: "Sağlık ve spor için en gelişmiş saat, kanda oksijen ve EKG ölçümü.",
      images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200"],
      variants: [
        { sku: "WATCH9-STARLIGHT-45", color: "Yıldız Işığı", storage: "45mm", price: 16999, stock: 15, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200" }
      ]
    },
    {
      categoryId: accessoriesCat.id,
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      brand: "Sony",
      featured: true,
      description: "Gürültü engellemede dünya lideri, kristal netliğinde ses ve konfor.",
      images: ["https://images.unsplash.com/photo-1670057037305-649069695655?q=80&w=1200"],
      variants: [
        { sku: "WH1000XM5-BLACK", color: "Siyah", storage: null, price: 12499, stock: 20, image: "https://images.unsplash.com/photo-1670057037305-649069695655?q=80&w=1200" }
      ]
    },
    {
      categoryId: accessoriesCat.id,
      name: "Samsung Galaxy Buds2 Pro",
      slug: "galaxy-buds2-pro",
      brand: "Samsung",
      featured: false,
      description: "24 bit Hi-Fi ses, akıllı aktif gürültü engelleme.",
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200"],
      variants: [
        { sku: "BUDS2PRO-GRAPHITE", color: "Grafit", storage: null, price: 5499, stock: 30, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200" }
      ]
    },
    {
      categoryId: accessoriesCat.id,
      name: "Logitech MX Master 3S",
      slug: "logitech-mx-master-3s",
      brand: "Logitech",
      featured: false,
      description: "Verimlilikte son nokta, ergonomik tasarım ve sessiz tıklama.",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200"],
      variants: [
        { sku: "MXMASTER3S-PALEGRAY", color: "Açık Gri", storage: null, price: 3999, stock: 18, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200" }
      ]
    },
    {
      categoryId: accessoriesCat.id,
      name: "Anker 737 Power Bank",
      slug: "anker-737-powerbank",
      brand: "Anker",
      featured: false,
      description: "Laptop şarj edebilen devasa güç, 140W hızlı şarj.",
      images: ["https://images.unsplash.com/photo-1619446210435-02f540702677?q=80&w=1200"],
      variants: [
        { sku: "ANKER737-BLACK", color: "Siyah", storage: "24000 mAh", price: 4499, stock: 10, image: "https://images.unsplash.com/photo-1619446210435-02f540702677?q=80&w=1200" }
      ]
    }
  ];

  for (const productData of additionalProducts) {
    // Önce ürünün var olup olmadığını kontrol et
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (existing) {
      console.log(`Atlanıyor: ${productData.name} (Zaten var)`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        categoryId: productData.categoryId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        brand: productData.brand,
        featured: productData.featured,
        active: true,
      },
    });

    await prisma.productImage.createMany({
      data: productData.images.map((url, index) => ({
        productId: product.id,
        url,
        order: index,
      })),
    });

    for (const variantData of productData.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantData.sku,
          color: variantData.color,
          storage: variantData.storage,
          price: new Prisma.Decimal(variantData.price),
          stock: variantData.stock,
          active: true,
        },
      });

      await prisma.productImage.create({
        data: {
          variantId: variant.id,
          url: variantData.image,
          order: 0,
        },
      });
    }
    console.log(`Eklendi: ${productData.name}`);
  }

  console.log("Tüm ürünler başarıyla eklendi.");
}

main()
  .catch((error) => {
    console.error("Hata:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
