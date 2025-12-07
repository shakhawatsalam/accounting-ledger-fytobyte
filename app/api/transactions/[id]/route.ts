/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import {
  validateTransactionEntries,
  calculateBalanceChange,
} from "@/lib/validation";
import prisma from "@/lib/prisma";

// Define params as a Promise
interface Params {
  params: Promise<{ id: string }>;
}

// GET single transaction
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // ✅ AWAIT the params first!
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PUT update transaction
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // ✅ AWAIT the params first!
    const { id } = await params;
    const body = await request.json();
    const { date, description, entries, reference } = body;

    // Get existing transaction with entries
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Validate new entries if provided
    if (entries) {
      validateTransactionEntries(entries);
    }

    // Complex update with balance recalculation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Reverse old balances
      for (const oldEntry of existingTransaction.entries) {
        const balanceChange = calculateBalanceChange(
          oldEntry.account.type,
          oldEntry.credit as any,
          oldEntry.debit as any
        );

        await tx.account.update({
          where: { id: oldEntry.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      // 2. Delete old entries
      await tx.transactionEntry.deleteMany({
        where: { transactionId: parseInt(id) },
      });

      // 3. Update transaction details
      const updatedTransaction = await tx.transaction.update({
        where: { id: parseInt(id) },
        data: {
          date: date ? new Date(date) : existingTransaction.date,
          description: description || existingTransaction.description,
          reference:
            reference !== undefined ? reference : existingTransaction.reference,
        },
      });

      // 4. Create new entries (if provided) or recreate old ones
      const newEntries = entries || existingTransaction.entries;
      const accountIds = newEntries.map((e: any) => e.accountId);
      const accounts = await tx.account.findMany({
        where: { id: { in: accountIds } },
      });

      // 5. Create new entries
      const createdEntries = await Promise.all(
        newEntries.map(async (entry: any) => {
          return tx.transactionEntry.create({
            data: {
              transactionId: parseInt(id),
              accountId: entry.accountId,
              debit: entry.debit,
              credit: entry.credit,
            },
            include: {
              account: true,
            },
          });
        })
      );

      // 6. Apply new balances
      for (const entry of createdEntries) {
        const account = accounts.find((a) => a.id === entry.accountId);
        if (!account) continue;

        const balanceChange = calculateBalanceChange(
          account.type,
          entry.debit,
          entry.credit
        );

        await tx.account.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      return {
        ...updatedTransaction,
        entries: createdEntries,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE transaction
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // ✅ AWAIT the params first!
    const { id } = await params;
    console.log(`Deleting transaction ID: ${id}`);

    // Get transaction with entries before deleting
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Reverse balances before deletion
    await prisma.$transaction(async (tx) => {
      // Reverse balances
      for (const entry of transaction.entries) {
        const balanceChange = calculateBalanceChange(
          entry.account.type,
          entry.credit as any,
          entry.debit as any
        );

        await tx.account.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      // Delete transaction (entries cascade automatically)
      await tx.transaction.delete({
        where: { id: parseInt(id) },
      });
    });

    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
