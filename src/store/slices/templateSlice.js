import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTemplates = createAsyncThunk(
  "template/fetchTemplates",
  async ({ status }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/template/get-all-template?status=${status}`);

      console.log("Response from template API:", response.data);

      return response?.data?.templates || [];
    } catch (error) {
      console.error("Error fetching templates:", error);
      return rejectWithValue(error?.response?.data || "Fetch error");
    }
  }
);

export const createTemplate = createAsyncThunk(
  "template/createTemplates",
  async ({ payload }, { rejectWithValue }) => {
    console.log("Creating template with payload:", payload);
    try {
      const response = await axios.post(
        `/api/template/create-template`,
        payload
      );

      console.log("Response from template API:", response.data);

      return response?.data?.templates || [];
    } catch (error) {
      console.error("Error fetching templates:", error);
      return rejectWithValue(error?.response?.data || "Fetch error");
    }
  }
);

export const fetchTemplateLibrary = createAsyncThunk(
  "template/fetchTemplateLibrary",
  async ({ filters }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/template/template-library?language=${filters.language}&platform=${filters.platform}&search=${filters.search}&category=${filters.category}&status=${filters.status}&topic=${filters.topic}&usecase=${filters.usecase}&industry=${filters.industry}`
      );
      console.log("Response from template library API:", response.data);
      return response?.data.templates || [];
    } catch (error) {
      console.error("Error fetching template library:", error);
      return rejectWithValue(error?.response?.data || "Fetch error");
    }
  }
);

const templateSlice = createSlice({
  name: "template",
  initialState: {
    templates: [],
    fetchLoading: false,
    fetchError: null,
    templateLibrary: [],
    libraryLoading: false,
    libraryError: null,
    createLoading: false,
    createError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload || action.error.message;
      })
      .addCase(fetchTemplateLibrary.pending, (state) => {
        state.libraryLoading = true;
        state.libraryError = null;
      })
      .addCase(fetchTemplateLibrary.fulfilled, (state, action) => {
        state.libraryLoading = false;
        state.templateLibrary = action.payload;
      })
      .addCase(fetchTemplateLibrary.rejected, (state, action) => {
        state.libraryLoading = false;
        state.libraryError = action.payload || action.error.message;
      })
      .addCase(createTemplate.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.createLoading = false;
        state.templates.push(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || action.error.message;
      });
  },
});

export default templateSlice.reducer;
