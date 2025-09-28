// app/api/save-transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"; // 🔑 Import this
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 🔑 And this

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // 🔑 Get the user session

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.transactions || !Array.isArray(body.transactions)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const created = await prisma.transaction.createMany({
      data: body.transactions.map((t: any) => ({
        // 🔑 Add the userId to each transaction
        userId: session.user.id,
        transDate: t.transDate,
        valueDate: t.valueDate,
        description: t.description,
        category: t.category,
        debitCredit: t.debitCredit,
        amount: parseFloat(t.amount.toString()), // Ensure amount is a number
        balance: parseFloat(t.balance.toString()), // Ensure balance is a number
        channel: t.channel,
        reference: t.transactionReference,
        type: t.type,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error("Error saving transactions:", error);
    return NextResponse.json({ error: "Failed to save transactions" }, { status: 500 });
  }
}