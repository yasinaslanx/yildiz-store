import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('iPhone 17 Pro Max ekleniyor...');

  // Telefon kategorisini bul
  const category = await prisma.category.findUnique({
    where: { slug: 'phones' }
  });

  if (!category) {
    console.error('Phones kategorisi bulunamadı!');
    return;
  }

  // Ürünü oluştur veya bul
  let product = await prisma.product.findUnique({
    where: { slug: 'iphone-17-pro-max' }
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        name: 'iPhone 17 Pro Max',
        slug: 'iphone-17-pro-max',
        brand: 'Apple',
        categoryId: category.id,
        description: 'Apple Intelligence için tasarlandı. Yeni nesil işlemci, olağanüstü kamera yetenekleri ve titanyum tasarım. Geleceği şimdi deneyimleyin.',
        featured: true,
        active: true
      }
    });
  }

  const colors = [
    { name: 'Siyah Titanyum', img: 'https://placehold.co/600x600/1a1a1a/ffffff?text=Siyah+Titanyum' },
    { name: 'Beyaz Titanyum', img: 'https://placehold.co/600x600/f5f5f5/000000?text=Beyaz+Titanyum' },
    { name: 'Doğal Titanyum', img: 'https://placehold.co/600x600/a39b93/ffffff?text=Dogal+Titanyum' },
    { name: 'Çöl Titanyumu', img: 'https://placehold.co/600x600/c7b299/ffffff?text=Col+Titanyumu' }
  ];

  const storages = [
    { size: '256 GB', price: 99999 },
    { size: '512 GB', price: 109999 },
    { size: '1 TB', price: 119999 }
  ];

  for (const color of colors) {
    for (const storage of storages) {
      const sku = `IPH17PM-${color.name.substring(0,3).toUpperCase()}-${storage.size.replace(' ','')}`;
      
      const existingVariant = await prisma.productVariant.findUnique({
        where: { sku }
      });

      if (!existingVariant) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku,
            color: color.name,
            storage: storage.size,
            price: storage.price,
            stock: Math.floor(Math.random() * 20) + 5, // Rastgele stok
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
  }

  console.log('iPhone 17 Pro Max ve varyantları başarıyla eklendi!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
