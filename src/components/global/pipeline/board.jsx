"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  MessageSquare, 
  HandCoins,
  TrendingUp,
  Clock,
  User,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useConversation } from "@/store/hooks/useConversation";

// --- Sub-components ---

function DroppableColumn({ id, title, leads }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[300px] min-w-[300px] h-full bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden shadow-sm transition-colors",
        isOver && "bg-indigo-50/50 border-indigo-200"
      )}
    >
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
           <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">{title}</h3>
           <Badge variant="secondary" className="bg-slate-100 text-[10px] px-1.5 py-0">
             {leads.length}
           </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
           <Plus className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
         <SortableContext items={leads.map(l => l._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 pb-8 min-h-[500px]">
               {leads.map((lead) => (
                 <SortableLeadCard key={lead._id} lead={lead} />
               ))}
               {leads.length === 0 && (
                 <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs italic">
                   Drop leads here
                 </div>
               )}
            </div>
         </SortableContext>
      </ScrollArea>
    </div>
  );
}

function SortableLeadCard({ lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const router = useRouter();
  const { setActiveChat } = useConversation();

  const handleCardClick = (e) => {
    // Prevent navigation if we are clicking on internal buttons
    if (e.target.closest('button')) return;
    
    if (lead.conversationId) {
      setActiveChat(lead.conversationId);
      router.push("/inbox");
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        onClick={handleCardClick}
        className={cn(
          "p-3 cursor-grab hover:shadow-md transition-all border-slate-200 group relative bg-white overflow-hidden",
          isDragging && "cursor-grabbing ring-2 ring-indigo-500"
        )}
      >
         <div className="space-y-2">
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                     <AvatarFallback className="text-[10px] bg-sky-50 text-sky-600 font-bold">
                        {lead.name[0]}
                     </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                     <span className="text-sm font-bold truncate max-w-[140px] leading-tight">{lead.name}</span>
                     <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {lead.phone}
                     </span>
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-slate-100 rounded-full">
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
               </Button>
            </div>

            <div className="flex flex-wrap gap-1">
               {lead.tags?.slice(0, 2).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 border-slate-100 text-slate-500 font-medium">
                     {tag}
                  </Badge>
               ))}
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
               <div className="flex items-center gap-1.5 text-indigo-600">
                  <HandCoins className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-tight">₹{lead.value.toLocaleString()}</span>
               </div>
               <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(lead.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
               </div>
            </div>
         </div>
         
         <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </div>
  );
}

// --- Main Pipeline Board ---

export function PipelineBoard() {
  const [pipelineData, setPipelineData] = useState({
    new: [],
    contacted: [],
    interested: [],
    done: [],
    other: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLead, setActiveLead] = useState(null);

  const stages = [
    { id: "new", title: "New Lead", icon: User },
    { id: "contacted", title: "Contacted", icon: MessageSquare },
    { id: "interested", title: "Interested", icon: TrendingUp },
    { id: "done", title: "Payment Done", icon: HandCoins }
  ];

  const fetchPipeline = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/organization/pipeline");
      if (res.data.success) {
        setPipelineData(res.data.pipeline);
      }
    } catch (error) {
      toast.error("Failed to fetch pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleDragStart = (event) => {
    const { active } = event;
    const leadId = active.id;
    const stage = Object.keys(pipelineData).find(key => 
      pipelineData[key].find(l => l._id === leadId)
    );
    const lead = pipelineData[stage].find(l => l._id === leadId);
    setActiveLead(lead);
  };

  const handleDragEnd = async (event) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id;
    const newStage = over.id;
    
    // Find stage by looking into each key's leads
    let oldStage = "";
    Object.keys(pipelineData).forEach(key => {
       if (pipelineData[key].find(l => l._id === leadId)) {
          oldStage = key;
       }
    });

    if (!oldStage || oldStage === newStage) return;

    // Support sorting and moving to new stage
    const lead = pipelineData[oldStage].find(l => l._id === leadId);
    const newOldStageLeads = pipelineData[oldStage].filter(l => l._id !== leadId);
    const newTargetStageLeads = [...pipelineData[newStage], { ...lead, stage: newStage }];

    setPipelineData(prev => ({
      ...prev,
      [oldStage]: newOldStageLeads,
      [newStage]: newTargetStageLeads
    }));

    try {
      await axios.patch("/api/organization/pipeline", { leadId, stage: newStage });
      toast.success(`Moved ${lead.name} to ${newStage.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to update status");
      fetchPipeline();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const flatLeads = Object.values(pipelineData).flat();
  const totalValue = flatLeads.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Header & Filters */}
      <header className="p-6 border-b space-y-4 shrink-0">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                 Sales Pipeline 
                 <TrendingUp className="w-5 h-5 text-indigo-500" />
               </h1>
               <p className="text-sm text-slate-500">Track and manage your leads through different stages.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center bg-slate-50 border rounded-lg px-3 py-2 text-sm font-medium gap-3">
                  <div className="flex flex-col pr-3 border-r">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Active</span>
                    <span className="text-slate-700 font-bold">{flatLeads.length} leads</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pipeline Value</span>
                    <span className="text-indigo-600 font-bold text-lg leading-tight">
                        ₹{totalValue.toLocaleString()}
                    </span>
                  </div>
               </div>
               <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-indigo-200 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" /> New Lead
               </Button>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
               <Input 
                 placeholder="Search by name or phone..." 
                 className="pl-9 h-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <Button variant="outline" className="gap-2 text-slate-600 h-10">
               <Filter className="w-4 h-4" /> Filters
            </Button>
         </div>
      </header>

      {/* Board */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-6 flex gap-6 min-h-0 bg-slate-50/20 no-scrollbar">
          {stages.map((stage) => (
             <DroppableColumn 
                key={stage.id}
                id={stage.id}
                title={stage.title}
                leads={(pipelineData[stage.id] || []).filter(l => 
                   l.name.toLowerCase().includes(search.toLowerCase()) || 
                   l.phone.includes(search)
                )}
             />
          ))}
        </div>

        <DragOverlay>
           {activeLead ? (
              <div className="w-[275px] rotate-3 scale-105 transition-transform">
                 <LeadCard lead={activeLead} isOverlay />
              </div>
           ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Simple LeadCard for Overlay (no dnd hooks)
function LeadCard({ lead, isOverlay }) {
  return (
    <Card className={cn(
      "p-3 border-slate-200 bg-white shadow-xl relative overflow-hidden",
      isOverlay && "border-indigo-300"
    )}>
       <div className="space-y-2">
          <div className="flex items-start justify-between">
             <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                   <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-600 font-bold">
                      {lead.name[0]}
                   </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                   <span className="text-sm font-bold truncate max-w-[140px] leading-tight">{lead.name}</span>
                   <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {lead.phone}
                   </span>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap gap-1">
             {lead.tags?.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 border-slate-100 text-slate-500 font-medium">
                   {tag}
                </Badge>
             ))}
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
             <div className="flex items-center gap-1.5 text-indigo-600">
                <HandCoins className="w-3.5 h-3.5" />
                <span className="text-xs font-bold tracking-tight">₹{lead.value.toLocaleString()}</span>
             </div>
          </div>
       </div>
    </Card>
  );
}
