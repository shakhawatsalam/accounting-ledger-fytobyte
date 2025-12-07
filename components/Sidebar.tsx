"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";

const accountGroups = [
  {
    title: "Assets",
    type: "ASSET",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Liabilities",
    type: "LIABILITY",
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  {
    title: "Equity",
    type: "EQUITY",
    icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Revenue",
    type: "REVENUE",
    icon: TrendingUp,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Expenses",
    type: "EXPENSE",
    icon: TrendingDown,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='hidden lg:block w-64 border-r bg-white dark:bg-gray-800'>
      <div className='p-6'>
        <h2 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
          Account Groups
        </h2>

        <div className='space-y-2'>
          {accountGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Link
                key={group.type}
                href={`/accounts?type=${group.type.toLowerCase()}`}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  pathname.includes("/accounts") &&
                    "bg-gray-50 dark:bg-gray-700"
                )}>
                <div className={cn("p-2 rounded-md", group.bgColor)}>
                  <Icon className={cn("h-5 w-5", group.color)} />
                </div>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  {group.title}
                </span>
              </Link>
            );
          })}
        </div>

        <div className='mt-8 pt-6 border-t'>
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-3'>
            Quick Actions
          </h3>
          <div className='space-y-2'>
            <Link
              href='/accounts'
              className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
              <Wallet className='h-4 w-4' />
              <span>Manage Accounts</span>
            </Link>
            <Link
              href='/settings'
              className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
              <Settings className='h-4 w-4' />
              <span>Settings</span>
            </Link>
            <Link
              href='/help'
              className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
              <HelpCircle className='h-4 w-4' />
              <span>Help & Support</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
