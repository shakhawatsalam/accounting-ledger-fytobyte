import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// Health check and utilities
export async function GET(request: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get basic stats
    const [accounts, transactions, entries] = await Promise.all([
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.transactionEntry.count(),
    ]);

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      stats: {
        accounts,
        transactions,
        entries,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to reset data (for testing)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "reset-test-data") {
      // Only allow in development
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Reset only allowed in development" },
          { status: 403 }
        );
      }

      // Clear all data in correct order
      await prisma.$transaction([
        prisma.transactionEntry.deleteMany(),
        prisma.transaction.deleteMany(),
        prisma.account.deleteMany(),
      ]);

      // Re-seed with test data
      await seedTestData();

      return NextResponse.json({
        message: "Test data reset successfully",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Utility action failed:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

async function seedTestData() {
  // Create default accounts
  const accounts = [
    { code: "1001", name: "Cash", type: "ASSET", balance: 10000 },
    { code: "1002", name: "Accounts Receivable", type: "ASSET", balance: 5000 },
    {
      code: "2001",
      name: "Accounts Payable",
      type: "LIABILITY",
      balance: 3000,
    },
    { code: "3001", name: "Owner's Capital", type: "EQUITY", balance: 12000 },
    { code: "4001", name: "Sales Revenue", type: "REVENUE", balance: 0 },
    { code: "4002", name: "Service Revenue", type: "REVENUE", balance: 0 },
    { code: "5001", name: "Rent Expense", type: "EXPENSE", balance: 0 },
    { code: "5002", name: "Utilities Expense", type: "EXPENSE", balance: 0 },
    { code: "5003", name: "Salary Expense", type: "EXPENSE", balance: 0 },
  ];

  for (const account of accounts) {
    await prisma.account.create({
      data: account,
    });
  }

  // Create some sample transactions
  const cashAccount = await prisma.account.findUnique({
    where: { code: "1001" },
  });
  const revenueAccount = await prisma.account.findUnique({
    where: { code: "4001" },
  });
  const expenseAccount = await prisma.account.findUnique({
    where: { code: "5001" },
  });

  if (cashAccount && revenueAccount && expenseAccount) {
    // Sample sales transaction
    await prisma.transaction.create({
      data: {
        description: "Product sale to customer",
        date: new Date(),
        entries: {
          create: [
            { accountId: cashAccount.id, debit: 1500, credit: 0 },
            { accountId: revenueAccount.id, debit: 0, credit: 1500 },
          ],
        },
      },
    });

    // Sample expense transaction
    await prisma.transaction.create({
      data: {
        description: "Monthly office rent",
        date: new Date(Date.now() - 86400000), // Yesterday
        entries: {
          create: [
            { accountId: expenseAccount.id, debit: 800, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: 800 },
          ],
        },
      },
    });
  }
}
