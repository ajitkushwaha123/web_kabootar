"use client";

import { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import LanguageSelect from "./language-picker/LanguagePicker";
import { useTemplateFilter } from "@/hooks/useTemplateFilter";
import debounce from "lodash.debounce";

const categories = [
  { title: "Marketing", value: "MARKETING" },
  { title: "Utility", value: "UTILITY" },
  { title: "Authentication", value: "AUTHENTICATION" },
];

const statuses = [
  { title: "Approved", value: "APPROVED" },
  { title: "Pending", value: "PENDING" },
  { title: "Rejected", value: "REJECTED" },
];

const platforms = [
  { title: "WhatsApp", value: "whatsapp" },
  { title: "Messenger", value: "messenger" },
];

export default function TemplateLibraryHeader({ onCreateTemplate }) {
  const { filters, updateFilter } = useTemplateFilter();

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter("search", value);
      }, 2000),
    [updateFilter]
  );

  useEffect(() => {
    debouncedSearch(filters.search);
    return () => {
      debouncedSearch.cancel();
    };
  }, [filters.search, debouncedSearch]);

  const handleFilter = (key, value) => {
    updateFilter(key, value);
  };

  return (
    <div className="space-y-4 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      <div className="flex items-center justify-between px-6 pt-5">
        <h1 className="text-2xl font-semibold text-green-600">
          Template Library
        </h1>
        <Button
          onClick={onCreateTemplate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search templates..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-start md:justify-end">
          {[
            {
              key: "platform",
              options: platforms,
              placeholder: "Platform",
              value: filters.platform,
            },
            {
              key: "category",
              options: categories,
              placeholder: "Category",
              value: filters.category || undefined,
            }
          ].map(({ key, options, placeholder, value }) => (
            <Select
              key={key}
              value={value}
              onValueChange={(val) => handleFilter(key, val)}
            >
              <SelectTrigger className="text-sm bg-white border border-gray-300 shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ title, value }) => (
                  <SelectItem key={value} value={value}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <LanguageSelect />
        </div>
      </div>
    </div>
  );
}
