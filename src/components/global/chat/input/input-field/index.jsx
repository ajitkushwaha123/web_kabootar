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
import { Mic, Send, SmilePlus } from "lucide-react";
import { useChat } from "@/store/hooks/useChat";
import { useConversation } from "@/store/hooks/useConversation";

const ChatInput = () => {
  const [message, setMessage] = React.useState("");

  const { sendMessage } = useChat();

  const {  } = useConversation()

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
