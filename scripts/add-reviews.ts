import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Dummy değerlendirmeler ekleniyor...');

  // Get a user to act as the reviewer
  let user = await prisma.user.findFirst();
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'Kullanıcısı',
        email: 'test@sunix.com.tr',
        passwordHash: 'dummyhash',
        role: 'USER',
      }
    });
  }

  const products = await prisma.product.findMany();
  let count = 0;

  for (const product of products) {
    const existingReview = await prisma.productReview.findFirst({
      where: { productId: product.id }
    });

    if (!existingReview) {
      await prisma.productReview.create({
        data: {
          userId: user.id,
          productId: product.id,
          rating: 5,
          title: 'Harika Ürün',
          comment: 'Ürün gerçekten beklediğimden çok daha kaliteli geldi. Kesinlikle tavsiye ederim!',
          status: 'APPROVED',
          isVerifiedPurchase: true
        }
      });
      count++;
    }
  }

  console.log(`İşlem tamam! ${count} ürüne 5 yıldızlı test değerlendirmesi eklendi.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
