"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { AvatarInitials } from "@/components/ui/avatar-initials";

export default function ChatBubble({
  message,
  messageId,
  time,
  direction,
  delay = 0,
  status,
  name = "User",
  type = "text",
  replyTo = null,
  scrollToReply,
  onReact,
}) {
  const [showReactions, setShowReactions] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowReactions(true);
  };

  const handleReaction = (emoji) => {
    setShowReactions(false);
    if (onReact) {
      onReact(emoji, messageId);
    }
  };

  const statusIcon =
    status === "read" ? (
      <CheckCheck className="w-3 h-3 text-blue-300 ml-1" />
    ) : status === "delivered" ? (
      <Check className="w-3 h-3 text-muted-foreground ml-1" />
    ) : null;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        direction === "outgoing" ? "justify-end" : "justify-start"
      )}
      onContextMenu={handleContextMenu}
    >
      {direction === "incoming" && <AvatarInitials name={name} />}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={cn(
          "relative px-4 py-2 text-sm max-w-[80%] md:max-w-[60%] rounded-2xl shadow-lg",
          direction === "outgoing"
            ? "bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-br-md"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-md"
        )}
      >
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={scrollToReply}
            className={cn(
              "mb-2 p-2 rounded-lg border-l-4 text-xs shadow-sm backdrop-blur-sm cursor-pointer hover:bg-opacity-80 transition",
              direction === "outgoing"
                ? "bg-indigo-200/20 border-white text-white"
                : "bg-gray-200 dark:bg-zinc-700 border-gray-500 text-gray-700 dark:text-gray-300"
            )}
          >
            <span className="font-medium">Replying to: </span>
            <span className="line-clamp-2 italic">{replyTo}</span>
          </motion.div>
        )}

        <p className="leading-snug break-words whitespace-pre-wrap font-normal">
          {type === "text" ? (
            message
          ) : type === "image" ? (
            <img
              src={message}
              alt="image"
              className="rounded-md max-w-full h-auto mt-1"
            />
          ) : (
            <span className="italic">[Unsupported Media]</span>
          )}
        </p>

        <div className="flex justify-end items-center gap-1 mt-1 text-[10px]">
          <span
            className={cn(
              direction === "outgoing" ? "text-white" : "text-muted-foreground"
            )}
          >
            {time
              ? new Date(time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
          {direction === "outgoing" && statusIcon}
        </div>

        {showReactions && (
          <div className="absolute -top-10 left-0 z-50 bg-white dark:bg-zinc-800 border rounded shadow p-1 flex gap-2">
            {["❤️", "😂", "👍", "🔥", "🙏"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-lg hover:scale-110 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {direction === "outgoing" && <AvatarInitials name="You" />}
    </div>
  );
}
