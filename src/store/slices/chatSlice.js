import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/api/inbox/chat-list");
      return res.data;
    } catch (error) {
      console.error("❌ Failed to fetch chat list:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ to, type, message, context }, thunkAPI) => {
    try {
      const res = await axios.post("/api/inbox/send-message", {
        to,
        type,
        message,
        ...(context ? { context } : {}),
      });
      return { to, message: res.data };
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatList: [],
    conversations: {},
    loadingChatList: false,
    loadingMessages: {},
    sendingMessage: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const msg = action.payload;
      const { chatWith } = msg;

      if (!state.conversations[chatWith]) {
        state.conversations[chatWith] = [];
      }

      state.conversations[chatWith].push(msg);
    },
    setMessages: (state, action) => {
      const { chatWith, messages } = action.payload;
      state.conversations[chatWith] = messages;
    },
    clearMessages: (state, action) => {
      const { chatWith } = action.payload;
      if (chatWith) {
        delete state.conversations[chatWith];
      } else {
        state.conversations = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.loadingChatList = true;
        state.error = null;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.chatList = action.payload;
        state.loadingChatList = false;
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch chat list";
        state.loadingChatList = false;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { to, message } = action.payload;
        if (!state.conversations[to]) state.conversations[to] = [];
        state.conversations[to].push(message);
        state.sendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || "Failed to send message";
        state.sendingMessage = false;
      });
  },
});

export const { addMessage, setMessages, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
