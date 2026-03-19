"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOrganization } from "@clerk/nextjs";
import { UserPlus2, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const api = {
  fetchAssignedAgents: async (leadId) => {
    const { data } = await axios.get(
      `/api/organization/inbox/leads/${leadId}/assigned-agents`
    );
    return data.assignedAgents || [];
  },
  assignAgent: async (leadId, agentId) => {
    const { data } = await axios.post(
      `/api/organization/inbox/leads/${leadId}/assign`,
      { agentId }
    );
    return data.assigned || [];
  },
  unassignAgent: async (leadId, agentId) => {
    const { data } = await axios.delete(
      `/api/organization/inbox/leads/${leadId}/assign`,
      { data: { agentId } }
    );
    return data.assigned || [];
  },
};

export const AgentSkeleton = ({ count = 4 }) => (
  <div className="flex flex-wrap gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
    ))}
  </div>
);

const AgentActionButton = ({ assigned, loading, onClick }) => {
  if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
  return assigned ? (
    <Trash2 className="w-4 h-4" onClick={onClick} title="Unassign Agent" />
  ) : (
    <UserPlus2 className="w-4 h-4" onClick={onClick} title="Assign Agent" />
  );
};

export const AssignAgent = ({ leadId = "" }) => {
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [loadingAgent, setLoadingAgent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { memberships } = useOrganization({ memberships: { infinite: true } });

  const refreshAssignedAgents = async () => {
    if (!leadId) return;
    setFetching(true);
    try {
      const agents = await api.fetchAssignedAgents(leadId);
      setAssignedAgents(agents);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch assigned agents");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    refreshAssignedAgents();
  }, [leadId]);

  if (!memberships) return null;

  const isAssigned = (agentId) =>
    assignedAgents.some((a) => a.agentId === agentId);

  const handleToggleAgent = async (agentId) => {
    setLoadingAgent(agentId);
    try {
      const updated = isAssigned(agentId)
        ? await api.unassignAgent(leadId, agentId)
        : await api.assignAgent(leadId, agentId);
      toast.success(
        isAssigned(agentId) ? "Agent unassigned" : "Agent assigned"
      );
      setAssignedAgents(updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update agent assignment");
    } finally {
      setLoadingAgent(null);
    }
  };

  return (
    <div>
      {/* Assigned Agents Card */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-2 flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <UserPlus2 className="h-4 w-4 text-primary" /> Assigned Agents
          </CardTitle>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            View / Assign
          </Button>
        </CardHeader>

        <CardContent className="pt-1">
          {fetching ? (
            <AgentSkeleton />
          ) : assignedAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents assigned</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {assignedAgents.map((agent) => {
                const membership = memberships.data?.find(
                  (m) =>
                    m.publicUserData?.userId === agent.agentId ||
                    m.id === agent.agentId
                );
                const name = membership
                  ? `${membership.publicUserData?.firstName || ""} ${
                      membership.publicUserData?.lastName || ""
                    }`.trim()
                  : "Unknown";
                const image =
                  membership?.publicUserData?.imageUrl ||
                  "/placeholder-avatar.png";

                return (
                  <div
                    key={agent.agentId}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <img
                      src={image}
                      alt={name}
                      title={name}
                      className="h-8 w-8 rounded-full border object-cover"
                      onClick={() => handleToggleAgent(agent.agentId)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet: All Org Agents */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[320px] sm:w-[400px] px-4">
          <SheetHeader>
            <SheetTitle>All Agents</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {memberships.data?.map((membership) => {
              const agentId =
                membership.publicUserData?.userId || membership.id;
              const name = `${membership.publicUserData?.firstName || ""} ${
                membership.publicUserData?.lastName || ""
              }`.trim();
              const image = membership.publicUserData?.imageUrl || null;
              const assigned = isAssigned(agentId);
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={agentId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-2">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {initials}
                      </div>
                    )}
                    <span
                      className="font-medium text-sm truncate max-w-[180px]"
                      title={name}
                    >
                      {name}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={assigned ? "destructive" : "default"}
                    onClick={() => handleToggleAgent(agentId)}
                    disabled={loadingAgent === agentId}
                  >
                    <AgentActionButton
                      assigned={assigned}
                      loading={loadingAgent === agentId}
                    />
                  </Button>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
