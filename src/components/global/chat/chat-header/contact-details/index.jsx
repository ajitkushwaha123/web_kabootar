"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { formatPhone, UserAvatar } from "@/helper/transform";
import { AssignAgent } from "./assign-agent";
import { LeadDetails } from "./lead-details";

export default function ContactDetails({
  name,
  phone,
  isLead,
  leadId,
  conversationId,
}) {
  const [leadStatus, setLeadStatus] = useState(isLead);
  const [markedLeadId, setMarkedLeadId] = useState(leadId);

  const handleLeadStatusChange = (status, newLeadId = null) => {
    setLeadStatus(status);
    if (newLeadId) setMarkedLeadId(newLeadId);
  };

  return (
    <div className="space-y-6 px-4 overflow-y-auto h-full pb-6">
      <div className="flex flex-col justify-center items-center py-5 text-center">
        <UserAvatar name={name} size="xl" />
        <h2
          className="text-lg font-semibold mt-3 max-w-[200px] truncate"
          title={name}
        >
          {name || "—"}
        </h2>
        <p
          className="text-sm text-muted-foreground truncate max-w-[180px]"
          title={formatPhone(phone)}
        >
          {formatPhone(phone) || "—"}
        </p>
      </div>

      <Separator />

      {leadStatus && <AssignAgent leadId={markedLeadId} />}

      <LeadDetails
        isLead={leadStatus}
        leadId={markedLeadId}
        conversationId={conversationId}
        onLeadStatusChange={handleLeadStatusChange}
      />
    </div>
  );
}
