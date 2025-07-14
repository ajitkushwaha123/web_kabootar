"use client";

import ChatList from "@/components/global/inbox/chat-list/ChatList";
import ChatWrapper from "@/components/global/inbox/chat-wrapper/ChatWrapper";
import Loader from "@/components/ui/loader";
import { Suspense } from "react";
import React from "react";

const Layout = () => {
  return (
    <div className="h-screen w-full flex bg-background text-foreground">
      <aside className="w-full max-w-sm border-r border-muted/20 bg-[#150022]">
        <ChatList />
      </aside>

      <main className="w-full flex-1 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100">
        <Suspense
          fallback={
            <div className="p-4">
              <Loader />
            </div>
          }
        >
          <ChatWrapper />
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;
