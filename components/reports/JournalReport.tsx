"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type JournalResponse } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JournalReportProps {
  startDate?: string;
  endDate?: string;
}

export default function JournalReport({
  startDate,
  endDate,
}: JournalReportProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accountFilter, setAccountFilter] = useState("all");

  const { data, isLoading } = useQuery<JournalResponse>({
    queryKey: [
      "journal-report",
      page,
      search,
      accountFilter,
      startDate,
      endDate,
    ],
    queryFn: () =>
      api.reports.journal({
        page,
        limit: 20,
        search: search || undefined,
        startDate,
        endDate,
      }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <CardTitle>General Journal Report</CardTitle>
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search entries...'
                className='pl-10 w-full md:w-64'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant='outline' size='icon'>
              <Filter className='h-4 w-4' />
            </Button>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : (
          <>
            {/* Journal Table */}
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className='text-right'>Debit</TableHead>
                    <TableHead className='text-right'>Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.journalEntries?.map((entry, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <TableRow
                        key={`${entry.transactionId}-${index}`}
                        className={cn(
                          isEven && "bg-gray-50 dark:bg-gray-800/50"
                        )}>
                        <TableCell className='font-medium whitespace-nowrap'>
                          <div className='flex flex-col'>
                            <span>
                              {format(new Date(entry.date), "MMM dd, yyyy")}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {format(new Date(entry.date), "hh:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <FileText className='h-4 w-4 mr-2 text-gray-400' />
                            <span className='line-clamp-2 max-w-[200px]'>
                              {entry.description}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.reference ? (
                            <Badge variant='outline'>{entry.reference}</Badge>
                          ) : (
                            <span className='text-gray-400 text-sm'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {entry.accountName}
                            </div>
                            <Badge variant='secondary' className='text-xs'>
                              {entry.accountCode}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          {Number(entry.debit) > 0 ? (
                            <div className='flex items-center justify-end space-x-2'>
                              <div className='w-2 h-2 rounded-full bg-green-500'></div>
                              <span className='font-medium text-green-600'>
                                {formatCurrency(entry.debit)}
                              </span>
                            </div>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {Number(entry.credit) > 0 ? (
                            <div className='flex items-center justify-end space-x-2'>
                              <div className='w-2 h-2 rounded-full bg-red-500'></div>
                              <span className='font-medium text-red-600'>
                                {formatCurrency(entry.credit)}
                              </span>
                            </div>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            {data?.journalEntries && data.journalEntries.length > 0 && (
              <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Total Debits</span>
                    <div className='w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center'>
                      <span className='text-green-600 dark:text-green-300 font-bold'>
                        D
                      </span>
                    </div>
                  </div>
                  <p className='text-2xl font-bold text-green-600 mt-2'>
                    {formatCurrency(
                      data.journalEntries.reduce(
                        (sum, entry) => sum + Number(entry.debit),
                        0
                      )
                    )}
                  </p>
                </div>
                <div className='p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Total Credits</span>
                    <div className='w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center'>
                      <span className='text-red-600 dark:text-red-300 font-bold'>
                        C
                      </span>
                    </div>
                  </div>
                  <p className='text-2xl font-bold text-red-600 mt-2'>
                    {formatCurrency(
                      data.journalEntries.reduce(
                        (sum, entry) => sum + Number(entry.credit),
                        0
                      )
                    )}
                  </p>
                </div>
                <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Total Entries</span>
                    <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center'>
                      <FileText className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                    </div>
                  </div>
                  <p className='text-2xl font-bold text-blue-600 mt-2'>
                    {data.journalEntries.length}
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {data?.pagination && (
              <div className='flex items-center justify-between mt-6'>
                <div className='text-sm text-gray-500'>
                  Showing{" "}
                  {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
                  {Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total
                  )}{" "}
                  of {data.pagination.total} entries
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}>
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  <div className='flex items-center space-x-1'>
                    {Array.from(
                      { length: Math.min(3, data.pagination.totalPages) },
                      (_, i) => {
                        const pageNum =
                          Math.max(
                            1,
                            Math.min(data.pagination.totalPages - 2, page - 1)
                          ) + i;
                        if (pageNum > data.pagination.totalPages) return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size='sm'
                            onClick={() => setPage(pageNum)}>
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.totalPages}>
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}

            {!isLoading &&
              (!data?.journalEntries || data.journalEntries.length === 0) && (
                <div className='text-center py-12'>
                  <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                    No journal entries found
                  </h3>
                  <p className='text-gray-500'>
                    {search
                      ? "Try a different search term"
                      : "No transactions recorded for the selected period"}
                  </p>
                </div>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
