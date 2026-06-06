"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from "lucide-react";
import { aiApi } from "@/lib/api";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // States for our dynamic switches
  const [chatbotAppEnabled, setChatbotAppEnabled] = useState(true);
  const [chatbotLmsEnabled, setChatbotLmsEnabled] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        const res = await aiApi.getGlobalConfig();
        if (res?.status === "success" && res?.data) {
          setChatbotAppEnabled(res.data.chatbotAppEnabled);
          setChatbotLmsEnabled(res.data.chatbotLmsEnabled);
        }
      } catch (err: any) {
        console.error("Failed to load global AI config:", err);
        setErrorMsg(err.message || "Failed to load global AI configurations.");
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      const res = await aiApi.updateGlobalSettings(chatbotAppEnabled, chatbotLmsEnabled);
      if (res?.status === "success") {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err: any) {
      console.error("Failed to save AI config:", err);
      setErrorMsg(err.message || "Failed to save AI settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure global preferences, system behavior, and AI models.</p>
      </div>

      {errorMsg && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-start gap-3 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Action Required</h4>
            <p className="text-xs mt-0.5 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Company Profile mock panel */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Company Profile</h2>
            <p className="text-sm text-muted-foreground">General information displayed across portal dashboards.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <input 
                type="text" 
                defaultValue="Reliant Home Health Agency" 
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-primary" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@relianthomehealth.com" 
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-primary" 
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Headquarters Address</label>
              <input 
                type="text" 
                defaultValue="123 Care Lane, Philadelphia, PA 19104" 
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-primary" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant governance panel */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Assistant Governance & Switches</h2>
            <p className="text-sm text-muted-foreground">Configure AI assistant activation states globally across the candidate application journey and the clinical study academy.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/30">
            <div className="space-y-1">
              <span className="text-sm font-semibold block">Application Assistant ("Reliant Companion")</span>
              <span className="text-xs text-muted-foreground block max-w-xl">
                Provides real-time support to prospective job applicants during their credential uploads, background check inquiries, and document verification stages.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={chatbotAppEnabled} 
                onChange={(e) => setChatbotAppEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/30">
            <div className="space-y-1">
              <span className="text-sm font-semibold block">LMS Study Companion ("Clinical Mentor")</span>
              <span className="text-xs text-muted-foreground block max-w-xl">
                Assists clinical students, home health aides, and hired staff with course orientations, HIPAA regulation queries, safety guides, and test preparations.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={chatbotLmsEnabled} 
                onChange={(e) => setChatbotLmsEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-3">
            <Cpu className="w-5 h-5 text-violet-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h5 className="font-semibold text-violet-700 dark:text-violet-400 text-xs uppercase tracking-wider">Note on Override Priority</h5>
              <p className="text-xs text-violet-600/90 dark:text-violet-400/90 mt-1 leading-relaxed">
                Global settings govern chatbot availability for all standard candidates. To fine-tune assistant access, go to individual <strong>Candidates details</strong> under the applications page to force-enable or force-disable the AI assistant for any specific user dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">System configuration updated successfully!</span>
        </div>
      )}
    </div>
  );
}
