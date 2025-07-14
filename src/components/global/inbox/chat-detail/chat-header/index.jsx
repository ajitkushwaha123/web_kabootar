"use client";

import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { useRouter } from "next/navigation";

export default function ChatHeader({ name, online = true, showBack = true }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <AvatarInitials name={name} online={online} />
        <div className="text-sm">
          <div className="font-medium leading-tight truncate max-w-[120px]">
            {name}
          </div>
          <div className="text-xs text-muted-foreground">
            {online ? "Online" : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
