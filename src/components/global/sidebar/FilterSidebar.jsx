"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTemplateFilter } from "@/hooks/useTemplateFilter";

export default function FilterSidebar({
  sections,
  selected = {},
  onChange,
  className,
}) {
  const { updateFilter, filters } = useTemplateFilter();
  console.log("FilterSidebar", { filters });

  const handleMainToggle = (sectionId, items) => {
    updateFilter("topic", sectionId);
    updateFilter("usecase", "");

    const updated = {};
    for (const item of items) {
      updated[item.id] = true;
    }

    onChange?.(updated);
  };

  const handleSingleSelect = (sectionId, itemId) => (checked) => {
    const updated = {};
    if (checked) {
      updated[itemId] = true;
    }

    if (sectionId === "INDUSTRY") {
      updateFilter("industry", itemId);
      updateFilter("topic", "");
      updateFilter("usecase", "");
    } else {
      updateFilter("usecase", itemId);
      updateFilter("topic", "");
    }
    onChange?.(updated);
  };

  return (
    <aside
      className={cn(
        "w-72 shrink-0 bg-white dark:bg-zinc-950 shadow-md",
        className
      )}
    >
      <ScrollArea className="px-4 py-6">
        <Accordion
          type="multiple"
          defaultValue={sections.map((s) => s.id)}
          className="space-y-4"
        >
          {sections.map(({ id, title, items }) => {
            const allChecked = items.every((item) => selected[item.id]);

            return (
              <AccordionItem
                key={id}
                value={id}
                className="border-none rounded-md bg-zinc-50 dark:bg-zinc-900"
              >
                <AccordionTrigger className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-left hover:bg-green-50 dark:hover:bg-green-900 rounded-md transition-colors">
                  <Checkbox
                    id={id}
                    checked={filters?.topic === id || allChecked}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMainToggle(id, items);
                    }}
                    className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                  />
                  <label
                    htmlFor={id}
                    className="flex-1 cursor-pointer select-none truncate"
                    title={title}
                  >
                    {title}
                  </label>
                </AccordionTrigger>

                <AccordionContent className="pl-3 pr-2 pb-3 pt-1">
                  <ul className="space-y-2">
                    {items.map(({ id: itemId, label, count }) => (
                      <li
                        key={itemId}
                        className="flex items-center gap-2 px-2 py-1 rounded-md transition hover:bg-green-50 dark:hover:bg-green-900"
                      >
                        <Checkbox
                          id={itemId}
                          checked={filters?.usecase === itemId || allChecked}
                          onCheckedChange={handleSingleSelect(id, itemId)}
                          className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                        />
                        <label
                          htmlFor={itemId}
                          className="flex-1 cursor-pointer w-[30px] truncate select-none text-sm text-zinc-800 dark:text-zinc-100"
                          title={label}
                        >
                          {label}
                        </label>

                        {typeof count === "number" && (
                          <span className="rounded-full bg-green-100 dark:bg-green-700 px-2 py-0.5 text-xs text-green-700 dark:text-green-100 font-medium">
                            {count}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </aside>
  );
}
