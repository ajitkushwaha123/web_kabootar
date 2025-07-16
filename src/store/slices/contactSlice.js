import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch contacts with optional query parameters
export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await axios.get(`/api/contacts?${query}`);
      return data; // expecting { data: [...], nextCursor }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Bulk upload contacts
export const bulkUploadContacts = createAsyncThunk(
  "contacts/bulkUploadContacts",
  async (contacts, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/contacts/bulk-upload", contacts);
      return data; // expecting insertedCount, optionally data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const contactSlice = createSlice({
  name: "contacts",
  initialState: {
    list: [],
    loading: false,
    error: null,
    hasMore: true,
    nextCursor: null,
    uploadLoading: false,
    uploadError: null,
  },
  reducers: {
    resetContacts(state) {
      state.list = [];
      state.loading = false;
      state.error = null;
      state.hasMore = true;
      state.nextCursor = null;
    },
    
  },
  extraReducers: (builder) => {
    builder
      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        const { data, nextCursor } = action.payload;
        state.list = [...state.list, ...data];
        state.nextCursor = nextCursor;
        state.hasMore = !!nextCursor;
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching contacts";
      })

      // Bulk Upload
      .addCase(bulkUploadContacts.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(bulkUploadContacts.fulfilled, (state, action) => {
        // Optionally append the uploaded contacts if returned
        if (action.payload?.data) {
          state.list = [...state.list, ...action.payload.data];
        }
        state.uploadLoading = false;
      })
      .addCase(bulkUploadContacts.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload || "Bulk upload failed";
      });
  },
});

export const { resetContacts } = contactSlice.actions;
export default contactSlice.reducer;
