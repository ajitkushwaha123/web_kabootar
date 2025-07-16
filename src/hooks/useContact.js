"use client";

import {
  fetchContacts,
  bulkUploadContacts,
  resetContacts,
} from "@/store/slices/contactSlice";
import { useSelector, useDispatch } from "react-redux";

export const useContact = () => {
  const dispatch = useDispatch();
  const {
    list,
    loading,
    error,
    nextCursor,
    hasMore,
    uploadLoading,
    uploadError,
  } = useSelector((state) => state.contacts);

  const loadContacts = (params = {}) => dispatch(fetchContacts(params));
  const uploadContacts = (data) => dispatch(bulkUploadContacts(data));

  return {
    contacts: list,
    loading,
    error,
    nextCursor,
    hasMore,
    uploadLoading,
    uploadError,
    loadContacts,
    uploadContacts,
    resetContacts: () => dispatch(resetContacts()),
  };
};
