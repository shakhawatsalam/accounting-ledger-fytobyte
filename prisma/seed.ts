import { AccountType } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";




async function main() {
  // Create chart of accounts with proper enum types
  const accounts = [
    // Assets (1000-1999)
    { code: "1001", name: "Cash", type: AccountType.ASSET, balance: 10000 },
    {
      code: "1002",
      name: "Accounts Receivable",
      type: AccountType.ASSET,
      balance: 5000,
    },
    {
      code: "1003",
      name: "Inventory",
      type: AccountType.ASSET,
      balance: 15000,
    },
    {
      code: "1004",
      name: "Prepaid Expenses",
      type: AccountType.ASSET,
      balance: 2000,
    },

    // Liabilities (2000-2999)
    {
      code: "2001",
      name: "Accounts Payable",
      type: AccountType.LIABILITY,
      balance: 8000,
    },
    {
      code: "2002",
      name: "Loans Payable",
      type: AccountType.LIABILITY,
      balance: 12000,
    },
    {
      code: "2003",
      name: "Accrued Expenses",
      type: AccountType.LIABILITY,
      balance: 3000,
    },

    // Equity (3000-3999)
    {
      code: "3001",
      name: "Owner's Capital",
      type: AccountType.EQUITY,
      balance: 20000,
    },
    {
      code: "3002",
      name: "Retained Earnings",
      type: AccountType.EQUITY,
      balance: 0,
    },

    // Revenue (4000-4999)
    {
      code: "4001",
      name: "Sales Revenue",
      type: AccountType.REVENUE,
      balance: 0,
    },
    {
      code: "4002",
      name: "Service Revenue",
      type: AccountType.REVENUE,
      balance: 0,
    },
    {
      code: "4003",
      name: "Interest Income",
      type: AccountType.REVENUE,
      balance: 0,
    },

    // Expenses (5000-5999)
    {
      code: "5001",
      name: "Rent Expense",
      type: AccountType.EXPENSE,
      balance: 0,
    },
    {
      code: "5002",
      name: "Utilities Expense",
      type: AccountType.EXPENSE,
      balance: 0,
    },
    {
      code: "5003",
      name: "Salary Expense",
      type: AccountType.EXPENSE,
      balance: 0,
    },
    {
      code: "5004",
      name: "Marketing Expense",
      type: AccountType.EXPENSE,
      balance: 0,
    },
    {
      code: "5005",
      name: "Office Supplies",
      type: AccountType.EXPENSE,
      balance: 0,
    },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
  }

  console.log("Database seeded successfully!");

  // Create sample transactions
  const cashAccount = await prisma.account.findUnique({
    where: { code: "1001" },
  });
  const revenueAccount = await prisma.account.findUnique({
    where: { code: "4001" },
  });
  const expenseAccount = await prisma.account.findUnique({
    where: { code: "5001" },
  });
  const payableAccount = await prisma.account.findUnique({
    where: { code: "2001" },
  });

  if (cashAccount && revenueAccount && expenseAccount && payableAccount) {
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
        date: new Date(Date.now() - 86400000),
        entries: {
          create: [
            { accountId: expenseAccount.id, debit: 800, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: 800 },
          ],
        },
      },
    });

    // Sample purchase on credit
    const inventoryAccount = await prisma.account.findUnique({
      where: { code: "1003" },
    });
    if (inventoryAccount) {
      await prisma.transaction.create({
        data: {
          description: "Inventory purchase from supplier",
          date: new Date(Date.now() - 172800000),
          entries: {
            create: [
              { accountId: inventoryAccount.id, debit: 2500, credit: 0 },
              { accountId: payableAccount.id, debit: 0, credit: 2500 },
            ],
          },
        },
      });
    }

    // Sample service revenue
    const serviceAccount = await prisma.account.findUnique({
      where: { code: "4002" },
    });
    if (serviceAccount) {
      await prisma.transaction.create({
        data: {
          description: "Consulting services provided",
          reference: "INV-001",
          date: new Date(Date.now() - 259200000),
          entries: {
            create: [
              { accountId: cashAccount.id, debit: 3200, credit: 0 },
              { accountId: serviceAccount.id, debit: 0, credit: 3200 },
            ],
          },
        },
      });
    }

    console.log("Sample transactions created!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
