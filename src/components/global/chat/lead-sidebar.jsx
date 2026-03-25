"use client";

import React, { useState } from "react";
import { 
  User, 
  Phone, 
  Tag as TagIcon, 
  Plus, 
  X, 
  StickyNote, 
  Send, 
  ChevronRight,
  Pin,
  Clock,
  Trash2,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel 
} from "@/components/ui/sidebar";
import { useConversation } from "@/store/hooks/useConversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import { fetchConversationDetailsById } from "@/store/slices/conversationSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PREDEFINED_TAGS = [
  "Fssai Registration",
  "Msme",
  "Swiggy & Zomato Account setup",
  "Photo uploading",
  "Growth on Swiggy And zomato",
  "Fix a Meeting - Offline leads",
  "Offline Lead Created",
  "Gst Ragistration",
  "Data Provide by field Executive"
];

const STAGES = ["new", "contacted", "interested", "done"];
const STAGE_LABELS = {
  new: "New Lead",
  contacted: "Contacted",
  interested: "Interested",
  done: "Payment Done"
};

export function LeadSidebar() {
  const { chatDetails, activeConversationId, chatDetailsLoading } = useConversation();
  const { user } = useUser();
  const dispatch = useDispatch();

  const [noteText, setNoteText] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  if (!activeConversationId || !chatDetails) return null;

  const lead = chatDetails.leadId;
  const currentStage = lead?.stage || "new";
  const contact = chatDetails.contactId;
  const tags = chatDetails.tags || [];
  const notes = chatDetails.notes || [];

  const handleUpdateStage = async (newStage) => {
    if (!lead?._id || isUpdatingStage) return;
    setIsUpdatingStage(true);
    try {
      const res = await axios.patch("/api/organization/pipeline", {
        leadId: lead._id,
        stage: newStage
      });
      if (res.data.success) {
        toast.success(`Stage updated to ${STAGE_LABELS[newStage]}`);
        dispatch(fetchConversationDetailsById(activeConversationId));
      }
    } catch (error) {
      toast.error("Failed to update stage");
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const getNextStage = () => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex !== -1 && currentIndex < STAGES.length - 1) {
      return STAGES[currentIndex + 1];
    }
    return null;
  };

  const nextStage = getNextStage();

  const handleAddTag = async (tagValue) => {
    if (!tagValue) return;

    try {
      const res = await axios.post(`/api/organization/inbox/conversation/${activeConversationId}/tag`, {
        tag: tagValue
      });
      if (res.data.success) {
        toast.success("Tag added");
        setIsAddingTag(false);
        dispatch(fetchConversationDetailsById(activeConversationId));
      }
    } catch (error) {
      toast.error("Failed to add tag");
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    try {
      const res = await axios.delete(`/api/organization/inbox/conversation/${activeConversationId}/tag`, {
        data: { tag: tagToRemove }
      });
      if (res.data.success) {
        toast.success("Tag removed");
        dispatch(fetchConversationDetailsById(activeConversationId));
      }
    } catch (error) {
      toast.error("Failed to remove tag");
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      const res = await axios.post(`/api/organization/inbox/conversation/${activeConversationId}/note`, {
        text: noteText.trim(),
        agentId: user?.id,
        agentName: user?.fullName || user?.firstName || "Unknown Agent"
      });
      if (res.data.success) {
        toast.success("Note saved");
        setNoteText("");
        setIsAddingNote(false);
        dispatch(fetchConversationDetailsById(activeConversationId));
      }
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  return (
    <Sidebar side="right" className="border-l bg-background w-[320px]">
      <SidebarHeader className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Lead Details
        </h3>
      </SidebarHeader>

      <SidebarContent className="p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Customer Profile Section */}
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                {(contact?.primaryName || "U")[0]}
              </div>
              <div>
                <h4 className="font-bold text-base">{contact?.primaryName || "Unknown Customer"}</h4>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  {contact?.primaryPhone}
                </p>
                {contact?.source && (
                   <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wider">
                     Source: {contact.source}
                   </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lead Stage Section */}
          <div className="p-4 space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                   <TrendingUp className="w-3.5 h-3.5" />
                   Sales Stage
                </span>
                <Badge className={cn(
                   "text-[10px] font-bold uppercase tracking-tight",
                   currentStage === "done" ? "bg-emerald-500 hover:bg-emerald-600" : 
                   currentStage === "interested" ? "bg-amber-500 hover:bg-amber-600" :
                   "bg-indigo-500 hover:bg-indigo-600"
                )}>
                   {STAGE_LABELS[currentStage]}
                </Badge>
             </div>

             {/* Progress Dots */}
             <div className="flex gap-1.5 justify-between px-1">
                {STAGES.map((s, idx) => {
                   const isCompleted = STAGES.indexOf(currentStage) >= idx;
                   return (
                      <div 
                        key={s} 
                        className={cn(
                           "h-1.5 flex-1 rounded-full transition-all duration-500",
                           isCompleted ? "bg-indigo-500" : "bg-slate-200"
                        )} 
                        title={STAGE_LABELS[s]}
                      />
                   );
                })}
             </div>

             {nextStage ? (
                <Button 
                   className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 shadow-indigo-100 shadow-md transition-all group"
                   onClick={() => handleUpdateStage(nextStage)}
                   disabled={isUpdatingStage}
                >
                   Move to {STAGE_LABELS[nextStage]}
                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             ) : (
                <div className="flex items-center justify-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 border-dashed">
                   <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-2">
                      🎉 Deal Completed
                   </span>
                </div>
             )}

             <div className="grid grid-cols-1 gap-2">
                <Select value={currentStage} onValueChange={handleUpdateStage}>
                   <SelectTrigger className="h-8 text-[10px] font-semibold bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Jump to stage..." />
                   </SelectTrigger>
                   <SelectContent>
                      {STAGES.map(s => (
                         <SelectItem key={s} value={s} className="text-[11px] font-medium">
                            {STAGE_LABELS[s]}
                         </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
          </div>

          <Separator />

          {/* Tags Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between px-4 py-2">
              <span className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsAddingTag(!isAddingTag)}
              >
                <Plus className={cn("w-4 h-4 transition-transform", isAddingTag && "rotate-45")} />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-4 pb-4">
              {isAddingTag && (
                <div className="mb-3">
                  <Select onValueChange={handleAddTag}>
                    <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_TAGS.map((tag) => (
                        <SelectItem key={tag} value={tag} className="text-xs">
                           {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="gap-1 pl-2 pr-1 py-1 hover:bg-secondary/80 group transition-colors"
                    >
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-2 italic">No tags added</p>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Notes Section */}
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel className="flex items-center justify-between px-4 py-2">
              <span className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Internal Notes
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setIsAddingNote(!isAddingNote)}
              >
                <Plus className={cn("w-4 h-4 transition-transform", isAddingNote && "rotate-45")} />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-4 pb-20">
              {isAddingNote && (
                <div className="space-y-2 mb-4 bg-accent/30 p-3 rounded-lg border border-accent">
                  <Textarea 
                    placeholder="Write a note..." 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[100px] text-xs bg-background resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsAddingNote(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={handleAddNote}>
                      <Send className="w-3 h-3" />
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {notes.length > 0 ? (
                  [...notes].reverse().map((note, idx) => (
                    <div key={idx} className="bg-muted/40 p-3 rounded-xl border border-border/50 relative group">
                      {note.isPinned && (
                        <Pin className="w-3 h-3 absolute top-2 right-2 text-primary fill-primary" />
                      )}
                      <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{note.text}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-semibold text-primary/70">{note.creatorName || "Agent"}</span>
                        <div className="flex items-center gap-1">
                           <Clock className="w-2.5 h-2.5" />
                           {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                     <StickyNote className="w-8 h-8 text-muted-foreground/30" />
                     <p className="text-xs text-muted-foreground italic">No internal notes yet</p>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}

// Add local components if missing from project
const Check = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
