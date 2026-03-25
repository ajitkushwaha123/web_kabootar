"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { 
  Zap, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Clock,
  Target,
  Trophy,
  RefreshCw,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionGuard } from "@/components/global/PermissionGuard";

// ── Colors ────────────────────────────────────────────────────
const PURPLE = "#6366f1";
const GREEN  = "#22c55e";
const AMBER  = "#f59e0b";
const CORAL  = "#f43f5e";
const TEAL   = "#14b8a6";
const BLUE   = "#3b82f6";
const PINK   = "#ec4899";
const ORANGE = "#f59e0b";

const INTENT_COLORS = {
  sales:     PURPLE,
  support:   BLUE,
  greeting:  GREEN,
  complaint: CORAL,
  followup:  AMBER,
  unknown:   "#94a3b8",
};

const PIE_COLORS = [PURPLE, PINK, ORANGE];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-50 rounded-2xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 font-black mb-2 uppercase tracking-tighter">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <p className="font-bold text-slate-700">
            {p.name}: <span className="text-indigo-600">{p.value}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, color }) {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 rounded-2xl bg-white border border-slate-50 shadow-sm group-hover:border-indigo-100 transition-colors">
             <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight italic">{value}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────
function Section({ title, children, icon: Icon, className = "" }) {
  return (
    <div className={cn("bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col", className)}>
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-1 h-4 bg-indigo-600 rounded-full" />
           <Icon className="w-4 h-4 text-slate-400" />
           <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{title}</h3>
         </div>
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [range]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  if (!data && loading) {
     return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Calculating Intelligence...</p>
        </div>
     );
  }

  const d = data || {
    summary: { totalMessages: 0, totalLeads: 0, convertedLeads: 0, unmatchedCount: 0, conversionRate: 0 },
    replySources: { bot: 0, ai: 0, agent: 0 },
    intentBreakdown: [],
    agentPerformance: [],
    dailyTrend: [],
    hourlyActivity: [],
    recentActivity: []
  };

  return (
    <PermissionGuard permission="analytics">
      <div className="p-8 max-w-7xl mx-auto space-y-10 font-poppins text-slate-900 bg-white min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-8 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">PERFORMANCE OVERVIEW</h1>
             </div>
             <p className="text-slate-400 font-medium text-sm ml-4">Live intelligence & conversion analytics platform.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
             {["today", "7d", "30d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    range === r ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" : "text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                  )}
                >
                  {r === "today" ? "TODAY" : r === "7d" ? "7 DAYS" : "30 DAYS"}
                </button>
             ))}
             <div className="w-px h-6 bg-slate-200 mx-1" />
             <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
             </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Traffic" value={d.summary.totalMessages} icon={MessageSquare} trend="+12.5%" color="#6366f1" />
          <StatCard title="New Leads" value={d.summary.totalLeads} icon={Users} trend="+8.2%" color="#ec4899" />
          <StatCard title="Converted" value={d.summary.convertedLeads} icon={Target} trend="+5.4%" color="#10b981" />
          <StatCard title="Conv. Rate" value={`${d.summary.conversionRate}%`} icon={Zap} trend="-1.2%" color="#f59e0b" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Traffic Chart */}
          <Section title="TRAFFIC TRENDS" icon={TrendingUp} className="lg:col-span-2">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.dailyTrend}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={PURPLE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="messages" stroke={PURPLE} strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" dot={{ r: 6, fill: "#fff", stroke: PURPLE, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0, fill: PURPLE }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Source Breakdown */}
          <Section title="REPLY SOURCES" icon={Layers}>
             <div className="h-[280px] mt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Bot Rules', value: d.replySources.bot },
                        { name: 'AI Brain', value: d.replySources.ai },
                        { name: 'Agent', value: d.replySources.agent },
                      ]}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={PURPLE} />
                      <Cell fill={PINK} />
                      <Cell fill={ORANGE} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-3xl font-black text-slate-800">100%</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                </div>
             </div>
             <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: "Bot", color: "bg-indigo-500", val: d.replySources.bot },
                  { label: "AI", color: "bg-pink-500", val: d.replySources.ai },
                  { label: "Agent", color: "bg-amber-500", val: d.replySources.agent }
                ].map(item => (
                   <div key={item.label} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={cn("w-2 h-2 rounded-full mx-auto mb-1", item.color)} />
                      <div className="text-[10px] font-black uppercase text-slate-400">{item.label}</div>
                      <div className="text-xs font-black text-slate-700">{item.val}</div>
                   </div>
                ))}
             </div>
          </Section>

          {/* AI Intent breakdown */}
          <Section title="AI PREDICTION BREAKDOWN" icon={Zap}>
             <div className="h-[300px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.intentBreakdown} layout="vertical">
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                      {d.intentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? PINK : PURPLE} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </Section>

          {/* Peak Hours */}
          <Section title="ENGAGEMENT HOTSPOTS" icon={Clock}>
             <div className="h-[300px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.hourlyActivity}>
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="step" dataKey="messages" stroke={ORANGE} fill={ORANGE} fillOpacity={0.1} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </Section>

          {/* Recent Activity */}
          <Section title="RECENT ACTIVITY FEED" icon={MessageSquare}>
             <div className="space-y-4 mt-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {d.recentActivity.map((m, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-pointer">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                              {m.senderName?.charAt(0) || m.phone?.charAt(0) || "C"}
                           </div>
                           <div>
                              <div className="text-[11px] font-black text-slate-800 tracking-tight">{m.senderName || m.phone}</div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">{new Date(m.timestamp || m.time).toLocaleTimeString()}</div>
                           </div>
                        </div>
                        {m.metadata?.intent && (
                          <div className="px-2 py-0.5 rounded-full bg-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                             {m.metadata.intent}
                          </div>
                        )}
                     </div>
                     <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed italic">
                        "{m.text?.body || m.text || "Media message"}"
                     </p>
                  </div>
                ))}
                {d.recentActivity.length === 0 && (
                   <div className="text-center py-10">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No recent traffic</p>
                   </div>
                )}
             </div>
          </Section>
        </div>

        {/* AI Insight Card */}
        <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group border-none">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                       <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Strategic Intelligence</span>
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter leading-none">AUTOMATION IS PERFORMING <span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-8 italic">OPTIMALLY</span>.</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-tight">AI handled {Math.round((d.replySources.ai / (d.replySources.bot + d.replySources.ai + d.replySources.agent || 1)) * 100)}% of queries correctly. Review your "Missed Intents" to identify further optimization gaps.</p>
              </div>

              <div className="flex gap-4">
                 <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                       <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Avg Response</span>
                       <span className="text-lg font-black text-white italic">1.2s</span>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-50/20 bg-amber-50/10 hover:bg-amber-50/20 transition-colors">
                       <span className="block text-[9px] font-black text-amber-600 uppercase tracking-tighter mb-1">Missed Intents</span>
                       <span className="text-lg font-black text-amber-400">{d.summary.unmatchedCount || 0}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
