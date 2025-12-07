"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type Transaction } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function RecentTransactions() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => api.transactions.getAll({ limit: 8 }),
  });

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/transactions'>View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  {/* <TableHead className='text-right'>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.transactions?.map((transaction: Transaction) => {
                  const totalDebits = transaction.entries.reduce(
                    (sum, entry) => sum + Number(entry.debit),
                    0
                  );
                  const totalCredits = transaction.entries.reduce(
                    (sum, entry) => sum + Number(entry.credit),
                    0
                  );
                  const isRevenue = totalCredits > totalDebits;

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className='font-medium'>
                        <div className='text-sm'>
                          {format(new Date(transaction.date), "MMM dd")}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {format(new Date(transaction.date), "hh:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center'>
                          <FileText className='h-4 w-4 mr-2 text-gray-400' />
                          <span className='truncate max-w-[200px]'>
                            {transaction.description}
                          </span>
                        </div>
                        {transaction.reference && (
                          <Badge variant='outline' className='mt-1 text-xs'>
                            {transaction.reference}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isRevenue ? "default" : "secondary"}
                          className='capitalize'>
                          {isRevenue ? "Revenue" : "Expense"}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end'>
                          {isRevenue ? (
                            <ArrowUpRight className='h-4 w-4 text-green-500 mr-2' />
                          ) : (
                            <ArrowDownRight className='h-4 w-4 text-red-500 mr-2' />
                          )}
                          <span
                            className={`font-medium ${
                              isRevenue ? "text-green-600" : "text-red-600"
                            }`}>
                            ${Math.max(totalDebits, totalCredits).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      {/* <TableCell className='text-right'>
                        <Button variant='ghost' size='icon' asChild>
                          <Link href={`/transactions/${transaction.id}`}>
                            <Eye className='h-4 w-4' />
                          </Link>
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
