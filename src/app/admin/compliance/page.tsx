"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  Calendar, 
  FileText,
  Clock,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface ComplianceDoc {
  id: string;
  caregiverName: string;
  email: string;
  applicationId: string;
  documentName: string;
  expirationDate: string;
}

export default function CompliancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "expired" | "expiring" | "compliant">("all");
  const [remindedDocs, setRemindedDocs] = useState<Record<string, boolean>>({});

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => applicationsApi.getAll(),
  });

  const sendReminderMutation = useMutation({
    mutationFn: (docId: string) => applicationsApi.sendDocumentExpirationReminder(docId),
    onSuccess: (_, docId) => {
      setRemindedDocs((prev) => ({ ...prev, [docId]: true }));
      setTimeout(() => {
        setRemindedDocs((prev) => ({ ...prev, [docId]: false }));
      }, 5000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to send email reminder");
    }
  });

  // Extract approved documents with an expiration date
  const allDocs: ComplianceDoc[] = (applications || []).flatMap((app: any) =>
    (app.documents || [])
      .filter((doc: any) => doc.status === "APPROVED" && doc.expirationDate)
      .map((doc: any) => ({
        id: doc.id,
        caregiverName: `${app.user?.firstName || "Unknown"} ${app.user?.lastName || "User"}`,
        email: app.user?.email || "",
        applicationId: app.id,
        documentName: doc.section?.name || "Document",
        expirationDate: doc.expirationDate,
      }))
  );

  const getDocStatus = (expDateStr: string) => {
    const expDate = new Date(expDateStr);
    const now = new Date();
    // Normalize dates to mid-night for day counts
    const d1 = Date.UTC(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const d2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        label: "Expired",
        color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
        days: diffDays,
        status: "expired" as const,
      };
    }
    if (diffDays <= 30) {
      return {
        label: "Expiring Soon",
        color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
        days: diffDays,
        status: "expiring" as const,
      };
    }
    return {
      label: "Compliant",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
      days: diffDays,
      status: "compliant" as const,
    };
  };

  const docStats = allDocs.reduce(
    (acc, d) => {
      const statusInfo = getDocStatus(d.expirationDate);
      acc[statusInfo.status]++;
      acc.total++;
      return acc;
    },
    { total: 0, expired: 0, expiring: 0, compliant: 0 }
  );

  const filteredDocs = allDocs.filter((doc) => {
    const statusInfo = getDocStatus(doc.expirationDate);
    const matchesStatus = statusFilter === "all" || statusInfo.status === statusFilter;
    
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      doc.caregiverName.toLowerCase().includes(q) ||
      doc.email.toLowerCase().includes(q) ||
      doc.documentName.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance & Document Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor caregiver document validity, manage expiration dates, and send automatic or manual compliance warnings.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
              Total Checked
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground">{docStats.total}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-0.5">Monitored Documents</div>
          </div>
        </div>

        {/* Expired Card */}
        <button 
          onClick={() => setStatusFilter("expired")}
          className={`bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[130px] hover:border-rose-500/50 hover:shadow-md transition-all text-left group ${
            statusFilter === "expired" ? "ring-2 ring-rose-500 border-transparent" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-950/30 dark:text-rose-400">
              Action Required
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {docStats.expired}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground mt-0.5">Expired Documents</div>
          </div>
        </button>

        {/* Expiring Soon Card */}
        <button
          onClick={() => setStatusFilter("expiring")}
          className={`bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[130px] hover:border-amber-500/50 hover:shadow-md transition-all text-left group ${
            statusFilter === "expiring" ? "ring-2 ring-amber-500 border-transparent" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400">
              30 Days Limit
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {docStats.expiring}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground mt-0.5">Expiring Within 30 Days</div>
          </div>
        </button>

        {/* Compliant Card */}
        <button
          onClick={() => setStatusFilter("compliant")}
          className={`bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[130px] hover:border-emerald-500/50 hover:shadow-md transition-all text-left group ${
            statusFilter === "compliant" ? "ring-2 ring-emerald-500 border-transparent" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
              Compliant
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {docStats.compliant}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground mt-0.5">Fully Valid Documents</div>
          </div>
        </button>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by caregiver name, email, or document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === "all" ? "bg-primary text-primary-foreground border-transparent" : "bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === "expired" ? "bg-rose-600 text-white border-transparent" : "bg-background hover:bg-muted text-rose-600 border-rose-200"
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setStatusFilter("expiring")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === "expiring" ? "bg-amber-500 text-white border-transparent" : "bg-background hover:bg-muted text-amber-600 border-amber-200"
              }`}
            >
              Expiring Soon
            </button>
            <button
              onClick={() => setStatusFilter("compliant")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === "compliant" ? "bg-emerald-600 text-white border-transparent" : "bg-background hover:bg-muted text-emerald-600 border-emerald-200"
              }`}
            >
              Compliant
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" /> Loading records...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 text-emerald-500/40 mb-3" />
              <p className="font-semibold text-foreground">No documents found matching this filter</p>
              <p className="text-xs mt-1">All caregivers seem compliant in this category.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-semibold">Caregiver</th>
                  <th className="px-6 py-3 font-semibold">Document Name</th>
                  <th className="px-6 py-3 font-semibold">Expiration Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Time Remaining</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocs.map((doc) => {
                  const statusInfo = getDocStatus(doc.expirationDate);
                  const isReminded = remindedDocs[doc.id];
                  return (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/applications/${doc.applicationId}`}
                          className="font-semibold text-primary hover:underline block"
                        >
                          {doc.caregiverName}
                        </Link>
                        <span className="text-xs text-muted-foreground">{doc.email}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {doc.documentName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          {new Date(doc.expirationDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {statusInfo.status === "expired" ? (
                          <span className="text-rose-600">
                            Expired {Math.abs(statusInfo.days)} days ago
                          </span>
                        ) : statusInfo.status === "expiring" ? (
                          <span className="text-amber-600">
                            {statusInfo.days} days left
                          </span>
                        ) : (
                          <span className="text-emerald-600">
                            {statusInfo.days} days left
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => sendReminderMutation.mutate(doc.id)}
                          disabled={sendReminderMutation.isPending || isReminded}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                            isReminded
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-primary text-primary-foreground border-transparent hover:bg-primary/95 disabled:opacity-50"
                          }`}
                        >
                          {sendReminderMutation.isPending && sendReminderMutation.variables === doc.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isReminded ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Mail className="w-3 h-3" />
                          )}
                          {isReminded ? "Sent Reminder" : "Send Reminder"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground font-semibold bg-muted/20">
          <div>Showing {filteredDocs.length} of {docStats.total} monitored documents</div>
        </div>
      </div>
    </div>
  );
}
