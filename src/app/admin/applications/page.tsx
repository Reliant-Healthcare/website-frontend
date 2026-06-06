"use client";

import { useState } from "react";
import { Download, Search, Filter, FileText, CheckCircle, XCircle, Loader2, Eye, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { applicationsApi } from "@/lib/api";

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and manage incoming candidate applications.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status] || "bg-gray-100 text-gray-800"}`}>
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
    </div>
  );
}
