"use client";

import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Lock } from "lucide-react";

export const PermissionGuard = ({ permission, children }) => {
  const { org, loading } = useAuth();
  const router = useRouter();

  const hasPermission = org?.role === "ADMIN" || org?.permissions?.includes(permission);

  useEffect(() => {
    if (!loading && !hasPermission) {
      // Small delay to show unauthorized state before potentially redirecting
      // router.push("/inbox"); 
    }
  }, [loading, hasPermission, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Access Denied</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">You do not have the required permissions to view this section. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return children;
};
