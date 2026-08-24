"use client";

import { ArrowUpRight, Clock, Loader2, ShieldAlert, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi, aiApi } from "@/lib/api";

const appStatusConfig: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  REVIEWING: "bg-blue-100 text-blue-800",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  HIRED: "bg-emerald-100 text-emerald-800",
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => applicationsApi.getDashboardStats(),
    refetchInterval: 5000, // Automatic live update every 5 seconds!
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Gathering live agency statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-800 rounded-2xl p-6 text-center max-w-xl mx-auto my-12">
        <h3 className="font-bold text-lg">Unable to load dashboard stats</h3>
        <p className="text-sm mt-1">Please make sure the NestJS backend and database are running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time clinical onboarding & systems telemetry for Reliant Home Health.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* New Applications Card */}
        <Link href="/admin/applications" className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-blue-500/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full dark:bg-blue-950/30 dark:text-blue-400">
              Applied
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {stats.newApplications ?? 0}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">New Applications</div>
          </div>
        </Link>
        
        {/* Pending Applications Card */}
        <Link href="/admin/applications" className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-amber-500/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400">
              In Review
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {stats.pendingApplications ?? 0}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">Pending Applications</div>
          </div>
        </Link>

        {/* Ready for Orientation Card */}
        <Link href="/admin/applications" className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-emerald-500/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
              Approved
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {stats.readyForOrientation ?? 0}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">Ready for Orientation</div>
          </div>
        </Link>

        {/* Compliance Reminders Card */}
        <Link href="/admin/compliance" className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-rose-500/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-950/30 dark:text-rose-400">
              Reminders
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
              {stats.complianceReminders ?? 0}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">Compliance Reminders</div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Applications List */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between bg-muted/10">
            <h2 className="text-lg font-bold text-foreground">Recent Applications</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-primary hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y flex-1">
            {!stats.recentApplications || stats.recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16 italic">No applications received yet.</p>
            ) : (
              stats.recentApplications.map((app: any) => (
                <Link
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{app.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{app.role}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${appStatusConfig[app.status] || "bg-gray-100 text-gray-800"}`}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Global Recent Activity Log */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-muted/10">
            <h2 className="text-lg font-bold text-foreground">Recent System Actions</h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[380px]">
            {!stats.recentActivities || stats.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16 italic">No logs recorded yet.</p>
            ) : (
              <div className="relative border-l border-muted ml-3 space-y-6">
                {stats.recentActivities.map((activity: any, i: number) => (
                  <div key={i} className="relative pl-6 group">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border bg-background group-hover:scale-125 transition-transform duration-200" />
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">{activity.title}</div>
                    <p className="text-xs text-foreground/90 font-medium">{activity.desc}</p>
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground/60" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Student Telemetry & Question Pattern Analytics Section */}
      <AiAnalyticsWidget />
    </div>
  );
}

function AiAnalyticsWidget() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["aiAnalyticsSummary"],
    queryFn: () => aiApi.getAnalyticsSummary().then((r) => r.data),
    refetchInterval: 10000,
  });

  if (isLoading || !analytics) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[140px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground font-medium">Gathering AI Student Telemetry & Category Patterns...</span>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            AI Student Telemetry & Question Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time categorization of student questions, clinical topics, and support escalations.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          <div className="bg-muted px-3 py-1.5 rounded-lg border">
            Total Chats: <span className="text-foreground font-bold">{analytics.totalConversations ?? 0}</span>
          </div>
          <div className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
            Escalated to Human: <span className="font-bold">{analytics.escalationCount ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown List */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            Question Category Distribution
          </h3>
          {!analytics.categoryBreakdown || analytics.categoryBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-6">No student questions logged yet.</p>
          ) : (
            <div className="space-y-2.5">
              {analytics.categoryBreakdown.map((item: any) => {
                const percentage =
                  analytics.totalMessages > 0
                    ? Math.round((item.count / analytics.totalMessages) * 100)
                    : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {item.category.replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {item.count} questions ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Student Inquiries */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            Recent Student & Applicant AI Messages
          </h3>
          {!analytics.recentActivity || analytics.recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-6">No recent AI inquiries.</p>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {analytics.recentActivity.map((act: any) => (
                <div
                  key={act.conversationId}
                  className="p-3 bg-muted/20 border rounded-lg hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-foreground">{act.user}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      {act.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">"{act.lastMessage}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
