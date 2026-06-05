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

// Generate a slug from text
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

async function scrapeCategories() {
  console.log("Sunix anasayfasından kategoriler çekiliyor...");
  const response = await axios.get(BASE_URL);
  const $ = cheerio.load(response.data);

  const categoryLinks: { url: string; title: string; slug: string }[] = [];

  $(".th-megadrawer__grid a.th-megadrawer__item").each((i, el) => {
    const href = $(el).attr("href");
    const title = $(el).find(".th-megadrawer__item-title").text().trim();
    if (href && title && title !== "Yeni Ürünler") {
      categoryLinks.push({
        url: href.startsWith("http") ? href : BASE_URL + href,
        title,
        slug: slugify(title),
      });
    }
  });

  return categoryLinks;
}

async function scrapeProductsForCategory(categoryUrl: string, dbCategoryId: string) {
  console.log(`Ziyaret ediliyor: ${categoryUrl}`);
  try {
    const response = await axios.get(categoryUrl);
    const $ = cheerio.load(response.data);

    const products: any[] = [];

    $(".th-product-card").each((i, el) => {
      const href = $(el).attr("href");
      let slug = href?.replace("/urun/", "") || `sunix-urun-${Date.now()}-${i}`;
      
      const name = $(el).find(".th-product-card__name").text().trim();
      const imgDataSrc = $(el).find("img").attr("data-src");
      const imgSrc = $(el).find("img").attr("src");
      const img = imgDataSrc || imgSrc || "https://placehold.co/600x600/f5f5f4/a8a29e?text=Resim+Yok";

      if (name) {
        products.push({
          name,
          slug,
          image: img.startsWith("http") ? img : BASE_URL + img,
          categoryId: dbCategoryId,
          description: `${name} - Sunix premium kalitesi ve garantisiyle.`,
          price: 500, // Varsayılan fiyat
          stock: 100, // Varsayılan stok
        });
      }
    });

    return products;
  } catch (error) {
    console.error(`Hata oluştu (${categoryUrl}):`, error.message);
    return [];
  }
}

async function main() {
  console.log("Kurtarma operasyonu başlıyor...");
  let totalAdded = 0;

  const categories = await scrapeCategories();
  console.log(`${categories.length} adet kategori bulundu.`);

  for (const cat of categories) {
    // Veritabanında kategoriyi bul (az önce restore ettik)
    const dbCat = await prisma.category.findFirst({
      where: { name: cat.title },
    });

    if (!dbCat) {
      console.log(`Kategori bulunamadı DB'de: ${cat.title}. Atlanıyor.`);
      continue;
    }

    const products = await scrapeProductsForCategory(cat.url, dbCat.id);
    console.log(`Kategori '${cat.title}' için ${products.length} ürün bulundu.`);

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

        // Varyant ekle
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

        // Resim ekle
        await prisma.productImage.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            url: prodData.image,
            order: 0,
          },
        });

        totalAdded++;
      } catch (err) {
        console.error(`Ürün eklenirken hata: ${prodData.name}`, err.message);
      }
    }

    // Siteyi yormamak için kısa bekleme
    await delay(1000);
  }

  console.log(`\nOperasyon Tamamlandı! Toplam ${totalAdded} ürün başarıyla veritabanına eklendi.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
