"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TemplateCardPreview({ template = {} }) {
  const {
    name = "",
    components = [],
    status = "",
    category = "",
  } = template || {};

  const header = components?.find((c) => c.type === "HEADER");
  const body = components?.find((c) => c.type === "BODY");
  const footer = components?.find((c) => c.type === "FOOTER");
  const buttons = components?.find((c) => c.type === "BUTTONS");

  const headerText = header?.format === "TEXT" ? header?.text : null;
  const previewUrl =
    header?.example?.previewUrl ||
    (Array.isArray(header?.example?.header_handle)
      ? header.example.header_handle[0]
      : null) ||
    null;

  const bodyText = body?.text || "";
  const bodyParams = body?.example?.body_text[0] || [];
  const footerText = footer?.text || "";


  const [showExample, setShowExample] = useState(false);

  const textFormatter = (text) =>
    text
      ? text
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";

  const statusColor = {
    APPROVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-700",
  };

  const categoryColor = {
    MARKETING: "bg-emerald-100 text-emerald-700",
    UTILITY: "bg-sky-100 text-sky-700",
    AUTHENTICATION: "bg-rose-100 text-rose-700",
  };

  const renderBodyContent = () => {
    if (!body) return null;

    const parts = bodyText.split(/({{\d+}})/g);

    console.log("Body Params:", parts);

    if (showExample) {
      return (
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {parts.map((part, idx) => {
            const match = part.match(/{{(\d+)}}/);
            if (match) {
              const index = Number(match[1]);

              console.log("index:", index);

              console.log("Body Params:", bodyParams);

              const example = bodyParams?.[index - 1];
              return (
                <span key={idx} className="text-green-600 font-medium">
                  {example || `{{${index}}}`}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {parts.map((part, idx) => {
          const match = part.match(/{{(\d+)}}/);
          if (match) {
            const index = Number(match[1]);

            // console.log("Index:", index);
            // const param = bodyParams?.[index - 1];
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <span className="text-green-600 font-medium cursor-help">
                    {`{{${index}}}`}
                  </span>
                </TooltipTrigger>
              </Tooltip>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-sm bg-white">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between">
        <h2 className="font-semibold text-gray-500 text-md truncate">
          {textFormatter(name || "Template Name")}
        </h2>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded",
            statusColor[status?.toUpperCase()] || "bg-gray-100 text-gray-600"
          )}
        >
          {status?.toUpperCase() || "PENDING"}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-chat p-4 overflow-auto">
        <div className="bg-white rounded-lg p-4 shadow-sm text-sm text-gray-800 whitespace-pre-wrap leading-relaxed flex flex-col gap-3">
          {/* Header Text */}
          {headerText && (
            <p className="font-semibold text-[15px] text-black">{headerText}</p>
          )}

          {/* Media Types */}
          {header?.format === "IMAGE" && (
            <div className="overflow-hidden rounded-md">
              <img
                src={
                  previewUrl ||
                  "https://i.pinimg.com/1200x/21/7f/0a/217f0a878b0fb41f5560651ebed1cc1a.jpg"
                }
                alt="Header Image"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          )}

          {header?.format === "VIDEO" && (
            <div className="w-full overflow-hidden rounded-md">
              {previewUrl ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-cover aspect-video rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center h-[180px] bg-gray-500">
                  <PlayCircle size={"70px"} />
                </div>
              )}
            </div>
          )}

          {header?.format === "DOCUMENT" && (
            <div className="w-full max-h-[260px] overflow-hidden rounded-md">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[240px] rounded-md border"
                  title="Document Preview"
                />
              ) : (
                <img
                  src="https://i.pinimg.com/736x/86/88/7c/86887c498851d548e201b3e375df8b2e.jpg"
                  alt="Document Placeholder"
                  className="w-full h-full object-cover rounded-md"
                />
              )}
            </div>
          )}

          {bodyText ? (
            renderBodyContent()
          ) : (
            <p className="text-gray-400 italic">No body content provided.</p>
          )}

          {Array.isArray(buttons?.buttons) && buttons.buttons.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {buttons.buttons.map((btn, idx) => (
                <a
                  key={idx}
                  href={btn.url || "#"}
                  className="inline-block text-sm font-medium text-green-600 border border-green-600 rounded-md px-3 py-1.5 hover:bg-green-50 transition text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {btn.text || `Button ${idx + 1}`}
                </a>
              ))}
            </div>
          )}

          {footerText && (
            <div className="text-xs flex justify-end text-gray-400 mt-4">
              {footerText}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-white flex justify-between items-center text-xs text-gray-500">
        {bodyParams.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setShowExample((prev) => !prev)}
          >
            {showExample ? "Show Params" : "Show Example"}
          </Button>
        )}
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded",
            categoryColor[category?.toUpperCase()] ||
              "bg-gray-100 text-gray-600"
          )}
        >
          {category?.toUpperCase() || "UNCATEGORIZED"}
        </span>
      </div>
    </div>
  );
}
