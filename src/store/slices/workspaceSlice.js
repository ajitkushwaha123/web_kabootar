import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  members: [],
  createLoading: false,
  createError: null,
  fetchLoading: false,
  fetchError: null,
  membersLoading: false,
  membersError: null,
};

export const createWorkspace = createAsyncThunk(
  "workspace/createWorkspace",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/workspace/create", payload);
      return res.data.workspace;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/workspace");
      return res?.data?.workspaces;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWorkspaceMembers = createAsyncThunk(
  "workspace/fetchWorkspaceMembers",
  async ({ workspaceId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/workspace/${workspaceId}/members`);
      return res.data.members;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = state.workspaces.find(
        (ws) => ws._id === action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWorkspace.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.createLoading = false;
        state.workspaces.push(action.payload);
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      .addCase(fetchWorkspaces.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      })

      // Fetch members
      .addCase(fetchWorkspaceMembers.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.payload;
      });
  },
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
