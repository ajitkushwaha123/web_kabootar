"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  setFilter,
  setFilters,
  resetFilters,
} from "@/store/slices/templateFilterSlice";

export function useTemplateFilter() {
  const dispatch = useDispatch();

  const filters = useSelector((state) => state.templateFilters);

  const updateFilter = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
  };
}
