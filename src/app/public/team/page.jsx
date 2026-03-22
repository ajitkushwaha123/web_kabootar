"use client";

import React, { useState, useEffect } from "react";
import { Users, UserCog, UserCheck, ShieldCheck, HeartHandshake } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";

export default function PublicTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/members");
      const data = await res.json();
      setMembers(data);
    } catch (e) {
      toast.error("Cloud not load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const updateRole = async (id, newRole) => {
    try {
      const res = await fetch(`/api/public/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        fetchMembers();
      } else {
        toast.error("Failed to update role");
      }
    } catch (e) {
      toast.error("Error updating role");
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return <ShieldCheck className="h-4 w-4 text-rose-500" />;
      case 'SUPPORT': return <HeartHandshake className="h-4 w-4 text-emerald-500" />;
      case 'SALES': return <UserCheck className="h-4 w-4 text-sky-500" />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <Badge className="w-fit" variant="outline">🏢 Global Directory</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Public Team Access</h1>
          <p className="text-muted-foreground text-lg italic">Anyone with this link can view and modify roles.</p>
        </header>

        <Card className="border-none shadow-xl bg-white/80 dark:bg-black/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" /> Active Members
            </CardTitle>
            <CardDescription>Listing all users across all organizations.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center animate-pulse text-muted-foreground">Loading members directory...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-slate-900">
                    <TableRow>
                      <TableHead className="w-[300px]">User Info</TableHead>
                      <TableHead>Organization ID</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-base">{member.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{member.phone}</span>
                            <span className="text-xs text-muted-foreground opacity-70 italic">{member.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="font-mono text-[10px]">{member.organizationId}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {getRoleIcon(member.role)}
                             <span className="font-semibold text-sm">{member.role}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select onValueChange={(val) => updateRole(member._id, val)}>
                            <SelectTrigger className="w-[130px] ml-auto">
                              <UserCog className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Change Role" />
                            </SelectTrigger>
                            <SelectContent align="end">
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="SALES">Sales</SelectItem>
                              <SelectItem value="SUPPORT">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {members.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                          No members found in the global directory.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground pt-10">
          This page is public for administrative purposes. Handle with care.
        </footer>
      </div>
    </div>
  );
}
