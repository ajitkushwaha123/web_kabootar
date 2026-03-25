"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Settings2, 
  LayoutGrid, 
  Layers, 
  Zap, 
  MessageSquare, 
  Smartphone,
  Eye,
  Info,
  Check,
  ChevronDown,
  MoreVertical,
  CircleHelp,
  ArrowRight,
  UtensilsCrossed,
  Tags,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/global/PermissionGuard";

// ── Phone Mockup Component ────────────────────────────────────
const PhonePreview = ({ item, selectedVariants, price }) => {
  return (
    <div className="relative w-[340px] h-[700px] bg-black rounded-[48px] border-[8px] border-slate-900 shadow-2xl scale-95 origin-top hidden xl:block">
      {/* Dynamic Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-1">
           <span className="text-[10px] text-white font-bold tracking-tighter">9:11</span>
           <div className="flex gap-1">
              <div className="w-1 h-3 bg-white/20 rounded-full" />
              <div className="w-4 h-3 bg-white/40 rounded-full" />
           </div>
        </div>
      </div>

      <div className="absolute top-2 bottom-2 left-2 right-2 bg-white rounded-[40px] overflow-hidden flex flex-col shadow-inner">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 pt-10 flex items-center justify-between">
           <ChevronLeft className="w-5 h-5 text-slate-400" />
           <div className="flex gap-2">
              <Eye className="w-4 h-4 text-slate-300" />
              <Layers className="w-4 h-4 text-slate-300" />
           </div>
        </div>

        {/* Item Image */}
        <div className="h-48 bg-slate-100 flex items-center justify-center relative">
           <ImageIcon className="w-12 h-12 text-slate-200" />
           {item.isVeg && (
             <div className="absolute left-6 bottom-4 w-4 h-4 border border-green-600 p-0.5 flex items-center justify-center bg-white rounded-sm shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
             </div>
           )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
           <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{item.name || "ITEM NAME"}</h3>
              <p className="text-sm font-bold text-slate-400">${price || item.basePrice || "0.00"}</p>
              <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed italic">{item.description || "Describe your delicious dish here for your customers..."}</p>
           </div>

           {/* Selected Variants Display */}
           {item.variantGroups?.map((group, idx) => (
             <div key={idx} className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{group.name}</h4>
                   <span className="text-[8px] font-bold text-indigo-500 bg-indigo-50 px-2 rounded-full border border-indigo-100">REQUIRED</span>
                </div>
                <div className="space-y-2">
                   {group.options?.map((opt, i) => (
                     <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <span className={cn("text-xs font-bold transition-all", i === 0 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600")}>{opt}</span>
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", i === 0 ? "border-indigo-600" : "border-slate-200 group-hover:border-slate-300")}>
                           {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 pt-2 bg-white/80 backdrop-blur-md border-t border-slate-100">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                 <div className="w-6 h-6 flex items-center justify-center text-slate-400 font-black">-</div>
                 <div className="text-xs font-black text-slate-700">1</div>
                 <div className="w-6 h-6 flex items-center justify-center text-slate-400 font-black">+</div>
              </div>
              <div className="text-right">
                 <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter italic">Total Incl. Tax</div>
                 <div className="text-sm font-black text-slate-800">${price || item.basePrice || "0.00"}</div>
              </div>
           </div>
           <button className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_30px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 group">
              ADD TO BAG
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};


export default function CatalogPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    name: "Chilli Paneer Gravy",
    basePrice: 290,
    description: "[veg preparation] Chilli Paneer Gravy is a popular Indo-Chinese dish that combines soft paneer cubes with a spicy, tangy, and...",
    category: "Main Course",
    isVeg: true,
    variantGroups: [
      { name: "Size", options: ["Small", "Medium", "Large"] }
    ],
    combinations: []
  });

  const [activeProperty, setActiveProperty] = useState(null);

  // ── Handlers ────────────────────────────────────────────────
  const addVariantGroup = (name = "New Property") => {
    const updated = { ...item, variantGroups: [...item.variantGroups, { name, options: ["Option 1"] }] };
    setItem(updated);
    setActiveProperty(updated.variantGroups.length - 1);
  };

  const removeVariantGroup = (idx) => {
    const updated = { ...item, variantGroups: item.variantGroups.filter((_, i) => i !== idx) };
    setItem(updated);
    if (activeProperty === idx) setActiveProperty(null);
  };

  const addOptionToGroup = (groupIdx) => {
    const updated = { ...item };
    updated.variantGroups[groupIdx].options.push(`Option ${updated.variantGroups[groupIdx].options.length + 1}`);
    setItem(updated);
  };

  const removeOptionFromGroup = (groupIdx, optIdx) => {
    const updated = { ...item };
    updated.variantGroups[groupIdx].options = updated.variantGroups[groupIdx].options.filter((_, i) => i !== optIdx);
    setItem(updated);
  };

  const updateOptionValue = (groupIdx, optIdx, val) => {
    const updated = { ...item };
    updated.variantGroups[groupIdx].options[optIdx] = val;
    setItem(updated);
  };

  const updateGroupName = (groupIdx, val) => {
    const updated = { ...item };
    updated.variantGroups[groupIdx].name = val;
    setItem(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          variantCombinations: item.combinations.map(c => ({
             values: c.values,
             price: c.price
          }))
        })
      });

      if (res.ok) {
        toast.success("Catalog Item Saved Successfully!", {
           description: `${item.name} with ${item.variantGroups.length} variants updated.`
        });
      } else {
        toast.error("Failed to save item");
      }
    } catch (e) {
      toast.error("Error saving item: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate combinations
  useEffect(() => {
    if (step === 2) {
      const combos = item.variantGroups.reduce((acc, group) => {
        if (acc.length === 0) return group.options.map(o => ({ [group.name]: o }));
        const current = [];
        acc.forEach(combo => {
          group.options.forEach(option => {
            current.push({ ...combo, [group.name]: option });
          });
        });
        return current;
      }, []);

      const existingCombos = item.combinations || [];
      const finalCombos = combos.map(c => {
        const found = existingCombos.find(ec => JSON.stringify(ec.values) === JSON.stringify(c));
        return { values: c, price: found ? found.price : item.basePrice };
      });
      setItem(prev => ({ ...prev, combinations: finalCombos }));
    }
  }, [step, item.variantGroups, item.basePrice]);

  return (
    <PermissionGuard permission="team">
      <div className="flex bg-slate-50/50 dark:bg-slate-950 font-poppins min-h-screen">
        
        {/* Left: Phone Preview */}
        <div className="flex-1 flex items-start justify-center p-12 overflow-y-auto">
           <PhonePreview 
             item={item} 
             selectedVariants={{}} 
             price={item.combinations[0]?.price} 
           />
        </div>

        {/* Right: Creation Panel */}
        <div className="w-[600px] bg-white border-l border-slate-100 flex flex-col shadow-2xl relative">
           
           {/* Header */}
           <div className="p-8 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{item.name || "UNNAMED ITEM"}</h2>
                 <div className="flex items-center gap-2 mt-2">
                    <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", step === 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400 shrink-0")}>Define Properties</div>
                    <ChevronRight className="w-3 h-3 text-slate-200" />
                    <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", step === 2 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400 shrink-0")}>Enter Pricing</div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm transition-all group">
                    <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                 </button>
                 <button className="p-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 hover:bg-white shadow-sm transition-all group">
                    <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              
              {step === 1 && (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Variant Groups</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">You can offer variations of an item, such as size/ base/ crust, etc.</p>
                   </div>

                   <div className="space-y-4">
                      {item.variantGroups?.map((group, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "group p-5 rounded-[24px] border-2 transition-all relative",
                            activeProperty === idx ? "bg-indigo-50/30 border-indigo-200 shadow-xl shadow-indigo-50" : "bg-white border-slate-50 hover:border-slate-100"
                          )}
                          onClick={() => setActiveProperty(idx)}
                        >
                           <button 
                             onClick={(e) => { e.stopPropagation(); removeVariantGroup(idx); }}
                             className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>

                           <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                 <Settings2 className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                 <input 
                                   className="text-sm font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-200 uppercase tracking-tight w-full"
                                   placeholder="Property Name (e.g. Size)"
                                   value={group.name}
                                   onChange={(e) => updateGroupName(idx, e.target.value)}
                                 />
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-2">
                              {group.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm hover:border-indigo-200 transition-colors">
                                   <input 
                                      className="text-[11px] font-bold text-slate-600 bg-transparent border-none focus:ring-0 p-0 w-16"
                                      value={opt}
                                      onChange={(e) => updateOptionValue(idx, i, e.target.value)}
                                   />
                                   <button 
                                     onClick={() => removeOptionFromGroup(idx, i)}
                                     className="text-slate-300 hover:text-rose-400"
                                   >
                                      <Plus className="w-3 h-3 rotate-45" />
                                   </button>
                                </div>
                              ))}
                              <button 
                                onClick={() => addOptionToGroup(idx)}
                                className="px-4 py-1.5 rounded-full border-2 border-dashed border-slate-100 text-slate-400 text-[10px] font-black uppercase hover:border-indigo-300 hover:text-indigo-400 transition-all flex items-center gap-2"
                              >
                                 <Plus className="w-3 h-3" />
                                 Add Value
                              </button>
                           </div>
                        </motion.div>
                      ))}

                      <button 
                        onClick={() => addVariantGroup()}
                        className="w-full py-6 rounded-[32px] border-4 border-dashed border-slate-50 text-slate-300 hover:border-indigo-100 hover:text-indigo-400 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-2"
                      >
                         <Plus className="w-5 h-5" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Create New Property</span>
                      </button>
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pricing Matrix</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">Set the price for each combination.</p>
                   </div>

                   <div className="space-y-3">
                      {item.combinations?.map((combo, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:border-indigo-200 transition-all hover:translate-x-1 group"
                        >
                           <div className="flex items-center gap-3 flex-1 overflow-hidden">
                              {Object.entries(combo.values).map(([key, val], i) => (
                                <React.Fragment key={key}>
                                   <div className="space-y-0.5 min-w-0">
                                      <span className="block text-[8px] font-black uppercase text-slate-300 tracking-tighter leading-none">{key}</span>
                                      <span className="text-xs font-black text-slate-700 truncate leading-none italic">{val}</span>
                                   </div>
                                   {i < Object.entries(combo.values).length - 1 && (
                                     <div className="w-1 h-1 bg-slate-200 rounded-full shrink-0 mx-2 mt-2" />
                                   )}
                                </React.Fragment>
                              ))}
                           </div>
                           
                           <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors min-w-[120px]">
                              <span className="text-xs font-black text-slate-400">$</span>
                              <input 
                                 type="number"
                                 className="w-full text-sm font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0 text-right italic"
                                 value={combo.price}
                                 onChange={(e) => {
                                    const updated = { ...item };
                                    updated.combinations[idx].price = parseInt(e.target.value);
                                    setItem(updated);
                                 }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

           </div>

           {/* Footer */}
           <div className="p-8 pt-6 border-t border-slate-100 bg-white">
              {step === 1 ? (
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-[32px] shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                >
                   Enter prices and review
                   <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex gap-4">
                   <button 
                     onClick={() => setStep(1)}
                     className="w-32 bg-slate-50 text-slate-400 font-bold py-5 rounded-[32px] border border-slate-100 hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                   >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                   </button>
                   <button 
                     onClick={handleSave}
                     disabled={loading}
                     className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[32px] shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                   >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                      <Check className="w-5 h-5" />
                   </button>
                </div>
              )}
           </div>

           <motion.div 
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-[24px] shadow-2xl flex items-center gap-3 border-4 border-emerald-400/50 backdrop-blur-md"
           >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                 <ChevronDown className="w-5 h-5 rotate-180" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none">Status: Live</p>
                 <p className="text-xs font-bold leading-none mt-1">4 item interactions recorded</p>
              </div>
           </motion.div>
        </div>

      </div>
    </PermissionGuard>
  );
}
