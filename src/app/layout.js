"use client";

import { Poppins } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/global/sidebar/app-sidebar";
import ReduxProvider from "@/components/providers/ReduxProviders";
import { ClerkProvider } from "@clerk/nextjs";
import DashboardHeader from "@/components/global/DashboardHeader/DashboardHeader";
import { usePathname } from "next/navigation";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} antialiased`}>
          <ReduxProvider>
            <SidebarProvider>
              {!isAuthPage && <AppSidebar />}
              <main className="w-full">
                {!isAuthPage && <DashboardHeader />}
                {children}
              </main>
            </SidebarProvider>
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
