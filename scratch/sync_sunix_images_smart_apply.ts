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

function getProductCode(name: string) {
  const match = name.match(/([a-zA-Z0-9]{2,5}-\d{1,4})/i);
  if (match) return match[1].toLowerCase();
  
  const match2 = name.match(/\b([a-zA-Z]\d{2,3})\b/i);
  if (match2) return match2[1].toLowerCase();
  
  return null;
}

function getTokens(name: string) {
    return normalizeString(name).split(/\s+/).filter(t => t.length > 2);
}

async function main() {
  if (!fs.existsSync(destBaseDir)) {
    fs.mkdirSync(destBaseDir, { recursive: true });
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const portalProducts: any[] = [];

  $('.frm-pos-kart-img').each((i, el) => {
    const src = $(el).find('img').attr('src');
    const name = $(el).next('.frm-pos-kart-info').find('.frm-pos-kart-ad').text().trim();
    if (name && src) {
      const filename = path.basename(decodeURIComponent(src));
      portalProducts.push({
        name,
        src,
        filename,
        normalized: normalizeString(name),
        code: getProductCode(name),
        tokens: getTokens(name)
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
    const dbCode = getProductCode(dbNorm);
    const dbTokens = getTokens(dbProduct.name);
    
    let match = null;

    // 1. Match by code
    if (dbCode) {
        match = portalProducts.find(p => p.code === dbCode);
    }
    
    // 2. Token overlap
    if (!match) {
        let bestMatch = null;
        let maxOverlap = 0;
        
        for (const p of portalProducts) {
            let overlap = 0;
            for (const token of dbTokens) {
                if (p.tokens.includes(token)) overlap++;
            }
            if (overlap > maxOverlap && overlap >= 2) {
                maxOverlap = overlap;
                bestMatch = p;
            }
        }
        if (bestMatch) match = bestMatch;
    }

    if (match) {
      const ext = path.extname(match.filename);
      const safeName = 'sunix_' + dbProduct.id + ext;
      const srcPath = path.join(filesDir, match.filename);
      const destPath = path.join(destBaseDir, safeName);

      try {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          copiedCount++;

          await prisma.productImage.create({
            data: {
              productId: dbProduct.id,
              url: `/images/products/sunix/${safeName}`,
              order: 0
            }
          });
          matchCount++;
        }
      } catch (err) {
        console.error(`[ERROR] Failed to process ${dbProduct.name}:`, err);
      }
    }
  }

  console.log(`\nBaşarıyla kopyalanan ve DB'ye eklenen ek görsel sayısı: ${matchCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
