import { Check, CheckCheck, Circle, Clock, XCircle } from "lucide-react";

export const renderMessageStatus = (msg) => {
  if (msg?.status === "pending") return <Clock className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />;
  if (msg?.status === "failed") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  if (msg?.direction !== "outgoing") return null;

  const statusMap = {
    sent: <Check className="h-3.5 w-3.5 text-muted-foreground" />,
    delivered: <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />,
    read: <CheckCheck className="h-3.5 w-3.5 text-sky-500" />,
  };
  return statusMap[msg?.status] || null;
};
