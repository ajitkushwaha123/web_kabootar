"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import InvitationHandler from "@/components/global/workspace/invitation/InvitationHandler";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center bg-gray-50">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin w-8 h-8" />
            <p>Validating invitation...</p>
          </div>
        }
      >
        <InvitationHandler />
      </Suspense>
    </div>
  );
}
