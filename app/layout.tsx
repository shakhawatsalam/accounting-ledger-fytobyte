import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/QueryProvider";
import Navigation from "@/components/Navigation";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerPro | Double-Entry Accounting",
  description: "Modern double-entry accounting system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
            <Navigation />
            <div className='flex'>
              {/* <Sidebar /> */}
              <main className='flex-1 p-6 lg:p-8'>
                <div className='max-w-7xl mx-auto'>{children}</div>
              </main>
            </div>
            <Toaster />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
