"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BalanceSheet from "@/components/reports/BalanceSheet";
import IncomeStatement from "@/components/reports/IncomeStatement";
import JournalReport from "@/components/reports/JournalReport";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("balance");

  // Handle date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Financial Reports
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            Generate and analyze financial reports
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <Filter className='h-4 w-4 text-gray-400' />
                <span className='text-sm font-medium'>Date Range:</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}>
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {startDate ? format(startDate, "PPP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                      required={false}
                    />
                  </PopoverContent>
                </Popover>
                <span className='text-gray-400'>to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}>
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {endDate ? format(endDate, "PPP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      initialFocus
                      required={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'>
        <TabsList className='grid grid-cols-3 w-full max-w-md'>
          <TabsTrigger value='balance' className='space-x-2'>
            <TrendingUp className='h-4 w-4' />
            <span>Balance Sheet</span>
          </TabsTrigger>
          <TabsTrigger value='income' className='space-x-2'>
            <TrendingDown className='h-4 w-4' />
            <span>Income Statement</span>
          </TabsTrigger>
          <TabsTrigger value='journal' className='space-x-2'>
            <CalendarIcon className='h-4 w-4' />
            <span>General Journal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='balance' className='space-y-6'>
          <BalanceSheet asOfDate={endDate?.toISOString()} />
        </TabsContent>

        <TabsContent value='income' className='space-y-6'>
          <IncomeStatement
            startDate={startDate?.toISOString()}
            endDate={endDate?.toISOString()}
          />
        </TabsContent>

        <TabsContent value='journal' className='space-y-6'>
          <JournalReport
            startDate={startDate?.toISOString()}
            endDate={endDate?.toISOString()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
