"use client";

import { useSearchParams } from "next/navigation";
import ChatDetail from "../chat-detail";

export default function ChatWrapper() {
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("chatWith");

  return <ChatDetail chatWith={chatWith} />;
}
