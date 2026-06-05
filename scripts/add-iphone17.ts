import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('iPhone 17 Pro Max güncelleniyor...');

  const category = await prisma.category.findUnique({
    where: { slug: 'phones' }
  });

  if (!category) {
    console.error('Phones kategorisi bulunamadı!');
    return;
  }

  // Ürünü bul veya oluştur
  const product = await prisma.product.upsert({
    where: { slug: 'iphone-17-pro-max' },
    update: {
      description: 'Yeni iPhone 17 Pro Max. Çarpıcı Derin Mavi, Kozmik Turuncu ve Gümüş renk seçenekleriyle. Kusursuz performans ve inanılmaz kamera yetenekleri.',
    },
    create: {
      name: 'iPhone 17 Pro Max',
      slug: 'iphone-17-pro-max',
      brand: 'Apple',
      categoryId: category.id,
      description: 'Yeni iPhone 17 Pro Max. Çarpıcı Derin Mavi, Kozmik Turuncu ve Gümüş renk seçenekleriyle. Kusursuz performans ve inanılmaz kamera yetenekleri.',
      featured: true,
      active: true
    }
  });

  // Eski varyantları ve resimlerini temizle ki yenilerini sıfırdan ekleyelim
  const oldVariants = await prisma.productVariant.findMany({
    where: { productId: product.id }
  });
  const oldVariantIds = oldVariants.map(v => v.id);

  if (oldVariantIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { variantId: { in: oldVariantIds } }
    });
    // In case there are other relations like OrderItem or Favorite
    try {
      await prisma.favorite.deleteMany({
        where: { productId: product.id }
      });
    } catch(e) {}
  }

  await prisma.productImage.deleteMany({
    where: { productId: product.id }
  });
  await prisma.productVariant.deleteMany({
    where: { productId: product.id }
  });

  const colors = [
    { name: 'Kozmik Turuncu', img: '/images/iphone17/iphone17promax.avif' },
    { name: 'Gümüş', img: '/images/iphone17/İphone17ProMaxBeyaz.avif' },
    { name: 'Derin Mavi', img: '/images/iphone17/İphone17ProMaxMavi.webp' },
  ];

  const storages = [
    { size: '256 GB', price: 132999 },
    { size: '512 GB', price: 146999 },
    { size: '1 TB', price: 160999 },
    { size: '2 TB', price: 188999 }
  ];

  for (const color of colors) {
    for (const storage of storages) {
      // Create a URL-safe, unique SKU
      const sku = `IPH17PM-${color.name.substring(0,3).toUpperCase()}-${storage.size.replace(' ','')}`;
      
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku,
          color: color.name,
          storage: storage.size,
          price: storage.price,
          stock: Math.floor(Math.random() * 20) + 5,
          active: true
        }
      });

      // Resim ekle
      await prisma.productImage.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          url: color.img,
          order: 0
        }
      });
    }
  }

  console.log('iPhone 17 Pro Max bilgileri Apple TR güncel verisiyle başarıyla güncellendi!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
