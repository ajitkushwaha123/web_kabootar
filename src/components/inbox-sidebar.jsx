"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import {
  ArchiveX,
  Command,
  File,
  Inbox,
  Send,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  MapPin,
  FileText,
  Contact,
  FileQuestion,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { Label } from "@/components/ui/label";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useConversation } from "@/store/hooks/useConversation";
import { InboxSidebarSkeleton } from "./skeleton/InboxSidebarSkeleton";
import { EmptyState } from "./empty-state";
import { renderMessageStatus } from "@/helper/ui-helper";
import { useOrganization } from "@clerk/nextjs";
import { StartNewChat } from "./global/chat/start-new-chat";

const renderMessagePreview = (msg) => {
  const type = msg?.messageType;
  const iconMap = {
    image: <ImageIcon className="h-4 w-4" />,
    video: <VideoIcon className="h-4 w-4" />,
    audio: <Mic className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    location: <MapPin className="h-4 w-4" />,
    contacts: <Contact className="h-4 w-4" />,
  };

  if (type === "text") return <span>{msg.text?.body || "Text message"}</span>;

  const icon = iconMap[type];
  if (icon) {
    const label =
      type.charAt(0).toUpperCase() + type.slice(1).replace(/s$/, "");
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{msg?.filename || label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <FileQuestion className="h-4 w-4" />
      <span>Unsupported message</span>
    </div>
  );
};

const SIDEBAR_DATA = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Inbox", icon: Inbox },
    { title: "Drafts", icon: File },
    { title: "Sent", icon: Send },
    { title: "Junk", icon: ArchiveX },
    { title: "Trash", icon: Trash2 },
  ],
};

export function InboxSidebar(props) {
  const [activeItem, setActiveItem] = React.useState(SIDEBAR_DATA.navMain[0]);
  const { setOpen } = useSidebar();

  const { organization } = useOrganization();

  const {
    conversations,
    loading,
    error,
    activeConversationId,
    getConversations,
    setActiveChat,
  } = useConversation();

  React.useEffect(() => {
    getConversations();
  }, [organization?.id]);

  const handleNavClick = React.useCallback(
    (item) => {
      setActiveItem(item);
      setOpen(true);
    },
    [setOpen]
  );

  return (
    <div className="flex h-screen shrink-0 border-r bg-background" {...props}>
      {/* Sidebar menu icons */}
      <aside className="flex w-[60px] flex-col border-r bg-background">
        <div className="flex h-14 items-center justify-center border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Command className="h-4 w-4" />
          </div>
        </div>

        <SidebarMenu className="flex flex-1 flex-col items-center space-y-2 py-4">
          {SIDEBAR_DATA.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => handleNavClick(item)}
                isActive={activeItem?.title === item.title}
                className="flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-accent"
                aria-label={item.title}
              >
                <item.icon className="h-5 w-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="flex h-14 items-center justify-center border-t">
          <NavUser user={SIDEBAR_DATA.user} />
        </div>
      </aside>

      {/* Sidebar main content */}
      <aside className="flex w-[310px] flex-col">
        <SidebarHeader className="sticky top-0 z-10 border-b bg-background p-4">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">
              {activeItem?.title}
            </h2>
            <div className="flex items-center gap-2">
              <Label className="flex items-center gap-2 text-xs">
                <span>Unreads</span>
                <Switch className="h-4 w-7" />
              </Label>
              <StartNewChat />
            </div>
          </div>
          <SidebarInput placeholder="Search conversations..." />
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              {loading && <InboxSidebarSkeleton />}

              {!loading && error && (
                <EmptyState
                  title="Failed to load :("
                  description="There was an error fetching your conversations."
                  buttonLabel="Try Again"
                  onClick={getConversations}
                  icon={<FileQuestion className="h-12 w-12 text-destructive" />}
                />
              )}

              {!loading && !error && conversations?.length === 0 && (
                <EmptyState
                  title="No conversations yet"
                  description="Start a new chat using the + button above."
                  buttonLabel="Refresh"
                  onClick={getConversations}
                  icon={<FileQuestion className="h-12 w-12 text-sky-500" />}
                />
              )}

              {!loading && !error && (
                conversations?.map((conv) => {
                  const msg = conv.lastMessageId;
                  const unreadCount = conv.unreadCount || 0;
                  const isActive = activeConversationId === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => setActiveChat(conv._id)}
                      className={cn(
                        "group flex items-center gap-3 border-b p-4 transition-all cursor-pointer hover:bg-accent/40 last:border-b-0",
                        isActive && "bg-accent",
                        unreadCount > 0 && "bg-sky-50/50 dark:bg-sky-950/20"
                      )}
                    >
                      {/* Avatar / Circle with Unread Green Dot */}
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-gray-500">
                          {(conv.contactId?.primaryName || "U")?.[0]?.toUpperCase()}
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 border-2 border-white dark:border-black"></span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 gap-1 leading-tight">
                        <div className="flex w-full items-center justify-between">
                          <span className={cn(
                            "truncate text-[15px] font-medium transition-colors",
                            unreadCount > 0 ? "text-foreground font-bold" : "text-foreground/80"
                          )}>
                            {conv.contactId?.primaryName || conv.contactId?.primaryPhone}
                          </span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {msg?.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="line-clamp-1 text-xs text-muted-foreground overflow-hidden">
                            {renderMessagePreview(msg)}
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {renderMessageStatus(msg)}
                            {unreadCount > 0 && (
                              <div className="rounded-full bg-sky-500 px-1.5 py-[1px] text-[10px] font-bold text-white shadow-sm min-w-[18px] text-center">
                                {unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
      </aside>
    </div>
  );
}
