"use client";

import { useRef, useState } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MyEmojiPicker } from "@/components/global/emoji-picker/MyEmojiPicker";

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileRef = useRef(null);

  const addAttachments = (files) => {
    const list = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...list]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) addAttachments(e.target.files);
    e.target.value = "";
  };

  const removeAttachment = (url) => {
    setAttachments((prev) => {
      const next = prev.filter((a) => a.url !== url);
      URL.revokeObjectURL(url);
      return next;
    });
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text && attachments.length === 0) return;

    onSend?.({
      text,
      attachments,
    });

    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setMessage("");
    setAttachments([]);
  };

  const handleSelectedEmoji = (emoji) => {
    console.log("Emoji selected:", emoji);
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3">
          {attachments.map(({ url }) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt="preview"
                className="h-16 w-16 object-cover rounded-md"
              />
              <button
                onClick={() => removeAttachment(url)}
                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow"
              >
                <X className="w-3 h-3 text-zinc-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Smile className="w-5 h-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="p-0 border-none bg-transparent shadow-none"
          >
            <MyEmojiPicker onSelect={(val) => handleSelectedEmoji(val)} />
          </PopoverContent>
        </Popover>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-muted/40 dark:bg-muted/30 border-none focus-visible:ring-0 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <Button
          size="icon"
          className="bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
