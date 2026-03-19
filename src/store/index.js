import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./slices/chatSlice";
import conversationReducer from "./slices/conversationSlice";
import templateReducer from "./slices/templateSlice";
import templateFilterReducer from "./slices/templateFilterSlice";
import mediaUploadReducer from "./slices/mediaUploadSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    conversation: conversationReducer,
    template: templateReducer,
    templateFilter: templateFilterReducer,
    mediaUpload: mediaUploadReducer,
  },
});
