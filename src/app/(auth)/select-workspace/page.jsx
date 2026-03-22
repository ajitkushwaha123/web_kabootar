"use client";

import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, ArrowRight, Building2, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function SelectWorkspacePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch("/api/organization/list");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations || []);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchOrgs();
    }
  }, [isLoaded, user]);

  const handleSelect = async (orgId) => {
    setSelectingId(orgId);
    try {
      const response = await fetch("/api/organization/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });

      if (response.ok) {
        toast.success("Workspace selected");
        // Force a page refresh to update auth state
        window.location.href = "/";
      } else {
        toast.error("Failed to select workspace");
      }
    } catch (error) {
      console.error("Error selecting workspace:", error);
      toast.error("An error occurred");
    } finally {
      setSelectingId(null);
    }
  };

  if (!isLoaded || (loading && organizations.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FBFF]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[600px] space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">
              K
            </div>
            <span className="text-xl font-bold tracking-tight">Kabootar</span>
          </div>
          <SignOutButton>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
          <p className="text-slate-500">Select a workspace to continue or create a new one.</p>
        </div>

        <div className="grid gap-4">
          {organizations.map((org) => (
            <Card 
              key={org.org_id} 
              className="group cursor-pointer hover:border-blue-500 hover:shadow-md transition-all border-slate-100 shadow-sm overflow-hidden"
              onClick={() => handleSelect(org.org_id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-slate-100 rounded-lg">
                  <AvatarImage src={org.logo_url} />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold rounded-lg text-lg">
                    {org.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                    {org.name}
                  </h3>
                  <p className="text-xs text-slate-400">kabootar.live/{org.slug}</p>
                </div>
                {selectingId === org.org_id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                )}
              </CardContent>
            </Card>
          ))}

          <Button 
            variant="outline" 
            className="w-full h-16 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all rounded-xl gap-2"
            onClick={() => router.push("/create-workspace")}
          >
            <Plus size={20} />
            <span className="font-semibold">Create New Workspace</span>
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400">
          Showing all available organizations (Admin Preview Mode)
        </p>
      </div>
    </div>
  );
}
