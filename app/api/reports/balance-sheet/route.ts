import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const asOfDate = searchParams.get("asOfDate") || new Date().toISOString();

    // Get all accounts with their entries up to the specified date
    const accounts = await prisma.account.findMany({
      include: {
        entries: {
          where: {
            createdAt: {
              lte: new Date(asOfDate),
            },
          },
          include: {
            transaction: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { code: "asc" }],
    });

    // Calculate balance for each account
    const accountBalances = accounts.map((account) => {
      const balance = account.entries.reduce((sum, entry) => {
        // Assets & Expenses: Debit positive, Credit negative
        // Liabilities, Equity, Revenue: Credit positive, Debit negative
        if (account.type === "ASSET" || account.type === "EXPENSE") {
          return sum + (Number(entry.debit) - Number(entry.credit));
        } else {
          return sum + (Number(entry.credit) - Number(entry.debit));
        }
      }, 0);

      return {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        balance,
      };
    });

    // Group by account type
    const groupedBalances = {
      assets: accountBalances.filter((a) => a.type === "ASSET"),
      liabilities: accountBalances.filter((a) => a.type === "LIABILITY"),
      equity: accountBalances.filter((a) => a.type === "EQUITY"),
      revenue: accountBalances.filter((a) => a.type === "REVENUE"),
      expenses: accountBalances.filter((a) => a.type === "EXPENSE"),
    };

    // Calculate totals
    const totals = {
      assets: groupedBalances.assets.reduce(
        (sum, account) => sum + account.balance,
        0
      ),
      liabilities: groupedBalances.liabilities.reduce(
        (sum, account) => sum + account.balance,
        0
      ),
      equity: groupedBalances.equity.reduce(
        (sum, account) => sum + account.balance,
        0
      ),
      revenue: groupedBalances.revenue.reduce(
        (sum, account) => sum + account.balance,
        0
      ),
      expenses: groupedBalances.expenses.reduce(
        (sum, account) => sum + account.balance,
        0
      ),
    };

    // Net Income = Revenue - Expenses
    const netIncome = totals.revenue - totals.expenses;

    // Equity includes retained earnings (net income)
    const equityWithNetIncome = totals.equity + netIncome;

    return NextResponse.json({
      asOfDate,
      accountBalances,
      groupedBalances,
      totals: {
        ...totals,
        netIncome,
        equityWithNetIncome,
      },
      accountingEquation: {
        assets: totals.assets,
        liabilities: totals.liabilities,
        equity: equityWithNetIncome,
        balances:
          Math.abs(totals.assets - (totals.liabilities + equityWithNetIncome)) <
          0.01,
      },
    });
  } catch (error) {
    console.error("Failed to generate balance sheet:", error);
    return NextResponse.json(
      { error: "Failed to generate balance sheet" },
      { status: 500 }
    );
  }
}
