import 'dotenv/config';
import fs from 'fs';
import * as cheerio from 'cheerio';
import { prisma } from '../src/lib/prisma';

const USD_RATE = 46.34; // HTML'deki anlık kur

async function main() {
  console.log('--- MySunix Bayi Ürünleri Aktarımı Başlıyor ---');
  console.log(`Dolar Kuru: 1 USD = ${USD_RATE} TL`);

  const html = fs.readFileSync('public/MySunix-BayiPortalı.html', 'utf8');
  const $ = cheerio.load(html);

  // Kategori işlemleri: "Aksesuar" veya "Genel" kategorisini bul/oluştur
  let defaultCategory = await prisma.category.findFirst({
    where: { name: { contains: 'Aksesuar', mode: 'insensitive' } }
  });

  if (!defaultCategory) {
    defaultCategory = await prisma.category.findFirst({
      where: { name: { contains: 'Genel', mode: 'insensitive' } }
    });
  }

  if (!defaultCategory) {
    console.log('Varsayılan "Genel" kategorisi oluşturuluyor...');
    defaultCategory = await prisma.category.create({
      data: {
        name: 'Genel',
        slug: 'genel',
        description: 'Genel ürünler'
      }
    });
  }

  let updatedCount = 0;
  let addedCount = 0;
  let skippedCount = 0;

  const productsData: any[] = [];

  $('.frm-pos-kart').each((i, el) => {
    const name = $(el).find('.frm-pos-kart-ad').text().trim();
    const priceText = $(el).find('.frm-pos-kart-fiyat').text().trim();
    const stockText = $(el).find('.frm-pos-kart-stok').text().trim();
    const imgSrc = $(el).find('img').attr('src');
    
    // Fiyat parse (örn: "$2.75 - 3.00")
    // Sadece sayıları alıp en yükseğini bul
    const prices = priceText.match(/[\d.]+/g);
    let maxUsdPrice = 0;
    if (prices && prices.length > 0) {
       maxUsdPrice = Math.max(...prices.map(p => parseFloat(p)));
    }
    
    const priceInTl = maxUsdPrice * USD_RATE;

    // Stok parse (örn: "1000+")
    let stock = 0;
    if (stockText) {
       const parsedStock = parseInt(stockText.replace(/\D/g, ''));
       if (!isNaN(parsedStock)) stock = parsedStock;
       if (stockText.includes('+')) stock = Math.max(stock, 100);
    }
    
    if (name && maxUsdPrice > 0) {
       productsData.push({
          name,
          priceTl: priceInTl,
          stock,
          imgSrc
       });
    }
  });

  console.log(`HTML'den ${productsData.length} geçerli ürün okundu.`);

  for (const item of productsData) {
    // 1. Ürünü isimle bulmaya çalış
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: item.name,
          mode: 'insensitive'
        }
      },
      include: {
        variants: true
      }
    });

    if (existingProduct) {
      // Ürün var, sadece stok ve fiyatı güncelle
      const variant = existingProduct.variants[0];
      if (variant) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            price: item.priceTl,
            stock: item.stock
          }
        });
        updatedCount++;
      } else {
        skippedCount++; // Varyantı yoksa atla
      }
    } else {
      // Ürün yok, yeni ekle
      // Slug oluştur (basit sanitize)
      const baseSlug = item.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const newProduct = await prisma.product.create({
        data: {
          name: item.name,
          slug: slug,
          description: `${item.name} orijinal bayiden eklenmiştir.`,
          brand: 'Sunix',
          categoryId: defaultCategory.id,
          variants: {
            create: {
              sku: `SNX-${slug.substring(0,6).toUpperCase()}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*1000)}`,
              color: 'Standart',
              price: item.priceTl,
              stock: item.stock
            }
          }
        }
      });

      // Eğer resim varsa ekle
      if (item.imgSrc && item.imgSrc !== '') {
        // img url is relative in HTML like "./urunler_files/urun_345.jpg"
        // In actual website we should probably just store the filename if we copy them or the full URL.
        // The user uploaded the files to public/MySunixBayiPortalı_files or public/urunler_files
        let finalImgUrl = item.imgSrc;
        if (finalImgUrl.startsWith('./')) {
           finalImgUrl = finalImgUrl.replace('./', '/');
        }

        await prisma.productImage.create({
          data: {
            url: finalImgUrl,
            productId: newProduct.id,
            order: 0
          }
        });
      }

      addedCount++;
    }
  }

  console.log('--- İŞLEM TAMAMLANDI ---');
  console.log(`✅ ${updatedCount} adet var olan ürün güncellendi.`);
  console.log(`✅ ${addedCount} adet YENİ ürün eklendi.`);
  if (skippedCount > 0) console.log(`⚠️ ${skippedCount} adet ürün atlandı.`);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
