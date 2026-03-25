"use client";

import React, { useState, useEffect } from "react";
import { Plus, Settings, Users, ArrowRightLeft, UserCheck, Trash2, Mail, Phone, MoreVertical, Lock, Layout } from "lucide-react";
import { IconChartBar, IconFileAi } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function TeamDashboard() {
  const [members, setMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState({ rule: "round_robin" });
  const [loading, setLoading] = useState(true);
  
  // States for 'Add Member' Form
  const [newMember, setNewMember] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    role: "SALES",
    permissions: ["inbox", "analytics", "bot", "team"],
    autoPassword: true,
    password: ""
  });
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, leadsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/members"),
        fetch("/api/admin/leads"),
        fetch("/api/admin/settings")
      ]);
      
      const [membersData, leadsData, settingsData] = await Promise.all([
        membersRes.json(),
        leadsRes.json(),
        settingsRes.json()
      ]);
      
      setMembers(membersData);
      setLeads(leadsData);
      setSettings(settingsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRule = async (newRule) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule: newRule })
      });
      if (res.ok) {
        setSettings({ ...settings, rule: newRule });
        toast.success(`Distribution set to ${newRule}`);
      }
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.credentials) {
           toast.success(`Agent Created! Email: ${resData.credentials.email} | Pass: ${resData.credentials.password}`, {
             duration: 10000,
             action: {
                label: 'Copy Password',
                onClick: () => navigator.clipboard.writeText(resData.credentials.password)
             }
           });
        } else {
           toast.success("Member added successfully");
        }
        setNewMember({ 
          name: "", 
          phone: "", 
          email: "", 
          role: "SALES",
          permissions: ["inbox", "analytics", "bot", "team"],
          autoPassword: true,
          password: ""
        });
        setIsAddMemberOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("Error adding member");
    }
  };

  const handleUpdateMember = async (id, updateData) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        toast.success("Member updated");
        fetchData();
      }
    } catch (error) {
      toast.error("Error updating member");
    }
  };

  const handleToggleMember = async (id, currentStatus) => {
    handleUpdateMember(id, { isActive: !currentStatus });
  };

  const handleDeleteMember = async (id) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Member removed");
        fetchData();
      }
    } catch (error) {
      toast.error("Error deleting member");
    }
  };

  const handleManualAssign = async (leadId, memberId) => {
    try {
      const res = await fetch("/api/admin/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, memberId })
      });
      if (res.ok) {
        toast.success("Lead assigned manually");
        fetchData();
      }
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">TEAM & PERMISSIONS</h1>
          <p className="text-slate-400 text-sm font-medium">Define access and distribute workloads effortlessly.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <Settings className="h-4 w-4" /> Routing Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[
                { id: 'round_robin', name: 'Round Robin', desc: 'Loop based distribution among agents' },
                { id: 'load_based', name: 'Load Balanced', desc: 'Prioritise agents with least leads' },
                { id: 'manual', name: 'Manual Only', desc: 'Admin assigns everything' }
              ].map(r => (
                <div key={r.id} className={cn(
                  "p-4 border rounded-xl cursor-pointer transition-all hover:border-indigo-200",
                  settings.rule === r.id ? "bg-indigo-50/50 border-indigo-400 ring-1 ring-indigo-400" : "bg-white border-slate-100"
                )} onClick={() => handleUpdateRule(r.id)}>
                   <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-xs uppercase tracking-tight text-slate-700">{r.name}</h4>
                      {settings.rule === r.id && <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]" />}
                   </div>
                   <p className="text-[10px] font-medium text-slate-400 leading-tight">{r.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-slate-50">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                <Users className="h-4 w-4" /> Team Roster
              </CardTitle>
            </div>
            
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 font-bold text-xs"><Plus className="h-4 w-4 mr-1" /> CREATE AGENT</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl overflow-hidden border-none p-0 shadow-2xl">
                <form onSubmit={handleAddMember}>
                  <div className="bg-indigo-600 p-8 text-white relative">
                     <div className="absolute top-0 right-0 p-8 opacity-10"><Users className="w-24 h-24" /></div>
                    <DialogTitle className="text-2xl font-black tracking-tighter mb-1">Onboard New Agent</DialogTitle>
                    <DialogDescription className="text-indigo-100 text-xs font-medium uppercase tracking-widest italic">Setup credentials and visibility</DialogDescription>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</Label>
                        <Input className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-none h-11" placeholder="Arjun Singh" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mobile (WA)</Label>
                        <Input className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-none h-11" placeholder="918888888888" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} required />
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2 border-t border-slate-50">
                       <div className="flex items-center justify-between">
                         <Label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest leading-none">Login Credentials</Label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input 
                             type="checkbox" 
                             checked={newMember.autoPassword} 
                             onChange={(e) => setNewMember({...newMember, autoPassword: e.target.checked})}
                             className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                           />
                           <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase">Auto-Generate Password</span>
                         </label>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Work Email</Label>
                            <Input className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-none h-11" type="email" placeholder="agent @magicscale.com" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} required />
                          </div>
                          {!newMember.autoPassword && (
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Manual Password</Label>
                              <Input className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-none h-11" type="password" value={newMember.password} onChange={(e) => setNewMember({...newMember, password: e.target.value})} />
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-50">
                       <Label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">Visibility Permissions</Label>
                       <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'inbox', label: 'Inbox & Chats', icon: <Mail className="w-3 h-3"/> },
                            { id: 'analytics', label: 'Analytics Panel', icon: <IconChartBar className="w-3 h-3"/> },
                            { id: 'bot', label: 'Bot Training', icon: <IconFileAi className="w-3 h-3"/> },
                            { id: 'team', label: 'Team Management', icon: <Users className="w-3 h-3"/> }
                          ].map(p => (
                            <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-white hover:border-indigo-100 transition-colors">
                               <input 
                                 type="checkbox" 
                                 checked={newMember.permissions?.includes(p.id)}
                                 onChange={(e) => {
                                   const current = newMember.permissions || [];
                                   const updated = e.target.checked ? [...current, p.id] : current.filter(x => x !== p.id);
                                   setNewMember({...newMember, permissions: updated});
                                 }}
                                 className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                               />
                               <div className="flex items-center gap-2">
                                  <div className="text-slate-400">{p.icon}</div>
                                  <span className="text-xs font-bold text-slate-600">{p.label}</span>
                               </div>
                            </label>
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsAddMemberOpen(false)} className="rounded-xl font-bold text-[10px] uppercase text-slate-400">Cancel</Button>
                    <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] uppercase shadow-lg shadow-indigo-100 min-w-[140px] h-11">Confirm Onboard</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50/50 uppercase">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-[9px] font-black text-slate-400 py-3">Agent</TableHead>
                  <TableHead className="text-[9px] font-black text-slate-400 py-3">Role</TableHead>
                  <TableHead className="text-[9px] font-black text-slate-400 py-3">Visibility Control</TableHead>
                  <TableHead className="text-[9px] font-black text-slate-400 py-3">Load</TableHead>
                  <TableHead className="text-[9px] font-black text-slate-400 py-3">Status</TableHead>
                  <TableHead className="py-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-slate-700 tracking-tight">{member.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{member.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={member.role} 
                        onValueChange={(val) => handleUpdateMember(member._id, { role: val })}
                      >
                        <SelectTrigger className="w-[110px] h-9 text-[10px] font-black uppercase rounded-lg border-slate-100 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN" className="text-[10px] font-bold">ADMIN</SelectItem>
                          <SelectItem value="SALES" className="text-[10px] font-bold">SALES</SelectItem>
                          <SelectItem value="SUPPORT" className="text-[10px] font-bold">SUPPORT</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                         {[
                           { id: 'inbox', icon: <Mail className="w-3.5 h-3.5" />, label: 'Inbox' },
                           { id: 'analytics', icon: <IconChartBar className="w-3.5 h-3.5" />, label: 'Analytics' },
                           { id: 'bot', icon: <IconFileAi className="w-3.5 h-3.5" />, label: 'Bot' },
                           { id: 'team', icon: <Users className="w-3.5 h-3.5" />, label: 'Team' }
                         ].map(p => {
                           const hasPerm = member.permissions?.includes(p.id);
                           return (
                             <button
                               key={p.id}
                               title={p.label}
                               onClick={() => {
                                 const current = member.permissions || [];
                                 const updated = hasPerm ? current.filter(x => x !== p.id) : [...current, p.id];
                                 handleUpdateMember(member._id, { permissions: updated });
                               }}
                               className={cn(
                                 "p-1.5 rounded-md border transition-all",
                                 hasPerm ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "bg-white border-slate-100 text-slate-300 grayscale opacity-40 hover:opacity-100 hover:grayscale-0"
                               )}
                             >
                               {p.icon}
                             </button>
                           )
                         })}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black tabular-nums text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{member.currentLeads || 0}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={member.isActive} 
                        className="data-[state=checked]:bg-indigo-600"
                        onCheckedChange={() => handleToggleMember(member._id, member.isActive)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member._id)} className="hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No members added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Lead Distribution History
          </CardTitle>
          <CardDescription>View recent leads and their assignment status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Re-assign</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-medium">{lead.title || "Unknown"}</TableCell>
                  <TableCell className="text-xs">{new Date(lead.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{lead.source}</Badge>
                  </TableCell>
                  <TableCell>
                    {lead.assignedTo?.[0] ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span>{lead.assignedTo?.[0]?.name || "Assigned"}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.stage === 'new' ? 'destructive' : 'default'} className="capitalize">{lead.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(val) => handleManualAssign(lead._id, val)}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Manual Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.filter(m => m.isActive).map((m) => (
                          <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No leads found in last 100 entries.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
