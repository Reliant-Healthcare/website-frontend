"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock, Upload,
  Loader2, Download, Send, AlertCircle, User, Mail, Phone, Briefcase,
  Calendar, MoreVertical, Eye, MessageSquare, History, Cpu,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, documentSectionsApi, aiApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock, label: "Pending" },
  UPLOADED: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Upload, label: "Uploaded" },
  APPROVED: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2, label: "Approved" },
  REJECTED: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" },
};

const appStatusConfig: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  REVIEWING: "bg-blue-100 text-blue-800",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  HIRED: "bg-emerald-100 text-emerald-800",
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const applicationId = params.id as string;
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [reviewingDoc, setReviewingDoc] = useState<any | null>(null);

  // Chatbot settings states
  const [chatbotAppOverride, setChatbotAppOverride] = useState("INHERIT");
  const [chatbotLmsOverride, setChatbotLmsOverride] = useState("INHERIT");
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);

  const { data: application, isLoading } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => applicationsApi.getOne(applicationId),
  });

  useEffect(() => {
    if (application?.user) {
      setChatbotAppOverride(application.user.chatbotAppOverride || "INHERIT");
      setChatbotLmsOverride(application.user.chatbotLmsOverride || "INHERIT");
    }
  }, [application]);

  // Load chat transcript history for audit
  const userId = application?.user?.id;
  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ["adminChatHistory", userId],
    queryFn: () => aiApi.getAdminChatHistory(userId!),
    enabled: !!userId,
  });

  const updateOverrideMutation = useMutation({
    mutationFn: ({ appOverride, lmsOverride }: { appOverride: string; lmsOverride: string }) =>
      aiApi.updateUserOverride(application.user.id, appOverride as any, lmsOverride as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      applicationsApi.updateStatus(applicationId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["application", applicationId] }),
  });

  const updateDocStatusMutation = useMutation({
    mutationFn: ({ docId, status, adminNotes, expirationDate }: { docId: string; status: "APPROVED" | "REJECTED"; adminNotes?: string; expirationDate?: string }) =>
      applicationsApi.updateDocumentStatus(docId, status, adminNotes, expirationDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["application", applicationId] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Application not found</h2>
        <Link href="/admin/applications" className="text-primary hover:underline mt-2 inline-block">
          Back to Applications
        </Link>
      </div>
    );
  }

  const releasedSectionIds = new Set<string>(application.documents?.map((d: any) => String(d.sectionId)) || []);
  const totalDocs = application.documents?.length || 0;
  const uploadedDocs = application.documents?.filter((d: any) => d.status !== "PENDING").length || 0;
  const approvedDocs = application.documents?.filter((d: any) => d.status === "APPROVED").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/applications")}
            className="text-sm text-primary hover:underline font-medium mb-3 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {application.user?.firstName} {application.user?.lastName}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appStatusConfig[application.status] || "bg-gray-100 text-gray-800"}`}>
              {application.status}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Applied {new Date(application.createdAt).toLocaleDateString()} · {application.job?.title || "General Application"} · {application.roleType}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowReleaseModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            Release Documents
          </button>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {application.user?.email}
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              {application.user?.phone || "Not provided"}
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              {application.roleType === "skilled" ? "Skilled Professional" : "Non-Skilled Professional"}
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Document Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploaded</span>
              <span className="font-semibold">{uploadedDocs}/{totalDocs}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: totalDocs > 0 ? `${(uploadedDocs / totalDocs) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Approved</span>
              <span className="font-semibold text-emerald-600">{approvedDocs}/{totalDocs}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: totalDocs > 0 ? `${(approvedDocs / totalDocs) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Application Status</h3>
          <select
            value={application.status}
            onChange={(e) => updateStatusMutation.mutate({ status: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {["PENDING", "REVIEWING", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED", "HIRED"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Change the overall application status
          </p>
        </div>
      </div>

      {/* Two-Column Grid for Documents & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Documents Table */}
        <div className="lg:col-span-2 bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/20">
            <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Released Documents
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and approve/reject forms submitted by this applicant
            </p>
          </div>

          {application.documents?.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No documents released yet.</p>
              <button
                onClick={() => setShowReleaseModal(true)}
                className="mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Release documents now →
              </button>
            </div>
          ) : (
            <div className="divide-y max-h-[380px] overflow-y-auto scrollbar-thin">
              {application.documents?.map((doc: any) => {
                const config = statusConfig[doc.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                const isActionable = doc.status !== "PENDING";

                return (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 border mt-0.5">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          {doc.section?.name}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        </h4>
                        {doc.section?.description && (
                          <p className="text-xs text-muted-foreground">{doc.section.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground/80 font-medium">
                          Released {new Date(doc.releasedAt).toLocaleDateString()}
                          {doc.uploadedAt && ` · Submitted ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                          {doc.expirationDate && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold ml-2">
                              · Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        {doc.status === "REJECTED" && doc.adminNotes && (
                          <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 mt-2 flex items-start gap-1.5 max-w-lg">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                            <div>
                              <span className="font-semibold">Rejection reason:</span> {doc.adminNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isActionable ? (
                        <button
                          onClick={() => setReviewingDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border bg-background hover:bg-muted text-xs font-bold rounded-xl text-foreground transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review & Action
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground italic px-2">
                          Awaiting candidate upload
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Review History / Audit Logs */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Review History
            </h2>
            <span className="text-xs font-bold bg-primary/10 text-primary border px-2 py-0.5 rounded-full">
              {application.activities?.length || 0}
            </span>
          </div>

          <div className="p-6">
            {!application.activities || application.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10 italic">No activity logs recorded yet.</p>
            ) : (
              <div className="max-h-[380px] overflow-y-auto pr-2 pl-2 -ml-2 scrollbar-thin">
                <div className="relative border-l border-muted pl-4 space-y-6">
                  {application.activities.map((activity: any) => (
                    <div key={activity.id} className="relative group space-y-1">
                      {/* Bullet marker */}
                      <span className="absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full border bg-background group-hover:scale-125 transition-transform duration-200" />
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {activity.actor}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded uppercase">
                          {activity.actorRole.replace(/_/g, " ")}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/90 font-medium">
                        {activity.details}
                      </p>

                      <span className="text-[10px] text-muted-foreground/80 block">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Chatbot Companion Governance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Governance Controls */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b">
            <Cpu className="w-5 h-5 text-violet-500" />
            <div>
              <h2 className="font-semibold text-lg">AI Assistant Governance</h2>
              <p className="text-xs text-muted-foreground">Force-enable or force-disable the AI chatbot for this user.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Application Onboarding Bot</label>
              <select
                value={chatbotAppOverride}
                onChange={(e) => {
                  const val = e.target.value;
                  setChatbotAppOverride(val);
                  updateOverrideMutation.mutate({ appOverride: val, lmsOverride: chatbotLmsOverride });
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
              >
                <option value="INHERIT">Inherit (System Default)</option>
                <option value="FORCE_ENABLE">Force Enable</option>
                <option value="FORCE_DISABLE">Force Disable</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">LMS Study Mentor Bot</label>
              <select
                value={chatbotLmsOverride}
                onChange={(e) => {
                  const val = e.target.value;
                  setChatbotLmsOverride(val);
                  updateOverrideMutation.mutate({ appOverride: chatbotAppOverride, lmsOverride: val });
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
              >
                <option value="INHERIT">Inherit (System Default)</option>
                <option value="FORCE_ENABLE">Force Enable</option>
                <option value="FORCE_DISABLE">Force Disable</option>
              </select>
            </div>

            <div className="text-[11px] text-muted-foreground bg-slate-50 dark:bg-slate-900/30 border p-3 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <span>
                "Inherit" respects the global settings. Use overrides for candidates undergoing clinical exams or who need high onboarding guidance.
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 cols: Chat Transcripts Audit Logs */}
        <div className="lg:col-span-2 bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-[350px]">
          <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Reliant Companion Chat Transcripts
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect applicant onboarding chat logs and question telemetry in real-time
              </p>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary border px-2 py-0.5 rounded-full">
              {historyData?.data?.length || 0} Session(s)
            </span>
          </div>

          <div className="flex-1 flex min-h-0 divide-x overflow-hidden">
            {/* Conversations list */}
            <div className="w-1/3 overflow-y-auto divide-y bg-slate-50/20">
              {!historyData?.data || historyData.data.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center p-4">No chat history recorded.</p>
              ) : (
                historyData.data.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConversation(c)}
                    className={`w-full text-left p-3 hover:bg-muted/40 transition-colors text-xs flex flex-col gap-1 ${
                      selectedConversation?.id === c.id ? "bg-primary/5 font-semibold text-primary" : ""
                    }`}
                  >
                    <span className="truncate block font-semibold text-foreground">
                      Session {c.id.substring(0, 8)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Updated {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Conversation detail Messages */}
            <div className="w-2/3 flex flex-col bg-slate-50/50 dark:bg-slate-900/10 p-4 overflow-y-auto">
              {!selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-40 text-muted-foreground" />
                  <p>Select a chat session on the left to read transcript audits.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedConversation.messages?.map((m: any) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[85%] ${
                        m.sender === "USER" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                          m.sender === "USER"
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-card border shadow-sm font-normal"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                        {m.sender === "USER" ? "Applicant" : "AI"} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Release Documents Modal */}
      <AnimatePresence>
        {showReleaseModal && (
          <ReleaseDocumentsModal
            applicationId={applicationId}
            roleType={application.roleType}
            releasedSectionIds={releasedSectionIds}
            onClose={() => setShowReleaseModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Review Document Modal */}
      <AnimatePresence>
        {reviewingDoc && (
          <ReviewDocumentModal
            doc={reviewingDoc}
            onClose={() => setReviewingDoc(null)}
            onApprove={async (notes, expirationDate) => {
              await updateDocStatusMutation.mutateAsync({ docId: reviewingDoc.id, status: "APPROVED", adminNotes: notes, expirationDate });
              setReviewingDoc(null);
            }}
            onReject={async (notes) => {
              await updateDocStatusMutation.mutateAsync({ docId: reviewingDoc.id, status: "REJECTED", adminNotes: notes });
              setReviewingDoc(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Review Document Modal ───────────────────────────────────────────────────

function ReviewDocumentModal({
  doc,
  onClose,
  onApprove,
  onReject,
}: {
  doc: any;
  onClose: () => void;
  onApprove: (notes: string, expirationDate?: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
}) {
  const [adminNotes, setAdminNotes] = useState(doc.adminNotes || "");
  const [expirationDate, setExpirationDate] = useState(doc.expirationDate ? new Date(doc.expirationDate).toISOString().split('T')[0] : "");
  const [isPending, setIsPending] = useState(false);
  const formSchema = Array.isArray(doc.section?.formSchema) ? doc.section.formSchema : [];
  const formData = doc.formData || {};
  const isWebForm = doc.section?.type === "WEB_FORM";

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setIsPending(true);
    try {
      if (status === "APPROVED") {
        await onApprove(adminNotes, expirationDate || undefined);
      } else {
        await onReject(adminNotes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  const handleDownloadFormPdf = () => {
    const submittedAt = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "N/A";
    const rows = formSchema.map((field: any) => {
      let answer = formData[field.id];
      if (field.type === "checkbox") {
        answer = answer ? "✓ Yes / Confirmed" : "✗ No / Not checked";
      } else if (field.type === "signature") {
        answer = answer ? `<img src="${answer}" style="max-height:50px;object-fit:contain;" />` : "(No signature provided)";
      } else {
        answer = answer || "(No answer provided)";
      }
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;width:40%;vertical-align:top">${field.label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;vertical-align:top;white-space:pre-wrap">${answer}</td>
        </tr>`;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.section?.name || "Form"} – Reliant Home Health</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
              h1 { font-size: 20px; font-weight: 900; color: #0d3b66; margin: 0 0 4px 0; }
              .meta { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
              thead td { background: #0d3b66; color: white; padding: 10px 12px; font-weight: 700; }
              tr:nth-child(even) td { background: #f9fafb; }
              .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; }
            }
          </style>
        </head>
        <body>
          <h1>${doc.section?.name || "Form Submission"}</h1>
          <div class="meta">Submitted: ${submittedAt} &nbsp;·&nbsp; Status: ${doc.status} &nbsp;·&nbsp; Reliant Home Health Admin Portal</div>
          <table>
            <thead><tr><td>Field</td><td>Applicant Answer</td></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">Generated by Reliant Home Health Admin Portal</div>
        </body>
      </html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:absolute;width:0;height:0;border:none;top:-9999px";
    document.body.appendChild(iframe);
    const doc2 = iframe.contentWindow?.document;
    if (doc2) {
      doc2.open();
      doc2.write(html);
      doc2.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 400);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border my-8 flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between shrink-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Review Document
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                doc.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                doc.status === "REJECTED" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"
              }`}>
                {doc.status}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {doc.section?.name} · Submitted {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isWebForm && formSchema.length > 0 && (
              <button
                onClick={handleDownloadFormPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted border hover:bg-muted/80 text-xs font-bold rounded-xl transition-all"
                title="Download form answers as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <XCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Document contents viewer */}
          <div className="bg-muted/30 border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Contents</h3>
            
            {isWebForm ? (
              <div className="space-y-4">
                {formSchema.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No fields configured on this form.</p>
                ) : (
                  formSchema.map((field: any) => (
                    <div key={field.id} className="space-y-1 pb-3 border-b border-border/60 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold text-muted-foreground">{field.label}</p>
                      <div className="text-sm text-foreground">
                        {field.type === "checkbox" ? (
                          formData[field.id] ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200 font-semibold">
                              ✓ Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground bg-muted px-2 py-0.5 rounded text-xs border font-medium">
                              ✗ Unchecked
                            </span>
                          )
                        ) : field.type === "signature" ? (
                          formData[field.id] ? (
                            <img src={formData[field.id]} alt="Signature" className="max-h-[60px] object-contain border border-dashed rounded p-1 bg-white" />
                          ) : (
                            <span className="text-muted-foreground italic text-xs">No signature provided</span>
                          )
                        ) : formData[field.id] ? (
                          <p className="whitespace-pre-wrap font-medium">{formData[field.id]}</p>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">No answer provided</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <FileText className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Uploaded PDF Attachment</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click below to open and review this document</p>
                </div>
                {doc.uploadedFileUrl ? (
                  <a
                    href={`${API_URL}${doc.uploadedFileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-primary/95 transition-all mt-1"
                  >
                    <Eye className="w-4 h-4" />
                    Open Uploaded File
                  </a>
                ) : (
                  <span className="text-xs text-destructive font-semibold">No file attachment found</span>
                )}
              </div>
            )}
          </div>

          {/* Expiration Date Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Expiration Date
              <span className="text-xs font-normal text-muted-foreground">(Optional – for compliance tracking/reminders)</span>
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-foreground"
            />
          </div>

          {/* Feedback & Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1">
              Feedback Notes / Rejection Reason
              <span className="text-xs font-normal text-muted-foreground">(Visible to applicant if document is rejected)</span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Provide context for approval, or detail exact reasons if rejecting so the applicant knows how to correct it..."
              rows={4}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-foreground resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t shrink-0 flex items-center justify-between gap-3 bg-muted/10">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 border bg-background hover:bg-muted text-xs font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("REJECTED")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-destructive hover:bg-destructive/95 text-destructive-foreground text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject Document
            </button>
            <button
              onClick={() => handleAction("APPROVED")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve Document
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Release Documents Modal ──────────────────────────────────────────────────

function ReleaseDocumentsModal({
  applicationId,
  roleType,
  releasedSectionIds,
  onClose,
}: {
  applicationId: string;
  roleType: string;
  releasedSectionIds: Set<string>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: allSections = [], isLoading } = useQuery({
    queryKey: ["document-sections-all"],
    queryFn: () => documentSectionsApi.getAll(),
  });

  const releaseMutation = useMutation({
    mutationFn: (sectionIds: string[]) =>
      applicationsApi.releaseDocuments(applicationId, sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      onClose();
    },
  });

  // Filter to sections that match the role type and aren't already released
  const availableSections = allSections.filter(
    (s: any) =>
      !releasedSectionIds.has(s.id) &&
      (s.roleType === roleType || s.roleType === "both"),
  );

  const toggleSection = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Release Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select which document sections to release to this applicant
            </p>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : availableSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
              <p className="font-medium">All sections have been released!</p>
              <p className="text-sm mt-1">There are no more sections available to release.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSections.map((section: any) => (
                <label
                  key={section.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    selected.has(section.id)
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="w-5 h-5 rounded border-2 text-primary focus:ring-primary accent-[hsl(209,84%,25%)]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{section.name}</p>
                    {section.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {section.roleType}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => releaseMutation.mutate(Array.from(selected))}
            disabled={selected.size === 0 || releaseMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {releaseMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Releasing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Release {selected.size} Document{selected.size !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
