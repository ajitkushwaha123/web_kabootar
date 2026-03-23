"use client";

import React, { useEffect } from "react";
import { TextMessage } from "@/components/global/chat/message/text";
import { useChat } from "@/store/hooks/useChat";
import { useConversation } from "@/store/hooks/useConversation";
import { useSocket } from "@/store/hooks/useSocket";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

const Page = () => {
  const { messages, getMessages, loading: chatLoading } = useChat();
  const { isTyping } = useSocket();
  const { user } = useUser();
  const { activeConversationId, loading: convoLoading, chatDetails } = useConversation();

  useEffect(() => {
    if (activeConversationId) {
      getMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loading = convoLoading || chatLoading;

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col flex-1 items-center justify-center text-muted-foreground min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium">Fetching conversation...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && (!messages || messages.length === 0) && (
          <div className="flex flex-1 items-center justify-center text-muted-foreground min-h-[400px]">
             <div className="text-center">
                <p className="text-lg font-semibold text-slate-400">No history yet</p>
                <p className="text-sm text-slate-300">Start the conversation below.</p>
             </div>
          </div>
        )}

        {/* Message list */}
        {!loading &&
          messages?.map((message) => {
            if (message.isDeleted) return null;

            return (
              <div key={message._id}>
                {message.messageType === "text" && (
                  <TextMessage
                    _id={message._id}
                    direction={message.direction}
                    name={
                      message.direction === "outgoing"
                        ? (message.senderId === "AI_BOT" ? "AI Assistant ✨" : (user?.fullName || "You"))
                        : (message.senderName || "Customer")
                    }
                    avatar={
                      message.direction === "outgoing"
                        ? user?.imageUrl || ""
                        : ""
                    }
                    time={message.createdAt}
                    message={message.text?.body}
                    status={message.status}
                  />
                )}
              </div>
            );
          })}
          
        {isTyping && (
          <div className="flex items-center gap-3 animate-pulse ml-1">
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-slate-400 font-bold tracking-widest animate-bounce">...</span>
             </div>
             <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl rounded-bl-none text-[11px] text-slate-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                <span className="font-semibold text-primary">{chatDetails?.contactId?.primaryName || "Customer"}</span> is typing...
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
