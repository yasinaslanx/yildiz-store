import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
  const sourceDir = path.join(process.cwd(), 'public', 'images', 'iphone17');
  const targetDir = path.join(process.cwd(), 'public', 'products', 'iphone17');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy files
  fs.copyFileSync(path.join(sourceDir, 'İphone17ProMaxBeyaz.avif'), path.join(targetDir, 'white.avif'));
  fs.copyFileSync(path.join(sourceDir, 'İphone17ProMaxMavi.webp'), path.join(targetDir, 'natural.webp'));
  fs.copyFileSync(path.join(sourceDir, 'iphone17promax.avif'), path.join(targetDir, 'black.avif'));
  fs.copyFileSync(path.join(sourceDir, 'iphone17promax.avif'), path.join(targetDir, 'desert.avif')); // using same as black for now since we don't have desert

  const p = await prisma.product.findUnique({
    where: { slug: 'iphone-17-pro-max' },
    include: { variants: true }
  });

  if (!p) return;

  const colorMap: Record<string, string> = {
    'Siyah Titanyum': '/products/iphone17/black.avif',
    'Beyaz Titanyum': '/products/iphone17/white.avif',
    'Doğal Titanyum': '/products/iphone17/natural.webp',
    'Çöl Titanyum': '/products/iphone17/desert.avif',
    'Çöl Titanyumu': '/products/iphone17/desert.avif',
  };

  for (const v of p.variants) {
    const url = colorMap[v.color];
    if (!url) continue;

    await prisma.productImage.deleteMany({
      where: { variantId: v.id }
    });

    await prisma.productImage.create({
      data: {
        url,
        order: 0,
        variantId: v.id,
        productId: p.id
      }
    });
  }

  console.log('Fixed DB and copied images!');
}

run();
