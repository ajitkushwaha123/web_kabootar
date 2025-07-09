import { configureStore } from "@reduxjs/toolkit";
import templateReducer from "./slices/templateSlice";
import templateFilterReducer from "./slices/templateFilterSlice";
import mediaUploadReducer from "./slices/mediaUploadSlice";

const store = configureStore({
  reducer: {
    template: templateReducer,
    templateFilters: templateFilterReducer,
    mediaUpload: mediaUploadReducer,
  },
});

export default store;
