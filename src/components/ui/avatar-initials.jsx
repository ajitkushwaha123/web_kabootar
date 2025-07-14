"use client";

import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function AvatarInitials({ name, online }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative w-11 h-11 flex items-center justify-center rounded-full 
              text-white text-sm font-bold uppercase shadow-sm transition-transform
              transform hover:scale-105 ${getAvatarColor(name)}`}
          >
            {getInitials(name)}
            {online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-sm">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "bg-rose-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-violet-500",
    "bg-indigo-500",
    "bg-blue-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-yellow-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash % colors.length)];
}
