"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  loading = false,
}: {
  title: string;
  value: string;
  change?: string;
  icon: any;
  trend?: "up" | "down";
  loading?: boolean;
}) => (
  <Card>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>{title}</p>
          {loading ? (
            <Skeleton className='h-8 w-32 mt-2' />
          ) : (
            <p className='text-2xl font-bold mt-2'>{value}</p>
          )}
          {change && (
            <div className='flex items-center mt-2'>
              {trend === "up" ? (
                <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
              ) : (
                <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
              )}
              <span
                className={`text-sm ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className='p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20'>
          <Icon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [accounts, transactions, balanceSheet] = await Promise.all([
        api.accounts.getAll(),
        api.transactions.getAll({ limit: 1 }),
        api.reports.balanceSheet(),
      ]);

      return {
        accounts: accounts.length,
        transactions: transactions.pagination.total,
        assets: balanceSheet.totals.assets,
        revenue: balanceSheet.totals.revenue,
        netIncome: balanceSheet.totals.netIncome,
        profitMargin:
          balanceSheet.totals.netIncome > 0
            ? (
                (balanceSheet.totals.netIncome / balanceSheet.totals.revenue) *
                100
              ).toFixed(1)
            : "0.0",
      };
    },
  });

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <StatCard
        title='Total Accounts'
        value={stats?.accounts?.toString() || "0"}
        change='+2 this month'
        icon={Wallet}
        loading={isLoading}
      />
      <StatCard
        title='Total Transactions'
        value={stats?.transactions?.toString() || "0"}
        change='+12 today'
        icon={FileText}
        loading={isLoading}
      />
      <StatCard
        title='Total Assets'
        value={`$${stats?.assets?.toLocaleString() || "0"}`}
        change='+5.2%'
        icon={DollarSign}
        loading={isLoading}
      />
      <StatCard
        title='Net Profit'
        value={`$${stats?.netIncome?.toLocaleString() || "0"}`}
        change={`${stats?.profitMargin || "0"}% margin`}
        icon={CreditCard}
        trend={stats?.netIncome && stats.netIncome > 0 ? "up" : "down"}
        loading={isLoading}
      />
    </div>
  );
}
