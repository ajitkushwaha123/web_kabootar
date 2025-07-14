import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (chatWith, thunkAPI) => {
    try {
      const res = await axios.get(`/api/inbox/chat-list/${chatWith}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "messages/markMessagesAsRead",
  async ({ chatWith }, thunkAPI) => {
    try {
      const userId = "917428917851";
      const res = await axios.post("/api/inbox/update-message-status", {
        chatWith,
        userId,
      });
      return { ...res.data, chatWith, userId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    byUser: {},
    loading: false,
    error: null,
  },
  reducers: {
    addLocalMessage: (state, action) => {
      const { chatWith, message } = action.payload;

      console.log("📤 Adding local message:", message, "to chat:", chatWith);

      console.log("Current state:", state.byUser[chatWith].messages);

      if (!state.byUser[chatWith]) {
        state.byUser[chatWith].messages = [];
      }
      state.byUser[chatWith].messages.push(message);
    },
    clearMessages: (state) => {
      state.byUser = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const chatWith = action.meta.arg;
        state.byUser[chatWith] = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.error = action.payload || "Failed to mark messages as read";
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { chatWith } = action.meta.arg;

        const chat = state.byUser[chatWith];

        console.log("chat", chat);

        if (chat && chat.messages) {
          chat.messages = chat.messages.map((msg) => {
            if (msg.to === userId && msg.unread) {
              return {
                ...msg,
                unread: false,
                readAt: new Date().toISOString(),
              };
            }
            return msg;
          });
        }
      });
  },
});

export const { addLocalMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
