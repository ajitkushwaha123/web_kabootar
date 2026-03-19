import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const uploadMedia = createAsyncThunk(
  "mediaUpload/uploadMedia",
  async (file, { rejectWithValue }) => {
    try {
      console.log("Uploading file:", file);
      const response = await axios.post(
        `/api/uploads?file_name=${file.name}&file_length=${file.size}&file_type=${file.type}`,
        file
      );

      console.log("Response from media upload API:", response.data);

      return response?.data?.data;
    } catch (error) {
      console.error("Error uploading media:", error);
      return rejectWithValue(error?.response?.data || "Upload failed");
    }
  }
);

const mediaUploadSlice = createSlice({
  name: "mediaUpload",
  initialState: {
    media: null,
    uploadLoading: false,
    uploadError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadMedia.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.media = action.payload;
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload || action.error.message;
      });
  },
});

export default mediaUploadSlice.reducer;
