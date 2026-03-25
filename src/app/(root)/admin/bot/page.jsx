"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  SendHorizontal,
  Settings2,
  Zap,
  Bot
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

const CATEGORIES = ["sales", "support", "onboarding", "fssai", "gst", "general"];

export default function BotTrainingPage() {
  const [activeTab, setActiveTab] = useState("rules");
  const [rules, setRules] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [knowledge, setKnowledge] = useState([]); 
  const [analytics, setAnalytics] = useState(null); // 📊 NEW
  const [loading, setLoading] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState(""); 
  
  // Settings state
  const [responseMode, setResponseMode] = useState("HYBRID");
  const [autoLearn, setAutoLearn] = useState(true); // 🧠 NEW
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85); // 🧠 NEW

  // Rule Form State
  const [formData, setFormData] = useState({
    keywords: "",
    reply: "",
    category: "general",
    priority: "5"
  });
  
  // Knowledge Form State 🧠 NEW
  const [knowledgeFormData, setKnowledgeFormData] = useState({
    question: "",
    answer: "",
    category: "learned"
  });
  const [editKId, setEditKId] = useState(null);

  // Bulk state
  const [bulkJson, setBulkJson] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  // Test State
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState([
    { role: "bot", text: "Namaste! Magic Scale Bot Test UI mein aapka swagat hai. Main Bot Rules aur AI Brain dono ko test kar sakta hoon. Kuch poocho!", source: "bot" }
  ]);
  const [testing, setTesting] = useState(false);
  const chatEndRef = useRef(null);

  // 📊 Analytics Fetching
  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/bot/analytics");
      const data = await res.json();
      if (data.success) setAnalytics(data);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
    fetchUnmatched();
    fetchSettings();
    fetchKnowledge(); // 🧠 NEW
  }, []);

  async function fetchKnowledge() { // 🧠 NEW
    try {
      const res = await fetch("/api/admin/bot/knowledge");
      const data = await res.json();
      if (data.success) setKnowledge(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSaveKnowledge = async () => { // 🧠 NEW
    if (!knowledgeFormData.question || !knowledgeFormData.answer) return toast.error("Please fill question and answer");
    setSaving(true);
    try {
      const url = editKId ? `/api/admin/bot/knowledge/${editKId}` : "/api/admin/bot/knowledge";
      const method = editKId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(knowledgeFormData)
      });
      if (res.ok) {
        toast.success(editKId ? "Memory updated!" : "Memory created!");
        setEditKId(null);
        setKnowledgeFormData({ question: "", answer: "", category: "learned" });
        fetchKnowledge();
      }
    } catch (e) {
      toast.error("Operation failed");
    }
    setSaving(false);
  };

  const deleteKnowledge = async (id) => { // 🧠 NEW
    if (!confirm("Pakka remove karein? Memory se delete ho jayega.")) return;
    try {
       await fetch(`/api/admin/bot/knowledge/${id}`, { method: "DELETE" });
       fetchKnowledge();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/bot/settings");
      const data = await res.json();
      if (data.success) {
        setResponseMode(data.mode);
        setAutoLearn(data.autoLearn);
        setConfidenceThreshold(data.confidenceThreshold);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleUpdateSettings = async (updates) => {
    try {
      const res = await fetch("/api/admin/bot/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        if (updates.mode) setResponseMode(data.mode);
        if (updates.autoLearn !== undefined) setAutoLearn(data.autoLearn);
        if (updates.confidenceThreshold !== undefined) setConfidenceThreshold(data.confidenceThreshold);
        toast.success("Settings updated!");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleModeChange = (newMode) => {
    setResponseMode(newMode);
    handleUpdateSettings({ mode: newMode });
  };

  const handleAutoLearnToggle = (checked) => {
    setAutoLearn(checked);
    handleUpdateSettings({ autoLearn: checked });
  };

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bot/rules");
      const data = await res.json();
      if (data.success) setRules(data.data);
    } catch (err) {
      toast.error("Failed to fetch rules");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnmatched() {
    try {
      const res = await fetch("/api/admin/bot/unmatched");
      const data = await res.json();
      if (data.success) setUnmatched(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSaveRule = async () => {
    if (!formData.keywords || !formData.reply) return toast.error("Please fill all fields");
    setSaving(true);
    const payload = {
      ...formData,
      keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
      priority: parseInt(formData.priority)
    };

    try {
      const url = editId ? `/api/admin/bot/rules/${editId}` : "/api/admin/bot/rules";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Rule updated!" : "Rule created!");
        setEditId(null);
        setFormData({ keywords: "", reply: "", category: "general", priority: "5" });
        fetchRules();
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects");
      
      setImporting(true);
      const res = await fetch("/api/admin/bot/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully imported ${data.count} rules! 🎉`);
        setBulkJson("");
        setIsBulkOpen(false);
        fetchRules();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (err) {
      toast.error(`Invalid JSON: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const deleteRule = async (id) => {
    if (!confirm("Pakka?")) return;
    try {
       const res = await fetch(`/api/admin/bot/rules/${id}`, { method: "DELETE" });
       if (res.ok) {
         toast.success("Rule deleted");
         fetchRules();
       }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const toggleRule = async (id, currentStatus) => {
    try {
       await fetch(`/api/admin/bot/rules/${id}`, {
         method: "PATCH",
         headers: { "Content-Type" : "application/json" },
         body: JSON.stringify({ isActive: !currentStatus })
       });
       fetchRules();
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  const sendTestMessage = async () => {
    if (!testInput.trim() || testing) return;
    const msg = testInput.trim();
    setTestMessages(p => [...p, { role: "user", text: msg }]);
    setTestInput("");
    setTesting(true);

    try {
      const res = await fetch("/api/admin/bot/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setTestMessages(p => [...p, { 
          role: "bot", 
          text: `Error ${res.status}: ${data.error || "Unknown Error"}`, 
          source: "fallback" 
        }]);
        return;
      }

      setTestMessages(p => [...p, { role: "bot", text: data.reply, source: data.source }]);
      if (data.source !== "bot") fetchUnmatched();
    } catch (err) {
       toast.error("Network or parsing error occurred");
    } finally {
      setTesting(false);
    }
  };

  const handleUnmatchedResolve = async (msg) => {
    setFormData({
      keywords: msg.text,
      reply: "",
      category: "general",
      priority: "5"
    });
    setActiveTab("rules");
    toast.info("Unmatched message copied to form!");
  };

  return (
    <div className="flex-col md:flex p-8 pt-6 space-y-6 max-w-[1200px] mx-auto">
      {/* HEADER SECTION WITH MODE SWITCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Zap className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-bold tracking-tight">Bot Tuning Center 🧠</h2>
              <p className="text-sm text-muted-foreground">Manage your Auto-Response and AI logic here.</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1 pr-4 border-r mr-2">
             <label className="text-[10px] uppercase font-bold text-slate-400">Response Strategy</label>
             <Select value={responseMode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-slate-200 font-semibold focus:ring-indigo-500">
                   <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        responseMode === 'OFF' ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                       )} />
                      <SelectValue />
                   </div>
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="HYBRID" className="font-medium">Hybrid (Bot + AI) ✨</SelectItem>
                   <SelectItem value="BOT_ONLY" className="font-medium">Bot Rules Only 🤖</SelectItem>
                   <SelectItem value="AI_ONLY" className="font-medium">AI Brain Only 🧠</SelectItem>
                   <SelectItem value="OFF" className="font-medium text-rose-500">Auto-Reply OFF ❌</SelectItem>
                </SelectContent>
             </Select>
          </div>

          <div className="flex flex-col gap-1 pr-4 border-r mr-2">
             <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                Auto-Learning <Bot className="w-2.5 h-2.5 text-indigo-400" />
             </label>
             <div className="flex items-center h-9 gap-2 bg-slate-50 px-3 rounded-lg border border-slate-200">
                <Switch checked={autoLearn} onCheckedChange={handleAutoLearnToggle} />
                <span className="text-[10px] font-bold text-slate-600">{autoLearn ? "ON" : "OFF"}</span>
             </div>
          </div>

          <div className="flex flex-col gap-1 pr-4 border-r mr-2">
             <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                Smart Match Score <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
             </label>
             <div className="flex items-center h-9 gap-2 bg-slate-50 px-2 rounded-lg border border-slate-200 w-24">
                <Input 
                   type="number" 
                   step="0.05" 
                   max="1" 
                   min="0.5" 
                   className="h-7 text-xs font-black border-none bg-transparent focus:ring-0 p-0 text-center" 
                   value={confidenceThreshold}
                   onChange={e => {
                      const val = parseFloat(e.target.value);
                      setConfidenceThreshold(val);
                      handleUpdateSettings({ confidenceThreshold: val });
                   }}
                />
             </div>
          </div>

          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
             <DialogTrigger asChild>
                <Button variant="outline" className="h-9 gap-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium">
                  <Plus className="w-4 h-4" /> Bulk
                </Button>
             </DialogTrigger>
             <DialogContent className="max-w-2xl">
                <DialogHeader>
                   <DialogTitle className="flex items-center gap-2">
                       <Plus className="w-5 h-5 text-indigo-600" />
                       Bulk Import Bot Rules
                    </DialogTitle>
                   <DialogDescription className="text-xs">
                      Multiple rules ko ek saath add karne ke liye niche diya gaya JSON format use karein. Ensure the structure is exactly as shown:
                   </DialogDescription>
                </DialogHeader>
                
                <div className="bg-slate-950/95 p-4 rounded-xl text-emerald-400 text-[11px] font-mono border border-slate-800 shadow-2xl my-3">
                   <p className="text-slate-500 mb-2 font-bold tracking-widest text-[9px] uppercase border-b border-white/5 pb-1">✅ Standard Import Format</p>
                   <pre>{`[
  {
    "keywords": ["price", "cost"],
    "reply": "Service cost is ₹3500",
    "category": "sales",
    "priority": 10
  }
]`}</pre>
                </div>

                <Textarea 
                  placeholder='[ {"keywords": ["price"], "reply": "Costs ₹3500", "category": "sales"}, ... ]'
                  className="min-h-[250px] font-mono text-xs mt-2 border-slate-200"
                  value={bulkJson}
                  onChange={e => setBulkJson(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                   <Button variant="ghost" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
                   <Button className="bg-indigo-600" onClick={handleBulkImport} disabled={importing || !bulkJson}>
                     {importing ? "Importing..." : "Start Import"}
                   </Button>
                </div>
             </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="shadow-sm border-indigo-100">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">{rules.length}</div>
              <p className="text-xs text-muted-foreground">Active automated responses</p>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-rose-100">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unmatched</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">{unmatched.length}</div>
              <p className="text-xs text-muted-foreground">Questions needing attention</p>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((rules.reduce((acc, r) => acc + (r.matchCount || 0), 0) / (rules.reduce((acc, r) => acc + (r.matchCount || 0), 0) + unmatched.length || 1)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Auto-match rate</p>
           </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100/50 p-1 border">
          <TabsTrigger value="rules" className="gap-2"><Bot className="w-4 h-4"/> Bot Rules</TabsTrigger>
          <TabsTrigger value="memory" className="gap-2"><Zap className="w-4 h-4"/> AI Memory</TabsTrigger>
          <TabsTrigger value="test" className="gap-2"><SendHorizontal className="w-4 h-4"/> Playground</TabsTrigger>
          <TabsTrigger value="unmatched" className="gap-2 flex">
             <MessageSquare className="w-4 h-4"/> Unmatched
             {unmatched.length > 0 && (
                <span className="ml-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
             )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
             <TrendingUp className="w-4 h-4"/> Efficiency & Costs
          </TabsTrigger>
        </TabsList>

        {/* --- AI MEMORY TAB --- */}
        <TabsContent value="memory" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 h-fit shadow-md border-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg">{editKId ? "Edit Memory" : "Add Direct Knowledge"}</CardTitle>
                  <CardDescription>Questions added here skip AI generation and reply directly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Question</label>
                      <Input 
                        placeholder="e.g. Price kya hai?" 
                        value={knowledgeFormData.question}
                        onChange={e => setKnowledgeFormData(p => ({ ...p, question: e.target.value }))}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Stored Answer</label>
                      <Textarea 
                        placeholder="Zomato onboarding cost is ₹3500..." 
                        className="min-h-[100px]"
                        value={knowledgeFormData.answer}
                        onChange={e => setKnowledgeFormData(p => ({ ...p, answer: e.target.value }))}
                      />
                   </div>
                   <Button className="w-full bg-indigo-600" onClick={handleSaveKnowledge} disabled={saving}>
                      {editKId ? "Update Memory" : "Add to Memory"}
                   </Button>
                   {editKId && (
                      <Button variant="ghost" className="w-full text-slate-400" onClick={() => { setEditKId(null); setKnowledgeFormData({ question: "", answer: "", category: "learned" }); }}>Cancel</Button>
                   )}
                </CardContent>
              </Card>

              <div className="md:col-span-2 space-y-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input 
                       placeholder="Search through AI Memory..." 
                       className="pl-10 h-10 bg-white border-slate-100"
                       value={knowledgeSearch}
                       onChange={e => setKnowledgeSearch(e.target.value)}
                    />
                 </div>
                 
                 <div className="space-y-2">
                    {knowledge.filter(k => k.question.toLowerCase().includes(knowledgeSearch.toLowerCase())).map(item => (
                       <Card key={item._id} className="transition-all hover:border-indigo-200 group border-slate-100 shadow-sm">
                          <CardContent className="p-4 flex items-start justify-between gap-4">
                             <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                   <Badge variant="outline" className="text-[9px] uppercase font-bold text-indigo-500 bg-indigo-50/50 border-none">
                                      {item.category}
                                   </Badge>
                                   <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Used {item.usageCount || 0} times</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 leading-tight">Q: {item.question}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed italic">A: {item.answer}</p>
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => {
                                   setEditKId(item._id);
                                   setKnowledgeFormData({ question: item.question, answer: item.answer, category: item.category });
                                }}><Edit className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => deleteKnowledge(item._id)}><Trash2 className="w-4 h-4"/></Button>
                             </div>
                          </CardContent>
                       </Card>
                    ))}
                    {knowledge.length === 0 && <div className="p-12 text-center text-slate-400 italic">No memory found. AI will learn from agent replies automatically! 🧠</div>}
                 </div>
              </div>
           </div>
        </TabsContent>

        {/* --- RULES TAB --- */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 h-fit shadow-md border-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg">{editId ? "Edit Rule" : "Quick Rule Creator"}</CardTitle>
                <CardDescription>Define keywords and the automated reply.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Keywords (Comma separated)</label>
                  <Input 
                    placeholder="price, cost, kitna" 
                    value={formData.keywords} 
                    onChange={e => setFormData(p => ({ ...p, keywords: e.target.value }))}
                  />
                  <p className="text-[10px] text-slate-400 italic">Example: price, cost, rates</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Automated Reply</label>
                  <Textarea 
                    placeholder="Type what the bot should say..." 
                    className="min-h-[120px]"
                    value={formData.reply}
                    onChange={e => setFormData(p => ({ ...p, reply: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                      <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                        <SelectTrigger className="capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Priority (1-10)</label>
                      <Input type="number" min="1" max="10" value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} />
                   </div>
                </div>
                <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-md" onClick={handleSaveRule} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editId ? "Update Rule" : "Publish Rule"}
                </Button>
                {editId && (
                   <Button variant="ghost" className="w-full text-slate-400" onClick={() => { setEditId(null); setFormData({ keywords: "", reply: "", category: "general", priority: "5" }); }}>Cancel Edit</Button>
                )}
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-4">
              <Card className="shadow-sm border-slate-100">
                <CardHeader className="py-4">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-md">Active Rules List</CardTitle>
                      <Badge variant="outline" className="text-indigo-600 border-indigo-100">{rules.length} total</Badge>
                   </div>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {loading ? (
                       <div className="p-8 text-center text-slate-400 italic flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Fetching rules...
                       </div>
                    ) : rules.length === 0 ? (
                       <div className="p-8 text-center text-slate-400 italic">No rules found. Start by creating one!</div>
                    ) : rules.map(rule => (
                      <div key={rule._id} className={cn("p-4 group transition-colors hover:bg-slate-50", !rule.isActive && "opacity-60 bg-slate-50/50")}>
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                 <Badge className="bg-slate-200 text-slate-700 border-none capitalize text-[10px]">{rule.category}</Badge>
                                 <span className="text-[10px] font-mono text-indigo-400">P:{rule.priority}</span>
                                 <span className="text-[10px] text-slate-400 font-medium">| {rule.matchCount || 0} matches</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {rule.keywords.map(kw => (
                                   <span key={kw} className="px-1.5 py-0.5 bg-indigo-50/50 text-indigo-600 rounded text-[10px] font-medium border border-indigo-100">#{kw}</span>
                                ))}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">{rule.reply}</p>
                           </div>
                           <div className="flex items-center gap-1 shrink-0">
                              <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule._id, rule.isActive)} />
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600" onClick={() => {
                                 setEditId(rule._id);
                                 setFormData({
                                    keywords: rule.keywords.join(", "),
                                    reply: rule.reply,
                                    category: rule.category,
                                    priority: String(rule.priority)
                                 });
                              }}><Edit className="w-4 h-4"/></Button>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 underline" onClick={() => deleteRule(rule._id)}><Trash2 className="w-4 h-4"/></Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- TEST TAB --- */}
        <TabsContent value="test" className="max-w-[700px] mx-auto">
           <Card className="shadow-2xl border-indigo-50 overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-4 border-b bg-indigo-50/30 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">M</div>
                 <div>
                    <h3 className="text-sm font-bold">Magic Scale Playground</h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live System Active
                    </p>
                 </div>
              </div>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px]">
                 {testMessages.map((m, i) => (
                    <div key={i} className={cn("flex flex-col gap-1 w-full", m.role === 'user' ? "items-end" : "items-start")}>
                       {m.source && (
                          <Badge variant="outline" className={cn(
                             "text-[9px] uppercase border-none tracking-tighter shadow-none -mb-1",
                             m.source === 'bot' ? "text-emerald-500" : m.source === 'ai' ? "text-indigo-500" : "text-amber-500"
                          )}>
                             {m.source === 'bot' ? "🤖 Rule Matched" : m.source === 'ai' ? "✨ AI Generated" : "⚠️ Fallback"}
                          </Badge>
                       )}
                       <div className={cn(
                          "max-w-[85%] p-3 text-sm leading-relaxed",
                          m.role === 'user' 
                            ? "bg-indigo-600 text-white rounded-2xl rounded-br-none" 
                            : "bg-slate-100 text-slate-800 rounded-2xl rounded-bl-none shadow-sm"
                       )}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 {testing && (
                    <div className="flex items-center gap-2 text-indigo-500 italic text-xs animate-pulse">
                       <Loader2 className="w-3 h-3 animate-spin"/> Processing through Brain layers...
                    </div>
                 )}
                 <div ref={chatEndRef} />
              </div>
              <div className="p-4 bg-white border-t flex gap-2">
                 <Input 
                   placeholder="Test a question: 'price kya hai', 'gst package', etc." 
                   className="h-11 rounded-xl shadow-inner border-slate-200" 
                   value={testInput}
                   onChange={e => setTestInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && sendTestMessage()}
                 />
                 <Button className="h-11 w-11 rounded-xl bg-indigo-600 shadow-indigo-100 shadow-lg shrink-0 p-0" onClick={sendTestMessage} disabled={testing || !testInput.trim()}>
                    <SendHorizontal className="w-5 h-5"/>
                 </Button>
              </div>
           </Card>
        </TabsContent>

        {/* --- UNMATCHED TAB --- */}
        <TabsContent value="unmatched" className="max-w-[800px] mx-auto space-y-4">
           {unmatched.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                 <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-bold text-lg text-slate-800">Clear Inbox!</p>
                    <p className="text-sm text-slate-400">Aapka bot sab handle kar raha hai. Koi unmatched messages nahi hain.</p>
                 </div>
              </div>
           ) : (
              <div className="space-y-2">
                 {unmatched.map(msg => (
                    <Card key={msg._id} className="transition-all hover:border-indigo-200 hover:shadow-md group shadow-sm border-slate-100">
                       <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                             <p className="text-md font-bold text-slate-800 leading-tight">"{msg.text}"</p>
                             <p className="text-[10px] text-slate-400 font-mono italic">{new Date(msg.createdAt).toLocaleString()} · User: {msg.phone || 'Unknown'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="outline" className="h-9 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => handleUnmatchedResolve(msg)}>
                                <Plus className="w-4 h-4" /> Resolve & Rule
                             </Button>
                             <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500" onClick={async () => {
                                await fetch("/api/admin/bot/unmatched", {
                                   method: "PATCH",
                                   headers: { "Content-Type" : "application/json" },
                                   body: JSON.stringify({ id: msg._id, resolved: true })
                                });
                                fetchUnmatched();
                             }}>
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           )}
        </TabsContent>

        {/* --- ANALYTICS TAB --- */}
        <TabsContent value="analytics" className="space-y-6">
           {analytics ? (
             <>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-white shadow-sm border-indigo-50">
                     <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase text-indigo-500">Today Cost</CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-800">
                          ₹{analytics.costs.today.toFixed(2)}
                        </CardTitle>
                     </CardHeader>
                  </Card>
                  <Card className="bg-white shadow-sm border-slate-50">
                     <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase text-slate-400">Total Match Rate</CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-800">
                           {analytics.bot.totalMatchCount} <span className="text-xs text-slate-400 font-normal">Hits</span>
                        </CardTitle>
                     </CardHeader>
                  </Card>
                  <Card className="bg-white shadow-sm border-emerald-50">
                     <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase text-emerald-500">Memory Size</CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-800">
                           {analytics.knowledge.learnedCount} <span className="text-xs text-slate-400 font-normal">Learnt</span>
                        </CardTitle>
                     </CardHeader>
                  </Card>
                  <Card className="bg-white shadow-sm border-rose-50">
                     <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase text-rose-500">Missed Intent</CardDescription>
                        <CardTitle className="text-3xl font-black text-slate-800">
                           {analytics.knowledge.unmatchedCount} <span className="text-xs text-slate-400 font-normal">Alerts</span>
                        </CardTitle>
                     </CardHeader>
                  </Card>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cost Breakdown */}
                  <Card className="shadow-md border-slate-100">
                     <CardHeader>
                        <CardTitle className="text-md font-bold">Cost Distribution</CardTitle>
                        <CardDescription>Breakdown by message session type (₹)</CardDescription>
                     </CardHeader>
                     <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={analytics.costs.byType.map(c => ({ name: c._id, value: Math.round(c.total * 100) / 100 }))}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={60}
                                 outerRadius={80}
                                 paddingAngle={5}
                                 dataKey="value"
                              >
                                 {analytics.costs.byType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                 ))}
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                           </PieChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </Card>

                  {/* Category Performance */}
                  <Card className="shadow-md border-slate-100">
                     <CardHeader>
                        <CardTitle className="text-md font-bold">Efficiency by Category</CardTitle>
                        <CardDescription>Which bot rules are getting the most hits?</CardDescription>
                     </CardHeader>
                     <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={analytics.bot.categories}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis fontSize={10} axisLine={false} tickLine={false} />
                              <Tooltip 
                                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                 cursor={{ fill: '#f8fafc' }}
                              />
                              <Bar dataKey="hits" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                           </BarChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </Card>
               </div>
               
               <Card className="shadow-md border-slate-100">
                  <CardHeader>
                     <CardTitle className="text-md flex items-center gap-2 font-black">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Top Performing Bot Rules
                     </CardTitle>
                     <CardDescription>Rules that handled most customer queries autonomously.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-3">
                        {analytics.bot.topRules.map((rule, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 transition-hover hover:bg-white hover:shadow-sm">
                             <div className="flex-1">
                                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{rule.category}</span>
                                <p className="text-sm font-bold text-slate-800 leading-tight truncate max-w-[400px]">"{rule.reply}"</p>
                                <div className="flex gap-1 mt-1">
                                   {Array.isArray(rule.keywords) ? rule.keywords.slice(0, 3).map(k => <span key={k} className="text-[8px] bg-slate-200 text-slate-500 px-1 rounded-sm">#{k}</span>) : null}
                                </div>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-indigo-600">{rule.matchCount}</span>
                                <span className="text-[8px] uppercase font-bold text-slate-400">Total Hits</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
             </>
           ) : (
             <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-400 font-medium italic">Calculating your CRM efficiency...</p>
             </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
