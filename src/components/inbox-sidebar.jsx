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
            <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label>
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
                  description="Start a new chat to see it appear here."
                  buttonLabel="New Chat"
                  onClick={() => console.log("Start new chat")}
                  icon={<FileQuestion className="h-12 w-12 text-sky-500" />}
                />
              )}

              {!loading &&
                !error &&
                conversations?.map((conv) => {
                  const msg = conv.lastMessageId;
                  const unreadCount = conv.unreadCount || 0;
                  const isActive = activeConversationId === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => setActiveChat(conv._id)}
                      className={cn(
                        "group flex flex-col items-start gap-1 border-b p-4 text-sm leading-tight transition-all cursor-pointer hover:bg-accent/40 last:border-b-0",
                        isActive && "bg-accent"
                      )}
                    >
                      <div className="flex w-full items-center">
                        <span className="truncate text-[15px] font-medium text-foreground">
                          {conv.contactId?.primaryName ||
                            conv.contactId?.primaryPhone}
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          {renderMessageStatus(msg)}
                          {msg?.timestamp && (
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="line-clamp-1 flex w-full items-center text-xs text-muted-foreground">
                        {renderMessagePreview(msg)}
                      </div>

                      {unreadCount > 0 && (
                        <div className="ml-auto mt-1 rounded-full bg-primary px-2 py-[2px] text-[10px] font-semibold text-primary-foreground shadow-sm">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
      </aside>
    </div>
  );
}
