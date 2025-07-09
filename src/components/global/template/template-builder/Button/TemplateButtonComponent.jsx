"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import ButtonDropdown from "../main/ButtonDropdown";
import VariableField from "../main/VariableField";

const extractVariablesFromURL = (url) => {
  const matches = url.match(/{{(\d+)}}/g);
  if (!matches) return { max: 0, unique: [] };
  const unique = Array.from(
    new Set(matches.map((m) => parseInt(m.replace(/[{}]/g, ""), 10)))
  ).sort((a, b) => a - b);
  const max = unique.length > 0 ? Math.max(...unique) : 0;
  return { max, unique };
};

const TemplateButtonComponent = ({ onChange }) => {
  const [buttons, setButtons] = useState([]);

  const handleAddButton = (type) => {
    const base = { type, text: "" };
    switch (type) {
      case "COPY_CODE":
        base.example = "";
        break;
      case "FLOW":
        Object.assign(base, {
          flow_id: "",
          flow_name: "",
          flow_action: "",
          navigate_screen: "",
          icon: "",
          flow_json: "{}",
        });
        break;
      case "PHONE_NUMBER":
        base.phone_number = "";
        break;
      case "URL":
        base.url = "";
        base.example = [""];
        break;
    }
    setButtons((prev) => [...prev, base]);
  };

  const updateField = (index, field, value) => {
    const updated = [...buttons];
    updated[index][field] = value;

    if (field === "url" && updated[index].type === "URL") {
      const { max } = extractVariablesFromURL(value);
      const synced = [...(updated[index].example || [])];
      for (let i = 0; i < max; i++) if (synced[i] === undefined) synced[i] = "";
      synced.length = max;
      updated[index].example = synced;
    }

    setButtons(updated);
    if (onChange) onChange(updated);
  };

  const updateURLExample = (index, updatedExamples) => {
    const updated = [...buttons];
    updated[index].example = updatedExamples;
    setButtons(updated);
    if (onChange) onChange(updated);
  };

  const removeButton = (index) => {
    const updated = buttons.filter((_, i) => i !== index);
    setButtons(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <ButtonDropdown onChange={handleAddButton} />
      </div>

      {buttons.length === 0 && (
        <p className="text-sm text-muted-foreground">No buttons added yet.</p>
      )}

      {buttons.map((btn, i) => (
        <Card
          key={i}
          className="relative shadow-sm border border-gray-200 rounded-xl"
        >
          <CardContent className="grid gap-5 p-6">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 text-red-500 hover:bg-red-50"
              onClick={() => removeButton(i)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            {btn.type !== "MPM" && (
              <div className="grid gap-1.5">
                <Label>Button Text</Label>
                <Input
                  value={
                    btn?.type === "COPY_CODE" ? "Copy offer code" : btn.text
                  }
                  placeholder="Enter button text"
                  maxLength={25}
                  onChange={(e) => updateField(i, "text", e.target.value)}
                  disabled={btn.type === "COPY_CODE"}
                />
              </div>
            )}

            {btn.type === "COPY_CODE" && (
              <div className="grid gap-1.5">
                <Label>Example</Label>
                <Input
                  value={btn.example}
                  placeholder="e.g. SAVE20"
                  onChange={(e) => updateField(i, "example", e.target.value)}
                />
              </div>
            )}

            {btn.type === "PHONE_NUMBER" && (
              <div className="grid gap-1.5">
                <Label>Phone Number</Label>
                <div className="flex justify-center items-center gap-2">
                  <Input className="w-[15%]" value={"+91"} />
                  <Input
                    value={btn.phone_number}
                    placeholder="XXXXXXXXXX"
                    onChange={(e) =>
                      updateField(i, "phone_number", e.target.value)
                    }
                    className={"w-[85%]"}
                  />
                </div>
              </div>
            )}

            {btn.type === "URL" && (
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Destination URL</Label>
                  <Input
                    value={btn.url}
                    placeholder="e.g. https://example.com?promo={{1}}"
                    onChange={(e) => updateField(i, "url", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use variables like{" "}
                    <code className="text-green-700 font-mono">{`{{1}}`}</code>{" "}
                    in your URL.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-green-700 border-green-600 hover:bg-green-50"
                    onClick={() => {
                      const updated = [...buttons];
                      const current = updated[i];
                      const { max } = extractVariablesFromURL(current.url);
                      const newVar = `{{${max + 1}}}`;
                      const separator = current.url.includes("?") ? "&" : "?";
                      const newUrl =
                        current.url.trim() === ""
                          ? `https://example.com?var=${newVar}`
                          : `${current.url}${separator}var${max + 1}=${newVar}`;
                      current.url = newUrl;
                      const examples = current.example || [];
                      examples[max] = "";
                      current.example = examples;
                      setButtons(updated);
                      if (onChange) onChange(updated);
                    }}
                  >
                    + Add Variable
                  </Button>
                </div>

                {btn.example?.length > 0 && (
                  <div className="grid gap-1.5">
                    <Label>Variable Example Values</Label>
                    <VariableField
                      examples={btn.example}
                      onChange={(updated) => updateURLExample(i, updated)}
                    />
                  </div>
                )}
              </div>
            )}

            {btn.type === "FLOW" && (
              <>
                {[
                  ["flow_id", "Flow ID"],
                  ["flow_name", "Flow Name"],
                  ["flow_action", "Flow Action"],
                  ["navigate_screen", "Navigate Screen"],
                  ["icon", "Icon (e.g. PROMOTION)"],
                ].map(([field, label]) => (
                  <div className="grid gap-1.5" key={field}>
                    <Label>{label}</Label>
                    <Input
                      value={btn[field]}
                      placeholder={label}
                      onChange={(e) => updateField(i, field, e.target.value)}
                    />
                  </div>
                ))}

                <div className="grid gap-1.5">
                  <Label>Flow JSON</Label>
                  <Textarea
                    value={btn.flow_json}
                    rows={5}
                    placeholder="{...flow_json}"
                    onChange={(e) =>
                      updateField(i, "flow_json", e.target.value)
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplateButtonComponent;
