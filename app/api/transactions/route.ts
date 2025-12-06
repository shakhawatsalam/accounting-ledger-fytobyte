/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import {
  validateTransactionEntries,
  AccountingValidationError,
  calculateBalanceChange,
} from "@/lib/validation";
import prisma from "@/lib/prisma";

// GET all transactions with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          entries: {
            include: {
              account: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, description, entries, reference } = body;

    // Validate required fields
    if (!description || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Description and entries array are required" },
        { status: 400 }
      );
    }

    // Validate double-entry accounting rules
    validateTransactionEntries(entries);

    // Check all accounts exist
    const accountIds = entries.map((e) => e.accountId);
    const accounts = await prisma.account.findMany({
      where: { id: { in: accountIds } },
    });

    if (accounts.length !== accountIds.length) {
      return NextResponse.json(
        { error: "One or more accounts not found" },
        { status: 404 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction with entries
      const transaction = await tx.transaction.create({
        data: {
          date: date ? new Date(date) : new Date(),
          description,
          reference,
          entries: {
            create: entries.map((entry) => ({
              accountId: entry.accountId,
              debit: entry.debit,
              credit: entry.credit,
            })),
          },
        },
        include: {
          entries: {
            include: {
              account: true,
            },
          },
        },
      });

      // 2. Update all affected account balances
      for (const entry of transaction.entries) {
        const account = accounts.find((a) => a.id === entry.accountId);
        if (!account) continue;

        // Calculate balance change
        const balanceChange = calculateBalanceChange(
          account.type,
          entry.debit as any,
          entry.credit as any
        );

        // Update account balance
        await tx.account.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);

    if (error instanceof AccountingValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
