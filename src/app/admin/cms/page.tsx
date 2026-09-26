"use client";

import { FileEdit, Globe, LayoutTemplate, Save, ShieldAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsApi } from "@/lib/api";

export default function CMSPage() {
  const queryClient = useQueryClient();
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  
  // Banner Form State
  const [bannerIsActive, setBannerIsActive] = useState(false);
  const [bannerText, setBannerText] = useState("");

  // Official Statement Form State
  const [statementTitle, setStatementTitle] = useState("");
  const [statementBody, setStatementBody] = useState("");

  // Fetch Banner Content
  const { data: bannerData, isLoading: isLoadingBanner } = useQuery({
    queryKey: ["cms", "global", "banner"],
    queryFn: () => cmsApi.getSection("global", "banner"),
  });

  // Fetch Notice Statement Content
  const { data: noticeData, isLoading: isLoadingNotice } = useQuery({
    queryKey: ["cms", "public", "notice-statement"],
    queryFn: () => cmsApi.getSection("public", "notice-statement"),
  });

  const saveContentMutation = useMutation({
    mutationFn: ({ page, section, data }: { page: string; section: string; data: any }) => 
      cmsApi.setSection(page, section, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cms", variables.page, variables.section] });
      alert("Content saved successfully!");
      setActiveEditor(null);
    },
    onError: (err: any) => alert(err.message || "Failed to save content"),
  });

  const defaultBannerText = "IMPORTANT: Reliant Home Health Agency Inc. is a fully accredited nursing agency. We are NOT affiliated with 'Reliant at Home Care' which recently closed operations.";
  const defaultNoticeTitle = "Official Notice of Non-Affiliation";
  const defaultNoticeBody = `It has come to our attention that an entity operating under the name "Reliant at Home Care" (or "Rekiant at Home Care") has recently ceased operations. Due to the similarity in names and unauthorized use of branding elements resembling ours from over a decade ago, there has been significant confusion in the community.\n\nWe are deeply sympathetic to the former employees and clients of "Reliant at Home Care" who are currently seeking missing paychecks or disruption in services due to their closure. However, because we are an entirely different corporation, we cannot process payments, retrieve records, or assist with employment matters regarding that company.`;

  const handleEditBanner = () => {
    setBannerIsActive(bannerData?.content?.isActive ?? true);
    setBannerText(bannerData?.content?.text ?? defaultBannerText);
    setActiveEditor("banner");
  };

  const handleSaveBanner = () => {
    saveContentMutation.mutate({
      page: "global",
      section: "banner",
      data: { isActive: bannerIsActive, text: bannerText },
    });
  };

  const handleEditNotice = () => {
    setStatementTitle(noticeData?.content?.title ?? defaultNoticeTitle);
    setStatementBody(noticeData?.content?.body ?? defaultNoticeBody);
    setActiveEditor("notice");
  };

  const handleSaveNotice = () => {
    saveContentMutation.mutate({
      page: "public",
      section: "notice-statement",
      data: { title: statementTitle, body: statementBody },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit the text, alerts, and content of your public website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <h2 className="font-semibold text-lg">Global Alerts & Notices</h2>
            </div>
            <div className="divide-y">
              
              {/* Top Banner Row */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-4">
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    Top Notification Banner
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${bannerData?.content?.isActive ?? true ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                      {bannerData?.content?.isActive ?? true ? "Active" : "Hidden"}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                    {bannerData?.content?.text || defaultBannerText}
                  </p>
                </div>
                <button 
                  onClick={handleEditBanner}
                  className="px-4 py-2 border rounded-lg hover:bg-muted font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
                >
                  <FileEdit className="w-4 h-4" /> Edit
                </button>
              </div>

              {/* Notice Page Row */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-4">
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    Official Statement Page (/notice)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                    {noticeData?.content?.title || defaultNoticeTitle}
                  </p>
                </div>
                <button 
                  onClick={handleEditNotice}
                  className="px-4 py-2 border rounded-lg hover:bg-muted font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
                >
                  <FileEdit className="w-4 h-4" /> Edit
                </button>
              </div>

            </div>
          </div>
          
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Website Pages (Coming Soon)</h2>
            </div>
            <div className="p-8 text-center text-muted-foreground text-sm">
              <p>Drag-and-drop website editor functionality will be activated in a future update.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal for Top Banner */}
      {activeEditor === "banner" && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-muted/30">
              <h2 className="font-bold text-lg">Edit Top Banner</h2>
              <button onClick={() => setActiveEditor(null)} className="text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="bannerActive" 
                  checked={bannerIsActive} 
                  onChange={(e) => setBannerIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="bannerActive" className="font-semibold text-sm">Show banner on website</label>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Banner Text</label>
                <textarea 
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  rows={4}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter the critical alert message..."
                />
              </div>
            </div>
            <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
              <button 
                onClick={() => setActiveEditor(null)}
                className="px-4 py-2 border rounded-lg font-semibold text-sm hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleSaveBanner}
                disabled={saveContentMutation.isPending}
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saveContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal for Official Statement */}
      {activeEditor === "notice" && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-muted/30">
              <h2 className="font-bold text-lg">Edit Official Statement (/notice)</h2>
              <button onClick={() => setActiveEditor(null)} className="text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Statement Title</label>
                <input 
                  type="text"
                  value={statementTitle}
                  onChange={(e) => setStatementTitle(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Statement Body Paragraphs</label>
                <p className="text-xs text-muted-foreground">This text will appear in the main body of the notice page.</p>
                <textarea 
                  value={statementBody}
                  onChange={(e) => setStatementBody(e.target.value)}
                  rows={8}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
              <button 
                onClick={() => setActiveEditor(null)}
                className="px-4 py-2 border rounded-lg font-semibold text-sm hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleSaveNotice}
                disabled={saveContentMutation.isPending}
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saveContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
