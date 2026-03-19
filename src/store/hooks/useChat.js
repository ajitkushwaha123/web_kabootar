import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  clearMessages,
  updateMessageStatus,
  sendMessage as sendMessageThunk,
  fetchMessages,
} from "../slices/chatSlice";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useConversation } from "./useConversation";

export const useChat = () => {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);

  const { activeConversationId } = useConversation();
  const { organization } = useOrganization();
  const { user } = useUser();

  // Add local (pending) message before sending
  const addLocalMessage = (messageData) => {
    if (!user) {
      console.warn("User not found while adding message");
      return null;
    }

    if (!activeConversationId) {
      console.warn("No active conversation selected");
      return null;
    }

    const timestamp = new Date().toISOString();

    const newMessage = {
      _id: crypto.randomUUID(),
      conversationId: activeConversationId,
      organizationId: organization?.id || "",
      senderId: user.id,
      senderType: "agent",
      direction: "outgoing",
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false,
      metadata: messageData.metadata || {},
      ...messageData,
    };

    dispatch(addMessage(newMessage));
    return newMessage;
  };

  // Send message with optimistic update
  const sendMessage = async (messageData) => {
    const localMessage = addLocalMessage(messageData);
    if (!localMessage) return;

    try {
      const response = await dispatch(sendMessageThunk(localMessage)).unwrap();

      dispatch(
        updateMessageStatus({
          _id: localMessage._id,
          status: response?.data?.status || "sent",
        })
      );
    } catch (err) {
      dispatch(
        updateMessageStatus({
          _id: localMessage._id,
          status: "failed",
        })
      );
      console.error("Failed to send message:", err);
    }
  };

  const getMessages = async (conversationId) => {
    const id = conversationId;
    if (!id) {
      console.warn("getMessages called without conversationId");
      return;
    }

    try {
      await dispatch(fetchMessages({ chatId: id })).unwrap();
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  return {
    messages,
    loading,
    error,
    addLocalMessage,
    sendMessage,
    getMessages,
    updateMessageStatus: (payload) => dispatch(updateMessageStatus(payload)),
    clearMessages: () => dispatch(clearMessages()),
  };
};
