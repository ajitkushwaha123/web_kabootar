"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTemplate,
  fetchTemplateLibrary,
  fetchTemplates,
} from "@/store/slices/templateSlice";

export const useTemplate = () => {
  const dispatch = useDispatch();

  const {
    templates,
    fetchLoading,
    fetchError,
    templateLibrary,
    libraryLoading,
    libraryError,
    createLoading,
    createError,
  } = useSelector((state) => state.template);

  const getTemplates = () => {
    dispatch(fetchTemplates());
  };

  const getTemplateLibrary = (filters) => {
    dispatch(fetchTemplateLibrary({ filters }));
  };

  const addTemplate = (payload) => {
    dispatch(createTemplate({ payload }));
  };

  return {
    templates,
    fetchLoading,
    fetchError,
    getTemplates,
    templateLibrary,
    libraryLoading,
    libraryError,
    getTemplateLibrary,
    addTemplate,
    createLoading,
    createError,
  };
};
