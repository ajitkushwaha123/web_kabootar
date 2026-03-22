"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/nextjs";
import { store } from "@/store";
import { AuthProvider, useAuth } from "@/lib/auth/context";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";

const OrgValidator = ({ children }) => {
  const { user, org, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublicAuthPage = pathname === "/create-workspace" || pathname === "/select-workspace";
    if (!loading && user && !org && !isPublicAuthPage) {
      router.push("/select-workspace");
    }
  }, [user, org, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Checking your organization...</p>
        </div>
      </div>
    );
  }

  return children;
};

const AppShell = ({ children }) => {
  const pathname = usePathname();
  const isAuthStage = pathname === "/create-workspace" || pathname === "/select-workspace";

  return (
    <ClerkProvider>
      <Provider store={store}>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <OrgValidator>
            {isAuthStage ? (
              <main className="min-h-screen bg-slate-50">{children}</main>
            ) : (
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } 
                }
              >
                <div className="flex min-h-screen w-full">
                  {/* Sidebar */}
                  <AppSidebar variant="inset" />

                  {/* Main content area */}
                  <SidebarInset className="flex flex-1 flex-col min-w-0">
                    <SiteHeader />
                    <main className="flex-1 min-w-0">{children}</main>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            )}
          </OrgValidator>
        </AuthProvider>
      </Provider>
    </ClerkProvider>
  );
};

export default AppShell;
