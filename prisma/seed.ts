import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "../src/lib/auth";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed başlıyor...");

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const adminPasswordHash = await hashPassword("Admin123456");
  const userPasswordHash = await hashPassword("User123456");

  await prisma.user.upsert({
    where: { email: "admin@yildizstore.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      firstName: "Yıldız",
      lastName: "Admin",
      email: "admin@yildizstore.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@yildizstore.com" },
    update: {
      passwordHash: userPasswordHash,
      role: "USER",
    },
    create: {
      firstName: "Test",
      lastName: "Kullanıcı",
      email: "user@yildizstore.com",
      passwordHash: userPasswordHash,
      role: "USER",
    },
  });

  const phonesCategory = await prisma.category.create({
    data: {
      name: "Telefonlar",
      slug: "phones",
      description: "Akıllı telefon modelleri",
      image: "/images/categories/phones.jpg",
      active: true,
    },
  });

  const computersCategory = await prisma.category.create({
    data: {
      name: "Bilgisayarlar",
      slug: "computers",
      description: "Laptop ve bilgisayar ürünleri",
      image: "/images/categories/computers.jpg",
      active: true,
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Aksesuarlar",
      slug: "phone-accessories",
      description: "Kulaklık, şarj cihazı ve aksesuarlar",
      image: "/images/categories/accessories.jpg",
      active: true,
    },
  });

  const products = [
    {
      categoryId: phonesCategory.id,
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      brand: "Apple",
      featured: true,
      description:
        "Titanium tasarım, A17 Pro çip, gelişmiş kamera sistemi ve ProMotion ekran ile güçlü iPhone deneyimi.",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200",
      ],
      variants: [
        {
          sku: "IPH15PRO-NATURAL-128",
          color: "Natural Titanium",
          storage: "128 GB",
          price: 64999,
          stock: 12,
          image:
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200",
        },
        {
          sku: "IPH15PRO-BLUE-256",
          color: "Blue Titanium",
          storage: "256 GB",
          price: 71999,
          stock: 8,
          image:
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200",
        },
      ],
    },
    {
      categoryId: phonesCategory.id,
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      brand: "Samsung",
      featured: true,
      description:
        "Galaxy AI özellikleri, S Pen desteği, güçlü kamera sistemi ve yüksek performanslı Android deneyimi.",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200",
      ],
      variants: [
        {
          sku: "S24ULTRA-BLACK-256",
          color: "Titanium Black",
          storage: "256 GB",
          price: 58999,
          stock: 15,
          image:
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200",
        },
        {
          sku: "S24ULTRA-GRAY-512",
          color: "Titanium Gray",
          storage: "512 GB",
          price: 67999,
          stock: 6,
          image:
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200",
        },
      ],
    },
    {
      categoryId: computersCategory.id,
      name: "MacBook Air M3 13 inç",
      slug: "macbook-air-m3-13",
      brand: "Apple",
      featured: true,
      description:
        "M3 çip, ince ve hafif tasarım, uzun pil ömrü ve Liquid Retina ekran ile günlük ve profesyonel kullanım için ideal.",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200",
      ],
      variants: [
        {
          sku: "MBA-M3-MIDNIGHT-256",
          color: "Midnight",
          storage: "256 GB SSD",
          price: 42999,
          stock: 10,
          image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200",
        },
        {
          sku: "MBA-M3-STARLIGHT-512",
          color: "Starlight",
          storage: "512 GB SSD",
          price: 52999,
          stock: 5,
          image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200",
        },
      ],
    },
    {
      categoryId: accessoriesCategory.id,
      name: "AirPods Pro 2. Nesil",
      slug: "airpods-pro-2-nesil",
      brand: "Apple",
      featured: true,
      description:
        "Aktif gürültü engelleme, adaptif ses, şeffaf mod ve MagSafe şarj kutusu ile premium kulaklık deneyimi.",
      images: [
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=1200",
      ],
      variants: [
        {
          sku: "AIRPODS-PRO2-WHITE",
          color: "White",
          storage: null,
          price: 8999,
          stock: 25,
          image:
            "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=1200",
        },
      ],
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        categoryId: productData.categoryId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        brand: productData.brand,
        featured: productData.featured,
        active: true,
      },
    });

    await prisma.productImage.createMany({
      data: productData.images.map((url, index) => ({
        productId: product.id,
        url,
        order: index,
      })),
    });

    for (const variantData of productData.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantData.sku,
          color: variantData.color,
          storage: variantData.storage,
          price: new Prisma.Decimal(variantData.price),
          stock: variantData.stock,
          active: true,
        },
      });

      await prisma.productImage.create({
        data: {
          variantId: variant.id,
          url: variantData.image,
          order: 0,
        },
      });
    }
  }

  console.log("Seed tamamlandı.");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });