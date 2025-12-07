"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type IncomeStatementResponse } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IncomeStatementProps {
  startDate?: string;
  endDate?: string;
}

export default function IncomeStatement({
  startDate,
  endDate,
}: IncomeStatementProps) {
  const { data, isLoading, error } = useQuery<IncomeStatementResponse>({
    queryKey: ["income-statement", startDate, endDate],
    queryFn: () => api.reports.incomeStatement(startDate, endDate),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-64 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load income statement. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const periodText = startDate
    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate || new Date()
      ).toLocaleDateString()}`
    : "Current Period";

  const isProfitable = data.netIncome > 0;
  const profitMargin = data.profitMargin || 0;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Income Statement (Profit & Loss)</CardTitle>
          <div className='text-sm text-gray-500'>{periodText}</div>
        </div>
      </CardHeader>
      <CardContent className='space-y-8'>
        {/* Profit Summary */}
        <div
          className={cn(
            "p-6 rounded-lg border",
            isProfitable
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              {isProfitable ? (
                <TrendingUp className='h-8 w-8 text-green-600' />
              ) : (
                <TrendingDown className='h-8 w-8 text-red-600' />
              )}
              <div>
                <h3 className='text-lg font-semibold'>
                  {isProfitable ? "Net Profit" : "Net Loss"}
                </h3>
                <p className='text-sm text-gray-500'>
                  After all revenues and expenses
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p
                className={cn(
                  "text-3xl font-bold",
                  isProfitable ? "text-green-600" : "text-red-600"
                )}>
                {formatCurrency(data.netIncome)}
              </p>
              <p className='text-sm text-gray-500'>
                {profitMargin.toFixed(1)}% Profit Margin
              </p>
            </div>
          </div>
          <Progress
            value={Math.min(100, Math.abs(profitMargin))}
            className={cn("h-2", isProfitable ? "bg-green-100" : "bg-red-100")}
          />
        </div>

        {/* Revenue Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-2 border-b'>
            <h3 className='text-lg font-semibold flex items-center'>
              <TrendingUp className='h-5 w-5 mr-2 text-green-600' />
              Revenue
            </h3>
            <span className='font-bold text-green-600'>
              {formatCurrency(data.revenues.total)}
            </span>
          </div>
          {data.revenues.accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-right'>% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenues.accounts.map((revenue) => {
                  const percentage =
                    (revenue.periodBalance / data.revenues.total) * 100;
                  return (
                    <TableRow key={revenue.id}>
                      <TableCell className='font-medium'>
                        {revenue.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{revenue.code}</Badge>
                      </TableCell>
                      <TableCell className='text-right font-medium text-green-600'>
                        {formatCurrency(revenue.periodBalance)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end space-x-2'>
                          <Progress value={percentage} className='w-24 h-2' />
                          <span className='text-sm'>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No revenue recorded for this period
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-2 border-b'>
            <h3 className='text-lg font-semibold flex items-center'>
              <TrendingDown className='h-5 w-5 mr-2 text-red-600' />
              Expenses
            </h3>
            <span className='font-bold text-red-600'>
              {formatCurrency(data.expenses.total)}
            </span>
          </div>
          {data.expenses.accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='text-right'>% of Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses.accounts.map((expense) => {
                  const percentage =
                    (expense.periodBalance / data.revenues.total) * 100;
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className='font-medium'>
                        {expense.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{expense.code}</Badge>
                      </TableCell>
                      <TableCell className='text-right font-medium text-red-600'>
                        {formatCurrency(expense.periodBalance)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end space-x-2'>
                          <Progress value={percentage} className='w-24 h-2' />
                          <span className='text-sm'>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No expenses recorded for this period
            </div>
          )}
        </div>

        {/* Financial Ratios */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center'>
            <PieChart className='h-5 w-5 mr-2 text-blue-600' />
            Financial Ratios
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium'>Gross Margin</span>
                <BarChart3 className='h-4 w-4 text-blue-600' />
              </div>
              <p className='text-2xl font-bold'>
                {data.revenues.total > 0
                  ? (
                      ((data.revenues.total - data.expenses.total) /
                        data.revenues.total) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
            </div>
            <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium'>Profit Margin</span>
                <DollarSign className='h-4 w-4 text-green-600' />
              </div>
              <p
                className={cn(
                  "text-2xl font-bold",
                  profitMargin > 0 ? "text-green-600" : "text-red-600"
                )}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium'>Expense Ratio</span>
                <TrendingDown className='h-4 w-4 text-purple-600' />
              </div>
              <p className='text-2xl font-bold'>
                {data.revenues.total > 0
                  ? ((data.expenses.total / data.revenues.total) * 100).toFixed(
                      1
                    )
                  : "0.0"}
                %
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
