"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function FinancialOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["financial-overview"],
    queryFn: async () => {
      const [balanceSheet, incomeStatement] = await Promise.all([
        api.reports.balanceSheet(),
        api.reports.incomeStatement(),
      ]);

      return {
        assets: balanceSheet.totals.assets,
        liabilities: balanceSheet.totals.liabilities,
        equity: balanceSheet.totals.equityWithNetIncome,
        revenue: incomeStatement.revenues.total,
        expenses: incomeStatement.expenses.total,
        netIncome: incomeStatement.netIncome,
        profitMargin: incomeStatement.profitMargin,
      };
    },
  });

  const metrics = [
    {
      label: "Revenue Growth",
      value: "+12.5%",
      change: "positive",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Expense Ratio",
      value: "65%",
      change: "neutral",
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Profit Margin",
      value: `${data?.profitMargin?.toFixed(1) || "0.0"}%`,
      change:
        data?.profitMargin && data.profitMargin > 15 ? "positive" : "negative",
      icon: DollarSign,
      color:
        data?.profitMargin && data.profitMargin > 15
          ? "text-green-600"
          : "text-red-600",
      bgColor:
        data?.profitMargin && data.profitMargin > 15
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <PieChart className='h-5 w-5 mr-2 text-blue-500' />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Key Metrics */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium text-gray-500'>Key Metrics</h3>
          <div className='grid grid-cols-2 gap-4'>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>
                      {metric.label}
                    </span>
                    <div className={cn("p-1.5 rounded", metric.bgColor)}>
                      <Icon className={cn("h-4 w-4", metric.color)} />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className='h-6 w-16' />
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <span className='text-xl font-bold'>{metric.value}</span>
                      {metric.change === "positive" && (
                        <TrendingUp className='h-4 w-4 text-green-500' />
                      )}
                      {metric.change === "negative" && (
                        <TrendingDown className='h-4 w-4 text-red-500' />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Distribution */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-gray-500'>
              Asset Distribution
            </h3>
            <BarChart3 className='h-4 w-4 text-gray-400' />
          </div>
          {isLoading ? (
            <Skeleton className='h-24 w-full' />
          ) : data ? (
            <>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Current Assets</span>
                  <span className='font-medium'>
                    ${(data.assets * 0.6).toLocaleString()}
                  </span>
                </div>
                <Progress value={60} className='h-2' />
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Fixed Assets</span>
                  <span className='font-medium'>
                    ${(data.assets * 0.3).toLocaleString()}
                  </span>
                </div>
                <Progress value={30} className='h-2' />
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Other Assets</span>
                  <span className='font-medium'>
                    ${(data.assets * 0.1).toLocaleString()}
                  </span>
                </div>
                <Progress value={10} className='h-2' />
              </div>
            </>
          ) : null}
        </div>

        {/* Quick Stats */}
        <div className='pt-4 border-t'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <p className='text-sm text-gray-500'>Total Assets</p>
              {isLoading ? (
                <Skeleton className='h-6 w-24' />
              ) : (
                <p className='text-lg font-bold'>
                  ${data?.assets?.toLocaleString() || "0"}
                </p>
              )}
            </div>
            <div className='space-y-1'>
              <p className='text-sm text-gray-500'>Net Income</p>
              {isLoading ? (
                <Skeleton className='h-6 w-24' />
              ) : (
                <p
                  className={cn(
                    "text-lg font-bold",
                    data?.netIncome && data.netIncome > 0
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                  ${data?.netIncome?.toLocaleString() || "0"}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
