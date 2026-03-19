"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function InboxSidebarSkeleton({ count = 6, className }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 shadow-sm animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 rounded bg-muted-foreground/20 animate-shimmer" />
            <div className="h-2.5 w-10 rounded bg-muted-foreground/15 animate-shimmer" />
          </div>
          <div className="h-2.5 w-40 rounded bg-muted-foreground/10 animate-shimmer" />
          <div className="h-2.5 w-28 rounded bg-muted-foreground/10 animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
