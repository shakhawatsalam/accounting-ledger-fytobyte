"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type JournalResponse } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accountFilter, setAccountFilter] = useState("all");

  const { data, isLoading } = useQuery<JournalResponse>({
    queryKey: ["journal", page, search, accountFilter],
    queryFn: () =>
      api.reports.journal({
        page,
        limit: 50,
        search: search || undefined,
      }),
  });

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            General Journal
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            Chronological record of all transactions
          </p>
        </div>
        <Button variant='outline'>
          <Download className='h-4 w-4 mr-2' />
          Export Journal
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search journal entries...'
                  className='pl-10'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className='w-[180px]'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Account filter' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Accounts</SelectItem>
                  <SelectItem value='asset'>Assets Only</SelectItem>
                  <SelectItem value='liability'>Liabilities Only</SelectItem>
                  <SelectItem value='revenue'>Revenue Only</SelectItem>
                  <SelectItem value='expense'>Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
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
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className='text-right'>Debit</TableHead>
                      <TableHead className='text-right'>Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.journalEntries?.map((entry, index) => (
                      <TableRow
                        key={`${entry.transactionId}-${index}`}
                        className={
                          index % 2 === 0
                            ? "bg-gray-50 dark:bg-gray-800/50"
                            : ""
                        }>
                        <TableCell className='font-medium'>
                          {format(new Date(entry.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <FileText className='h-4 w-4 mr-2 text-gray-400' />
                            {entry.description}
                          </div>
                          {entry.reference && (
                            <Badge variant='outline' className='mt-1 text-xs'>
                              Ref: {entry.reference}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {entry.accountName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {entry.accountCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          {entry.debit > 0 ? (
                            <span className='font-medium text-green-600'>
                              ${Number(entry.debit).toFixed(2)}
                            </span>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {entry.credit > 0 ? (
                            <span className='font-medium text-red-600'>
                              ${Number(entry.credit).toFixed(2)}
                            </span>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}>
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pagination.totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
