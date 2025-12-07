"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceSheetProps {
  asOfDate?: string;
}

export default function BalanceSheet({ asOfDate }: BalanceSheetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["balance-sheet", asOfDate],
    queryFn: () => api.reports.balanceSheet(asOfDate),
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
          <CardTitle>Balance Sheet</CardTitle>
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
        <XCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load balance sheet. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const renderAccountGroup = (
    title: string,
    accounts: any[],
    total: number
  ) => (
    <div className='space-y-2'>
      <div className='flex items-center justify-between py-2 border-b'>
        <h3 className='text-lg font-semibold'>{title}</h3>
        <span className='font-bold'>{formatCurrency(total)}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className='text-right'>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className='font-medium'>{account.name}</TableCell>
              <TableCell>
                <Badge variant='outline'>{account.code}</Badge>
              </TableCell>
              <TableCell className='text-right font-medium'>
                {formatCurrency(account.balance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const accountingEquationBalances =
    Math.abs(
      data.totals.assets -
        (data.totals.liabilities + data.totals.equityWithNetIncome)
    ) < 0.01;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Balance Sheet</CardTitle>
          <div className='text-sm text-gray-500'>
            As of {asOfDate ? new Date(asOfDate).toLocaleDateString() : "Today"}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-8'>
        {/* Accounting Equation Validation */}
        <Alert
          className={cn(
            accountingEquationBalances
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}>
          {accountingEquationBalances ? (
            <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
          ) : (
            <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          )}
          <AlertTitle>
            Accounting Equation: Assets = Liabilities + Equity
          </AlertTitle>
          <AlertDescription>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-2'>
              <div className='space-y-1'>
                <div className='flex items-center'>
                  <TrendingUp className='h-4 w-4 mr-2 text-green-600' />
                  <span className='font-medium'>Assets:</span>
                </div>
                <p className='text-lg font-bold'>
                  {formatCurrency(data.totals.assets)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center'>
                  <TrendingDown className='h-4 w-4 mr-2 text-red-600' />
                  <span className='font-medium'>Liabilities:</span>
                </div>
                <p className='text-lg font-bold'>
                  {formatCurrency(data.totals.liabilities)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center'>
                  <TrendingUp className='h-4 w-4 mr-2 text-blue-600' />
                  <span className='font-medium'>Equity:</span>
                </div>
                <p className='text-lg font-bold'>
                  {formatCurrency(data.totals.equityWithNetIncome)}
                </p>
              </div>
            </div>
            <div className='mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border'>
              <p className='text-center font-mono'>
                {formatCurrency(data.totals.assets)} ={" "}
                {formatCurrency(data.totals.liabilities)} +{" "}
                {formatCurrency(data.totals.equityWithNetIncome)}
              </p>
              <p
                className={cn(
                  "text-center mt-2 font-semibold",
                  accountingEquationBalances ? "text-green-600" : "text-red-600"
                )}>
                {accountingEquationBalances
                  ? "✓ Equation balances perfectly!"
                  : "✗ Equation does not balance!"}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Assets Section */}
        {renderAccountGroup(
          "Assets",
          data.groupedBalances.assets.filter((a: any) => a.balance !== 0),
          data.totals.assets
        )}

        {/* Liabilities Section */}
        {renderAccountGroup(
          "Liabilities",
          data.groupedBalances.liabilities.filter((a: any) => a.balance !== 0),
          data.totals.liabilities
        )}

        {/* Equity Section */}
        {renderAccountGroup(
          "Equity",
          [
            ...data.groupedBalances.equity.filter((a: any) => a.balance !== 0),
            {
              id: "net-income",
              code: "3900",
              name: "Retained Earnings (Net Income)",
              balance: data.totals.netIncome,
            },
          ],
          data.totals.equityWithNetIncome
        )}

        {/* Summary */}
        <div className='border-t pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <h4 className='font-semibold text-blue-700 dark:text-blue-300'>
                Total Assets
              </h4>
              <p className='text-2xl font-bold'>
                {formatCurrency(data.totals.assets)}
              </p>
            </div>
            <div className='space-y-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
              <h4 className='font-semibold text-red-700 dark:text-red-300'>
                Total Liabilities
              </h4>
              <p className='text-2xl font-bold'>
                {formatCurrency(data.totals.liabilities)}
              </p>
            </div>
            <div className='space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <h4 className='font-semibold text-green-700 dark:text-green-300'>
                Net Equity
              </h4>
              <p className='text-2xl font-bold'>
                {formatCurrency(data.totals.equityWithNetIncome)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
