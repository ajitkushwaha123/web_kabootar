"use client";

import React from "react";
import { Label } from "@/components/ui/label";

const VariableField = ({ examples = [], onChange }) => {
  const handleExampleChange = (index, value) => {
    const updated = [...examples];
    updated[index] = value;
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-3 rounded-md p-4 bg-green-50/30">
      <Label className="text-sm font-medium text-green-900">
        Example Values <span className="text-gray-500">(for Preview)</span>
      </Label>

      <div className="space-y-2">
        {examples.map((val, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white border border-green-200 rounded-md px-3 py-2 shadow-sm hover:border-green-400 transition"
          >
            <span className="text-xs text-green-600 font-mono whitespace-nowrap">
              {`{{${i + 1}}}`}
            </span>

            <input
              type="text"
              value={val}
              onChange={(e) => handleExampleChange(i, e.target.value)}
              placeholder={`Enter value for {{${i + 1}}}`}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariableField;
