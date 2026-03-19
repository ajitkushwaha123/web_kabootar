import { Check, CheckCheck } from "lucide-react";

export const renderMessageStatus = (msg) => {
  if (msg?.direction !== "outgoing") return null;
  const statusMap = {
    sent: <Check className="h-3.5 w-3.5 text-muted-foreground" />,
    delivered: <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />,
    read: <CheckCheck className="h-3.5 w-3.5 text-sky-500" />,
  };
  return (
    statusMap[msg?.status] || (
      <Circle className="h-2.5 w-2.5 text-muted-foreground" />
    )
  );
};
