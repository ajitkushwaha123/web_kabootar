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
  metadata,
  onCorrect,
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
        {metadata?.source && (
          <DropdownMenuItem 
            className="text-indigo-600 font-bold gap-2 cursor-pointer"
            onClick={() => onCorrect?.(children, metadata?.triggerMessage)}
          >
             <Clock className="w-3.5 h-3.5"/> Correct AI Answer
          </DropdownMenuItem>
        )}
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
        "flex items-end gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        direction === "outgoing" ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      <Avatar className="w-8 h-8 border-2 border-white shadow-sm shrink-0">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px] font-bold">
           {name ? name[0]?.toUpperCase() : "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 max-w-[80%] group">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">{name}</span>
          
          {metadata?.source && (
             <span className={clsx(
                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-tighter",
                metadata.source === 'memory' && "bg-indigo-50 text-indigo-600 border border-indigo-100",
                metadata.source === 'bot' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                metadata.source === 'ai' && "bg-violet-50 text-violet-600 border border-violet-100"
             )}>
                {metadata.source}
             </span>
          )}

          {metadata?.intent && (
             <span className="text-[8px] font-bold text-slate-300 border-l border-slate-200 pl-2 uppercase tracking-widest">{metadata.intent}</span>
          )}

          <span className="text-[9px] text-slate-300 font-mono">
            {formatMessageTime(time)}
          </span>
          {direction === "outgoing" && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               {renderStatusIcon()}
            </div>
          )}
        </div>

        <div
          className={clsx(
            "p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed relative",
            direction === "incoming"
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-800"
              : "bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-none shadow-indigo-200 dark:shadow-none"
          )}
        >
          {children}
          
          {direction === "outgoing" && (
             <div className="absolute bottom-1 right-2 scale-75">
               {status === 'read' ? (
                 <CheckCheck className="w-3 h-3 text-indigo-200" />
               ) : (
                 <Check className="w-3 h-3 text-indigo-100/50" />
               )}
             </div>
          )}
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
         {renderDropdownMenu()}
      </div>
    </div>
  );
};
