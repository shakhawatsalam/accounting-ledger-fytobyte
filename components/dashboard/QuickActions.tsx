"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import { PlusCircle } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "recalculate":
        toast({
          title: "Recalculating balances...",
          description: "Account balances are being updated.",
        });
        break;
      case "export":
        toast({
          title: "Export started",
          description: "Your data export has been queued.",
        });
        break;
      case "report":
        toast({
          title: "Report generated",
          description: "Financial report is ready for download.",
        });
        break;
    }
  };

  return (
    <>
      <div className='flex items-center space-x-3'>
        <Button
          onClick={() => setShowAddDialog(true)}
          className='hidden md:flex'>
          <PlusCircle className='h-4 w-4 mr-2' />
          New Transaction
        </Button>

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <Settings className='h-4 w-4 mr-2' />
              Quick Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
              <PlusCircle className='h-4 w-4 mr-2' />
              <span>New Transaction</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("recalculate")}>
              <RefreshCw className='h-4 w-4 mr-2' />
              <span>Recalculate Balances</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("report")}>
              <BarChart3 className='h-4 w-4 mr-2' />
              <span>Generate Report</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("export")}>
              <Download className='h-4 w-4 mr-2' />
              <span>Export Data</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileText className='h-4 w-4 mr-2' />
              <span>View Journal</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calculator className='h-4 w-4 mr-2' />
              <span>Tax Calculator</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TrendingUp className='h-4 w-4 mr-2' />
              <span>Performance Analytics</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
