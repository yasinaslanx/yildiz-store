import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST(request: Request) {
  try {
    const adminUser = await requirePermission("WAREHOUSE");
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Geçersiz veri formatı." }, { status: 400 });
    }

    let stats = { newProducts: 0, newVariants: 0, updatedStocks: 0, errors: 0 };

    for (const item of items) {
      const { sku, name, brand, category, color, price, stock } = item;
      
      if (!sku) {
        stats.errors++;
        continue;
      }

      // 1. Önce SKU kontrolü (Varyant var mı?)
      const existingVariant = await prisma.productVariant.findUnique({
        where: { sku: sku.toString() }
      });

      if (existingVariant) {
        // Varyant var, sadece stok/fiyat güncelle
        const parsedStock = typeof stock === 'number' ? stock : parseInt(stock || "0", 10);
        const parsedPrice = typeof price === 'number' ? price : parseFloat(price || existingVariant.price.toString());

        if (existingVariant.stock !== parsedStock || Number(existingVariant.price) !== parsedPrice) {
           await prisma.$transaction([
             prisma.productVariant.update({
               where: { id: existingVariant.id },
               data: { stock: parsedStock, price: parsedPrice }
             }),
             prisma.stockLog.create({
               data: {
                 variantId: existingVariant.id,
                 userId: adminUser.id,
                 previousStock: existingVariant.stock,
                 newStock: parsedStock,
                 change: parsedStock - existingVariant.stock,
                 reason: "Gelişmiş Excel Yüklemesi (Güncelleme)"
               }
             })
           ]);
           stats.updatedStocks++;
        }
        continue;
      }

      // SKU YOK: Yeni Varyant (ve belki Yeni Ürün) Oluşturulacak
      if (!name || !price) {
        // Yeni ürün için isim ve fiyat şart
        stats.errors++;
        continue;
      }

      const parsedStock = typeof stock === 'number' ? stock : parseInt(stock || "0", 10);
      const parsedPrice = typeof price === 'number' ? price : parseFloat(price || "0");
      const safeColor = color || "Standart";
      const safeBrand = brand || "Diğer";
      
      // Ürün adından mevcut Product'ı ara
      let product = await prisma.product.findFirst({
        where: { name: name.toString() }
      });

      if (product) {
        // Ürün zaten var, sadece yeni varyant ekle
        const newVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: sku.toString(),
            color: safeColor,
            price: parsedPrice,
            stock: parsedStock
          }
        });

        if (parsedStock > 0) {
           await prisma.stockLog.create({
             data: {
               variantId: newVariant.id,
               userId: adminUser.id,
               previousStock: 0,
               newStock: parsedStock,
               change: parsedStock,
               reason: "Gelişmiş Excel Yüklemesi (Yeni Varyant)"
             }
           });
        }
        stats.newVariants++;
      } else {
        // YEPYENİ ÜRÜN
        let categoryId = null;

        // Kategori Kontrolü & Oluşturma
        if (category) {
          let catRecord = await prisma.category.findFirst({
            where: { name: { equals: category.toString(), mode: 'insensitive' } }
          });

          if (!catRecord) {
            // Kategori yok, oluştur
            catRecord = await prisma.category.create({
              data: {
                name: category.toString(),
                slug: slugify(category.toString()) + "-" + Date.now().toString().substring(8),
                description: `${category} kategorisindeki ürünler`
              }
            });
          }
          categoryId = catRecord.id;
        }

        // Yeni Ürün Oluştur
        const baseSlug = slugify(name.toString());
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString().substring(8)}`;

        const newProduct = await prisma.product.create({
          data: {
            name: name.toString(),
            slug: uniqueSlug,
            description: name.toString(), // Varsayılan açıklama
            brand: safeBrand,
            categoryId: categoryId,
            variants: {
              create: {
                sku: sku.toString(),
                color: safeColor,
                price: parsedPrice,
                stock: parsedStock
              }
            }
          },
          include: {
            variants: true
          }
        });

        // Log oluştur
        const createdVariant = newProduct.variants[0];
        if (createdVariant && parsedStock > 0) {
           await prisma.stockLog.create({
             data: {
               variantId: createdVariant.id,
               userId: adminUser.id,
               previousStock: 0,
               newStock: parsedStock,
               change: parsedStock,
               reason: "Gelişmiş Excel Yüklemesi (Yeni Ürün)"
             }
           });
        }
        stats.newProducts++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `İşlem Tamamlandı: ${stats.newProducts} yeni ürün eklendi, ${stats.newVariants} yeni varyant oluşturuldu, ${stats.updatedStocks} ürünün stoğu güncellendi, ${stats.errors} satırda hata oluştu veya atlandı.`,
      stats
    });

  } catch (error: any) {
    console.error("ADVANCED IMPORT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası: " + (error?.message || "Bilinmeyen hata") },
      { status: 500 }
    );
  }
}
