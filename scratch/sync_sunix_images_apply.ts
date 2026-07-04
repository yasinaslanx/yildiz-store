import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const htmlPath = 'C:\\Users\\Monster\\ÇALIŞMALARIM\\yildizstore\\yildiz-store\\public\\images\\MySunix - Bayi Portalı.html';
const htmlDir = path.dirname(htmlPath);
const filesDir = path.join(htmlDir, 'MySunix - Bayi Portalı_files');

const destBaseDir = 'C:\\Users\\Monster\\ÇALIŞMALARIM\\yildizstore\\yildiz-store\\public\\images\\products\\sunix';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function normalizeString(str: string) {
  return str.toLocaleLowerCase('tr-TR').replace(/sunix/g, '').replace(/sunİx/g, '').trim();
}

async function main() {
  if (!fs.existsSync(destBaseDir)) {
    fs.mkdirSync(destBaseDir, { recursive: true });
  }

  console.log('Loading HTML...');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const portalProducts: { name: string; src: string; normalized: string; filename: string }[] = [];

  $('.frm-pos-kart-img').each((i, el) => {
    const src = $(el).find('img').attr('src');
    const name = $(el).next('.frm-pos-kart-info').find('.frm-pos-kart-ad').text().trim();
    if (name && src) {
      const filename = path.basename(decodeURIComponent(src));
      portalProducts.push({
        name,
        src,
        filename,
        normalized: normalizeString(name)
      });
    }
  });

  const missingProducts = await prisma.product.findMany({
    where: {
      brand: 'Sunix',
      images: { none: {} }
    }
  });

  let matchCount = 0;
  let copiedCount = 0;

  for (const dbProduct of missingProducts) {
    const dbNorm = normalizeString(dbProduct.name);
    
    // Find best match
    let match = portalProducts.find(p => p.normalized === dbNorm);
    if (!match) {
      match = portalProducts.find(p => dbNorm.includes(p.normalized) || p.normalized.includes(dbNorm));
    }

    if (match) {
      // Create safe filename (remove spaces, special chars)
      const ext = path.extname(match.filename);
      const safeName = 'sunix_' + dbProduct.id + ext;
      const srcPath = path.join(filesDir, match.filename);
      const destPath = path.join(destBaseDir, safeName);

      try {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          copiedCount++;

          // Add to DB
          await prisma.productImage.create({
            data: {
              productId: dbProduct.id,
              url: `/images/products/sunix/${safeName}`,
              order: 0
            }
          });
          matchCount++;
        } else {
          console.log(`[FILE NOT FOUND] ${srcPath}`);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to process ${dbProduct.name}:`, err);
      }
    }
  }

  console.log(`\nBaşarıyla kopyalanan ve DB'ye eklenen görsel sayısı: ${matchCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
