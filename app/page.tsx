import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import QuickActions from "@/components/dashboard/QuickActions";
import FinancialOverview from "@/components/dashboard/FinancialOverview";

export default function Home() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Dashboard
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            Overview of your accounting system
          </p>
        </div>
        <QuickActions />
      </div>

      <DashboardStats />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <RecentTransactions />
        </div>
        <div>
          <FinancialOverview />
        </div>
      </div>
    </div>
  );
}
