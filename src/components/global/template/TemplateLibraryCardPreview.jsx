"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function TemplateCardLibraryPreview({ template }) {
  const {
    name,
    category,
    header,
    body,
    body_param_types,
    body_params = [],
    buttons = [],
  } = template;

  const [showExample, setShowExample] = useState(false);

  const textFormatter = (text) =>
    text
      ? text
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";

  const categoryColor = {
    MARKETING: "bg-emerald-100 text-emerald-700",
    UTILITY: "bg-sky-100 text-sky-700",
    AUTHENTICATION: "bg-rose-100 text-rose-700",
  };

  const renderBodyContent = () => {
    if (!body) return null;

    const parts = body.split(/({{\d+}})/g);

    if (showExample) {
      return (
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {parts.map((part, idx) => {
            const match = part.match(/{{(\d+)}}/);
            if (match) {
              const index = Number(match[1]);
              const example = body_params?.[index - 1];
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
            const param = body_param_types?.[index - 1];
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <span className="text-green-600 font-medium cursor-help">
                    {`{{${index}}}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>{param || "No param"}</span>
                </TooltipContent>
              </Tooltip>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="rounded-2xl shadow-sm bg-white overflow-hidden flex flex-col h-full">

      <div className="bg-white rounded-t-xl p-4 shadow-sm flex items-center justify-between gap-4">
        <h2 className="font-semibold text-gray-500 text-md truncate overflow-hidden whitespace-nowrap flex-1">
          {textFormatter(name)}
        </h2>
      </div>

      <div className="bg-chat p-4 flex-1 overflow-auto h-full relative">
        <div className="bg-white rounded-xl p-4 shadow-sm text-sm text-gray-800 whitespace-pre-wrap leading-relaxed flex flex-col gap-4">
          {header && (
            <p className="font-semibold text-[15px] mb-2 text-black">
              {header}
            </p>
          )}

          <div className="flex-1">{renderBodyContent()}</div>

          {buttons?.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {buttons.map((btn, idx) => (
                <a
                  key={idx}
                  href={btn.url || "#"}
                  className="inline-block text-sm font-medium text-green-600 border border-green-600 rounded-md px-3 py-1.5 hover:bg-green-50 transition text-center"
                >
                  {btn.text}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bottom-0 bg-white flex justify-between items-center rounded-b-xl shadow-sm text-xs text-gray-500">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => setShowExample((prev) => !prev)}
        >
          {showExample ? "Show Params" : "Show Example"}
        </Button>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded",
            categoryColor[category?.toUpperCase()] ||
              "bg-gray-100 text-gray-600"
          )}
        >
          {category?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
