import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  invitations: [],
  inviteSendLoading: false,
  inviteSendError: null,
  validateLoading: false,
  validateError: null,
  validateSuccess: null,
  acceptLoading: false,
  acceptError: null,
  acceptSuccess: null,
};

export const inviteMembers = createAsyncThunk(
  "invitation/inviteMembers",
  async ({ payload, id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/workspace/${id}/invite/send`, payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const validateInvitation = createAsyncThunk(
  "invitation/validateInvitation",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/workspace/invite/validate", { token });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  "invitation/acceptInvitation",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/workspace/invite/accept", { token });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const invitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {
    clearInviteStatus: (state) => {
      state.inviteSendError = null;
      state.validateError = null;
      state.validateSuccess = null;
      state.acceptError = null;
      state.acceptSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(inviteMembers.pending, (state) => {
        state.inviteSendLoading = true;
        state.inviteSendError = null;
      })
      .addCase(inviteMembers.fulfilled, (state, action) => {
        state.inviteSendLoading = false;
        const newInvites = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        state.invitations.push(...newInvites);
      })
      .addCase(inviteMembers.rejected, (state, action) => {
        state.inviteSendLoading = false;
        state.inviteSendError = action.payload;
      })

      .addCase(validateInvitation.pending, (state) => {
        state.validateLoading = true;
        state.validateError = null;
        state.validateSuccess = null;
      })
      .addCase(validateInvitation.fulfilled, (state, action) => {
        state.validateLoading = false;
        state.validateSuccess = action.payload;
      })
      .addCase(validateInvitation.rejected, (state, action) => {
        state.validateLoading = false;
        state.validateError = action.payload;
      })

      .addCase(acceptInvitation.pending, (state) => {
        state.acceptLoading = true;
        state.acceptError = null;
        state.acceptSuccess = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.acceptLoading = false;
        state.acceptSuccess = action.payload;
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.acceptLoading = false;
        state.acceptError = action.payload;
      });
  },
});

export const { clearInviteStatus } = invitationSlice.actions;
export default invitationSlice.reducer;
