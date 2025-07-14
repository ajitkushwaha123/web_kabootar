import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addLocalMessage,
  markMessagesAsRead,
} from "@/store/slices/messageSlice";
import { sendMessage } from "@/store/slices/chatSlice";

export const useConversations = (chatWith) => {
  const dispatch = useDispatch();

  const { byUser, loading, error } = useSelector((state) => state.messages);
  const messages = byUser[chatWith]?.messages || [];

  const chatWithData = byUser[chatWith]?.chatWith || [];

  useEffect(() => {
    if (chatWith && !byUser[chatWith] && !loading) {
      dispatch(fetchMessages(chatWith));
      dispatch(markMessagesAsRead({ chatWith }));
    }
  }, [chatWith, dispatch, byUser, loading]);

  const sendLocalMessage = ({ message, chatId }) => {
    dispatch(
      addLocalMessage({
        chatWith: chatId,
        message,
      })
    );
  };

  const sendMsg = ({ to, type, message, context }) => {
    dispatch(sendMessage({ to, type, message, context }));
  };

  return {
    messages,
    loading,
    error,
    sendLocalMessage,
    sendMsg,
    chatWithData,
  };
};
