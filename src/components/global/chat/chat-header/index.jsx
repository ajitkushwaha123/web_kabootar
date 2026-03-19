"use client";

import { ChatHeaderSkeleton } from "@/components/skeleton/ChatHeaderSkeleton";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import StickyChatHeader from "./sticky-chat-header";
import ContactDetails from "./contact-details";
export default function ChatHeader({ chatDetails }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <header
          className="
        sticky w-full top-0 z-10 bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700"
        >
          <StickyChatHeader
            name={chatDetails?.contactId?.primaryName}
            phone={chatDetails?.contactId?.primaryPhone}
          />
        </header>
      </SheetTrigger>

      <SheetContent position="right" size="sm">
        <SheetHeader>
          <SheetTitle>Contact Details</SheetTitle>
        </SheetHeader>
        <ContactDetails
          name={chatDetails?.contactId?.primaryName}
          phone={chatDetails?.contactId?.primaryPhone}
          isLead={chatDetails?.isLead}
          leadId={chatDetails?.leadId}
          conversationId={chatDetails?._id}
        />
      </SheetContent>
    </Sheet>
  );
}
