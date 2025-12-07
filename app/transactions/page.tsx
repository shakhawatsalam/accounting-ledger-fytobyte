"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  api,
  type Transaction,
  type TransactionsResponse,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Calendar,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
// Import the new component
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";

export default function TransactionsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<TransactionsResponse>({
    queryKey: ["transactions", page, search, dateFilter],
    queryFn: () =>
      api.transactions.getAll({
        page,
        limit: 20,
        search: search || undefined,
      }),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.transactions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete transaction");
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setShowEditDialog(true);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Transactions
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            Manage all financial transactions
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className='h-4 w-4 mr-2' />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search transactions...'
                  className='pl-10'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className='w-[180px]'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Date filter' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Time</SelectItem>
                  <SelectItem value='today'>Today</SelectItem>
                  <SelectItem value='week'>This Week</SelectItem>
                  <SelectItem value='month'>This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline'>
                <Calendar className='h-4 w-4 mr-2' />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : error ? (
            <div className='text-center py-8 text-gray-500'>
              Error loading transactions
            </div>
          ) : (
            <>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Accounts</TableHead>
                      <TableHead className='text-right'>Debits</TableHead>
                      <TableHead className='text-right'>Credits</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.transactions?.map((transaction: Transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className='font-medium'>
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <FileText className='h-4 w-4 mr-2 text-gray-400' />
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.reference ? (
                            <Badge variant='outline'>
                              {transaction.reference}
                            </Badge>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1 max-w-[200px]'>
                            {transaction.entries.slice(0, 2).map((entry) => (
                              <Badge
                                key={entry.id}
                                variant='secondary'
                                className='text-xs'>
                                {entry.account.code}
                              </Badge>
                            ))}
                            {transaction.entries.length > 2 && (
                              <Badge variant='outline' className='text-xs'>
                                +{transaction.entries.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='text-right text-green-600'>
                          $
                          {transaction.entries
                            .reduce(
                              (sum, entry) => sum + Number(entry.debit),
                              0
                            )
                            .toFixed(2)}
                        </TableCell>
                        <TableCell className='text-right text-red-600'>
                          $
                          {transaction.entries
                            .reduce(
                              (sum, entry) => sum + Number(entry.credit),
                              0
                            )
                            .toFixed(2)}
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEdit(transaction.id)}>
                                <Edit className='h-4 w-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-red-600'
                                onClick={() => handleDelete(transaction.id)}>
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                    of {data.pagination.total} transactions
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

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        transactionId={selectedTransactionId}
      />
    </div>
  );
}
