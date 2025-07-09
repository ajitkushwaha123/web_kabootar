"use client";

import React, { useState, useEffect } from "react";
import LanguageSelect from "../../language-picker/LanguagePicker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const TemplateTitleComponent = ({ onChange }) => {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en_US");

  useEffect(() => {
    onChange?.({ title, language });
  }, [title, language]);

  return (
    <Card className="bg-white border border-slate-200 shadow-sm rounded-md">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-xl text-slate-800">
              Template Information
            </h3>
            <p className="text-sm text-slate-500">
              Set a clear name and language for your WhatsApp template.
            </p>
          </div>
          <Info className="w-5 h-5 text-slate-400 mt-1" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Title Input */}
          <div className="w-full md:w-3/4 space-y-2">
            <Label htmlFor="title" className="text-sm text-slate-700">
              Template Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. limited_time_offer_2025"
              className="border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500 shadow-sm rounded-md"
              value={title}
              onChange={(e) => {
                const formatted = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "_");
                setTitle(formatted);
              }}
            />
            <p className="text-xs text-slate-500">
              Use only lowercase letters and underscores.
            </p>
          </div>

          {/* Language Picker */}
          <div className="w-full md:w-1/4 space-y-2">
            <Label htmlFor="language" className="text-sm text-slate-700">
              Language
            </Label>
            <LanguageSelect onSelect={(val) => setLanguage(val)} />
            <p className="text-xs text-slate-500">
              Default language for the template.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateTitleComponent;
