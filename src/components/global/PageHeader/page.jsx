"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PageHeader({
  title = "Page Title",
  description = "Page description goes here.",
  filterOptions = [],
  onFilterChange,
  defaultFilter = "All",
  buttonText = "",
  buttonLink = "",
  showButton = true,
  showFilter = true,
}) {
  const [selected, setSelected] = useState(defaultFilter);

  const handleChange = (value) => {
    setSelected(value);
    onFilterChange?.(value);
  };

  return (
    <div className="bg-green-50 border border-green-100 rounded-xl px-6 py-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          {showFilter && filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Filter className="w-4 h-4" />
                  <span>{selected}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleChange(option)}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showButton && buttonText && buttonLink && (
            <Link href={buttonLink}>
              <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-md">
                <Plus className="w-4 h-4" />
                {buttonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
