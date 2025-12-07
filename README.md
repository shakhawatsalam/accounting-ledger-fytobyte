
## 📊 Accounting Ledger - Double-Entry Accounting System

A modern, full-stack double-entry accounting system built with Next.js 14, TypeScript, PostgreSQL, and Tailwind CSS. This application provides comprehensive financial transaction management with real-time reporting.
## 🚀 Live Demo

- https://accounting-ledger-fytobyte.vercel.app/
## Run Locally

Clone the project

```bash
  git clone https://github.com/shakhawatsalam/accounting-ledger-fytobyte.git
  cd accounting-ledger
```

Install dependencies

```bash
  npm install
```

Set Up Environment Variables

```bash
  # Database
    DATABASE_URL="postgresql://username:password@localhost:5432/accounting_ledger"
```

Start the server

```bash
  npm run dev
  npm run start
```


## 📁 Project Structure

```
├── app
│   ├── api
│   │   ├── accounts
│   │   │   ├── [id]
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── reports
│   │   │   ├── balance-sheet
│   │   │   │   └── route.ts
│   │   │   ├── income-statement
│   │   │   │   └── route.ts
│   │   │   └── journal
│   │   │       └── route.ts
│   │   ├── transactions
│   │   │   ├── [id]
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── utils
│   │       └── route.ts
│   ├── journal
│   │   └── page.tsx
│   ├── reports
│   │   └── page.tsx
│   ├── transactions
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── dashboard
│   │   ├── DashboardStats.tsx
│   │   ├── FinancialOverview.tsx
│   │   ├── QuickActions.tsx
│   │   └── RecentTransactions.tsx
│   ├── reports
│   │   ├── BalanceSheet.tsx
│   │   ├── IncomeStatement.tsx
│   │   └── JournalReport.tsx
│   ├── transactions
│   │   ├── AddTransactionDialog.tsx
│   │   └── EditTransactionDialog.tsx
│   ├── ui
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── Navigation.tsx
│   ├── QueryProvider.tsx
│   ├── Sidebar.tsx
│   └── ThemeProvider.tsx
├── hooks
├── lib
│   ├── generated
│   ├── api-client.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── validation.ts
├── prisma
│   ├── migrations
│   │   ├── 20251206040258_initial_schema
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore
├── README.md
├── components.json
├── env.example
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
└── tsconfig.json
```