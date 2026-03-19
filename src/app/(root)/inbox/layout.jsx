"use client";

import { useEffect } from "react";
import axios from "axios";
import { EmptyState } from "@/components/empty-state";
import ChatHeader from "@/components/global/chat/chat-header";
import ChatInput from "@/components/global/chat/input/input-field";
import { InboxSidebar } from "@/components/inbox-sidebar";
import { ChatHeaderSkeleton } from "@/components/skeleton/ChatHeaderSkeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useConversation } from "@/store/hooks/useConversation";

export default function Page({ children }) {
  const { chatDetails, chatDetailsLoading, activeConversationId } =
    useConversation();

  const markAsRead = async (chatId) => {
    try {
      await axios.put(
        `/api/organization/inbox/conversation/chat/${chatId}/mark-as-read`
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  const handleEmptyStateClick = () => {
    console.log("Empty state button clicked");
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" }}>
      <InboxSidebar />

      {activeConversationId ? (
        <SidebarInset className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white">
          {chatDetailsLoading ? (
            <ChatHeaderSkeleton />
          ) : (
            <ChatHeader chatDetails={chatDetails} />
          )}

          <main className="flex-1 overflow-y-auto p-4">{children}</main>

          <footer className="sticky bottom-0 z-10 p-4 bg-white dark:bg-black border-t border-gray-300 dark:border-gray-700">
            <ChatInput />
          </footer>
        </SidebarInset>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="No Conversation Selected"
            description="Please select a conversation from the sidebar or start a new one."
            buttonLabel="Start Chat"
            onClick={handleEmptyStateClick}
            icon={null}
            gifSrc={null}
            className="text-center"
          />
        </div>
      )}
    </SidebarProvider>
  );
}
