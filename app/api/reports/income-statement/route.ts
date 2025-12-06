import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate") || new Date().toISOString();

    // Default to current month if no start date
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const end = new Date(endDate);

    // Get revenue and expense accounts with entries in date range
    const accounts = await prisma.account.findMany({
      where: {
        type: { in: ["REVENUE", "EXPENSE"] },
      },
      include: {
        entries: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          include: {
            transaction: true,
          },
        },
      },
      orderBy: { code: "asc" },
    });

    // Calculate balances for the period
    const accountBalances = accounts.map((account) => {
      const periodBalance = account.entries.reduce((sum, entry) => {
        // Revenue: Credit increases, Debit decreases
        // Expenses: Debit increases, Credit decreases
        if (account.type === "REVENUE") {
          return sum + (Number(entry.credit) - Number(entry.debit));
        } else {
          return sum + (Number(entry.debit) - Number(entry.credit));
        }
      }, 0);

      return {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        periodBalance,
      };
    });

    // Separate revenues and expenses
    const revenues = accountBalances.filter(
      (a) => a.type === "REVENUE" && a.periodBalance > 0
    );
    const expenses = accountBalances.filter(
      (a) => a.type === "EXPENSE" && a.periodBalance > 0
    );

    // Calculate totals
    const totalRevenue = revenues.reduce(
      (sum, account) => sum + account.periodBalance,
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, account) => sum + account.periodBalance,
      0
    );
    const netIncome = totalRevenue - totalExpenses;

    return NextResponse.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      revenues: {
        accounts: revenues,
        total: totalRevenue,
      },
      expenses: {
        accounts: expenses,
        total: totalExpenses,
      },
      netIncome,
      profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    });
  } catch (error) {
    console.error("Failed to generate income statement:", error);
    return NextResponse.json(
      { error: "Failed to generate income statement" },
      { status: 500 }
    );
  }
}
