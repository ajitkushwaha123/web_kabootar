"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, Send, SmilePlus, Sparkles, Loader2 } from "lucide-react";
import { useChat } from "@/store/hooks/useChat";
import { useConversation } from "@/store/hooks/useConversation";
import { toast } from "sonner";

const ChatInput = () => {
  const [message, setMessage] = React.useState("");
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const { sendMessage } = useChat();
  const { activeConversationId } = useConversation();

  const handleAISuggest = async () => {
    console.log("✨ AI Suggest Clicked. Active Convo ID:", activeConversationId);
    if (!activeConversationId) {
      toast.error("Select a conversation first");
      console.warn("No active conversation ID found.");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch("/api/organization/inbox/message/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId }),
      });

      const data = await response.json();
      if (data.success && data.suggestion) {
        setMessage(data.suggestion);
        toast.success("AI suggestion generated!");
      } else {
        toast.error(data.message || "AI failed to suggest a reply");
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to connect to AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
  
    sendMessage({
      messageType: "text",
      text: {
        body: message,
        preview_url: false,
      },
    });
    setMessage("");
  };

  return (
    <div className="w-full flex items-center gap-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
            >
              <SmilePlus size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Emoji</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAISuggest}
              disabled={isAiLoading || !activeConversationId}
              variant="ghost"
              size="icon"
              className="text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded-sm"
            >
              {isAiLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} className="fill-sky-500/20" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-sky-600 text-white border-sky-600">AI Reply Suggestion</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 rounded-sm border border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 dark:focus:ring-gray-600 dark:focus:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-black text-black dark:text-white"
      />

      <Button
        variant="ghost"
        size="icon"
        className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
      >
        <Mic size={20} />
      </Button>

      <Button
        onClick={handleSend}
        className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-sm p-2 flex items-center justify-center"
      >
        <Send size={20} />
      </Button>
    </div>
  );
};

export default ChatInput;
