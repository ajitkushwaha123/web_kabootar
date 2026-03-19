"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplateFilter } from "@/hooks/useTemplateFilter";

const LANGUAGES = [
  { label: "English (US)", code: "en_US" },
  { label: "English (UK)", code: "en_GB" },
  { label: "Hindi", code: "hi" },
  { label: "Spanish", code: "es" },
  { label: "French", code: "fr" },
  { label: "German", code: "de" },
  { label: "Portuguese (BR)", code: "pt_BR" },
  { label: "Chinese (CHN)", code: "zh_CN" },
  { label: "Arabic", code: "ar" },
  { label: "Japanese", code: "ja" },
  { label: "Korean", code: "ko" },
  { label: "Vietnamese", code: "vi" },
  { label: "Urdu", code: "ur" },
  { label: "Tamil", code: "ta" },
  { label: "Telugu", code: "te" },
];

export default function LanguageSelect({ onSelect }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("en_US");
  const { updateFilter } = useTemplateFilter();

  useEffect(() => {
    updateFilter("language", selected);
    if (typeof onSelect === "function") onSelect(selected);
  }, [selected]);

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Select value={selected} onValueChange={setSelected}>
      <SelectTrigger className="rounded-md shadow-sm text-sm border-green-300 focus:ring-green-500 focus:ring-2">
        <SelectValue>
          {LANGUAGES.find((lang) => lang.code === selected)?.label ??
            "Select Language"}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="max-h-[320px] border border-green-400 rounded-xl shadow-lg p-1">
        <div className="p-2">
          <Input
            placeholder="Search language..."
            className="text-sm px-3 py-2 rounded-md border border-green-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[250px] px-1">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => (
              <SelectItem
                key={lang.code}
                value={lang.code}
                className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-green-50 rounded-md transition"
              >
                {lang.label}
              </SelectItem>
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 px-2 py-4">
              No results found.
            </div>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
