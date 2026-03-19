import { useEffect, useCallback, useRef } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchConversationDetailsById,
  upsertConversation,
  clearConversations,
  setActiveConversation,
} from "../slices/conversationSlice";

export const useConversation = () => {
  const dispatch = useDispatch();

  const {
    conversations,
    loading,
    error,
    activeConversationId,
    chatDetails,
    chatDetailsLoading,
  } = useSelector((state) => state.conversation);

  const { organization } = useOrganization();
  const { user } = useUser();

  // Fetch all conversations for the current organization
  const getConversations = useCallback(async () => {
    if (!organization?.id) return;
    try {
      await dispatch(fetchConversations());
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [dispatch, organization?.id]);

  const getConversationDetails = useCallback(
    async (conversationId) => {
      if (!conversationId) return;
      try {
        await dispatch(fetchConversationDetailsById(conversationId));
      } catch (err) {
        console.error("Failed to fetch conversation details:", err);
      }
    },
    [dispatch]
  );

  const addOrUpdateConversation = useCallback(
    (conversationData) => {
      if (!conversationData) return;
      dispatch(upsertConversation(conversationData));
    },
    [dispatch]
  );

  const clearAllConversations = useCallback(() => {
    dispatch(clearConversations());
  }, [dispatch]);

  const setActiveChat = useCallback(
    async (conversationId) => {
      if (!conversationId) return;
      dispatch(setActiveConversation(conversationId));
      await dispatch(fetchConversationDetailsById(conversationId));
    },
    [dispatch]
  );

  return {
    conversations,
    loading,
    error,
    activeConversationId,
    chatDetails,

    getConversations,
    getConversationDetails,
    addOrUpdateConversation,
    clearAllConversations,
    setActiveChat,
    chatDetailsLoading,

    user,
    organization,
  };
};
