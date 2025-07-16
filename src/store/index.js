import { configureStore } from "@reduxjs/toolkit";
import templateReducer from "./slices/templateSlice";
import templateFilterReducer from "./slices/templateFilterSlice";
import mediaUploadReducer from "./slices/mediaUploadSlice";
import chatReducer from "./slices/chatSlice";
import messageReducer from "./slices/messageSlice";
import contactReducer from "./slices/contactSlice";

const store = configureStore({
  reducer: {
    template: templateReducer,
    templateFilters: templateFilterReducer,
    mediaUpload: mediaUploadReducer,
    chat: chatReducer,
    messages: messageReducer,
    contacts: contactReducer,
  },
});

export default store;
