"use client";

import { useEffect, useState } from "react";
import socketService from "@/lib/socket/socketClient";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import { addMessage, updateMessageStatus } from "../slices/chatSlice";
import { upsertConversation } from "../slices/conversationSlice";

export const useSocket = () => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const dispatch = useDispatch();
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id, organization?.id);
    }

    // Listen for new messages
    socketService.on("new-message", (message) => {
      console.log("New real-time message received:", message);
      dispatch(addMessage(message));
    });

    // Listen for status updates
    socketService.on("message-status-update", (data) => {
      console.log("Status update received:", data);
      dispatch(updateMessageStatus(data));
    });

    // Listen for conversation updates (unread count, last message)
    socketService.on("conversation-update", (conversation) => {
      console.log("Conversation update received:", conversation);
      dispatch(upsertConversation(conversation));
    });

    // Typing indicators
    socketService.on("user-typing", (data) => {
      setIsTyping(data.isTyping);
      // Auto reset typing after 3 seconds
      if (data.isTyping) {
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Online/Offline Presence
    socketService.on("presence-update", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketService.off("new-message");
      socketService.off("message-status-update");
      socketService.off("conversation-update");
      socketService.off("user-typing");
      socketService.off("presence-update");
    };
  }, [user?.id, organization?.id, dispatch]);

  const emitTyping = (conversationId, isTyping) => {
    socketService.emit("typing", { conversationId, isTyping });
  };

  return {
    isTyping,
    onlineUsers,
    emitTyping,
    socket: socketService,
  };
};
