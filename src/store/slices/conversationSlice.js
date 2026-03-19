import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  conversations: [],
  loading: false,
  error: null,
  activeConversationId: null,
  chatDetails: null,
  chatDetailsLoading: false,
};

export const fetchConversations = createAsyncThunk(
  "conversation/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "/api/organization/inbox/conversation/list"
      );
      return response.data.conversations;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchConversationDetailsById = createAsyncThunk(
  "conversation/fetchConversationDetailsById",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/organization/inbox/conversation/chat/${conversationId}/details`
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    upsertConversation: (state, action) => {
      const { conversationId, lastMessageId, ...rest } = action.payload;
      const existingIndex = state.conversations.findIndex(
        (conv) => conv._id === conversationId
      );

      if (existingIndex !== -1) {
        Object.assign(state.conversations[existingIndex], {
          lastMessageId,
          ...rest,
        });
      } else {
        state.conversations.unshift({
          _id: conversationId,
          lastMessageId,
          ...rest,
        });
      }
    },

    // ✅ Set active conversation
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },

    clearConversations: (state) => {
      state.conversations = [];
      state.activeConversationId = null;
      state.chatDetails = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // 🟦 Fetch all conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload || [];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch conversations";
      })

      .addCase(fetchConversationDetailsById.pending, (state) => {
        state.chatDetailsLoading = true;
        state.error = null;
        state.chatDetails = null;
      })
      .addCase(fetchConversationDetailsById.fulfilled, (state, action) => {
        state.chatDetailsLoading = false;
        state.chatDetails = action.payload || {};
      })
      .addCase(fetchConversationDetailsById.rejected, (state, action) => {
        state.chatDetailsLoading = false;
        state.error = action.payload || "Failed to fetch conversation details";
      });
  },
});

export const { upsertConversation, clearConversations, setActiveConversation } =
  conversationSlice.actions;

export default conversationSlice.reducer;
