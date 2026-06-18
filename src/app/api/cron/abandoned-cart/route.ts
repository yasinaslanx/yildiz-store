import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/mailer";

// This route is called by Vercel Cron: daily at 10:00 UTC (13:00 TR)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/abandoned-cart", "schedule": "0 10 * * *" }] }

const CRON_SECRET = process.env.CRON_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunixstore.com";
const CART_ABANDON_HOURS = 24;
const RESEND_COOLDOWN_DAYS = 7; // Don't send again within 7 days

function generateCouponCode(userId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CART-${suffix}`;
}

export async function GET(request: Request) {
  // Security: Only Vercel Cron or requests with our secret can call this
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - CART_ABANDON_HOURS);

    const reminderCutoff = new Date();
    reminderCutoff.setDate(reminderCutoff.getDate() - RESEND_COOLDOWN_DAYS);

    // Find users with non-empty carts that haven't been updated in 24h
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: { lte: cutoffTime },
        items: { some: {} }, // cart is not empty
        user: {
          // Has not received a reminder in the last 7 days
          OR: [
            { cartReminder: null },
            { cartReminder: { sentAt: { lte: reminderCutoff } } },
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            email: true,
            cartReminder: true,
          },
        },
        items: {
          take: 3,
          include: {
            variant: {
              select: {
                price: true,
                product: { select: { name: true } },
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
      take: 50, // Process max 50 per run to respect rate limits
    });

    const results = { sent: 0, failed: 0, skipped: 0 };

    for (const cart of abandonedCarts) {
      const { user, items } = cart;
      if (!user?.email || !user?.firstName) { results.skipped++; continue; }
      if (items.length === 0) { results.skipped++; continue; }

      const couponCode = generateCouponCode(user.id);

      try {
        // Create or update the coupon in the database
        await prisma.coupon.upsert({
          where: { code: couponCode },
          create: {
            code: couponCode,
            discountType: "PERCENTAGE",
            discountValue: 5,
            usageLimit: 1,
            usedCount: 0,
            active: true,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          },
          update: {},
        });

        const cartItemsForEmail = items.map(item => ({
          name: item.variant.product.name,
          price: Number(item.variant.price),
          image: item.variant.images[0]?.url,
        }));

        await sendAbandonedCartEmail(user.email, user.firstName, couponCode, cartItemsForEmail, SITE_URL);

        // Record that we sent the reminder
        await prisma.cartReminder.upsert({
          where: { userId: user.id },
          create: { userId: user.id, couponCode, sentAt: new Date() },
          update: { couponCode, sentAt: new Date() },
        });

        results.sent++;
      } catch (err) {
        console.error(`Failed to send abandoned cart email to ${user.email}:`, err);
        results.failed++;
      }
    }

    console.log(`Abandoned Cart Cron Results:`, results);
    return NextResponse.json({
      success: true,
      message: `Terk edilmiş sepet işlemi tamamlandı.`,
      results,
    });
  } catch (error: any) {
    console.error("ABANDONED CART CRON ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
