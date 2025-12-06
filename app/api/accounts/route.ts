import { AccountWhereInput } from "@/lib/generated/prisma/models";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// GET all accounts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    const whereClause = type ? { type } : {};

    const accounts = await prisma.account.findMany({
      where: whereClause as AccountWhereInput,
      orderBy: [{ type: "asc" }, { code: "asc" }],
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST create new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, type, description } = body;

    // Validate required fields
    if (!code || !name || !type) {
      return NextResponse.json(
        { error: "Code, name, and type are required" },
        { status: 400 }
      );
    }

    // Check if account code already exists
    const existingAccount = await prisma.account.findUnique({
      where: { code },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account code already exists" },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        code,
        name,
        type,
        description,
        balance: 0,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Failed to create account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
