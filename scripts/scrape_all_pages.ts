import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = "https://sunix.com.tr";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const manualCategories = [
  { url: "https://sunix.com.tr/kategori/akilli-saat", dbSlug: "akilli-saat" },
  { url: "https://sunix.com.tr/kategori/arac-telefon-tutucu", dbSlug: "arac-telefon-tutucu" },
  { url: "https://sunix.com.tr/kategori/arac-sarj-fm-modulator", dbSlug: "arac-sarj-fm-modulator" },
  { url: "https://sunix.com.tr/kategori/bluetooth-kulaklik", dbSlug: "bluetooth-kulaklik" },
  { url: "https://sunix.com.tr/kategori/cevirici", dbSlug: "cevirici" },
  { url: "https://sunix.com.tr/kategori.php?id=19", dbSlug: "depolamasd-urunleri", queryParam: "&sayfa=" },
  { url: "https://sunix.com.tr/kategori/diger-aksesuarlar", dbSlug: "diger-aksesuarlar" },
  { url: "https://sunix.com.tr/kategori/ekran-koruyucu", dbSlug: "ekran-koruyucu" },
  { url: "https://sunix.com.tr/kategori/hoparlor", dbSlug: "hoparlor" },
  { url: "https://sunix.com.tr/kategori/kablo", dbSlug: "kablo" },
  { url: "https://sunix.com.tr/kategori/sarj-aleti", dbSlug: "sarj-aleti" },
  { url: "https://sunix.com.tr/kategori/tasinabilir-pil", dbSlug: "tasinabilir-pil" },
  { url: "https://sunix.com.tr/kategori.php?id=16", dbSlug: "lensler", queryParam: "&sayfa=" },
  { url: "https://sunix.com.tr/kategori.php?id=18", dbSlug: "kablolu-kulaklik", queryParam: "&sayfa=" }
];

async function scrapeProductsForCategory(categoryUrl: string, dbCategoryId: string, queryParam: string = "?sayfa=") {
  let products: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const pageUrl = page === 1 ? categoryUrl : `${categoryUrl}${queryParam}${page}`;
    console.log(`Ziyaret ediliyor: ${pageUrl}`);
    
    try {
      const response = await axios.get(pageUrl);
      const $ = cheerio.load(response.data);
      
      const pageProducts: any[] = [];
      
      $(".th-product-card").each((i, el) => {
        const href = $(el).attr("href");
        let slug = href?.replace("/urun/", "") || `sunix-urun-${Date.now()}-${i}`;
        
        const name = $(el).find(".th-product-card__name").text().trim();
        const imgDataSrc = $(el).find("img").attr("data-src");
        const imgSrc = $(el).find("img").attr("src");
        const img = imgDataSrc || imgSrc || "https://placehold.co/600x600/f5f5f4/a8a29e?text=" + encodeURIComponent(name);

        if (name) {
          pageProducts.push({
            name,
            slug,
            image: img.startsWith("http") ? img : BASE_URL + img,
            categoryId: dbCategoryId,
            description: `${name} - Sunix premium kalitesi ve garantisiyle.`,
            price: 500,
            stock: 100,
          });
        }
      });

      if (pageProducts.length === 0) {
        hasMore = false;
      } else {
        products.push(...pageProducts);
        // Eğer sayfadaki ürün sayısı 24'ten azsa, son sayfadayız demektir
        if (pageProducts.length < 24) {
           hasMore = false;
        } else {
           page++;
        }
      }
    } catch (error) {
      console.error(`Hata oluştu (${pageUrl}):`, error.message);
      hasMore = false;
    }
    
    await delay(500);
  }

  return products;
}

async function main() {
  console.log("Kapsamlı kurtarma operasyonu (Sayfalama destekli) başlıyor...");
  let totalAdded = 0;

  for (const cat of manualCategories) {
    const dbCat = await prisma.category.findUnique({
      where: { slug: cat.dbSlug },
    });

    if (!dbCat) {
      console.log(`Kategori bulunamadı DB'de: ${cat.dbSlug}. Atlanıyor.`);
      continue;
    }

    const products = await scrapeProductsForCategory(cat.url, dbCat.id, cat.queryParam);
    console.log(`Kategori '${cat.dbSlug}' için TOPLAM ${products.length} ürün bulundu.`);

    for (const prodData of products) {
      try {
        const product = await prisma.product.upsert({
          where: { slug: prodData.slug },
          update: {},
          create: {
            categoryId: prodData.categoryId,
            name: prodData.name,
            slug: prodData.slug,
            description: prodData.description,
            brand: "Sunix",
            active: true,
          },
        });

        const variantSlug = `${prodData.slug}-v1`;
        const variant = await prisma.productVariant.upsert({
          where: { id: variantSlug },
          update: {},
          create: {
            id: variantSlug,
            productId: product.id,
            sku: `SNX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            color: "Standart",
            price: new Prisma.Decimal(prodData.price),
            stock: prodData.stock,
            active: true,
          },
        });

        const exists = await prisma.productImage.findFirst({
           where: { productId: product.id, url: prodData.image }
        });
        
        if (!exists) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              url: prodData.image,
              order: 0,
            },
          });
        }

        totalAdded++;
      } catch (err) {
        console.error(`Ürün eklenirken hata: ${prodData.name}`, err.message);
      }
    }
  }

  console.log(`\nOperasyon Tamamlandı! Tüm sayfalar tarandı ve ürünler veritabanına eklendi/güncellendi.`);
  const finalCount = await prisma.product.count();
  console.log(`Veritabanındaki Toplam Ürün Sayısı: ${finalCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
