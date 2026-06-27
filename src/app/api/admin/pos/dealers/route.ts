import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(req: Request) {
  try {
    await requireAdminUser();

    // Fetch all dealers and their transactions
    const dealers = await prisma.user.findMany({
      where: { role: { in: ["DEALER", "ADMIN"] } }, // Allow admins to test POS
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dealerTransactions: {
          select: {
            type: true,
            amount: true,
          }
        }
      },
      orderBy: { firstName: "asc" }
    });

    const formattedDealers = dealers.map(dealer => {
      let balanceUSD = 0;
      let totalDebtUSD = 0;
      let totalPaymentUSD = 0;
      dealer.dealerTransactions.forEach(t => {
        if (t.type === "DEBT") {
          balanceUSD += Number(t.amount);
          totalDebtUSD += Number(t.amount);
        }
        if (t.type === "PAYMENT") {
          balanceUSD -= Number(t.amount);
          totalPaymentUSD += Number(t.amount);
        }
      });

      return {
        id: dealer.id,
        name: `${dealer.firstName} ${dealer.lastName}`,
        email: dealer.email,
        phone: dealer.phone || "",
        balanceUSD: balanceUSD,
        totalDebtUSD,
        totalPaymentUSD
      };
    });

    return NextResponse.json({ success: true, dealers: formattedDealers });
  } catch (error) {
    console.error("GET DEALERS ERROR:", error);
    return NextResponse.json({ success: false, message: "Bayiler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const body = await req.json();
    const { firstName, lastName, email, phone } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, message: "Ad, soyad ve e-posta zorunludur." }, { status: 400 });
    }

    // Pre-hashed dummy password (e.g. 'yildiz123')
    const passwordHash = "$2a$10$X8T.vI1Gj8pYh8v.8Z1J.eQz1w.7xK0X1V8r6a1Q9w3g5p2b7e5qO";

    const newDealer = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        passwordHash,
        role: "DEALER",
        dealerTier: "BRONZE",
      }
    });

    return NextResponse.json({ 
      success: true, 
      dealer: {
        id: newDealer.id,
        name: `${newDealer.firstName} ${newDealer.lastName}`,
        email: newDealer.email,
        phone: newDealer.phone || "",
        balanceUSD: 0
      }
    });
  } catch (error) {
    console.error("POST DEALER ERROR:", error);
    return NextResponse.json({ success: false, message: "Cari oluşturulamadı (E-posta veya telefon zaten kayıtlı olabilir)." }, { status: 500 });
  }
}
