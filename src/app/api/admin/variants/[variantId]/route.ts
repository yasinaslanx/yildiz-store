import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { sendEmail } from "@/lib/email";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { variantId } = await context.params;
    const body = await request.json();

    const oldVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true }
    });

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: body.stock,
        price: body.price,
        oldPrice: body.oldPrice,
        sku: body.sku,
        images: body.image ? {
          deleteMany: {}, // Mevcut resimleri temizle (basitlik için tek resim yönetiyoruz)
          create: {
            url: body.image,
            order: 0
          }
        } : undefined
      },
      include: {
        product: true,
        images: true
      }
    });

    // Stok 0'dan büyük bir değere çıktıysa haber ver bekleyenlere mail gönder
    if (oldVariant && oldVariant.stock === 0 && variant.stock > 0) {
      const alerts = await prisma.stockAlert.findMany({
        where: { variantId, notified: false }
      });

      if (alerts.length > 0) {
        const emails = alerts.map(a => a.email);
        
        await sendEmail({
          to: emails,
          subject: `${variant.product.name} Tekrar Stokta!`,
          html: `
            <h1>Müjde!</h1>
            <p>Beklediğiniz <b>${variant.product.name} (${variant.color})</b> ürünü tekrar stoklarımıza girdi.</p>
            <p>Hemen satın almak için web sitemizi ziyaret edebilirsiniz.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products/${variant.product.slug}">Ürüne Git</a>
          `
        });

        // Bildirildi olarak işaretle
        await prisma.stockAlert.updateMany({
          where: { variantId, email: { in: emails } },
          data: { notified: true }
        });
      }
    }

    // Trendyol Tarzı: Favorilerdeki ürün azalırsa haber ver
    if (oldVariant && oldVariant.stock > 5 && variant.stock > 0 && variant.stock <= 5) {
      const favorites = await prisma.favorite.findMany({
        where: { variantId },
        include: { user: true }
      });

      if (favorites.length > 0) {
        const emails = favorites.map(f => f.user.email);

        await sendEmail({
          to: emails,
          subject: "Fırsatı Kaçırma! Favorilerindeki ürün tükenmek üzere!",
          html: `
            <h2>Stoklar Tükeniyor!</h2>
            <p>Favorilerine eklediğin <b>${variant.product.name} (${variant.color})</b> ürününden sadece <b>${variant.stock}</b> adet kaldı.</p>
            <p>Ürün tamamen tükenmeden hemen satın almak için tıkla:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products/${variant.product.slug}" style="display:inline-block; padding:12px 24px; background:#000; color:#fff; text-decoration:none; border-radius:8px;">Ürünü Al</a>
          `
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error("UPDATE VARIANT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Varyant güncellenemedi." },
      { status: 500 },
    );
  }
}
