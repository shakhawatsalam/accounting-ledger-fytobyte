/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    // Get transactions with entries in journal format
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        entries: {
          include: {
            account: true,
          },
          orderBy: {
            // Order entries within transaction: debits first, then credits
            debit: "desc",
          },
        },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      skip,
      take: limit,
    });

    // Flatten for journal view
    const journalEntries = transactions.flatMap((transaction) =>
      transaction.entries.map((entry) => ({
        transactionId: transaction.id,
        date: transaction.date,
        description: transaction.description,
        reference: transaction.reference,
        accountCode: entry.account.code,
        accountName: entry.account.name,
        debit: entry.debit,
        credit: entry.credit,
      }))
    );

    const total = await prisma.transaction.count({ where: whereClause });

    return NextResponse.json({
      journalEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to generate journal report:", error);
    return NextResponse.json(
      { error: "Failed to generate journal report" },
      { status: 500 }
    );
  }
}
