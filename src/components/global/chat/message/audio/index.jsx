"use client";

import * as React from "react";
import { Play, Pause, MoreVertical } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import { MessageLayout } from "../layout";

export const AudioMessage = ({
  name,
  avatar,
  time,
  audioSrc,
  duration = "3:42",
  status = "delivered",
  direction = "incoming",
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = (React.useRef < HTMLAudioElement) | (null > null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <MessageLayout
      name={name}
      avatar={avatar}
      time={time}
      status={status}
      direction={direction}
    >
      <div
        className={clsx(
          "flex items-center gap-3 w-full max-w-md rounded-xl p-3",
          direction === "incoming"
            ? "bg-gray-100 dark:bg-gray-700"
            : "bg-blue-100 dark:bg-blue-600"
        )}
      >
        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-gray-800 dark:text-white" />
          ) : (
            <Play className="w-5 h-5 text-gray-800 dark:text-white" />
          )}
        </button>

        {/* Fake waveform (static for now) */}
        <div className="flex-1 flex items-center">
          <svg
            aria-hidden="true"
            className="h-8 w-full"
            viewBox="0 0 185 40"
            fill="none"
          >
            <rect y="17" width="3" height="6" rx="1.5" fill="currentColor" />
            <rect
              x="7"
              y="15.5"
              width="3"
              height="9"
              rx="1.5"
              fill="currentColor"
            />
            <rect
              x="14"
              y="6.5"
              width="3"
              height="27"
              rx="1.5"
              fill="currentColor"
            />
            <rect
              x="21"
              y="10"
              width="3"
              height="20"
              rx="1.5"
              fill="currentColor"
            />
            <rect
              x="28"
              y="13"
              width="3"
              height="14"
              rx="1.5"
              fill="currentColor"
            />
            {/* add more rects for a longer waveform */}
          </svg>
        </div>

        {/* Duration */}
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {duration}
        </span>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Reply</DropdownMenuItem>
            <DropdownMenuItem>Forward</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
    </MessageLayout>
  );
};
