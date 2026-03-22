"use client";

import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, LogOut, ArrowRight, Building2, Phone, Link2, Key } from "lucide-react";
import { toast } from "sonner";

export default function CreateWorkspacePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo_url: "",
    display_phone_number: "",
    phone_number_id: "",
    wa_business_account_id: "",
    access_token: "",
  });

  const [loading, setLoading] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const suggestedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, slug: suggestedSlug }));
    }
  }, [formData.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/organization/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Workspace created successfully!");
        // Refresh or redirect to the dashboard
        router.push("/");
      } else {
        toast.error(data.error || "Failed to create workspace");
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FBFF]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px] space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">
              K
            </div>
            <span className="text-xl font-bold tracking-tight">Kabootar</span>
          </div>
          <SignOutButton>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Create your workspace</CardTitle>
                <CardDescription className="text-slate-500 text-sm">
                  Set up your organization and WhatsApp details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-4">
              {/* Logo Selection Preview */}
              <div className="flex flex-col items-center gap-3 py-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                   <AvatarImage src={formData.logo_url} />
                   <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                     {formData.name?.charAt(0) || "W"}
                   </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center">
                  <Label htmlFor="logo_url" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Logo URL</Label>
                  <Input 
                    id="logo_url"
                    name="logo_url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="h-8 text-xs bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Workspace name</Label>
                  <Input 
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Acme Corp"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-100 h-11 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-slate-700 font-mono flex items-center gap-1.5">
                    <Link2 size={14} className="text-slate-400" />
                    Workspace slug
                  </Label>
                  <div className="relative group">
                    <Input 
                      id="slug"
                      name="slug"
                      required
                      placeholder="acme-corp"
                      value={formData.slug}
                      onChange={handleChange}
                      className="pl-3 border-slate-200 focus:border-blue-500 focus:ring-blue-100 h-11 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pl-1">
                    Your workspace URL: <span className="text-blue-500 font-medium">kabootar.live/{formData.slug || "slug"}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100"></div>

                <div className="space-y-2">
                  <Label htmlFor="display_phone_number" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                     <Phone size={14} className="text-slate-400" />
                     WhatsApp Phone Number
                  </Label>
                  <Input 
                    id="display_phone_number"
                    name="display_phone_number"
                    placeholder="+91 99999 99999"
                    value={formData.display_phone_number}
                    onChange={handleChange}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-100 h-11 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_number_id" className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">WhatsApp Phone ID</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={16} />
                      </div>
                      <Input
                        id="phone_number_id"
                        name="phone_number_id"
                        value={formData.phone_number_id}
                        onChange={handleChange}
                        placeholder="Enter Meta Phone ID"
                        className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wa_business_account_id" className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Business ID</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Building2 size={16} />
                      </div>
                      <Input
                        id="wa_business_account_id"
                        name="wa_business_account_id"
                        value={formData.wa_business_account_id}
                        onChange={handleChange}
                        placeholder="Enter Meta Business ID"
                        className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="access_token" className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Meta Access Token</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Key size={16} />
                    </div>
                    <Input
                      id="access_token"
                      name="access_token"
                      type="password"
                      value={formData.access_token}
                      onChange={handleChange}
                      placeholder="Paste your Permanent Access Token here"
                      className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1 italic">Note: Use a Permanent Access Token for sending messages.</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-6 pb-8 bg-slate-50/50">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-md font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                disabled={loading || !formData.name || !formData.slug}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-slate-400 max-w-[80%] mx-auto">
                By creating a workspace, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
