"use client";

import { Users, FileText, Activity, ArrowUpRight, Clock, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";

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
        {/* Pending Applications Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              In Review
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground">{stats.pendingApplications}</div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">Pending Applications</div>
          </div>
        </div>
        
        {/* Total Registered Talent Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Talent Pool
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground">{stats.activeEmployees}</div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">Registered Candidates</div>
          </div>
        </div>

        {/* LMS completions Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Training
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground">{stats.lmsCompletions}</div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">LMS Course Completions</div>
          </div>
        </div>

        {/* Scheduled Interviews Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Interviews
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-foreground">{stats.interviewsScheduled}</div>
            <div className="text-sm font-semibold text-muted-foreground mt-0.5">Interviews Scheduled</div>
          </div>
        </div>
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
    </div>
  );
}
