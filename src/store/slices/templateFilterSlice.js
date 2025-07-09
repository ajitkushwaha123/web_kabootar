import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  category: "",
  status: "",
  language: "en_US",
  platform: "",
  topic: "",
  usecase: "",
  industry: "",
};

const templateFilterSlice = createSlice({
  name: "templateFilters",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => initialState,
  },
});

export const { setFilter, setFilters, resetFilters } =
  templateFilterSlice.actions;
export default templateFilterSlice.reducer;
