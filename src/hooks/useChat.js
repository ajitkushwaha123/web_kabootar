"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChatList } from "@/store/slices/chatSlice";

export const useChat = () => {
  const dispatch = useDispatch();
  const { chatList, loadingChatList, error } = useSelector(
    (state) => state.chat
  );

  useEffect(() => {
    if (!chatList.length && !loadingChatList) {
      dispatch(fetchChatList());
    }
  }, [chatList.length, loadingChatList, dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchChatList());
  }, [dispatch]);

  const sorted = useMemo(() => {
    return [...chatList].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [chatList]);

  return {
    chatList: sorted,
    loading: loadingChatList,
    error,
    refresh,
  };
};
