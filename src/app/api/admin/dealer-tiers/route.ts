import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

// Tier thresholds (monthly revenue in TRY)
const TIER_THRESHOLDS = {
  GOLD: 20000,
  SILVER: 5000,
  BRONZE: 0,
};

export function calculateTier(monthlyRevenue: number): "BRONZE" | "SILVER" | "GOLD" {
  if (monthlyRevenue >= TIER_THRESHOLDS.GOLD) return "GOLD";
  if (monthlyRevenue >= TIER_THRESHOLDS.SILVER) return "SILVER";
  return "BRONZE";
}

export const TIER_DISCOUNTS = {
  BRONZE: 0,   // Standard wholesale price
  SILVER: 3,   // %3 extra off wholesale
  GOLD: 7,     // %7 extra off wholesale
};

export const TIER_LABELS = {
  BRONZE: "🥉 Bronze Bayi",
  SILVER: "🥈 Silver Bayi",
  GOLD: "🥇 Gold Bayi",
};

// POST /api/admin/dealer-tiers - recalculate all dealer tiers
export async function POST() {
  try {
    await requirePermission("USERS");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find all dealers
    const dealers = await prisma.user.findMany({
      where: { role: "DEALER" },
      select: { id: true, email: true, firstName: true, lastName: true, dealerTier: true },
    });

    const updates: { id: string; oldTier: string; newTier: string; monthlyRevenue: number }[] = [];

    for (const dealer of dealers) {
      const result = await prisma.order.aggregate({
        where: {
          userId: dealer.id,
          paymentStatus: "PAID",
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { totalAmount: true },
      });

      const monthlyRevenue = Number(result._sum.totalAmount ?? 0);
      const newTier = calculateTier(monthlyRevenue);

      if (newTier !== dealer.dealerTier) {
        await prisma.user.update({
          where: { id: dealer.id },
          data: { dealerTier: newTier },
        });
        updates.push({
          id: dealer.id,
          oldTier: dealer.dealerTier,
          newTier,
          monthlyRevenue,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${dealers.length} bayi kontrol edildi, ${updates.length} tier güncellendi.`,
      data: { checked: dealers.length, updated: updates.length, updates },
    });
  } catch (error: any) {
    console.error("DEALER TIER RECALCULATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Tier hesaplanamadı." },
      { status: error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}

// GET /api/admin/dealer-tiers - get all dealer tier stats
export async function GET() {
  try {
    await requirePermission("USERS");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dealers = await prisma.user.findMany({
      where: { role: "DEALER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
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

    const dealerStats = dealers.map((d) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
      email: d.email,
      tier: d.dealerTier,
      monthlyRevenue: d.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    }));

    return NextResponse.json({ success: true, data: dealerStats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Tier listesi alınamadı." },
      { status: error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}
