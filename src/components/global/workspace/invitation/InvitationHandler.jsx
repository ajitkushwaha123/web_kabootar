"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { useInvitations } from "@/hooks/useInvitation";

export default function InvitationHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const {
    invitationValidation,
    acceptInvite,
    inviteSendLoading: loading,
    inviteSendError: error,
  } = useInvitations();

  const [message, setMessage] = useState("Awaiting invitation validation...");
  const [status, setStatus] = useState(
    /** @type {"idle" | "loading" | "success" | "error" | "missing"} */ ("idle")
  );

  useEffect(() => {
    if (!token) {
      setMessage("Missing or invalid invitation token.");
      setStatus("missing");
      return;
    }

    const processInvite = async () => {
      try {
        setStatus("loading");

        await invitationValidation(token).unwrap();
        setMessage("Invitation is valid. Accepting invite...");

        await acceptInvite(token).unwrap();
        setMessage("🎉 Invitation accepted successfully!");
        setStatus("success");

        setTimeout(() => router.push("/"), 3000);
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "Failed to accept invitation.");
        setStatus("error");
      }
    };

    processInvite();
  }, [token]);

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="animate-spin h-8 w-8 text-gray-600" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "missing":
        return <Info className="h-8 w-8 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "success":
        return "text-green-700";
      case "error":
        return "text-red-600";
      case "missing":
        return "text-yellow-700";
      case "loading":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="max-w-md w-full space-y-4 flex flex-col items-center">
      {renderIcon()}
      <p className={`text-sm ${getTextColor()}`}>{message}</p>
    </div>
  );
}
