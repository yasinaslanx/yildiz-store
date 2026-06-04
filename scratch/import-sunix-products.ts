import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// CONFIGURATION
const TEST_MODE = false; // Set to true to test with only 5 products first.
const DEFAULT_PRICE = 150.00;
const DEFAULT_STOCK = 50;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

function formatCategoryName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\s*\/\s*/g, " / ")
    .trim();
}

function getUniqueKey(detailUrl: string): string {
  const idMatch = detailUrl.match(/id=(\d+)/);
  if (idMatch) return idMatch[1];

  const friendlyMatch = detailUrl.match(/\/urun\/([^/?#]+)/);
  if (friendlyMatch) return friendlyMatch[1];

  return Math.random().toString(36).substring(7);
}

type ScrapedProduct = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  detailUrl: string;
};

async function scrapeProducts(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];
  const totalPages = TEST_MODE ? 1 : 14;

  console.log(`[Scraper] Toplam ${totalPages} sayfa taranıyor...`);

  for (let page = 1; page <= totalPages; page++) {
    const url = `https://www.sunix.com.tr/kategori?sayfa=${page}`;
    console.log(`[Scraper] Sayfa ${page} yükleniyor...`);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        console.error(`[Scraper] Sayfa ${page} alınamadı: ${response.statusText}`);
        continue;
      }

      const html = await response.text();

      // Match all <a> tags with the class th-product-card
      const cardRegex = /<a\s+[^>]*href="([^"]+)"[^>]*class="[^"]*th-product-card[^"]*"[\s\S]*?<\/a>/gi;
      const matches = [...html.matchAll(cardRegex)];

      for (const match of matches) {
        const cardHtml = match[0];
        const detailUrl = match[1];
        const id = getUniqueKey(detailUrl);

        // Find image URL
        const srcMatch = cardHtml.match(/data-src="([^"]+)"/);
        const imageUrl = srcMatch ? srcMatch[1] : "";

        // Find category
        const catMatch = cardHtml.match(/class="th-product-card__cat">([^<]+)<\/div>/i);
        const category = catMatch ? catMatch[1].trim() : "Genel";

        // Find name
        const nameMatch = cardHtml.match(/class="th-product-card__name">([^<]+)<\/div>/i);
        const name = nameMatch ? nameMatch[1].trim() : "";

        if (name && detailUrl) {
          products.push({
            id,
            name,
            category,
            imageUrl,
            detailUrl: detailUrl.startsWith("http")
              ? detailUrl
              : `https://www.sunix.com.tr${detailUrl}`,
          });
        }
      }
    } catch (err) {
      console.error(`[Scraper] Sayfa ${page} taranırken hata oluştu:`, err);
    }
  }

  console.log(`[Scraper] Toplam ${products.length} ürün listelendi.`);
  return products;
}

async function scrapeProductDetails(
  detailUrl: string
): Promise<{ sku: string; description: string }> {
  try {
    const response = await fetch(detailUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return { sku: "", description: "" };
    }

    const html = await response.text();

    // Ürün Kodu (SKU)
    const skuMatch =
      html.match(/Ürün Kodu:\s*<b>([^<]+)<\/b>/i) ||
      html.match(/prod-code[^>]*>[\s\S]*?<b>([^<]+)<\/b>/i);
    const sku = skuMatch ? skuMatch[1].trim() : "";

    // Desteklenen Modeller
    const modelsMatch =
      html.match(/<div class="prod-models__group">([\s\S]*?)<\/div>/i) ||
      html.match(/<div class="prod-models">([\s\S]*?)<\/div>/i);
    let description = "";

    if (modelsMatch) {
      const listItems =
        modelsMatch[1].match(/<li>([^<]+)<\/li>/gi) ||
        modelsMatch[1].match(/<span>([^<]+)<\/span>/gi) ||
        modelsMatch[1].match(/<div[^>]*>([^<]+)<\/div>/gi);

      if (listItems) {
        const models = listItems
          .map((item) => item.replace(/<[^>]+>/g, "").trim())
          .filter(Boolean);

        if (models.length > 0) {
          description = `Desteklenen Modeller:\n${models.map((m) => `- ${m}`).join("\n")}`;
        }
      } else {
        description = modelsMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
    }

    return { sku, description };
  } catch (err) {
    console.error(`[Scraper] Detay sayfasından veri çekilemedi (${detailUrl}):`, err);
    return { sku: "", description: "" };
  }
}

async function main() {
  console.log(`=== SUNIX IMPORT SCRIPT START === (TEST_MODE: ${TEST_MODE})`);

  const scrapedProducts = await scrapeProducts();
  const productsToImport = TEST_MODE ? scrapedProducts.slice(0, 5) : scrapedProducts;

  console.log(`[Import] ${productsToImport.length} ürün veritabanına aktarılıyor...`);

  let successCount = 0;
  let skippedCount = 0;

  for (const scraped of productsToImport) {
    const slug = `${slugify(scraped.name)}-${scraped.id}`;

    // Ürünün veritabanında zaten var olup olmadığını kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      console.log(`[Import] Atlanıyor: ${scraped.name} (Zaten veritabanında var)`);
      skippedCount++;
      continue;
    }

    console.log(`[Import] Detaylar çekiliyor: ${scraped.name}...`);
    const details = await scrapeProductDetails(scraped.detailUrl);

    // Kategori eşleme / oluşturma
    const categorySlug = slugify(scraped.category);
    const categoryName = formatCategoryName(scraped.category);

    let category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      console.log(`[Import] Yeni kategori oluşturuluyor: ${categoryName}`);
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          description: `${categoryName} kategorisindeki Sunix ürünleri.`,
          image: scraped.imageUrl || null,
          active: true,
        },
      });
    }

    // SKU benzersizliğini sağlama
    let finalSku = details.sku || `SNX-${scraped.id}`;
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: finalSku },
    });

    if (existingVariant) {
      finalSku = `${finalSku}-${scraped.id}`;
    }

    try {
      // Ürün oluşturma (İlişkili tablolarla beraber)
      await prisma.product.create({
        data: {
          name: scraped.name,
          slug: slug,
          description: details.description || `${scraped.name} - Sunix kalitesiyle.`,
          brand: "Sunix",
          categoryId: category.id,
          featured: false,
          active: true,
          images: {
            create: scraped.imageUrl
              ? [
                  {
                    url: scraped.imageUrl,
                    order: 0,
                  },
                ]
              : [],
          },
          variants: {
            create: [
              {
                sku: finalSku,
                color: "Standart",
                price: new Prisma.Decimal(DEFAULT_PRICE),
                stock: DEFAULT_STOCK,
                active: true,
                images: scraped.imageUrl
                  ? {
                      create: [
                        {
                          url: scraped.imageUrl,
                          order: 0,
                        },
                      ],
                    }
                  : undefined,
              },
            ],
          },
        },
      });

      console.log(`[Import] Eklendi: ${scraped.name} (SKU: ${finalSku})`);
      successCount++;
    } catch (dbErr) {
      console.error(`[Import] Ürün eklenirken veritabanı hatası oluştu (${scraped.name}):`, dbErr);
    }
  }

  console.log(`\n=== IMPORT TAMAMLANDI ===`);
  console.log(`Başarılı: ${successCount}`);
  console.log(`Atlanan: ${skippedCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error during execution:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
