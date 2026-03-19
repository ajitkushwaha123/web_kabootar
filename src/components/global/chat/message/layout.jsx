"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Clock, Check, CheckCheck, XCircle } from "lucide-react";
import clsx from "clsx";
import { formatMessageTime } from "@/utils/formatTime";

export const MessageLayout = ({
  _id,
  name,
  avatar,
  time,
  status,
  direction = "incoming",
  maxWidth = "320px",
  className,
  children,
}) => {
  const renderStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      case "sent":
        return <Check className="w-3.5 h-3.5 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
      case "failed":
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleDelete = (messageId) => {
    console.log("Delete message with ID:", messageId);
    // Implement delete logic
  };

  const renderDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="self-center text-gray-500 hover:text-black dark:hover:text-white"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={direction === "incoming" ? "start" : "end"}
        className="w-40"
      >
        <DropdownMenuItem>Reply</DropdownMenuItem>
        <DropdownMenuItem>Forward</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem>Report</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(_id)}
          className="text-red-500"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      className={clsx(
        "flex items-start gap-2.5 w-full",
        direction === "outgoing" ? "justify-end" : "justify-start",
        className
      )}
    >
      {direction === "incoming" && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      )}

      {direction == "outgoing" && renderDropdownMenu()}

      <div
        className={clsx(
          "flex flex-col leading-1.5 p-3 rounded-2xl shadow-sm relative",
          direction === "incoming"
            ? "bg-gray-100 text-black dark:bg-gray-800 dark:text-white rounded-bl-none"
            : "bg-black text-white dark:bg-white dark:text-black rounded-br-none"
        )}
        style={{ maxWidth }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatMessageTime(time)}
          </span>
        </div>

        {children}

        {direction === "outgoing" && status && (
          <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
            {renderStatusIcon()}
          </div>
        )}
      </div>

      {direction == "incoming" && renderDropdownMenu()}

      {direction === "outgoing" && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
