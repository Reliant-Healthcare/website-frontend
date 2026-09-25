"use client";

import { useState } from "react";
import { Download, Search, Filter, FileText, CheckCircle, XCircle, Loader2, Eye, ChevronRight, UserPlus, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { applicationsApi } from "@/lib/api";

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.getAll(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const filteredApps = applications.filter((app: any) => {
    const matchesSearch =
      `${app.user?.firstName} ${app.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    REVIEWING: "bg-blue-100 text-blue-800",
    INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    HIRED: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and manage incoming candidate applications.</p>
        </div>
        <div className="flex gap-3">
          <div className="border rounded-lg p-0.5 bg-muted/40 flex shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "pipeline"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pipeline Kanban
            </button>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/95 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/20 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-primary"
            >
              <option value="">All Statuses</option>
              {["PENDING", "REVIEWING", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED", "HIRED"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full pt-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="w-10 h-10 mb-3" />
                <p className="font-medium">No applications found</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Applicant</th>
                    <th className="px-6 py-3 font-medium">Role Type</th>
                    <th className="px-6 py-3 font-medium">Date Applied</th>
                    <th className="px-6 py-3 font-medium">Documents</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredApps.map((app: any) => {
                    const totalDocs = app.documents?.length || 0;
                    const uploadedDocs = app.documents?.filter((d: any) => d.status !== "PENDING").length || 0;
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">
                            {app.user?.firstName} {app.user?.lastName}
                          </div>
                          <div className="text-muted-foreground text-xs">{app.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            app.roleType === "skilled" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {app.roleType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {totalDocs > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full"
                                  style={{ width: `${(uploadedDocs / totalDocs) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{uploadedDocs}/{totalDocs}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status] || "bg-gray-100 text-gray-800"}`}>
                            {app.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/admin/applications/${app.id}`)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: app.id, status: "APPROVED" })}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: app.id, status: "REJECTED" })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {filteredApps.length} applications</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50" disabled={applications.length < 10}>Next</button>
            </div>
          </div>
        </div>
      ) : (
        /* Pipeline Kanban View */
        <div className="space-y-6">
          {/* Quick Search Bar for Kanban */}
          <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search candidates in pipeline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {[
              { id: "Applied", label: "Applied", statuses: ["PENDING"], bg: "bg-blue-50/20 border-blue-100 dark:bg-blue-950/5 dark:border-blue-900/20", headerBg: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400", icon: UserPlus },
              { id: "DocsPending", label: "Documents Pending", statuses: ["REVIEWING", "INTERVIEW_SCHEDULED"], bg: "bg-amber-50/20 border-amber-100 dark:bg-amber-950/5 dark:border-amber-900/20", headerBg: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400", icon: Clock },
              { id: "Orientation", label: "Orientation", statuses: ["APPROVED"], bg: "bg-emerald-50/20 border-emerald-100 dark:bg-emerald-950/5 dark:border-emerald-900/20", headerBg: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400", icon: CheckCircle2 },
              { id: "Active", label: "Active Caregivers", statuses: ["HIRED"], bg: "bg-indigo-50/20 border-indigo-100 dark:bg-indigo-950/5 dark:border-indigo-900/20", headerBg: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400", icon: CheckCircle },
            ].map((col) => {
              const colApps = filteredApps.filter((app: any) => col.statuses.includes(app.status));
              const ColumnIcon = col.icon;
              return (
                <div key={col.id} className={`border rounded-xl shadow-sm ${col.bg} flex flex-col min-h-[500px] overflow-hidden`}>
                  {/* Column Header */}
                  <div className={`p-4 border-b flex items-center justify-between font-bold ${col.headerBg}`}>
                    <div className="flex items-center gap-2 text-sm">
                      <ColumnIcon className="w-4 h-4 shrink-0" />
                      <span>{col.label}</span>
                    </div>
                    <span className="text-xs bg-background px-2 py-0.5 rounded-full shadow-sm border font-bold">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards list */}
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
                    {colApps.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-10">No candidates in this stage</p>
                    ) : (
                      colApps.map((app: any) => {
                        const totalDocs = app.documents?.length || 0;
                        const uploadedDocs = app.documents?.filter((d: any) => d.status !== "PENDING").length || 0;
                        const percentage = totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;
                        return (
                          <div
                            key={app.id}
                            className="bg-card border rounded-lg p-4 shadow-sm hover:shadow transition-all space-y-3 cursor-pointer relative group/card"
                            onClick={() => router.push(`/admin/applications/${app.id}`)}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-semibold text-sm group-hover/card:text-primary transition-colors">
                                  {app.user?.firstName} {app.user?.lastName}
                                </h4>
                                <p className="text-[10px] text-muted-foreground">{app.user?.email}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/admin/applications/${app.id}`);
                                }}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-xs font-semibold text-foreground/80">
                              {app.job?.title || "General Application"}
                            </div>

                            {/* Documents progress */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                <span>Forms Progress</span>
                                <span>{uploadedDocs}/{totalDocs} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Quick status selector */}
                            <div className="flex items-center justify-between gap-1 pt-2 border-t border-muted/55" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Stage:</span>
                              <select
                                value={app.status}
                                onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                                className="border rounded px-1.5 py-0.5 text-[10px] bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium"
                              >
                                <option value="PENDING">Applied</option>
                                <option value="REVIEWING">Reviewing</option>
                                <option value="INTERVIEW_SCHEDULED">Interview</option>
                                <option value="APPROVED">Orientation</option>
                                <option value="HIRED">Active Caregiver</option>
                                <option value="REJECTED">Reject / Archive</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
