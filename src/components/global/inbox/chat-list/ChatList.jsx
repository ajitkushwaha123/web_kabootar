"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, Download, Check, CheckCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { useChat } from "@/hooks/useChat";
import { getDateGroup, getGroupedChatsSorted } from "@/utils/chat-data";
import Loader from "@/components/ui/loader";

export default function ChatList() {
  const [chatListGrouped, setChatListGrouped] = useState({});
  const { chatList, loading, error } = useChat();
  const router = useRouter();

  useEffect(() => {
    if (!chatList || chatList.length === 0) return;

    const enhanced = chatList.map((chat) => {
      const timestamp = new Date(chat.timestamp);
      return {
        ...chat,
        dateGroup: getDateGroup(timestamp),
        time: timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread:
          chat.direction === "incoming" && chat.unreadCount > 0 ? true : false,
      };
    });

    const grouped = getGroupedChatsSorted(enhanced);
    setChatListGrouped(grouped);
  }, [chatList]);

  const getPhone = (phone) => (phone ? phone.slice(2) : "Unknown");

  const getStatusIcon = (status) => {
    switch (status) {
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case "delivered":
      case "sent":
        return <Check className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getPreviewMessage = (chat) => {
    if (chat.typing)
      return (
        <span className="italic text-blue-500 animate-pulse">typing…</span>
      );
    if (chat.type === "image") return "[Image]";
    if (chat.type === "template") return "[Template]";
    return chat.message || chat.text || "";
  };

  const renderChatGroups = () =>
    Object.entries(chatListGrouped).map(([group, chats]) => (
      <div key={group} className="mb-8">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-1 tracking-wider">
          {group}
        </div>
        <div className="space-y-2">
          {chats.map((chat, index) => (
            <motion.div
              key={chat._id || chat.messageId || index}
              onClick={() => router.push(`/inbox?chatWith=${chat.chatWith}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`group flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                chat.unread
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-zinc-100 dark:hover:bg-muted/20"
              }`}
            >
              {/* Avatar */}
              <AvatarInitials
                name={chat.profileName || getPhone(chat.to)}
                className="text-sm font-medium bg-muted-foreground/10 dark:bg-muted-foreground/20"
              />

              {/* Main Text Content */}
              <div className="flex flex-1 min-w-0 flex-col gap-1 px-3">
                <div className="flex justify-between items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                    {chat.profileName || getPhone(chat.to)}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                  <span className="truncate max-w-[180px] flex-1 min-w-0">
                    {getPreviewMessage(chat)}
                  </span>
                  {chat.direction === "outgoing" && getStatusIcon(chat.status)}
                </div>
              </div>

              {/* Unread Badge */}
              {chat.unread && (
                <div className="ml-2 shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded-full">
                  {chat.unreadCount || 1}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    ));

  return (
    <ScrollArea className="h-screen w-full max-w-sm bg-background border-r dark:border-zinc-800 px-4 py-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-bold tracking-tight">Chats</h2>
        <div className="flex gap-2">
          <button
            title="Call"
            className="hover:bg-muted dark:hover:bg-muted/20 p-2 rounded-md"
          >
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            title="Export"
            className="hover:bg-muted dark:hover:bg-muted/20 p-2 rounded-md"
          >
            <Download className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-10">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-500 py-10">
          Error: {error}
        </div>
      ) : Object.keys(chatListGrouped).length === 0 && !loading ? (
        <div className="text-center text-sm text-muted-foreground py-10">
          No chats yet. Start a conversation!
        </div>
      ) : (
        renderChatGroups()
      )}
    </ScrollArea>
  );
}
