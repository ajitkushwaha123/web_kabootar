"use client";

import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Zap, Download, ClipboardCopy } from "lucide-react";

const deliveryOptions = [
//   {
//     value: "zero_tap",
//     label: "Zero-tap autofill",
//     icon: Zap,
//     description:
//       "Automatically sends the code without requiring user action. Best for frictionless experience.",
//   },
//   {
//     value: "one_tap",
//     label: "One-tap autofill",
//     icon: Download,
//     description:
//       "Sends code when customer taps the button. Fallbacks to copy code if autofill fails.",
//   },
  {
    value: "COPY_CODE",
    label: "Copy code",
    icon: ClipboardCopy,
    description:
      "Basic setup. Customers copy and paste the code manually into your app.",
  },
];

const CodeDeliverySetup = () => {
  const [selected, setSelected] = useState("COPY_CODE");

  return (
    <div className="space-y-5 bg-white p-6 rounded-md shadow-sm border border-green-100">
      <div>
        <h3 className="text-xl font-semibold text-gray-600">
          Code delivery setup
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose how customers send the code from WhatsApp to your app.{" "}
          <a href="#" className="text-green-600 underline">
            Learn how to send authentication message templates
          </a>
          .
        </p>
      </div>

      <div className="space-y-3">
        {deliveryOptions.map(({ value, label, icon: Icon, description }) => {
          const isSelected = selected === value;

          return (
            <div
              key={value}
              onClick={() => setSelected(value)}
              className={`flex cursor-pointer items-start gap-4 p-4 rounded-xl transition-all border ${
                isSelected
                  ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                  : "hover:bg-green-50 border-gray-200"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <Icon className="w-4 h-4 text-green-600" />
                  <span>{label}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white border border-green-100 rounded-md p-2 shadow-md max-w-sm">
                        <p className="text-xs px-2 text-gray-700">{description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-gray-600 max-w-md">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodeDeliverySetup;
