"use client";

import React, { useState, useEffect } from "react";
import { Plus, Settings, Users, ArrowRightLeft, UserCheck, Trash2, Mail, Phone, MoreVertical } from "lucide-react";
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
  const [newMember, setNewMember] = useState({ name: "", phone: "", email: "" });
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
        toast.success("Member added successfully");
        setNewMember({ name: "", phone: "", email: "" });
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

  const handleToggleMember = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        toast.success("Member status updated");
        fetchData();
      }
    } catch (error) {
      toast.error("Error updating member");
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Team & Lead Distribution</h1>
          <p className="text-muted-foreground">Manage your team and how new WhatsApp leads are assigned.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>Refresh Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Distribution Rule
            </CardTitle>
            <CardDescription>Choose how new leads are assigned.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${settings.rule === 'round_robin' ? 'bg-primary/5 border-primary' : 'bg-card'}`} onClick={() => handleUpdateRule('round_robin')}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">Round Robin</h4>
                  {settings.rule === 'round_robin' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">Distributes leads equally among all active team members in a loop.</p>
              </div>
              
              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${settings.rule === 'load_based' ? 'bg-primary/5 border-primary' : 'bg-card'}`} onClick={() => handleUpdateRule('load_based')}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">Load Based</h4>
                  {settings.rule === 'load_based' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">Gives leads to the member with the fewest active leads currently.</p>
              </div>

              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${settings.rule === 'manual' ? 'bg-primary/5 border-primary' : 'bg-card'}`} onClick={() => handleUpdateRule('manual')}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">Manual</h4>
                  {settings.rule === 'manual' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">Leads will not be automatically assigned. Admin must assign them.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Team Members
              </CardTitle>
              <CardDescription>Active members receive automated assignments.</CardDescription>
            </div>
            
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddMember}>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>Add a new person to receive leads.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Yogesh Sharma" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">WhatsApp Number (with country code)</Label>
                      <Input id="phone" placeholder="918888888888" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="yogesh@example.com" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Leads (Current/Total)</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {member.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.currentLeads || 0} / {member.totalLeads || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={member.isActive} 
                        onCheckedChange={() => handleToggleMember(member._id, member.isActive)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
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
