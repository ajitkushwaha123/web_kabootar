"use client";

import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import VariableField from "../main/VariableField";

const extractVariables = (text) => {
  const matches = text.match(/{{(\d+)}}/g);
  if (!matches) return { max: 0, unique: [] };

  const unique = Array.from(
    new Set(matches.map((m) => parseInt(m.replace(/[{}]/g, ""), 10)))
  ).sort((a, b) => a - b);

  const max = unique.length > 0 ? Math.max(...unique) : 0;

  return { max, unique };
};

const TemplateBodyComponent = ({ onChange }) => {
  const [bodyText, setBodyText] = useState("");
  const [examples, setExamples] = useState([]);
  const textareaRef = useRef(null);

  const syncAll = (text, updatedExamples = examples) => {
    const { max } = extractVariables(text);
    const syncedExamples = [...updatedExamples];

    for (let i = 0; i < max; i++) {
      if (syncedExamples[i] === undefined) syncedExamples[i] = "";
    }
    syncedExamples.length = max;

    setBodyText(text);
    setExamples(syncedExamples);

    if (onChange) {
      onChange({
        type: "BODY",
        text,
        example: {
          body_text: [syncedExamples],
        },
      });
    }
  };

  const handleAddVariable = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { max } = extractVariables(bodyText);
    const newVar = `{{${max + 1}}}`;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText = bodyText.slice(0, start) + newVar + bodyText.slice(end);

    syncAll(newText);

    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + newVar.length;
      textarea.focus();
    });
  };

  const handleTextChange = (e) => {
    syncAll(e.target.value);
  };

  const handleExampleChange = (updated) => {
    setExamples(updated);

    if (onChange) {
      onChange({
        type: "BODY",
        text: bodyText,
        example: {
          body_text: [updated],
        },
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="body-text">Body</Label>
        <Textarea
          id="body-text"
          ref={textareaRef}
          placeholder="e.g. Hi {{1}}, your order {{2}} is ready!"
          value={bodyText}
          onChange={handleTextChange}
          className="resize-none min-h-[120px] focus-visible:ring-2 focus-visible:ring-green-500"
        />
      </div>

      <div className="w-full flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddVariable}
          className="text-green-700 border-green-600 text-sm hover:bg-green-50"
        >
          + Add Variable
        </Button>
      </div>

      {examples.length > 0 && (
        <VariableField examples={examples} onChange={handleExampleChange} />
      )}
    </div>
  );
};

export default TemplateBodyComponent;
