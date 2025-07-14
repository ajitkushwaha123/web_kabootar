"use client";

import Loader from "@/components/ui/loader";
import { EmojiPicker } from "frimousse";

export function MyEmojiPicker({ onSelect }) {
  const handleEmojiSelect = (emoji) => {
    onSelect?.(emoji);
  };

  return (
    <EmojiPicker.Root className="isolate p-2 w-[320px] h-[380px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col">
      <EmojiPicker.Search
        placeholder="Search emojis"
        className="mx-2 mt-1 mb-2 appearance-none rounded-md px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <EmojiPicker.Viewport className="relative flex-1 overflow-y-auto rounded-md">
        <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
          <Loader />
        </EmojiPicker.Loading>

        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
          No emoji found.
        </EmojiPicker.Empty>

        <EmojiPicker.List
          className="pb-2"
          components={{
            CategoryHeader: ({ category, ...p }) => (
              <div
                {...p}
                className="sticky top-0 z-10 bg-white dark:bg-zinc-900 text-xs font-semibold px-3 py-1 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800"
              >
                {category.label}
              </div>
            ),

            Row: ({ children, ...p }) => (
              <div {...p} className="flex flex-wrap gap-1 px-2 py-1">
                {children}
              </div>
            ),

            Emoji: ({ emoji, ...p }) => {
              const mergedClick = (e) => {
                p.onClick?.(e);
                handleEmojiSelect(emoji.emoji);
              };

              return (
                <button
                  {...p}
                  type="button"
                  onClick={mergedClick}
                  className="w-9 h-9 text-lg rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                >
                  {emoji.emoji}
                </button>
              );
            },
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
