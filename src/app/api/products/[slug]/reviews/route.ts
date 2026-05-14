import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validations/review";
import { getZodErrorMessage } from "@/lib/validation";
import { ZodError } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis yapılandırması
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const reviewRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});

// Prisma'yı tip hatalarından kurtarmak için proxy
const db = prisma as any;

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Geçersiz parametre." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Ürün bulunamadı." }, { status: 404 });
    }

    const reviews = await db.productReview.findMany({
      where: {
        productId: product.id,
        status: "APPROVED"
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // İstatistikler
    const stats = await db.productReview.aggregate({
      where: { productId: product.id, status: "APPROVED" },
      _avg: { rating: true },
      _count: { id: true }
    });

    const ratingDistribution = await db.productReview.groupBy({
      by: ["rating"],
      where: { productId: product.id, status: "APPROVED" },
      _count: { id: true }
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalCount: stats._count.id,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    return NextResponse.json({ success: false, message: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Giriş yapmalısınız." }, { status: 401 });
    }

    const params = await context.params;
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Geçersiz parametre." }, { status: 400 });
    }

    // Rate limit
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_URL !== "https://your-upstash-url.upstash.io") {
        const { success } = await reviewRateLimit.limit(user.id);
        if (!success) {
          return NextResponse.json({ success: false, message: "Çok fazla deneme." }, { status: 429 });
        }
      }
    } catch (e) {
      console.warn("Rate limit bypass.");
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Ürün bulunamadı." }, { status: 404 });
    }

    const existingReview = await db.productReview.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ success: false, message: "Zaten yorum yaptınız." }, { status: 400 });
    }

    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "DELIVERED" as any,
        items: { some: { productId: product.id } }
      },
      select: { id: true }
    });

    const review = await db.productReview.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating: validated.rating,
        title: validated.title,
        comment: validated.comment,
        isVerifiedPurchase: !!orderWithProduct,
        orderId: orderWithProduct?.id || null,
        status: "PENDING"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Yorumunuz alındı.",
      data: review
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, message: getZodErrorMessage(error) }, { status: 400 });
    }
    console.error("POST REVIEW ERROR:", error);
    return NextResponse.json({ success: false, message: "İşlem başarısız." }, { status: 500 });
  }
}
