"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, BarChart3, List } from "lucide-react";

import { useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transactions", href: "/transactions", icon: List },
  { name: "Journal", href: "/journal", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Navigation() {
  const pathname = usePathname();
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <nav className='bg-white dark:bg-gray-800 border-b shadow-sm'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <div className='flex items-center space-x-8'>
              <Link href='/' className='flex items-center space-x-2'>
                <div className='h-8 w-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold'>L</span>
                </div>
                <span className='text-xl font-bold text-gray-800 dark:text-white'>
                  LedgerPro
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className='hidden md:flex items-center space-x-1'>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}>
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className='md:hidden py-3 border-t'>
            <div className='flex justify-around'>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300"
                    }`}>
                    <Icon size={20} />
                    <span className='text-xs'>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
