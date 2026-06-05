import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('iPhone 17 Pro Max görselleri güncelleniyor...');

  const product = await prisma.product.findUnique({
    where: { slug: 'iphone-17-pro-max' }
  });

  if (!product) {
    console.error('Ürün bulunamadı!');
    return;
  }

  const images = {
    'Siyah Titanyum': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-black-titanium-select?wid=1200&hei=1200&fmt=jpeg',
    'Beyaz Titanyum': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-white-titanium-select?wid=1200&hei=1200&fmt=jpeg',
    'Doğal Titanyum': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-natural-titanium-select?wid=1200&hei=1200&fmt=jpeg',
    'Çöl Titanyumu': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-max-desert-titanium-select?wid=1200&hei=1200&fmt=jpeg'
  };

  const variants = await prisma.productVariant.findMany({
    where: { productId: product.id }
  });

  let count = 0;
  for (const variant of variants) {
    const imageUrl = images[variant.color as keyof typeof images];
    if (imageUrl) {
      await prisma.productImage.updateMany({
        where: { variantId: variant.id },
        data: { url: imageUrl }
      });
      count++;
    }
  }

  console.log(`${count} adet varyantın görseli gerçek resimlerle güncellendi!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
