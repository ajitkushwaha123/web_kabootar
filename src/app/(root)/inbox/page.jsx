"use client";

import React, { useEffect, useState } from "react";
import { TextMessage } from "@/components/global/chat/message/text";
import { useChat } from "@/store/hooks/useChat";
import { useConversation } from "@/store/hooks/useConversation";
import { useSocket } from "@/store/hooks/useSocket";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Loader2, BrainCircuit } from "lucide-react";
import { PermissionGuard } from "@/components/global/PermissionGuard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Page = () => {
  const { messages, getMessages, loading: chatLoading } = useChat();
  const { isTyping } = useSocket();
  const { user } = useUser();
  const { organization } = useOrganization();
  const { activeConversationId, loading: convoLoading, chatDetails } = useConversation();

  // 🧠 AI Correction State
  const [correctDialog, setCorrectDialog] = useState({
    isOpen: false,
    trigger: "",
    answer: "",
    loading: false
  });

  useEffect(() => {
    if (activeConversationId) {
      getMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loading = convoLoading || chatLoading;

  const handleSaveCorrection = async () => {
    if (!correctDialog.trigger || !correctDialog.answer) return;
    setCorrectDialog(p => ({ ...p, loading: true }));
    try {
      const res = await fetch("/api/admin/bot/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: correctDialog.trigger,
          answer: correctDialog.answer,
          category: "correction"
        })
      });
      if (res.ok) {
        toast.success("AI Memory updated successfully! 🧠");
        setCorrectDialog({ isOpen: false, trigger: "", answer: "", loading: false });
      }
    } catch (e) {
      toast.error("Correction failed to save.");
    }
    setCorrectDialog(p => ({ ...p, loading: false }));
  };

  return (
    <PermissionGuard permission="inbox">
      <div className="flex flex-1 flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Correction Dialog */}
          <Dialog open={correctDialog.isOpen} onOpenChange={(o) => setCorrectDialog(p => ({ ...p, isOpen: o }))}>
             <DialogContent className="max-w-md">
                <DialogHeader>
                   <DialogTitle className="flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5 text-indigo-600"/>
                     Correct Assistant Answer
                   </DialogTitle>
                   <DialogDescription>
                     Aapke correction se AI Assistant seekhega aur agli baar sahi jawab dega.
                   </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Customer Question</label>
                      <Input 
                        value={correctDialog.trigger} 
                        onChange={e => setCorrectDialog(p => ({ ...p, trigger: e.target.value }))}
                        placeholder="Customer ne kya pucha?"
                        className="font-medium bg-slate-50 border-slate-200"
                        readOnly={!!correctDialog.trigger} // Usually we want to fix for THAT question
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Better Answer</label>
                      <Textarea 
                         value={correctDialog.answer}
                         onChange={e => setCorrectDialog(p => ({ ...p, answer: e.target.value }))}
                         placeholder="The correct answer should be..."
                         className="min-h-[120px] bg-white border-slate-200"
                      />
                   </div>
                </div>
                <DialogFooter>
                   <Button variant="ghost" onClick={() => setCorrectDialog(p => ({ ...p, isOpen: false }))}>Cancel</Button>
                   <Button className="bg-indigo-600 gap-2" size="sm" onClick={handleSaveCorrection} disabled={correctDialog.loading || !correctDialog.answer}>
                      {correctDialog.loading ? "Saving..." : <><BrainCircuit className="w-4 h-4"/> Optimize Brain</>}
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col flex-1 items-center justify-center text-muted-foreground min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium">Fetching conversation...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && (!messages || messages.length === 0) && (
            <div className="flex flex-1 items-center justify-center text-muted-foreground min-h-[400px]">
               <div className="text-center">
                  <p className="text-lg font-semibold text-slate-400">No history yet</p>
                  <p className="text-sm text-slate-300">Start the conversation below.</p>
               </div>
            </div>
          )}

          {/* Message list */}
          {!loading &&
            messages?.map((message) => {
              if (message.isDeleted) return null;

              return (
                <div key={message._id}>
                  {message.messageType === "text" && (
                    <TextMessage
                      _id={message._id}
                      direction={message.direction}
                      name={
                        message.direction === "outgoing"
                          ? (message.senderId === "AI_BOT" ? "AI Assistant ✨" : (user?.fullName || "You"))
                          : (message.senderName || "Customer")
                      }
                      avatar={
                        message.direction === "outgoing"
                          ? user?.imageUrl || ""
                          : ""
                      }
                      time={message.createdAt}
                      message={message.text?.body}
                      status={message.status}
                      metadata={message.metadata}
                      onCorrect={(msg, trigger) => setCorrectDialog({
                        isOpen: true,
                        trigger: trigger || "",
                        answer: msg || "",
                        loading: false
                      })}
                    />
                  )}
                </div>
              );
            })}
            
          {isTyping && (
            <div className="flex items-center gap-3 animate-pulse ml-1">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest animate-bounce">...</span>
               </div>
               <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl rounded-bl-none text-[11px] text-slate-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="font-semibold text-primary">{chatDetails?.contactId?.primaryName || "Customer"}</span> is typing...
               </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default Page;
