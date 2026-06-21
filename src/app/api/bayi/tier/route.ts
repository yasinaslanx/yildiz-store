import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const TIER_DISCOUNTS = {
  BRONZE: 3,
  SILVER: 6,
  GOLD: 10,
};

const TIER_THRESHOLDS = {
  GOLD: 20000,
  SILVER: 5000,
};

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "DEALER" && sessionUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Yetkisiz" }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        dealerTier: true,
        orders: {
          where: {
            paymentStatus: "PAID",
            createdAt: { gte: thirtyDaysAgo },
          },
          select: { totalAmount: true },
        },
      },
    });

    if (!user) return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı" }, { status: 404 });

    const monthlyRevenue = user.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const tier = user.dealerTier;

    // Next tier progress
    let nextTier: string | null = null;
    let nextTierThreshold = 0;
    let progress = 100;

    if (tier === "BRONZE") {
      nextTier = "SILVER";
      nextTierThreshold = TIER_THRESHOLDS.SILVER;
      progress = Math.min(100, Math.round((monthlyRevenue / TIER_THRESHOLDS.SILVER) * 100));
    } else if (tier === "SILVER") {
      nextTier = "GOLD";
      nextTierThreshold = TIER_THRESHOLDS.GOLD;
      progress = Math.min(100, Math.round(((monthlyRevenue - TIER_THRESHOLDS.SILVER) / (TIER_THRESHOLDS.GOLD - TIER_THRESHOLDS.SILVER)) * 100));
    }

    return NextResponse.json({
      success: true,
      data: {
        tier,
        discountPercent: TIER_DISCOUNTS[tier as keyof typeof TIER_DISCOUNTS] || 0,
        monthlyRevenue,
        nextTier,
        nextTierThreshold,
        progress,
        remaining: nextTierThreshold > 0 ? Math.max(0, nextTierThreshold - monthlyRevenue) : 0,
      },
    });
  } catch (error: any) {
    console.error("GET DEALER TIER ERROR:", error);
    return NextResponse.json({ success: false, message: "Tier bilgisi alınamadı" }, { status: 500 });
  }
}
