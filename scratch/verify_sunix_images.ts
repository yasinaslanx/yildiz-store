import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const destBaseDir = 'C:\\Users\\Monster\\ÇALIŞMALARIM\\yildizstore\\yildiz-store\\public';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking recently added Sunix images for errors...");
  
  // Find products that have images in the new folder
  const images = await prisma.productImage.findMany({
    where: {
      url: { startsWith: '/images/products/sunix/' }
    },
    include: {
      product: {
        select: { name: true, brand: true }
      }
    }
  });

  console.log(`Found ${images.length} images starting with /images/products/sunix/`);
  
  let missingFiles = 0;
  let invalidUrls = 0;
  
  for (const img of images) {
    // 1. Check if URL is valid (no weird spaces or unencoded chars)
    if (img.url.includes(' ') || img.url.includes('%')) {
       console.warn(`[WARNING] Suspicious URL: ${img.url} for product ${img.product?.name}`);
       invalidUrls++;
    }

    // 2. Check if physical file exists
    const fullPath = path.join(destBaseDir, img.url.replace(/\//g, path.sep));
    if (!fs.existsSync(fullPath)) {
       console.error(`[ERROR] File missing on disk: ${fullPath} for product ${img.product?.name}`);
       missingFiles++;
    }
  }

  if (missingFiles === 0 && invalidUrls === 0) {
    console.log(`\n✅ TÜM KONTROLLER BAŞARILI: ${images.length} resmin tamamı diskte mevcut ve veritabanı yolları geçerli.`);
  } else {
    console.log(`\n❌ HATALAR BULUNDU: ${missingFiles} dosya diskte eksik, ${invalidUrls} şüpheli URL var.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
