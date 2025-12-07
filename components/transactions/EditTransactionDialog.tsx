/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, type Transaction } from "@/lib/api-client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z
  .object({
    date: z.date(),
    description: z.string().min(1, "Description is required"),
    reference: z.string().optional(),
    entries: z
      .array(
        z.object({
          id: z.number().optional(),
          accountId: z.string().min(1, "Account is required"),
          debit: z
            .string()
            .refine(
              (val) => !val || parseFloat(val) >= 0,
              "Debit must be positive"
            ),
          credit: z
            .string()
            .refine(
              (val) => !val || parseFloat(val) >= 0,
              "Credit must be positive"
            ),
        })
      )
      .min(2, "At least two entries required"),
  })
  .refine(
    (data) => {
      const totalDebits = data.entries.reduce(
        (sum, entry) => sum + parseFloat(entry.debit || "0"),
        0
      );
      const totalCredits = data.entries.reduce(
        (sum, entry) => sum + parseFloat(entry.credit || "0"),
        0
      );
      return Math.abs(totalDebits - totalCredits) < 0.01;
    },
    {
      message: "Total debits must equal total credits",
      path: ["entries"],
    }
  );

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number | null;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transactionId,
}: EditTransactionDialogProps) {
  const queryClient = useQueryClient();

  // Fetch transaction data when dialog opens
  const { data: transaction, isLoading: isLoadingTransaction } =
    useQuery<Transaction>({
      queryKey: ["transaction", transactionId],
      queryFn: () => api.transactions.getById(transactionId!),
      enabled: open && !!transactionId,
    });

  // Fetch accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      reference: "",
      entries: [
        { accountId: "", debit: "", credit: "" },
        { accountId: "", debit: "", credit: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  // Populate form when transaction data loads
  useEffect(() => {
    if (transaction) {
      form.reset({
        date: new Date(transaction.date),
        description: transaction.description,
        reference: transaction.reference || "",
        entries: transaction.entries.map((entry) => ({
          id: entry.id,
          accountId: entry.accountId.toString(),
          debit: entry.debit.toString(),
          credit: entry.credit.toString(),
        })),
      });
    }
  }, [transaction, form]);

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      if (!transactionId) throw new Error("Transaction ID is required");

      return api.transactions.update(transactionId, {
        ...data,
        date: data.date.toISOString(),
        entries: data.entries.map((entry) => ({
          accountId: parseInt(entry.accountId),
          debit: parseFloat(entry.debit || "0"),
          credit: parseFloat(entry.credit || "0"),
        })),
      });
    },
    onSuccess: () => {
      toast.success("Transaction updated successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  const handleDeleteEntry = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl flex items-center gap-2'>
            {isLoadingTransaction ? (
              <Loader2 className='h-5 w-5 animate-spin' />
            ) : null}
            Edit Transaction {transactionId ? `#${transactionId}` : ""}
          </DialogTitle>
        </DialogHeader>

        {isLoadingTransaction ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Header Fields */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}>
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={(date) => {
                              // Handle undefined case
                              if (date) {
                                field.onChange(date);
                              }
                            }}
                            initialFocus
                            required={false}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='reference'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., INV-001' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex items-end'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      append({ accountId: "", debit: "", credit: "" })
                    }
                    className='w-full'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Entry
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe the transaction...'
                        className='min-h-20'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Journal Entries Table */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Journal Entries</h3>
                  <div className='text-sm text-gray-500'>
                    Total Debits: $
                    {fields
                      .reduce(
                        (sum, _, index) =>
                          sum +
                          parseFloat(
                            form.watch(`entries.${index}.debit`) || "0"
                          ),
                        0
                      )
                      .toFixed(2)}
                    {" | "}
                    Total Credits: $
                    {fields
                      .reduce(
                        (sum, _, index) =>
                          sum +
                          parseFloat(
                            form.watch(`entries.${index}.credit`) || "0"
                          ),
                        0
                      )
                      .toFixed(2)}
                  </div>
                </div>

                <div className='border rounded-lg overflow-hidden'>
                  <div className='grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b'>
                    <div className='col-span-5 font-medium'>Account</div>
                    <div className='col-span-3 font-medium text-center'>
                      Debit
                    </div>
                    <div className='col-span-3 font-medium text-center'>
                      Credit
                    </div>
                    <div className='col-span-1 font-medium text-center'>
                      Actions
                    </div>
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='grid grid-cols-12 gap-4 p-4 border-b last:border-0'>
                      <div className='col-span-5'>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.accountId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select account' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem
                                      key={account.id}
                                      value={account.id.toString()}>
                                      {account.code} - {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='col-span-3'>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.debit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='0.00'
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    if (
                                      e.target.value &&
                                      parseFloat(e.target.value) > 0
                                    ) {
                                      form.setValue(
                                        `entries.${index}.credit`,
                                        ""
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='col-span-3'>
                        <FormField
                          control={form.control}
                          name={`entries.${index}.credit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='0.00'
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    if (
                                      e.target.value &&
                                      parseFloat(e.target.value) > 0
                                    ) {
                                      form.setValue(
                                        `entries.${index}.debit`,
                                        ""
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='col-span-1 flex items-center justify-center'>
                        {fields.length > 2 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDeleteEntry(index)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Summary */}
              {form.formState.errors.entries?.message && (
                <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                  <div className='flex items-center text-red-600 dark:text-red-400'>
                    <X className='h-5 w-5 mr-2' />
                    {form.formState.errors.entries.message}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button type='submit' disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className='h-4 w-4 mr-2' />
                      Update Transaction
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
