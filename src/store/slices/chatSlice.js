import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

// --- Send a message ---
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/organization/inbox/message/send-message",
        messageData
      );
      return response.data; // assume { success, data, message }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// --- Fetch all messages for a conversation ---
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ chatId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/organization/inbox/conversation/chat/${chatId}`
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action) => {
      const msg = state.messages.find((m) => m._id === action.payload._id);
      if (msg) msg.status = action.payload.status;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Messages ---
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload?.data || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch messages";
      })

      // --- Send Message ---
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMessage = action.payload?.data;
        // if (newMessage) {
        //   state.messages.push(newMessage);
        // }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to send message";
      });
  },
});

export const { addMessage, updateMessageStatus, clearMessages } =
  chatSlice.actions;

export default chatSlice.reducer;
