"use client";

import React, { useState, useEffect } from "react";
import { Users, UserCog, UserCheck, ShieldCheck, HeartHandshake, UserPlus } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function PublicAllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      toast.error("Cloud not load all users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (clerkId, newRole) => {
    try {
      const res = await fetch(`/api/public/users/${clerkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error("Failed to update user role");
      }
    } catch (e) {
      toast.error("Error updating user role");
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return <ShieldCheck className="h-4 w-4 text-rose-500" />;
      case 'SUPPORT': return <HeartHandshake className="h-4 w-4 text-emerald-500" />;
      case 'SALES': return <UserCheck className="h-4 w-4 text-sky-500" />;
      default: return <UserPlus className="h-4 w-4 text-slate-400 font-bold" />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <Badge className="w-fit" variant="outline">👥 Global User Directory</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Manage All Users</h1>
          <p className="text-muted-foreground text-lg">Every user registered in the system is listed below.</p>
        </header>

        <Card className="border-none shadow-xl bg-white/80 dark:bg-black/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" /> Registered Users
            </CardTitle>
            <CardDescription>View all accounts and bridge them into roles.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-20 text-center animate-pulse text-muted-foreground flex flex-col items-center gap-4">
                <Users className="h-10 w-10 text-slate-300 animate-bounce" />
                Scanning all user records...
              </div>
            ) : (
              <div className="rounded-md border bg-white dark:bg-slate-950 shadow">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-slate-900">
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Org Integration</TableHead>
                      <TableHead>User Role</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.clerkId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                               <AvatarImage src={user.imageUrl} />
                               <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                               <span className="font-bold text-sm tracking-tight">{user.name}</span>
                               <span className="text-[10px] text-muted-foreground font-mono opacity-60">ID: {user.clerkId}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                              <span>📧 {user.email}</span>
                              <span>📞 {user.phone}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                           {user.memberId ? (
                             <Badge variant="default" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-200">Team Member</Badge>
                           ) : (
                             <Badge variant="secondary" className="text-[9px] opacity-70 italic">Standalone User</Badge>
                           )}
                           <div className="text-[8px] text-muted-foreground mt-1 truncate max-w-[100px]">{user.organizationId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {getRoleIcon(user.role)}
                             <span className={`font-bold text-xs ${user.role !== 'USER' ? 'text-primary' : 'text-slate-400'}`}>{user.role}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select onValueChange={(val) => updateRole(user.clerkId, val)}>
                            <SelectTrigger className="w-[120px] ml-auto h-8 text-[11px]">
                              <UserCog className="h-3 w-3 mr-2" />
                              <SelectValue placeholder="Set Role" />
                            </SelectTrigger>
                            <SelectContent align="end">
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="SALES">Sales</SelectItem>
                              <SelectItem value="SUPPORT">Support</SelectItem>
                              <SelectItem value="USER">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground pt-10">
          This system-wide management page lists all registered Clerk accounts. Use with caution.
        </footer>
      </div>
    </div>
  );
}
