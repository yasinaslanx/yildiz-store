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
      dealer.dealerTransactions.forEach(t => {
        if (t.type === "DEBT") balanceUSD += Number(t.amount);
        if (t.type === "PAYMENT") balanceUSD -= Number(t.amount);
      });

      return {
        id: dealer.id,
        name: `${dealer.firstName} ${dealer.lastName}`,
        email: dealer.email,
        phone: dealer.phone || "",
        balanceUSD: balanceUSD,
      };
    });

    return NextResponse.json({ success: true, dealers: formattedDealers });
  } catch (error) {
    console.error("GET DEALERS ERROR:", error);
    return NextResponse.json({ success: false, message: "Bayiler alınamadı." }, { status: 500 });
  }
}
