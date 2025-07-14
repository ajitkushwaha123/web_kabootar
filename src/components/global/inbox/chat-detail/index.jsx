"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatHeader from "./chat-header";
import ChatInput from "./chat-input";
import ChatBubble from "./chat-bubble";
import { AnimatePresence, motion } from "framer-motion";
import { useConversations } from "@/hooks/useConversation";

const ChatDetail = ({ chatWith }) => {
  const bottomRef = useRef(null);
  const msgRefs = useRef({});

  const {
    messages = [],
    loading,
    error,
    sendMsg,
    chatWithData,
  } = useConversations(chatWith);
  const [replyTo, setReplyTo] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

  const scrollToMessage = useCallback((id) => {
    const el = msgRefs.current[id];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  }, []);

  const findRepliedMessage = useCallback(
    (id) => messages.find((m) => m.messageId === id),
    [messages]
  );

  const handleSendText = async (message) => {
    await sendMsg({
      to: chatWith,
      type: "text",
      message,
      ...(replyTo?.messageId && {
        context: { message_id: replyTo.messageId },
      }),
    });
    setReplyTo(null);
  };

  const handleReaction = async (emoji, messageId) => {
    await sendMsg({
      to: chatWith,
      type: "reaction",
      message: { message_id: messageId, emoji },
    });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full w-full max-h-screen bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100">
      <div className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-inherit">
        <ChatHeader
          name={
            chatWithData?.profileName || chatWithData?.phoneNumber || "Unknown"
          }
          online={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {loading && (
          <div className="text-center text-sm text-zinc-500">Loading…</div>
        )}
        {error && (
          <div className="text-center text-sm text-red-500">
            Error: {error.toString()}
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center text-sm text-zinc-500">
            No messages yet. Say hi!
          </div>
        )}

        {messages.map((msg, i) => {
          const replyMsg =
            msg.context?.message_id &&
            findRepliedMessage(msg.context.message_id);

          const key = msg.messageId || `msg-${i}`;

          return (
            <motion.div
              key={key}
              ref={(el) => {
                if (msg.messageId) msgRefs.current[msg.messageId] = el;
              }}
              onClick={() => setReplyTo(msg)}
              className={`group cursor-pointer ${
                highlightedId === msg.messageId
                  ? "ring-2 ring-indigo-400 rounded-xl"
                  : ""
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
            >
              <ChatBubble
                direction={msg.direction}
                message={msg.message}
                type={msg.type}
                time={msg.timestamp}
                status={msg.status}
                name={chatWith}
                replyTo={replyMsg?.message || null}
                scrollToReply={() =>
                  msg.context?.message_id &&
                  scrollToMessage(msg.context.message_id)
                }
                messageId={msg.messageId}
                onReact={handleReaction}
              />
            </motion.div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm flex justify-between items-center"
          >
            <span className="truncate">
              Replying to: 
              <strong>
                {typeof replyTo.message === "string"
                  ? replyTo.message
                  : replyTo.message?.text || "[media]"}
              </strong>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-3 text-red-500 hover:text-red-600 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky bottom-0 z-10 border-t border-zinc-200 dark:border-zinc-800 bg-inherit">
        <ChatInput onSend={handleSendText} />
      </div>
    </div>
  );
};

export default ChatDetail;
