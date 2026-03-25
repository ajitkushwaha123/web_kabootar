"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Users, Building2, Globe, Phone, ExternalLink, ShieldCheck, Mail, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MasterAdminPage = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/master/orgs");
      const data = await res.json();
      if (data.success) {
        setOrgs(data.data);
      } else {
        toast.error("Failed to load platform data");
      }
    } catch (err) {
      toast.error("Network error fetching orgs");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = orgs.filter(o => 
    (o.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (o.org_id || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalOrgs: orgs.length,
    totalUsers: orgs.reduce((acc, o) => acc + (o.memberCount || 0), 0),
    avgUsers: Math.round(orgs.reduce((acc, o) => acc + (o.memberCount || 0), 0) / (orgs.length || 1))
  };

  const handleViewDetails = (org) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* 🏙️ Master Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-indigo-600" />
             Platform Command Center
           </h1>
           <p className="text-slate-500 font-medium">Monitoring all kabootars and workspaces.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search org or ID..." 
                className="pl-9 bg-slate-50 border-slate-200" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={fetchOrgs}>Refresh</Button>
        </div>
      </div>

      {/* 📊 Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
         <Card className="bg-white shadow-sm border-indigo-50">
           <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-indigo-500">Total Workspaces</CardDescription>
              <CardTitle className="text-3xl font-black flex items-center justify-between">
                {stats.totalOrgs} 🏢
              </CardTitle>
           </CardHeader>
         </Card>
         <Card className="bg-white shadow-sm border-emerald-50">
           <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-emerald-500">Total Active Users</CardDescription>
              <CardTitle className="text-3xl font-black flex items-center justify-between">
                {stats.totalUsers} 👤
              </CardTitle>
           </CardHeader>
         </Card>
         <Card className="bg-white shadow-sm border-amber-50">
           <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-amber-500">Avg Members / Org</CardDescription>
              <CardTitle className="text-3xl font-black flex items-center justify-between">
                {stats.avgUsers} 📈
              </CardTitle>
           </CardHeader>
         </Card>
      </div>

      {/* 📋 Organizations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Workspace / Org</TableHead>
              <TableHead className="font-bold text-slate-700">Admin</TableHead>
              <TableHead className="font-bold text-slate-700">Mode</TableHead>
              <TableHead className="font-bold text-slate-700">Members</TableHead>
              <TableHead className="font-bold text-slate-700">Creation</TableHead>
              <TableHead className="text-right font-bold text-slate-700 pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                   <div className="animate-pulse flex flex-col items-center gap-2">
                      <Globe className="w-8 h-8 text-slate-300 animate-spin" />
                      <span className="text-slate-400 font-medium tracking-tight">Loading Platform Data...</span>
                   </div>
                </TableCell>
              </TableRow>
            ) : filteredOrgs.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-40 text-center text-slate-400">No organizations found.</TableCell>
               </TableRow>
            ) : filteredOrgs.map(org => (
              <TableRow key={org._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleViewDetails(org)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-slate-100">
                      <AvatarImage src={org.logo_url} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                        {(org.name || "U")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{org.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{org.org_id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">{org.adminUser?.name || "No Admin Linked"}</span>
                    <span className="text-[10px] text-slate-400">{org.adminUser?.email || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-slate-100 text-slate-600 border-none px-2 py-0.5 text-[9px] font-black uppercase">
                    {org.autoReplyMode || "HYBRID"}
                  </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                        <span className="text-xs font-black text-indigo-700">{org.memberCount}</span>
                      </div>
                      <Users className="w-3.5 h-3.5 text-slate-300" />
                   </div>
                </TableCell>
                <TableCell>
                   <span className="text-[11px] font-medium text-slate-500">
                     {org.createdAt ? format(new Date(org.createdAt), "MMM d, yyyy") : "Recently"}
                   </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                   <Button variant="ghost" size="sm" className="hover:bg-indigo-50 hover:text-indigo-600 text-slate-400">
                     <ExternalLink className="w-4 h-4" />
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 👤 Members Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Workspace Members: {selectedOrg?.name || "Unknown Workspace"}
            </DialogTitle>
            <DialogDescription>
              Detailed lookup for all users linked to this organization workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[400px] overflow-y-auto pr-2">
            <div className="grid gap-3">
              {selectedOrg?.crmMembers.map(member => (
                <div key={member._id} className="p-3 border rounded-xl flex items-center justify-between border-slate-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                        {(member.name || "U")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{member.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-200 text-slate-600 px-1.5 py-0 text-[8px] font-black">
                           {member.role}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 tracking-tighter">{member.user_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <div className="flex items-center gap-1.5 text-slate-500">
                       <Mail className="w-3 h-3" />
                       <span className="text-[10px] font-medium">{member.email}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-slate-400">
                       <Phone className="w-3 h-3" />
                       <span className="text-[10px] font-mono">{member.phone}</span>
                     </div>
                  </div>
                </div>
              ))}
              {selectedOrg?.crmMembers.length === 0 && (
                <div className="py-10 text-center text-slate-400 font-medium">No members found in CRM.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterAdminPage;
