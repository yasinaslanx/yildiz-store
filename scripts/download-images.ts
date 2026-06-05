import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { prisma } from '../src/lib/prisma';

const downloadFile = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  console.log('Orijinal Apple görselleri indiriliyor...');
  
  const dir = path.join(process.cwd(), 'public', 'products', 'iphone17');
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  const images = {
    'Siyah Titanyum': { url: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-black-titanium-select?wid=1200&hei=1200&fmt=jpeg', filename: 'black.jpg' },
    'Beyaz Titanyum': { url: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-white-titanium-select?wid=1200&hei=1200&fmt=jpeg', filename: 'white.jpg' },
    'Doğal Titanyum': { url: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-natural-titanium-select?wid=1200&hei=1200&fmt=jpeg', filename: 'natural.jpg' },
    'Çöl Titanyumu': { url: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-desert-titanium-select?wid=1200&hei=1200&fmt=jpeg', filename: 'desert.jpg' }
  };

  for (const [color, data] of Object.entries(images)) {
    const dest = path.join(dir, data.filename);
    console.log(`İndiriliyor: ${color}`);
    await downloadFile(data.url, dest);
  }

  console.log('İndirme tamamlandı. Veritabanı güncelleniyor...');

  const product = await prisma.product.findUnique({
    where: { slug: 'iphone-17-pro-max' }
  });

  if (product) {
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id }
    });

    for (const variant of variants) {
      const imgData = images[variant.color as keyof typeof images];
      if (imgData) {
        await prisma.productImage.updateMany({
          where: { variantId: variant.id },
          data: { url: `/products/iphone17/${imgData.filename}` }
        });
      }
    }
    console.log('Veritabanı görselleri local path ile güncellendi!');
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
