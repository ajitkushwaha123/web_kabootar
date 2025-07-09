"use client";

import { uploadMedia } from "@/store/slices/mediaUploadSlice";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useMedia() {
  const dispatch = useDispatch();

  const media = useSelector((state) => state.mediaUpload.media);
  const uploadLoading = useSelector((state) => state.mediaUpload.uploadLoading);
  const uploadError = useSelector((state) => state.mediaUpload.uploadError);

  const upload = useCallback(
    async (file) => {
      if (!file) {
        console.error("No file provided for upload");
        return;
      }

      console.log("Uploading file:", file);
      return dispatch(uploadMedia(file));
    },
    [dispatch]
  );

  return {
    media,
    uploadLoading,
    uploadError,
    upload,
  };
}
