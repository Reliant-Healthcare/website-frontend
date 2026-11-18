"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock, Upload,
  Loader2, Download, Send, AlertCircle, User, Mail, Phone, Briefcase,
  Calendar, Eye, History, ShieldCheck, GraduationCap, Award, Trash2,
  ExternalLink, Check, AlertTriangle, X, RefreshCw, Search, Filter,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatesApi, applicationsApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock, label: "Pending" },
  UPLOADED: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Upload, label: "Uploaded" },
  APPROVED: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2, label: "Approved" },
  REJECTED: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" },
};

const appStatusConfig: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  REVIEWING: "bg-blue-100 text-blue-800 border-blue-200",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800 border-purple-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  HIRED: "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold",
};

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<"applications" | "vault" | "training" | "timeline">("applications");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Vault Search, Filter, & Pagination states
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultStatusFilter, setVaultStatusFilter] = useState("ALL");
  const [vaultRoleFilter, setVaultRoleFilter] = useState("ALL");
  const [vaultPage, setVaultPage] = useState(1);
  const [vaultPageSize, setVaultPageSize] = useState(10);

  const handleDownloadDocumentPdf = async (doc: any) => {
    const docId = doc.documentId;
    if (!docId) {
      if (doc.fileUrl) {
        window.open(doc.fileUrl, "_blank");
      }
      return;
    }
    setDownloadingDocId(docId);
    try {
      const cleanName = `${(doc.sectionName || "official-document").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-signed.pdf`;
      await applicationsApi.downloadOfficialPdf(docId, cleanName);
    } catch (err: any) {
      console.error("Failed to download official PDF:", err);
      if (doc.fileUrl) {
        window.open(doc.fileUrl, "_blank");
      } else {
        alert(err.message || "Failed to download official PDF.");
      }
    } finally {
      setDownloadingDocId(null);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["candidate-360", id],
    queryFn: async () => {
      const res = await candidatesApi.getById(id);
      return res?.candidate ? res : (res?.data ?? res);
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (force: boolean) => {
      return candidatesApi.delete(id, force);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidatesList"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-360", id] });
      router.push("/admin/candidates");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete candidate.";
      setDeleteError(msg);
      if (err.response?.status === 409) {
        setForceDelete(true);
      }
    },
  });

  const notifyMutation = useMutation({
    mutationFn: async () => {
      return candidatesApi.bulkAction({
        action: "send_reminder",
        userIds: [id],
      });
    },
    onSuccess: () => {
      setReminderSent(true);
      const email = data?.candidate?.email || data?.candidate?.user?.email || "candidate's email";
      setActionSuccess(`Onboarding reminder email sent successfully to ${email}!`);
      setActionError(null);
      setTimeout(() => {
        setReminderSent(false);
        setActionSuccess(null);
      }, 5000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to send reminder email.";
      setActionError(msg);
      setTimeout(() => setActionError(null), 6000);
    },
  });

  const candidate = data?.candidate;
  const applications = data?.applications || [];
  const documentVault = data?.documentVault || [];
  const training = data?.training || { enrollments: [], certificates: [], quizAttempts: [] };
  const auditTimeline = data?.auditTimeline || [];
  const candidateName =
    candidate?.name ||
    `${candidate?.firstName || ""} ${candidate?.lastName || ""}`.trim() ||
    "Candidate";
  const isHired = applications.some((a: any) => a.status === "HIRED");
  const uniqueRoles = Array.from(new Set(applications.map((a: any) => a.roleType))).filter(Boolean);

  // Unified Document Vault Search, Filter, & Pagination calculation
  const filteredVault = useMemo(() => {
    return documentVault.filter((doc: any) => {
      // Search filter: matches section name, job title, role track, or status
      if (vaultSearch.trim()) {
        const q = vaultSearch.toLowerCase().trim();
        const matchName = (doc.sectionName || "").toLowerCase().includes(q);
        const matchJob = (doc.jobTitle || "").toLowerCase().includes(q);
        const matchRole = (doc.roleType || "").toLowerCase().includes(q);
        const matchStatus = (doc.status || "").toLowerCase().includes(q);
        if (!matchName && !matchJob && !matchRole && !matchStatus) return false;
      }
      // Status filter
      if (vaultStatusFilter !== "ALL") {
        if (doc.status !== vaultStatusFilter) return false;
      }
      // Role track filter
      if (vaultRoleFilter !== "ALL") {
        const role = (doc.roleType || "").toUpperCase();
        if (vaultRoleFilter === "SKILLED" && !role.includes("SKILL")) return false;
        if (vaultRoleFilter === "NON_SKILLED" && role.includes("SKILL") && !role.includes("NON")) return false;
      }
      return true;
    });
  }, [documentVault, vaultSearch, vaultStatusFilter, vaultRoleFilter]);

  const totalVaultPages = Math.max(1, Math.ceil(filteredVault.length / vaultPageSize));
  const paginatedVault = useMemo(() => {
    const start = (vaultPage - 1) * vaultPageSize;
    return filteredVault.slice(start, start + vaultPageSize);
  }, [filteredVault, vaultPage, vaultPageSize]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#003366] mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading Candidate 360 profile...</p>
      </div>
    );
  }

  if (error || !data || !data.candidate) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-900">Candidate Not Found</h2>
          <p className="text-sm text-red-700 mt-1 mb-4">
            The candidate profile you are looking for may have been deleted or does not exist.
          </p>
          <Link
            href="/admin/candidates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-xl text-sm font-medium hover:bg-[#002244] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Candidate Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/candidates"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#003366] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates Directory
        </Link>
        {actionSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium shadow-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003366] to-[#005599] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {candidateName ? candidateName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{candidateName}</h1>
                {isHired ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    HIRED EMPLOYEE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {candidate.role || "APPLICANT"}
                  </span>
                )}
                {uniqueRoles.map((r: any) => (
                  <span
                    key={r}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r === "SKILLED" ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {r === "SKILLED" ? "Skilled Clinical" : "Non-Skilled Direct Care"}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-[#003366] hover:underline">
                    {candidate.email}
                  </a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {new Date(candidate.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{applications.length} Application{applications.length === 1 ? "" : "s"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (notifyMutation.isPending || reminderSent) return;
                notifyMutation.mutate();
              }}
              disabled={notifyMutation.isPending}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60 ${
                reminderSent
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 ring-2 ring-emerald-200"
                  : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
              title="Send onboarding & compliance reminder email to candidate"
            >
              {notifyMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#003366]" />
                  <span>Sending Email...</span>
                </>
              ) : reminderSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reminder Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#003366]" />
                  <span>Send Reminder</span>
                </>
              )}
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              title="Refresh Profile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setDeleteError(null);
                setForceDelete(false);
                setDeleteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "applications"
              ? "border-[#003366] text-[#003366]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "vault"
              ? "border-[#003366] text-[#003366]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Vault ({documentVault.length})
        </button>
        <button
          onClick={() => setActiveTab("training")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "training"
              ? "border-[#003366] text-[#003366]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Training & LMS ({training.enrollments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "timeline"
              ? "border-[#003366] text-[#003366]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          Audit Timeline ({auditTimeline.length})
        </button>
      </div>

      {/* Tab 1: Applications History */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app: any) => {
              const totalDocs = app.documents?.length || 0;
              const approvedDocs = app.documents?.filter((d: any) => d.status === "APPROVED").length || 0;
              const pct = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                            app.roleType === "SKILLED"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {app.roleType === "SKILLED" ? "Skilled Clinical" : "Non-Skilled Care"}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {app.job?.title || "Caregiver / Clinical Role"}
                        </h3>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          appStatusConfig[app.status] || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {app.status ? app.status.replace("_", " ") : "PENDING"}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Submitted</span>
                        <span className="font-medium text-slate-800">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Docs</span>
                        <span className="font-medium text-slate-800">
                          {approvedDocs} / {totalDocs} Approved
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct === 100 ? "bg-emerald-500" : "bg-[#003366]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{pct}% Complete</span>
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] hover:text-[#002244] hover:underline"
                    >
                      View Application <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Consolidated Document Vault */}
      {activeTab === "vault" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Vault Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Unified Document Vault</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
                  {documentVault.length} Total
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidated master documents across all role tracks and application submissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                {documentVault.filter((d: any) => d.status === "APPROVED").length} / {documentVault.length} Approved
              </span>
            </div>
          </div>

          {/* Vault Controls Bar: Search, Status Filter, Role Track Filter, Page Size */}
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={vaultSearch}
                onChange={(e) => {
                  setVaultSearch(e.target.value);
                  setVaultPage(1);
                }}
                placeholder="Search by document name, role track, or job title..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366]/30 bg-slate-50/50 hover:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              {vaultSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setVaultSearch("");
                    setVaultPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={vaultStatusFilter}
                  onChange={(e) => {
                    setVaultStatusFilter(e.target.value);
                    setVaultPage(1);
                  }}
                  className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30 font-medium text-slate-700"
                >
                  <option value="ALL">All Statuses ({documentVault.length})</option>
                  <option value="APPROVED">Approved ({documentVault.filter((d: any) => d.status === "APPROVED").length})</option>
                  <option value="UPLOADED">Uploaded / Needs Review ({documentVault.filter((d: any) => d.status === "UPLOADED").length})</option>
                  <option value="PENDING">Pending / Awaiting ({documentVault.filter((d: any) => d.status === "PENDING").length})</option>
                  <option value="REJECTED">Rejected ({documentVault.filter((d: any) => d.status === "REJECTED").length})</option>
                </select>
              </div>

              {/* Role Track Filter */}
              <select
                value={vaultRoleFilter}
                onChange={(e) => {
                  setVaultRoleFilter(e.target.value);
                  setVaultPage(1);
                }}
                className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30 font-medium text-slate-700"
              >
                <option value="ALL">All Role Tracks</option>
                <option value="SKILLED">Skilled Clinical</option>
                <option value="NON_SKILLED">Non-Skilled Direct Care</option>
              </select>

              {/* Page Size Selector */}
              <select
                value={vaultPageSize}
                onChange={(e) => {
                  setVaultPageSize(Number(e.target.value));
                  setVaultPage(1);
                }}
                className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30 font-medium text-slate-700"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              {(vaultSearch || vaultStatusFilter !== "ALL" || vaultRoleFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setVaultSearch("");
                    setVaultStatusFilter("ALL");
                    setVaultRoleFilter("ALL");
                    setVaultPage(1);
                  }}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Document / Form Section</th>
                  <th className="py-3 px-4">Role Track</th>
                  <th className="py-3 px-4">Origin Application</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVault.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No documents match your filters</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search query, status, or role track filters.
                      </p>
                      {(vaultSearch || vaultStatusFilter !== "ALL" || vaultRoleFilter !== "ALL") && (
                        <button
                          type="button"
                          onClick={() => {
                            setVaultSearch("");
                            setVaultStatusFilter("ALL");
                            setVaultRoleFilter("ALL");
                            setVaultPage(1);
                          }}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#003366] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Reset Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedVault.map((doc: any) => {
                    const cfg = statusConfig[doc.status] || statusConfig.PENDING;
                    const StatusIcon = cfg.icon;

                    return (
                      <tr key={doc.documentId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <span>{doc.sectionName || "Form Document"}</span>
                              {doc.hasFormData && (
                                <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                  Digital Form Data
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              doc.roleType === "SKILLED"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {doc.roleType || "Universal"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {doc.jobTitle || "Standard Caregiver"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {(doc.documentId || doc.sectionId || doc.fileUrl) && (
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[#003366] bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                title="Preview document in viewer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                            )}
                            {(doc.documentId || doc.sectionId) && (
                              <button
                                type="button"
                                onClick={() => handleDownloadDocumentPdf(doc)}
                                disabled={downloadingDocId === doc.documentId}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                title="Download Official PDF"
                              >
                                {downloadingDocId === doc.documentId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#003366]" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>PDF</span>
                              </button>
                            )}
                            <Link
                              href={`/admin/applications/${doc.applicationId}?docId=${doc.documentId || doc.sectionId}#doc-${doc.documentId || doc.sectionId}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[#003366] hover:text-[#002244] bg-[#003366]/5 hover:bg-[#003366]/10 border border-[#003366]/20 rounded-lg text-xs font-semibold transition-colors"
                              title="Inspect and review this specific document section in application view"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3 text-[#003366]" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredVault.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="font-medium">
                Showing{" "}
                <strong className="text-slate-900">
                  {Math.min((vaultPage - 1) * vaultPageSize + 1, filteredVault.length)}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-900">
                  {Math.min(vaultPage * vaultPageSize, filteredVault.length)}
                </strong>{" "}
                of <strong className="text-slate-900">{filteredVault.length}</strong> documents
                {filteredVault.length !== documentVault.length && (
                  <span className="text-slate-400 ml-1">(filtered from {documentVault.length} total)</span>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVaultPage((p) => Math.max(1, p - 1))}
                  disabled={vaultPage === 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 px-2 font-medium">
                  Page <strong className="text-slate-900 ml-1">{vaultPage}</strong> of{" "}
                  <strong className="text-slate-900 ml-1">{totalVaultPages}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setVaultPage((p) => Math.min(totalVaultPages, p + 1))}
                  disabled={vaultPage >= totalVaultPages}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Training & LMS Progress */}
      {activeTab === "training" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Courses Enrolled</span>
                <GraduationCap className="w-5 h-5 text-[#003366]" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {training.enrollments?.length || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Certificates Awarded</span>
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {training.certificates?.length || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Quiz Submissions</span>
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {training.quizAttempts?.length || 0}
              </p>
            </div>
          </div>

          {/* Courses List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">OLTL In-Services & Direct Care Training</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {!training.enrollments || training.enrollments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No LMS course enrollments found for this user.
                </div>
              ) : (
                training.enrollments.map((enr: any) => (
                  <div key={enr.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-[#003366] rounded-xl">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{enr.course?.title || "Assigned Course"}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Enrolled on {new Date(enr.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold ${
                          enr.completedAt
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {enr.completedAt ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Unified Activity Audit Trail */}
      {activeTab === "timeline" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Complete Candidate Lifecycle Timeline</h3>
          {auditTimeline.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No logged activities recorded yet.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {auditTimeline.map((act: any) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-white border-2 border-[#003366] group-hover:scale-125 transition-transform" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900">{act.action}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {act.notes && (
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {act.notes}
                    </p>
                  )}
                  {act.jobTitle && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Target Role: <span className="font-medium text-slate-600">{act.jobTitle}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safe Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Delete Candidate Profile</h3>
                </div>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
                  {deleteError}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">{candidateName}</span>?
                This will cascade delete all associated application drafts, document uploads, and audit records.
              </p>

              {forceDelete && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <p className="font-bold">⚠️ Compliance Guardrail Warning:</p>
                  <p>
                    This candidate has an application marked as <span className="font-semibold text-emerald-800">HIRED</span>.
                    Deleting an active employee profile is restricted unless explicitly forced by a compliance director.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-1 font-medium text-slate-900">
                    <input
                      type="checkbox"
                      id="forceConfirm"
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      onChange={(e) => {
                        setForceDelete(e.target.checked);
                      }}
                    />
                    <span>I understand and confirm forceful permanent deletion</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(forceDelete)}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : forceDelete ? (
                    "Force Delete Profile"
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Document Preview Modal */}
        {previewDoc && (
          <DocumentPreviewModal
            doc={previewDoc}
            onClose={() => setPreviewDoc(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Document Preview Modal ────────────────────────────────────────────────────
function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: any;
  onClose: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);
      try {
        if (doc.documentId) {
          createdUrl = await applicationsApi.getOfficialPdfBlobUrl(doc.documentId);
          if (active) {
            setBlobUrl(createdUrl);
          }
        } else if (doc.fileUrl) {
          setBlobUrl(doc.fileUrl);
        } else {
          setError("No document content or file found.");
        }
      } catch (err: any) {
        if (active) {
          if (doc.fileUrl) {
            setBlobUrl(doc.fileUrl);
          } else {
            setError(err.message || "Failed to load document preview.");
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      active = false;
      if (createdUrl && createdUrl.startsWith("blob:")) {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [doc]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const cleanName = `${(doc.sectionName || "official-document").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-signed.pdf`;
      if (doc.documentId) {
        await applicationsApi.downloadOfficialPdf(doc.documentId, cleanName);
      } else if (doc.fileUrl) {
        window.open(doc.fileUrl, "_blank");
      }
    } catch (err: any) {
      alert("Download failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const isImage = doc.fileUrl && !blobUrl?.startsWith("blob:") && /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(doc.fileUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 text-[#003366] rounded-xl shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {doc.sectionName || "Official Document Preview"}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {doc.jobTitle ? `${doc.jobTitle} · ` : ""}
                {doc.roleType === "SKILLED" ? "Skilled Clinical" : "Direct Care"}
                {doc.uploadedAt ? ` · Submitted ${new Date(doc.uploadedAt).toLocaleDateString()}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
                title="Pop out in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pop Out</span>
              </a>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#003366] text-white hover:bg-[#002244] text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#003366]" />
              <p className="text-sm font-medium text-slate-700">Generating live signed PDF preview...</p>
              <p className="text-xs text-slate-400">Rendering official templates, signatures, and compliance audit stamps</p>
            </div>
          ) : error ? (
            <div className="max-w-md p-6 bg-white rounded-2xl border border-red-200 text-center space-y-3 shadow-sm">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Preview Unavailable</h4>
              <p className="text-xs text-slate-600">{error}</p>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#003366] font-semibold underline"
                >
                  Open attached file directly <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : isImage && doc.fileUrl ? (
            <div className="p-4 w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={doc.fileUrl}
                alt={doc.sectionName || "Document"}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              className="w-full h-full border-0 bg-white"
              title={doc.sectionName || "Document Preview"}
            />
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
