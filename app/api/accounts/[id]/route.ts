import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// In Next.js 14 App Router, params is a Promise
interface Context {
  params: Promise<{ id: string }>;
}

// GET single account
export async function GET(request: NextRequest, { params }: Context) {
  try {
    // ✅ AWAIT params first!
    const { id } = await params;

    const account = await prisma.account.findUnique({
      where: { id: parseInt(id) },
      include: {
        entries: {
          include: {
            transaction: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit recent entries
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Failed to fetch account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

// PUT update account
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    // ✅ AWAIT params first!
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const account = await prisma.account.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("Failed to update account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE account (only if no transactions)
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    // ✅ AWAIT params first!
    const { id } = await params;

    // Check if account has any entries
    const accountWithEntries = await prisma.account.findUnique({
      where: { id: parseInt(id) },
      include: { entries: true },
    });

    if (!accountWithEntries) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (accountWithEntries.entries.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete account with existing transactions" },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
