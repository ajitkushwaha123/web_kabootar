import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./slices/chatSlice";
import conversationReducer from "./slices/conversationSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    conversation: conversationReducer,
  },
});
