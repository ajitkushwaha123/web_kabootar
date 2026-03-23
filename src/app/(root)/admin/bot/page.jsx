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
  SendHorizontal
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

const CATEGORIES = ["sales", "support", "onboarding", "fssai", "gst", "general"];

/**
 * BOT TRAINING DASHBOARD
 * Admin UI — Bot train karo + test karo + unmatched dekho
 */
export default function BotTrainingPage() {
  const [activeTab, setActiveTab] = useState("rules");
  const [rules, setRules] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Rule Form State
  const [formData, setFormData] = useState({
    keywords: "",
    reply: "",
    category: "general",
    priority: "5"
  });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Test State
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState([
    { role: "bot", text: "Namaste! Magic Scale Bot Test UI mein aapka swagat hai. Main Bot Rules aur AI Brain dono ko test kar sakta hoon. Kuch poocho!", source: "bot" }
  ]);
  const [testing, setTesting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchRules();
    fetchUnmatched();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

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
      setTestMessages(p => [...p, { role: "bot", text: data.reply, source: data.source }]);
      if (data.source !== "bot") fetchUnmatched();
    } catch (err) {
       toast.error("Test failed");
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
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Bot Tuning Center 🧠</h2>
           <p className="text-muted-foreground">Train your AI with rules, test responses, and learn from visitor messages.</p>
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
          <TabsTrigger value="rules" className="gap-2"><Plus className="w-4 h-4"/> Rules Manager</TabsTrigger>
          <TabsTrigger value="test" className="gap-2"><SendHorizontal className="w-4 h-4"/> Live Playground</TabsTrigger>
          <TabsTrigger value="unmatched" className="gap-2 flex">
             <MessageSquare className="w-4 h-4"/> Review Inbox
             {unmatched.length > 0 && (
                <span className="ml-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
             )}
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}
