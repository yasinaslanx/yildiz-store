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

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function normalizeString(str: string) {
  return str.toLocaleLowerCase('tr-TR').replace(/sunix/g, '').replace(/sunİx/g, '').trim();
}

async function main() {
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

  console.log(`Found ${portalProducts.length} products in HTML.`);

  console.log('Fetching products missing images from DB...');
  const missingProducts = await prisma.product.findMany({
    where: {
      brand: 'Sunix',
      images: { none: {} }
    }
  });

  console.log(`Found ${missingProducts.length} missing image products in DB.`);

  let matchCount = 0;
  for (const dbProduct of missingProducts) {
    const dbNorm = normalizeString(dbProduct.name);
    
    // Find best match:
    // 1. Exact normalized match
    let match = portalProducts.find(p => p.normalized === dbNorm);
    
    // 2. Contains match
    if (!match) {
      match = portalProducts.find(p => dbNorm.includes(p.normalized) || p.normalized.includes(dbNorm));
    }

    if (match) {
      console.log(`[MATCH] DB: "${dbProduct.name}" <-> Portal: "${match.name}" (File: ${match.filename})`);
      matchCount++;
    } else {
      // console.log(`[NO MATCH] DB: "${dbProduct.name}"`);
    }
  }

  console.log(`\nTotal matched: ${matchCount} out of ${missingProducts.length}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
