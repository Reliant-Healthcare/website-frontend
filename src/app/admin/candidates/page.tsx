"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatesApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Download,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Phone,
  Calendar,
  Layers,
  Award,
} from "lucide-react";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-100 dark:bg-amber-950/40 border-amber-200", text: "text-amber-800 dark:text-amber-300", label: "Pending" },
  REVIEWING: { bg: "bg-blue-100 dark:bg-blue-950/40 border-blue-200", text: "text-blue-800 dark:text-blue-300", label: "Reviewing" },
  INTERVIEW_SCHEDULED: { bg: "bg-purple-100 dark:bg-purple-950/40 border-purple-200", text: "text-purple-800 dark:text-purple-300", label: "Interview" },
  APPROVED: { bg: "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200", text: "text-emerald-800 dark:text-emerald-300", label: "Approved" },
  HIRED: { bg: "bg-teal-100 dark:bg-teal-950/40 border-teal-200", text: "text-teal-800 dark:text-teal-300", label: "Hired" },
  REJECTED: { bg: "bg-red-100 dark:bg-red-950/40 border-red-200", text: "text-red-800 dark:text-red-300", label: "Rejected" },
};

export default function CandidatesDirectoryPage() {
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [deleteCandidateTarget, setDeleteCandidateTarget] = useState<any | null>(null);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("REVIEWING");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch candidates query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["candidatesList", page, limit, search, roleType, status],
    queryFn: () =>
      candidatesApi.getAll({
        page,
        limit,
        search: search.trim() || undefined,
        roleType: roleType !== "all" ? roleType : undefined,
        status: status !== "all" ? status : undefined,
      }),
  });

  const candidates = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };

  // Mutations
  const singleDeleteMutation = useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      candidatesApi.delete(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatesList"] });
      setDeleteCandidateTarget(null);
    },
    onError: (err: any) => {
      alert("Delete failed: " + (err.message || "Unknown error"));
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (payload: { userIds: string[]; action: any; payload?: any }) =>
      candidatesApi.bulkAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatesList"] });
      setSelectedIds([]);
      setBulkStatusModalOpen(false);
      setBulkDeleteModalOpen(false);
    },
    onError: (err: any) => {
      alert("Bulk action failed: " + (err.message || "Unknown error"));
    },
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map((c: any) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const targets = selectedIds.length > 0
      ? candidates.filter((c: any) => selectedIds.includes(c.id))
      : candidates;

    if (targets.length === 0) {
      alert("No candidates to export");
      return;
    }

    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Primary Role Track",
      "Application Count",
      "Latest Position",
      "Latest Status",
      "Docs Approved",
      "Docs Total",
      "Registered Date",
    ];

    const rows = targets.map((c: any) => [
      c.id,
      `"${c.firstName}"`,
      `"${c.lastName}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.primaryRoleType}"`,
      c.applicationCount,
      `"${c.latestApplication?.jobTitle || 'N/A'}"`,
      `"${c.latestApplication?.status || 'N/A'}"`,
      c.complianceSummary?.approved || 0,
      c.complianceSummary?.total || 0,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reliant-candidates-export-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearch("");
    setRoleType("all");
    setStatus("all");
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* ── Top Header & Metrics ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Candidates 360
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {pagination.total} Total
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Centralized candidate lifecycle management: applications history, document vault, training, and audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Search & Filter Control Bar ─────────────────────────────────── */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Role Track Filter */}
          <div>
            <select
              value={roleType}
              onChange={(e) => {
                setRoleType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            >
              <option value="all">All Role Tracks</option>
              <option value="skilled">Skilled Professional (RN/LPN/PT)</option>
              <option value="non-skilled">Non-Skilled Caregiver (HHA/CNA/DCW)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            >
              <option value="all">All Application Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="APPROVED">Approved</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border bg-muted/40 hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Candidates Data Table ───────────────────────────────────────── */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden relative">
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden">
            <div className="w-full h-full bg-primary animate-pulse" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b select-none font-semibold">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={candidates.length > 0 && selectedIds.length === candidates.length}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Tracks Applied</th>
                <th className="px-4 py-3">Latest Application</th>
                <th className="px-4 py-3">Compliance Progress</th>
                <th className="px-4 py-3">LMS Training</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Loading candidates...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="font-semibold text-sm text-foreground">No candidates found</p>
                    <p className="text-xs mt-1">Try adjusting your search keywords or filter settings.</p>
                  </td>
                </tr>
              ) : (
                candidates.map((c: any) => {
                  const isSelected = selectedIds.includes(c.id);
                  const latestApp = c.latestApplication;
                  const statusInfo = statusConfig[latestApp?.status] || {
                    bg: "bg-muted text-muted-foreground border-border",
                    text: "text-muted-foreground",
                    label: latestApp?.status || "None",
                  };

                  const compTotal = c.complianceSummary?.total || 0;
                  const compApproved = c.complianceSummary?.approved || 0;
                  const compPercent = compTotal > 0 ? Math.round((compApproved / compTotal) * 100) : 0;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c.id)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                            {c.firstName?.charAt(0) || ""}{c.lastName?.charAt(0) || ""}
                          </div>
                          <div>
                            <Link
                              href={`/admin/candidates/${c.id}`}
                              className="font-bold text-foreground hover:text-primary transition-colors hover:underline"
                            >
                              {c.fullName || `${c.firstName} ${c.lastName}`}
                            </Link>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span>{c.email}</span>
                              {c.phone && <span>· {c.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tracks Applied */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {c.rolesApplied?.map((r: string) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                r === "skilled"
                                  ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                                  : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}
                            >
                              {r === "skilled" ? "Skilled" : "Non-Skilled"}
                            </span>
                          ))}
                          {(!c.rolesApplied || c.rolesApplied.length === 0) && (
                            <span className="text-muted-foreground italic text-[11px]">No applications</span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          {c.applicationCount} application{c.applicationCount === 1 ? "" : "s"}
                        </span>
                      </td>

                      {/* Latest Application */}
                      <td className="px-4 py-3.5">
                        {latestApp ? (
                          <div>
                            <span className="font-semibold text-foreground block truncate max-w-[180px]">
                              {latestApp.jobTitle}
                            </span>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </td>

                      {/* Compliance Progress */}
                      <td className="px-4 py-3.5">
                        {compTotal > 0 ? (
                          <div className="space-y-1 max-w-[130px]">
                            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                              <span>{compApproved}/{compTotal} Approved</span>
                              <span>{compPercent}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  compPercent === 100
                                    ? "bg-emerald-600"
                                    : compPercent > 50
                                    ? "bg-blue-600"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${compPercent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No docs</span>
                        )}
                      </td>

                      {/* LMS Training */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {c.trainingSummary?.certificatesCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Award className="w-3 h-3" />
                              {c.trainingSummary.certificatesCount} Cert{c.trainingSummary.certificatesCount === 1 ? "" : "s"}
                            </span>
                          ) : c.trainingSummary?.enrolledCount > 0 ? (
                            <span className="text-[11px] text-muted-foreground">
                              {c.trainingSummary.completedCount}/{c.trainingSummary.enrolledCount} In-Service
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">Not enrolled</span>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/candidates/${c.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg text-xs transition-colors"
                          >
                            View 360
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => setDeleteCandidateTarget(c)}
                            title="Delete candidate"
                            className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ─────────────────────────────────────────── */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {candidates.length > 0 ? (page - 1) * limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{pagination.total}</span> candidates
          </div>

          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded-lg px-2 py-1 bg-background text-foreground text-xs focus:outline-none"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-foreground px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="p-1.5 border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Sticky Bulk Actions Bar ────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background dark:bg-card dark:text-foreground px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-4 text-xs font-semibold backdrop-blur-md"
          >
            <span>{selectedIds.length} candidate{selectedIds.length === 1 ? "" : "s"} selected</span>
            <div className="h-4 w-[1px] bg-border/40" />

            <button
              onClick={() => setBulkStatusModalOpen(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all font-bold"
            >
              Change Status
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all"
            >
              Export CSV
            </button>

            <button
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl transition-all"
            >
              Delete Selected
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-background/20 rounded-lg text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Single Delete Modal with Hired Guardrail ────────────────────── */}
      <AnimatePresence>
        {deleteCandidateTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-base font-bold text-foreground">Delete Candidate Profile</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">{deleteCandidateTarget.fullName}</span>?
                This will permanently remove their user account, all linked applications, verified compliance documents, and training records.
              </p>

              {deleteCandidateTarget.latestApplication?.status === "HIRED" && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive font-medium">
                  ⚠️ This candidate is marked as <strong>HIRED</strong>. Deleting will erase all official onboarding records for this active worker.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteCandidateTarget(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    singleDeleteMutation.mutate({
                      id: deleteCandidateTarget.id,
                      force: deleteCandidateTarget.latestApplication?.status === "HIRED",
                    })
                  }
                  disabled={singleDeleteMutation.isPending}
                  className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-xl text-xs hover:bg-destructive/90 transition-colors inline-flex items-center gap-1.5"
                >
                  {singleDeleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bulk Status Update Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {bulkStatusModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border p-6 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-foreground">Bulk Status Update</h3>
              <p className="text-xs text-muted-foreground">
                Set application status for {selectedIds.length} selected candidates:
              </p>

              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-background text-foreground"
              >
                <option value="REVIEWING">Reviewing</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="APPROVED">Approved</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setBulkStatusModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    bulkActionMutation.mutate({
                      userIds: selectedIds,
                      action: "status_update",
                      payload: { newStatus: targetStatus },
                    })
                  }
                  disabled={bulkActionMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90"
                >
                  {bulkActionMutation.isPending ? "Updating..." : "Update Status"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bulk Delete Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {bulkDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-foreground">Bulk Delete Candidates</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                You are about to delete <span className="font-bold text-foreground">{selectedIds.length} candidates</span>.
                This will permanently erase all associated applications, verified documents, and records.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setBulkDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    bulkActionMutation.mutate({
                      userIds: selectedIds,
                      action: "delete",
                    })
                  }
                  disabled={bulkActionMutation.isPending}
                  className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-xl text-xs hover:bg-destructive/90"
                >
                  {bulkActionMutation.isPending ? "Deleting..." : "Confirm Bulk Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

