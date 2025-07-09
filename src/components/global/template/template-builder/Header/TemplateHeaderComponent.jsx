"use client";

import React, { useState } from "react";
import MediaDropdown from "../main/MediaDropdown";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileImage,
  FileVideo,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useMedia from "@/hooks/useUpload";

const TemplateHeaderComponent = ({ setData }) => {
  const [selectedType, setSelectedType] = useState("none");
  const [mediaText, setMediaText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { upload, uploadLoading, uploadError, media } = useMedia();

  const handleMediaChange = (type) => {
    setSelectedType(type);
    setMediaText("");
    setMediaFile(null);
    setPreviewUrl(null);

    if (type === "none") {
      setData(null);
    } else {
      // Send status as soon as type changes
      setData({
        type: "HEADER",
        format: type.toUpperCase(),
        status: "awaiting content", // optional status message
      });
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setMediaText(value);
    setData(
      value
        ? {
            type: "HEADER",
            format: "TEXT",
            text: value,
          }
        : null
    );
  };

  const getFileIcon = () => {
    const iconProps = "w-4 h-4";
    switch (selectedType) {
      case "image":
        return <FileImage className={`${iconProps} text-blue-500`} />;
      case "video":
        return <FileVideo className={`${iconProps} text-purple-500`} />;
      case "document":
        return <FileText className={`${iconProps} text-gray-500`} />;
      default:
        return null;
    }
  };

  const handleUpload = async () => {
    if (!mediaFile || selectedType === "none") return;

    const response = await upload(mediaFile);
    const handle = media?.h || response?.payload?.h;
    const fileUrl = URL.createObjectURL(mediaFile);

    if (!handle) return;

    const format = selectedType.toUpperCase();

    setPreviewUrl(fileUrl);

    setData({
      type: "HEADER",
      format,
      example: {
        header_handle: [handle],
        previewUrl: fileUrl,
      },
    });
  };

  return (
    <div className="space-y-5">
      <MediaDropdown onChange={handleMediaChange} />

      {selectedType === "none" && (
        <div className="space-y-2">
          <Label htmlFor="media-text">Header Text</Label>
          <Input
            id="media-text"
            placeholder="e.g. Welcome to our store!"
            value={mediaText}
            onChange={handleTextChange}
            className="focus-visible:ring-2 focus-visible:ring-green-500"
          />
        </div>
      )}

      {["image", "video"].includes(selectedType) && (
        <div className="space-y-3">
          <Label className="capitalize">Upload {selectedType}</Label>

          <label
            htmlFor="media-upload"
            className={cn(
              "flex items-center gap-3 p-4 text-sm border-2 border-dashed rounded-md cursor-pointer transition",
              mediaFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-green-500"
            )}
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {mediaFile ? mediaFile.name : `Choose a ${selectedType} file`}
            </span>
            <input
              type="file"
              id="media-upload"
              accept={selectedType === "image" ? "image/*" : "video/*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMediaFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
              className="hidden"
            />
          </label>

          {mediaFile && (
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <span className="text-sm text-gray-600 truncate max-w-[160px]">
                {mediaFile.name}
              </span>

              <button
                onClick={handleUpload}
                disabled={uploadLoading}
                className="ml-auto text-sm text-green-600 hover:underline flex items-center gap-1"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>Upload</>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaFile(null);
                  setPreviewUrl(null);
                  setData(null);
                }}
                className="text-gray-400 hover:text-red-500"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="mt-2">
              {selectedType === "image" ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-w-xs rounded-md border"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-xs rounded-md border"
                />
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-red-500 mt-1">Error: {uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateHeaderComponent;
