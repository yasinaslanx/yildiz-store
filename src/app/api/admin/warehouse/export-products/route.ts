import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const adminUser = await requirePermission("WAREHOUSE");
    if (!adminUser) {
      return new NextResponse("Yetkisiz erişim", { status: 401 });
    }

    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          include: {
            category: true,
          }
        }
      },
      orderBy: {
        product: {
          name: 'asc'
        }
      }
    });

    // UTF-8 BOM ekliyoruz ki Excel Türkçe karakterleri düzgün okusun
    let csvContent = '\uFEFF';
    
    // CSV Başlıkları
    csvContent += "SKU;Urun Adi;Kategori;Renk;Alis Fiyati;Sube Fiyati;Toptan Fiyati;Perakende Fiyati;Stok\n";

    variants.forEach(v => {
      const sku = v.sku || '';
      const name = (v.product?.name || '').replace(/;/g, ',');
      const category = (v.product?.category?.name || '').replace(/;/g, ',');
      const color = (v.color || '').replace(/;/g, ',');
      
      const buyPrice = v.buyPrice ? v.buyPrice.toString() : '0';
      const branchPrice = v.branchPrice ? v.branchPrice.toString() : '0';
      const wholesalePrice = v.wholesalePrice ? v.wholesalePrice.toString() : '0';
      const price = v.price ? v.price.toString() : '0';
      const stock = v.stock.toString();

      csvContent += `${sku};${name};${category};${color};${buyPrice};${branchPrice};${wholesalePrice};${price};${stock}\n`;
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="tum_urunler.csv"',
      },
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return new NextResponse("Dışa aktarma hatası: " + error.message, { status: 500 });
  }
}
