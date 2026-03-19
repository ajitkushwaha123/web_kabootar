"use client";

import React, { useEffect } from "react";
import { TextMessage } from "@/components/global/chat/message/text";
import { useChat } from "@/store/hooks/useChat";
import { useConversation } from "@/store/hooks/useConversation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

const Page = () => {
  const { messages, getMessages, loading: chatLoading } = useChat();
  const { user } = useUser();
  const { activeConversationId, loading: convoLoading } = useConversation();

  useEffect(() => {
    if (activeConversationId) {
      getMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loading = convoLoading || chatLoading;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
      {/* Loading state */}
      {loading && (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading messages...
        </div>
      )}

      {/* Empty state */}
      {!loading && (!messages || messages.length === 0) && (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          No messages yet {activeConversationId}
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
                      ? user?.fullName || "You"
                      : message.senderName || "John Doe"
                  }
                  avatar={
                    message.direction === "outgoing"
                      ? user?.imageUrl || ""
                      : message.senderAvatar || ""
                  }
                  time={message.createdAt}
                  message={message.text?.body}
                  status={message.status}
                />
              )}
            </div>
          );
        })}
    </div>
  );
};

export default Page;
