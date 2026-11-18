"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Upload, CheckCircle2, Clock, XCircle,
  Loader2, AlertCircle, Lock, ChevronRight, LogOut, User,
  Shield, Bell, KeyRound, BookOpen, Video, Award, Settings,
  Check, Play, ArrowRight, BookOpenCheck, ChevronLeft, Printer,
  MessageSquare, Sparkles, Bot, Send, ShieldAlert, Plus, Trash2, Save,
  ZoomIn, Eye, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, authApi, coursesApi, aiApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import SignaturePad from "@/components/SignaturePad";
import DatePicker from "@/components/DatePicker";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const resolveMediaUrl = (url?: string | null) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("data:")) return url;
  if (url.includes("/upload/view")) return url;

  // Cloud storage / DigitalOcean Spaces files route through backend proxy for streaming & auth
  if (url.includes("digitaloceanspaces.com") || url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const baseUrl = API_URL.replace(/\/+$/, "");
    return `${baseUrl}/upload/view?url=${encodeURIComponent(url)}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = API_URL.replace(/\/+$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

const cacheUploadedScan = (fieldId: string, url: string) => {
  if (!url || typeof window === "undefined") return;
  try {
    const fLower = (fieldId || "").toLowerCase();
    const existing = JSON.parse(localStorage.getItem("reliant_candidate_scans") || "{}");
    if (fLower === "id_card_front" || fLower === "id_doc_front" || fLower === "drivers_license_front" || fLower === "photo_id_front" || fLower === "driver_license") {
      existing.id_front = url;
    } else if (fLower === "id_card_back" || fLower === "id_doc_back" || fLower === "drivers_license_back" || fLower === "photo_id_back") {
      existing.id_back = url;
    } else if (fLower === "ssn_card_front" || fLower === "work_auth_doc" || fLower === "ssn_card" || fLower === "social_security_card") {
      existing.ssn_front = url;
    } else if (fLower === "ssn_card_back") {
      existing.ssn_back = url;
    } else if (fLower === "voided_check_file" || fLower === "direct_deposit_proof") {
      existing.voided_check = url;
    } else if (fLower === "tb_clearance_file") {
      existing.tb_clearance = url;
    }
    localStorage.setItem("reliant_candidate_scans", JSON.stringify(existing));
  } catch {}
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
  PENDING: { color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", icon: Clock, label: "Awaiting Upload" },
  UPLOADED: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: Upload, label: "Under Review" },
  APPROVED: { color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, label: "Approved" },
  REJECTED: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: XCircle, label: "Needs Revision" },
};

const appStatusLabel: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Pending Review", color: "bg-amber-100 text-amber-800" },
  REVIEWING: { text: "Under Review", color: "bg-blue-100 text-blue-800" },
  INTERVIEW_SCHEDULED: { text: "Interview Scheduled", color: "bg-purple-100 text-purple-800" },
  APPROVED: { text: "Approved", color: "bg-emerald-100 text-emerald-800" },
  REJECTED: { text: "Rejected", color: "bg-red-100 text-red-800" },
  HIRED: { text: "Hired!", color: "bg-emerald-100 text-emerald-800" },
};

function PortalContent() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Read initial states from URL params or sessionStorage for full-application reload persistence
  const initialTab = (searchParams?.get("tab") as "applications" | "courses" | "certificates") || 
    (typeof window !== "undefined" ? sessionStorage.getItem("reliant_portal_tab") as any : null) || "applications";
  const initialCourseId = searchParams?.get("courseId") || 
    (typeof window !== "undefined" ? sessionStorage.getItem("reliant_portal_courseId") : null) || null;
  const initialLessonId = searchParams?.get("lessonId") || 
    (typeof window !== "undefined" ? sessionStorage.getItem("reliant_portal_lessonId") : null) || null;

  const [activeTab, setActiveTabState] = useState<"applications" | "courses" | "certificates">(initialTab);
  const [activeCourseId, setActiveCourseIdState] = useState<string | null>(initialCourseId);
  const [activeLessonId, setActiveLessonIdState] = useState<string | null>(initialLessonId);
  const [viewingCertificate, setViewingCertificate] = useState<any | null>(null);

  // Sync state reactively when search params change (direct URL entry, back/forward navigation)
  useEffect(() => {
    if (!searchParams) return;
    const urlTab = searchParams.get("tab") as "applications" | "courses" | "certificates" | null;
    const urlCourseId = searchParams.get("courseId");
    const urlLessonId = searchParams.get("lessonId");

    if (urlTab && ["applications", "courses", "certificates"].includes(urlTab) && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
    if (urlCourseId !== activeCourseId) {
      setActiveCourseIdState(urlCourseId);
    }
    if (urlLessonId !== activeLessonId) {
      setActiveLessonIdState(urlLessonId);
    }
  }, [searchParams]);

  // Helper function for full-application state persistence sync
  const updatePortalState = (tab: "applications" | "courses" | "certificates", courseId: string | null = null, lessonId: string | null = null) => {
    setActiveTabState(tab);
    setActiveCourseIdState(courseId);
    setActiveLessonIdState(lessonId);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("reliant_portal_tab", tab);
      if (courseId) sessionStorage.setItem("reliant_portal_courseId", courseId);
      else sessionStorage.removeItem("reliant_portal_courseId");
      if (lessonId) sessionStorage.setItem("reliant_portal_lessonId", lessonId);
      else sessionStorage.removeItem("reliant_portal_lessonId");

      const params = new URLSearchParams(window.location.search);
      params.set("tab", tab);
      if (courseId) params.set("courseId", courseId);
      else params.delete("courseId");
      if (lessonId) params.set("lessonId", lessonId);
      else params.delete("lessonId");

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const setActiveTab = (tab: "applications" | "courses" | "certificates") => updatePortalState(tab, activeCourseId, activeLessonId);
  const setActiveCourseId = (courseId: string | null) => updatePortalState(activeTab, courseId, null);
  const setActiveLessonId = (lessonId: string | null) => updatePortalState(activeTab, activeCourseId, lessonId);
  const launchCourse = (courseId: string, lessonId: string | null = null) => updatePortalState("courses", courseId, lessonId);
  const closeCoursePlayer = () => updatePortalState(activeTab, null, null);

  // Query applicant applications
  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.getMyApplications(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Query training courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => coursesApi.getAll(),
  });

  // Query real certificates
  const { data: certificates = [], isLoading: isLoadingCerts } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => coursesApi.getMyCertificates(),
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const showPasswordPrompt = user?.mustChangePassword;

  // Compute actual dynamic telemetry stats from active database queries
  const enrolledCoursesCount = courses.length;
  const completedCoursesCount = certificates.length;
  const certificatesCount = certificates.length;

  return (
    <div className="min-h-[85vh] bg-muted/20 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-card border rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Welcome, {user?.firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Candidate & Employee Hub · Manage your journey with Reliant
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 border bg-background rounded-xl text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-destructive border border-destructive/15 bg-background rounded-xl text-sm font-medium hover:bg-destructive/5 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Password change alert */}
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Please change your password</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your account was created with a generated password. Please update it for security.
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Change Now
            </button>
          </motion.div>
        )}

        {/* ── Unification Tabs ────────────────────────────────────────────────── */}
        <div className="flex border-b border-muted mb-8 gap-1 sm:gap-2 bg-card/45 px-4 pt-2 rounded-t-2xl">
          {[
            { id: "applications", label: "My Applications", icon: FileText },
            { id: "courses", label: "Learning Center (LMS)", icon: BookOpen },
            { id: "certificates", label: "My Certificates", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "applications" && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {isLoadingApps ? (
                <div className="flex items-center justify-center py-20 bg-card border rounded-2xl shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : applications.length === 0 ? (
                <div className="bg-card border rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No Active Applications</h2>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start your journey with Reliant Home Health by submitting an application.
                  </p>
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow"
                  >
                    Browse Careers
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app: any) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Assigned Courses", value: enrolledCoursesCount, desc: "Mandatory training modules" },
                  { label: "Completed Modules", value: completedCoursesCount, desc: "Successfully finished modules" },
                  { label: "Earned CEUs", value: (certificatesCount * 1.5).toFixed(1), desc: "Continuing Education Units", highlight: true },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-card border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-3xl font-extrabold mt-2 ${stat.highlight ? "text-primary bg-primary/5 border px-3 py-1 rounded-xl w-fit" : ""}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Recommended Courses List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">LMS Course Catalog</h3>
                  <span className="text-xs font-medium text-muted-foreground">Assigned by recruiter</span>
                </div>

                {isLoadingCourses ? (
                  <div className="flex items-center justify-center py-10 bg-card border rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : courses.length === 0 ? (
                  <div className="bg-card border rounded-2xl p-8 text-center">
                    <BookOpenCheck className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                    <p className="font-semibold text-muted-foreground">No active training courses found</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any, idx: number) => {
                      const enrolled = course.enrollment;
                      const progress = enrolled?.progress || 0;
                      const isCompleted = enrolled?.status === "COMPLETED";

                      return (
                        <div 
                          key={course.id} 
                          onClick={() => launchCourse(course.id)}
                          className="bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-primary/40"
                        >
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  {course.category}
                                </span>
                                {course.isRequired ? (
                                  <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Required
                                  </span>
                                ) : (
                                  <span className="bg-muted border border-border text-muted-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Optional
                                  </span>
                                )}
                              </div>
                              {isCompleted ? (
                                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Completed
                                </span>
                              ) : progress > 0 ? (
                                <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {progress}% Progress
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground font-semibold">1.5 CEUs</span>
                              )}
                            </div>
                            <h4 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {course.description || "Comprehensive clinical guidelines and compliance training modules."}
                            </p>
                          </div>
                          
                          {/* Progress bar inside card if course has started */}
                          {progress > 0 && !isCompleted && (
                            <div className="px-5 pb-2">
                              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="p-5 border-t bg-muted/10 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                              <Video className="w-3.5 h-3.5 text-primary" /> Training Lecture
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                launchCourse(course.id);
                              }}
                              className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                            >
                              {isCompleted ? "Review Content" : progress > 0 ? "Resume Module" : "Launch Module"} 
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "certificates" && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-card border rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-lg">Earn Continuing Education Units (CEUs)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Completion certificates are immediately generated and available for offline print upon finishing 100% of all assigned curriculum modules.
                  </p>
                </div>
              </div>

              {/* Certificates List */}
              {isLoadingCerts ? (
                <div className="flex items-center justify-center py-20 bg-card border rounded-2xl">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : certificates.length === 0 ? (
                <div className="bg-card border rounded-2xl p-16 text-center text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="font-bold text-base">No Certificates Earned Yet</p>
                  <p className="text-xs mt-1">Complete your assigned training modules under the Learning Center tab to earn verified CEU certificates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert: any) => (
                    <div key={cert.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 text-emerald-600">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-snug">{cert.course?.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                            <span>Completed {new Date(cert.issuedAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="font-mono text-emerald-700">CE-{cert.id.split("-")[0].toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewingCertificate(cert)}
                        className="inline-flex h-9 items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary text-xs font-extrabold rounded-xl hover:text-white transition-all shrink-0 border border-primary/20"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print/View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LMS Player Full-Screen Modal */}
      <AnimatePresence>
        {activeCourseId && (
          <LMSPlayerModal
            courseId={activeCourseId}
            activeLessonId={activeLessonId}
            onActiveLessonChange={(lessonId) => {
              updatePortalState(activeTab, activeCourseId, lessonId);
            }}
            onClose={() => {
              closeCoursePlayer();
              queryClient.invalidateQueries({ queryKey: ["my-courses"] });
              queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
            }}
            onViewCertificate={(cert: any) => {
              setViewingCertificate(cert);
            }}
          />
        )}
      </AnimatePresence>

      {/* Clinical Printable Certificate Modal */}
      <AnimatePresence>
        {viewingCertificate && (
          <CertificateViewModal
            cert={viewingCertificate}
            onClose={() => setViewingCertificate(null)}
          />
        )}
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>

      {/* Embedded Floating AI Chatbot Companion */}
      <ChatbotCompanion activeTab={activeTab} />
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-muted/20 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}

// ── LMS Course Player Modal ─────────────────────────────────────────────────

function LMSPlayerModal({
  courseId,
  activeLessonId,
  onActiveLessonChange,
  onClose,
  onViewCertificate
}: {
  courseId: string;
  activeLessonId: string | null;
  onActiveLessonChange: (id: string | null) => void;
  onClose: () => void;
  onViewCertificate: (cert: any) => void;
}) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"content" | "quiz" | "final-exam">("content");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const { data: courseDetails, isLoading, isError } = useQuery({
    queryKey: ["portal-course-details", courseId],
    queryFn: () => coursesApi.getOne(courseId),
  });

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-course-details", courseId] });
    }
  });

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId: string) => coursesApi.completeLesson(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-course-details", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    }
  });

  // Automatically Enroll if not already enrolled when launching the player
  useEffect(() => {
    if (courseDetails && !courseDetails.enrollment) {
      enrollMutation.mutate();
    }
  }, [courseDetails]);

  // Handle auto-selection of first lesson or active lesson
  useEffect(() => {
    if (courseDetails?.lessons && courseDetails.lessons.length > 0 && !activeLessonId && viewMode === "content") {
      // Find the first uncompleted lesson
      const completedList = courseDetails.enrollment?.completedLessons || [];
      const uncompleted = courseDetails.lessons.find((l: any) => !completedList.includes(l.id));
      onActiveLessonChange(uncompleted ? uncompleted.id : courseDetails.lessons[0].id);
    }
  }, [courseDetails, activeLessonId]);

  // Reset quiz states when active lesson changes
  useEffect(() => {
    setAnswers({});
    setQuizResult(null);
    if (activeLessonId) {
      setViewMode("content");
    }
  }, [activeLessonId]);

  // Content Copy Protection (Anti-Theft)
  useEffect(() => {
    if (!courseDetails?.enableAntiTheft) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
      }
      if (e.metaKey && e.altKey && (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "j")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [courseDetails?.enableAntiTheft]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
          <p className="text-white text-sm font-semibold">Loading curriculum player...</p>
        </div>
      </div>
    );
  }

  if (isError || !courseDetails) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="font-bold text-lg">Unable to Launch Module</h3>
          <p className="text-xs text-muted-foreground">
            The requested course module could not be loaded or is currently unavailable.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-xs hover:bg-primary/90 transition-colors"
          >
            Return to Learning Center
          </button>
        </div>
      </div>
    );
  }

  const lessons = courseDetails.lessons || [];
  if (lessons.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-bold text-lg">{courseDetails.title || "Curriculum Module"}</h3>
          <p className="text-xs text-muted-foreground">
            This training module does not currently have any lessons assigned. Please contact the administrator.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-xs hover:bg-primary/90 transition-colors"
          >
            Return to Learning Center
          </button>
        </div>
      </div>
    );
  }
  const enrollment = courseDetails.enrollment;
  const progress = enrollment?.progress || 0;
  const completedLessons: string[] = enrollment?.completedLessons || [];

  const activeLesson = lessons.find((l: any) => l.id === activeLessonId) || lessons[0];
  const activeQuiz = activeLesson?.quizzes?.[0];
  const hasQuiz = !!activeQuiz;

  const mandatoryLessons = lessons.filter((l: any) => l.isRequired !== false);
  const allMandatoryCompleted = mandatoryLessons.length === 0 || mandatoryLessons.every((l: any) => completedLessons.includes(l.id));
  const allLessonsCompleted = lessons.length > 0 && lessons.every((l: any) => completedLessons.includes(l.id));
  const finalQuiz = courseDetails.quizzes?.[0];

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    if (hasQuiz) {
      setViewMode("quiz");
      setAnswers({});
      setQuizResult(null);
    } else {
      await completeLessonMutation.mutateAsync(activeLesson.id);
      const currentIndex = lessons.findIndex((l: any) => l.id === activeLesson.id);
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson) {
        onActiveLessonChange(nextLesson.id);
      }
    }
  };

  // Safe Embed YouTube Parser
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return null;
    try {
      // YouTube embed parser
      const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(ytReg);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
      }
      return url; // Return direct link or path if it's already an embed/MP4 path
    } catch (e) {
      return url;
    }
  };

  const isYouTube = activeLesson?.videoUrl?.includes("youtube") || activeLesson?.videoUrl?.includes("youtu.be");
  const parsedVideoSrc = activeLesson?.videoUrl ? getEmbedVideoUrl(activeLesson.videoUrl) : null;

  return (
    <div 
      className="fixed inset-0 bg-background z-50 flex flex-col font-sans"
    >
      {/* Top Banner Player Header */}
      <header className="h-16 border-b bg-card shrink-0 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-xl transition-all mr-2 flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-1">{courseDetails.title}</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Continuing Education Training</p>
          </div>
        </div>

        {/* Dynamic telemetry details progress */}
        {enrollment && (
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-foreground">{progress}% Completed</p>
              <div className="w-36 bg-muted h-2 rounded-full overflow-hidden mt-1 border">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
            
            {progress >= 100 && (
              <button
                onClick={async () => {
                  // Retrieve the actual certificate record
                  const certs = await coursesApi.getMyCertificates();
                  const thisCert = certs.find((c: any) => c.courseId === courseId);
                  if (thisCert) onViewCertificate(thisCert);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all animate-bounce"
              >
                <Award className="w-4 h-4" /> View Certificate
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main curriculum player screen splits */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left main pane: content reader and player */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {lessons.length === 0 ? (
              <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold text-lg">Curriculum coming soon</h3>
                <p className="text-xs text-muted-foreground mt-1">Recruiters are currently uploading lectures for this module.</p>
              </div>
            ) : viewMode === "content" ? (
              activeLesson ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        Topic {activeLesson.order || 1}
                      </span>
                      {activeLesson.isRequired === false ? (
                        <span className="text-[10px] font-semibold bg-muted text-muted-foreground border px-2.5 py-1 rounded-full">
                          Elective / Supplemental Study
                        </span>
                      ) : courseDetails?.title?.includes("OLTL") ? (
                        <span className="text-[10px] font-extrabold bg-red-500/10 text-red-600 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> 55 Pa. Code § 52.21 Mandatory Topic
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                          Mandatory Topic
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 text-foreground leading-tight">{activeLesson.title}</h1>
                  </div>

                  {/* Sleek aspect ratio video frame */}
                  {activeLesson.videoUrl && (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border relative group">
                      {isYouTube && parsedVideoSrc ? (
                        <iframe
                          src={parsedVideoSrc}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : activeLesson.videoUrl ? (
                        <video
                          src={activeLesson.videoUrl.startsWith('http') ? activeLesson.videoUrl : `${API_URL}${activeLesson.videoUrl}`}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white">
                          <p className="text-xs font-semibold">Video Unavailable</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reading content segment */}
                  {activeLesson.content && (
                    <div className="pt-4 border-t border-border/80">
                      <MarkdownRenderer content={activeLesson.content} />
                    </div>
                  )}

                  {/* Reading material file download */}
                  {activeLesson.readingFileUrl && (
                    <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">Reading Material</p>
                        <p className="text-xs text-muted-foreground truncate">{activeLesson.readingFilename || "Attached document"}</p>
                      </div>
                      <a
                        href={activeLesson.readingFileUrl.startsWith('http') ? activeLesson.readingFileUrl : `${API_URL}${activeLesson.readingFileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={activeLesson.readingFilename || "reading-material"}
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-primary/90 transition-all shadow-sm shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}

                </div>
              ) : null
            ) : (
              <div className="space-y-8 p-4 max-w-2xl mx-auto">
                <div className="border-b pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    {viewMode === "final-exam" ? "Final Exam" : "Lesson Evaluation"}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black mt-3 text-foreground leading-tight">
                    {viewMode === "final-exam" ? `${courseDetails.title} Final Examination` : `${activeLesson.title} Quiz`}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
                    {viewMode === "final-exam" 
                      ? "Answer all questions. Minimum passing score of 80% is required to earn your certificate." 
                      : "Review quiz. 100% score required to mark this topic complete."}
                  </p>
                </div>

                {quizResult ? (
                  <div className="bg-card border rounded-2xl p-6 text-center space-y-4 shadow-sm">
                    {quizResult.passed ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-lg text-emerald-800">Congratulations! You Passed!</h3>
                        <p className="text-sm font-semibold text-muted-foreground">
                          Score: <span className="text-foreground font-extrabold">{quizResult.score}%</span> ({quizResult.correctCount} of {quizResult.totalQuestions} correct)
                        </p>
                        {viewMode === "final-exam" ? (
                          <div className="pt-2">
                            {quizResult.requiresAttestationSignOff ? (
                              <AttestationSignOff
                                courseTitle={courseDetails.title}
                                onAttestationComplete={async (signatureUrl) => {
                                  try {
                                    await coursesApi.attest(courseId, signatureUrl);
                                    queryClient.invalidateQueries({ queryKey: ["my-courses"] });
                                    queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
                                    queryClient.invalidateQueries({ queryKey: ["portal-course-details", courseId] });
                                    setQuizResult({
                                      ...quizResult,
                                      requiresAttestationSignOff: false
                                    });
                                  } catch (err) {
                                    alert("Failed to submit attestation signature. Please try again.");
                                  }
                                }}
                              />
                            ) : (
                              <>
                                <p className="text-xs text-muted-foreground mb-4 font-medium">Your certificate has been issued and is available in your Learning Center portal.</p>
                                <button
                                  onClick={async () => {
                                    const certs = await coursesApi.getMyCertificates();
                                    const thisCert = certs.find((c: any) => c.courseId === courseId);
                                    if (thisCert) {
                                      onViewCertificate(thisCert);
                                    } else {
                                      onClose();
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all mx-auto"
                                >
                                  <Award className="w-4 h-4" /> View My Certificate
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setViewMode("content");
                              setQuizResult(null);
                              setAnswers({});
                              const currentIndex = lessons.findIndex((l: any) => l.id === activeLesson.id);
                              const nextLesson = lessons[currentIndex + 1];
                              if (nextLesson) {
                                onActiveLessonChange(nextLesson.id);
                              }
                            }}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-primary/90 transition-all shadow-sm mx-auto flex items-center gap-1"
                          >
                            Proceed to Next Topic <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                          <XCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-lg text-rose-800">Evaluation Not Passed</h3>
                        <p className="text-sm font-semibold text-muted-foreground">
                          Score: <span className="text-rose-600 font-extrabold">{quizResult.score}%</span> ({quizResult.correctCount} of {quizResult.totalQuestions} correct)
                        </p>
                        <p className="text-xs text-muted-foreground font-semibold">Minimum score required is {viewMode === "final-exam" ? "80%" : "100%"}. You can retake the evaluation at any time.</p>
                        <button
                          onClick={() => {
                            setQuizResult(null);
                            setAnswers({});
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm mx-auto"
                        >
                          Retry Evaluation
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8 pb-10">
                    {(viewMode === "final-exam" ? finalQuiz : activeLesson.quizzes?.[0])?.questions.map((q: any, qIdx: number) => (
                      <div key={q.id} className="space-y-3 border-b pb-6 last:border-0">
                        <p className="font-bold text-sm text-foreground">
                          {qIdx + 1}. {q.text}
                        </p>
                        <div className="grid gap-2.5">
                          {q.options.map((opt: string, oIdx: number) => {
                            const isSelected = answers[qIdx] === oIdx;
                            return (
                              <button
                                key={opt}
                                onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                                  isSelected 
                                    ? "bg-primary/5 border-primary text-primary font-bold shadow-sm" 
                                    : "bg-card border-border hover:bg-muted/15 text-foreground/80"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center gap-4 border-t pt-6 bg-background">
                      <button
                        onClick={() => setViewMode("content")}
                        className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                      >
                        Back to Study Guide
                      </button>
                      <button
                        onClick={async () => {
                          const currentQuiz = viewMode === "final-exam" ? finalQuiz : activeLesson.quizzes?.[0];
                          if (!currentQuiz) return;
                          
                          const answeredCount = Object.keys(answers).length;
                          if (answeredCount < currentQuiz.questions.length) {
                            alert("Please answer all questions before submitting.");
                            return;
                          }

                          setSubmittingQuiz(true);
                          try {
                            const ansArray = Object.keys(answers).sort((a,b) => parseInt(a) - parseInt(b)).map(k => answers[parseInt(k)]);
                            const res = await coursesApi.submitQuizAttempt(courseId, currentQuiz.id, ansArray);
                            
                            if (viewMode === "quiz" && res.passed) {
                              await completeLessonMutation.mutateAsync(activeLesson.id);
                            }

                            setQuizResult(res);
                          } catch (e) {
                            alert("Error submitting quiz attempt. Please try again.");
                          } finally {
                            setSubmittingQuiz(false);
                          }
                        }}
                        disabled={submittingQuiz || Object.keys(answers).length < (viewMode === "final-exam" ? finalQuiz : activeLesson.quizzes?.[0])?.questions.length}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-extrabold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submittingQuiz ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Submit Answers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer action completion locks */}
          {lessons.length > 0 && activeLesson && viewMode === "content" && (
            <div className="max-w-3xl mx-auto w-full border-t pt-6 mt-8 flex justify-between items-center gap-4 bg-background px-8 pb-4">
              <div className="text-xs text-muted-foreground font-semibold">
                {completedLessons.includes(activeLesson.id) ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> You've read/watched this topic.
                  </span>
                ) : (
                  <span>Ensure you review all video and text guides before evaluation.</span>
                )}
              </div>

              {!completedLessons.includes(activeLesson.id) ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={completeLessonMutation.isPending}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-extrabold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {completeLessonMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : hasQuiz ? (
                    <ArrowRight className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {hasQuiz ? "Take Quiz" : "Mark Topic Complete"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    const currentIndex = lessons.findIndex((l: any) => l.id === activeLesson.id);
                    const nextLesson = lessons[currentIndex + 1];
                    if (nextLesson) {
                      onActiveLessonChange(nextLesson.id);
                    } else if (allLessonsCompleted && finalQuiz) {
                      onActiveLessonChange(null);
                      setViewMode("final-exam");
                    } else {
                      alert("You have completed all topics! Click Final Examination in syllabus to finish.");
                    }
                  }}
                  className="bg-muted hover:bg-muted-foreground/15 border text-foreground px-6 py-3 rounded-xl text-sm font-extrabold transition-all flex items-center gap-1"
                >
                  Next Topic <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Pane Sidebar: Course Syllabus Topics */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l bg-card shrink-0 flex flex-col overflow-hidden">
          <div className="p-5 border-b bg-muted/15">
            <h3 className="font-extrabold text-sm text-foreground">Course Syllabus</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Click any topic to navigate or review lessons</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {lessons.map((lesson: any, index: number) => {
              const isSelected = lesson.id === activeLessonId && viewMode !== "final-exam";
              const isDone = completedLessons.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onActiveLessonChange(lesson.id);
                    setViewMode("content");
                  }}
                  className={`w-full text-left p-4.5 transition-all flex items-start gap-3.5 hover:bg-muted/15 ${
                    isSelected ? "bg-primary/5 text-primary border-l-4 border-primary" : "text-foreground"
                  }`}
                >
                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                      isSelected ? "border-primary text-primary bg-primary/5" : "text-muted-foreground"
                    }`}>
                      {index + 1}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`text-xs font-bold leading-snug ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {lesson.title}
                      </p>
                      {lesson.isRequired === false ? (
                        <span className="text-[9px] font-semibold bg-muted text-muted-foreground border px-1.5 py-0.2 rounded-full">
                          Elective
                        </span>
                      ) : courseDetails?.title?.includes("OLTL") ? (
                        <span className="text-[9px] font-extrabold bg-red-500/10 text-red-600 border border-red-200 px-1.5 py-0.2 rounded-full">
                          55 Pa. Code § 52.21 Mandatory
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-amber-500/10 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[9px] font-semibold text-muted-foreground/80 uppercase">
                      {lesson.videoUrl && <span className="flex items-center gap-0.5"><Video className="w-3 h-3" /> Video</span>}
                      {lesson.content && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> Reading</span>}
                      {lesson.readingFileUrl && <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> Doc</span>}
                      {lesson.quizzes?.length > 0 && <span className="flex items-center gap-0.5 bg-primary/5 text-primary px-1 rounded"><Award className="w-2.5 h-2.5" /> Quiz</span>}
                    </div>
                  </div>
                </button>
              );
            })}

            {finalQuiz && (
              <button
                disabled={!allMandatoryCompleted}
                onClick={() => {
                  if (allMandatoryCompleted) {
                    onActiveLessonChange(null);
                    setViewMode("final-exam");
                    setAnswers({});
                    setQuizResult(null);
                  }
                }}
                className={`w-full text-left p-4.5 transition-all flex items-start gap-3.5 hover:bg-muted/15 border-t border-dashed ${
                  viewMode === "final-exam" 
                    ? "bg-primary/5 text-primary border-l-4 border-primary" 
                    : !allMandatoryCompleted ? "opacity-60 cursor-not-allowed bg-muted/20" : "text-foreground"
                }`}
                title={!allMandatoryCompleted ? "Complete all mandatory topics to unlock the Final Examination" : "Take Final Examination"}
              >
                {progress >= 100 ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                ) : !allMandatoryCompleted ? (
                  <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-extrabold text-foreground">
                      Course Final Examination
                    </p>
                    {!allMandatoryCompleted && (
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {!allMandatoryCompleted 
                      ? `Complete all mandatory topics to unlock (${completedLessons.filter(id => mandatoryLessons.some((m: any) => m.id === id)).length}/${mandatoryLessons.length} finished)` 
                      : `${finalQuiz.questions?.length || 20} evaluation questions (80% passing score)`}
                  </p>
                </div>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Custom Printable Certificate View Modal ──────────────────────────────────

function CertificateViewModal({
  cert,
  onClose
}: {
  cert: any;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Certificate - Reliant Home Health</title>
              <style>
                @media print {
                  body { margin: 0; padding: 20px; font-family: sans-serif; background: white; -webkit-print-color-adjust: exact; }
                  .cert-border { border: 15px double #0d3b66; padding: 40px; text-align: center; border-radius: 8px; position: relative; }
                  .cert-gold { border: 4px solid #f4d35e; margin: 5px; height: 95%; }
                  .cert-title { font-size: 34px; font-weight: 900; color: #0d3b66; text-transform: uppercase; margin-bottom: 20px; }
                  .cert-sub { font-size: 14px; font-style: italic; color: #666; margin-bottom: 40px; }
                  .cert-name { font-size: 26px; font-weight: 800; text-decoration: underline; color: #111; margin-bottom: 30px; }
                  .cert-desc { font-size: 13px; color: #333; max-width: 500px; margin: 0 auto 40px auto; line-height: 1.6; }
                  .cert-course { font-size: 18px; font-weight: bold; color: #0d3b66; }
                  .cert-footer { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
                  .cert-sign { border-top: 1px solid #999; width: 160px; font-size: 11px; padding-top: 8px; color: #444; }
                  .cert-meta { font-size: 10px; color: #777; margin-top: 50px; }
                  .cert-sign-container { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; max-width: 600px; margin-left: auto; margin-right: auto; gap: 40px; }
                  .cert-sign-col { width: 140px; text-align: center; font-size: 9px; }
                  .cert-sign-border { border-top: 1px solid #ccc; padding-top: 6px; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        }, 500);
      }
    }
  };

  const formattedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certCode = `CE-${cert.id.split("-")[0].toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border p-6 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between shrink-0 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Continuing Education Certificate
            </h2>
            <p className="text-xs text-muted-foreground">Clinical CEU verified certificates and print portal</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted border rounded-xl">
            <XCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Interactive Printable Area */}
        <div className="border bg-white rounded-xl p-8 md:p-14 text-center select-none shadow-inner overflow-hidden relative" style={{ color: "#000" }}>
          <div ref={printRef} className="cert-border border-[14px] border-double border-[#0d3b66] p-6 md:p-10 rounded-xl relative">
            <div className="border-4 border-[#f4d35e] m-1 p-8 md:p-12 relative">
              
              {/* Seal emblem */}
              <div className="absolute top-4 right-4 w-16 h-16 opacity-30 md:opacity-75">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#f4d35e] fill-current">
                  <path d="M50 0L61.2 15.3L80.1 12.3L77.1 31.2L92.4 42.4L80.1 53.6L80.1 72.5L61.2 72.5L50 87.8L38.8 72.5L19.9 72.5L19.9 53.6L7.6 42.4L19.9 31.2L19.9 12.3L38.8 15.3Z" />
                  <circle cx="50" cy="42.4" r="25" className="text-[#0d3b66]" />
                </svg>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-[#0d3b66] tracking-wider uppercase mb-2">
                Certificate of Completion
              </h1>
              <p className="text-xs md:text-sm font-semibold italic text-muted-foreground/80 mb-8">
                Reliant Home Health Agency Continuing Education Portal
              </p>

              <p className="text-xs md:text-sm text-foreground/90 font-medium mb-4">
                This certifies that clinical candidate
              </p>
              <h2 className="text-xl md:text-3xl font-extrabold text-black underline mb-6 tracking-wide">
                {cert.user?.firstName} {cert.user?.lastName}
              </h2>
              
              <p className="text-xs md:text-sm text-foreground/90 font-medium max-w-xl mx-auto leading-relaxed mb-6">
                has successfully reviewed all clinical topics, passed the final curriculum evaluations, and successfully completed the continuing professional education course
              </p>

              <h3 className="text-lg md:text-xl font-bold text-[#0d3b66] uppercase mb-8 border-y-2 border-[#f4d35e]/40 py-2.5 max-w-lg mx-auto">
                {cert.course?.title}
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mt-12 max-w-2xl mx-auto border-t pt-8">
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-semibold">Verification Code</p>
                  <p className="text-xs font-mono font-bold text-emerald-700">{certCode}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-semibold">CEU Credit Hours</p>
                  <p className="text-xs font-bold text-[#0d3b66]">1.5 CEUs</p>
                </div>
                <div className="text-center sm:text-right space-y-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-semibold">Date of Issuance</p>
                  <p className="text-xs font-semibold text-black">{formattedDate}</p>
                </div>
              </div>

              {/* Digital clinical signatures */}
              <div className="cert-sign-container flex justify-between items-end gap-10 mt-14 max-w-2xl mx-auto">
                {cert.signature ? (
                  <div className="cert-sign-col w-36 text-center flex flex-col items-center">
                    <img src={cert.signature} alt="Employee Signature" className="max-h-[35px] object-contain mb-0.5" />
                    <div className="w-full cert-sign-border border-t border-muted/80 pt-1.5">
                      <p className="text-[9px] font-semibold text-black leading-none">{cert.user?.firstName} {cert.user?.lastName}</p>
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Employee Signature</p>
                    </div>
                  </div>
                ) : (
                  <div className="cert-sign-col w-36" />
                )}
                <div className="cert-sign-col w-36 cert-sign-border border-t border-muted/80 pt-1.5 text-center">
                  <p className="text-[9px] font-semibold font-serif text-[#0d3b66] italic mb-0.5 leading-none">Elizabeth Warren, RN</p>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Clinical Director</p>
                </div>
                <div className="cert-sign-col w-36 cert-sign-border border-t border-muted/80 pt-1.5 text-center">
                  <p className="text-[9px] font-semibold font-serif text-[#0d3b66] italic mb-0.5 leading-none">Arthur Pendragon</p>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Administrator</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end shrink-0 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
          >
            Close Viewer
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-primary/95 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Certificate
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ application }: { application: any }) {
  const queryClient = useQueryClient();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [fillingFormDoc, setFillingFormDoc] = useState<any | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ sectionId, file }: { sectionId: string; file: File }) =>
      applicationsApi.uploadDocument(application.id, sectionId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  const status = appStatusLabel[application.status] || appStatusLabel.PENDING;
  const releasedDocs = application.documents?.length || 0;
  const completedDocs = application.documents?.filter((d: any) => d.status === "APPROVED").length || 0;
  const totalAvailableDocs = application.totalAvailableDocs || releasedDocs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {application.job?.title || "General Application"}
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.color}`}>
              {status.text}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Applied {new Date(application.createdAt).toLocaleDateString()} ·{" "}
            {application.roleType === "skilled" ? "Skilled Professional" : "Non-Skilled Professional"}
          </p>
        </div>
        {totalAvailableDocs > 0 && (
          <div className="text-right">
            <p className="text-sm font-medium">{completedDocs}/{totalAvailableDocs} Total Steps Completed</p>
            <div className="w-48 bg-muted rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedDocs / totalAvailableDocs) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You currently have access to {releasedDocs} out of {totalAvailableDocs} required documents.
            </p>
          </div>
        )}
      </div>

      {/* Info Notice about documents */}
      {releasedDocs < totalAvailableDocs && (
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>More documents will be released later.</strong> Admin is reviewing your progress. You will be assigned additional documents (such as background checks) once you clear the initial stages.
          </p>
        </div>
      )}

      {/* Documents */}
      {application.documents?.length === 0 ? (
        <div className="px-6 py-10 text-center text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Awaiting documents</p>
          <p className="text-sm">Your application is being set up. Documents will appear here once released.</p>
        </div>
      ) : (
        <div className="divide-y">
          {application.documents?.map((doc: any) => {
            const config = statusConfig[doc.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            const sectionId = doc.sectionId;

            return (
              <div
                key={doc.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  doc.status === "PENDING" ? "bg-amber-50/30" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${config.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{doc.section?.name}</h4>
                  {doc.section?.description && (
                    <p className="text-xs text-muted-foreground truncate">{doc.section.description}</p>
                  )}
                  {doc.adminNotes && doc.status === "REJECTED" && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {doc.adminNotes}
                    </p>
                  )}
                </div>

                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border hidden sm:inline-flex ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>

                {/* Draft saved indicator */}
                {doc.status === "PENDING" && doc.formData && typeof doc.formData === "object" && Object.keys(doc.formData).length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hidden md:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Draft Saved
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {/* Web Form or PDF actions */}
                  {(doc.section?.type === "WEB_FORM" || doc.section?.type === "BOTH") && (
                    <>
                      {(doc.status === "PENDING" || doc.status === "REJECTED") && !doc.uploadedFileUrl && (
                        <button
                          onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ["my-applications"] });
                            setFillingFormDoc(doc);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {doc.status === "REJECTED"
                            ? "Re-fill Form"
                            : (doc.formData && Object.keys(doc.formData).length > 0 ? "Resume Form" : "Fill Online")}
                        </button>
                      )}
                      {doc.formData && (doc.status === "UPLOADED" || doc.status === "APPROVED") && (
                        <>
                          <button
                            onClick={() => setFillingFormDoc(doc)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            title="View your answers"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={async () => {
                              const cleanName = `${(doc.section?.name || 'official-document').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-signed.pdf`;
                              await applicationsApi.downloadOfficialPdf(doc.id, cleanName);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-primary hover:text-primary/80"
                            title="Download official signed and stamped PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {(doc.section?.type === "PDF" || doc.section?.type === "BOTH") && (
                    <>
                      {/* Download blank form */}
                      {doc.section?.fileUrl && !doc.formData && (
                        <a
                          href={doc.section.fileUrl.startsWith('http') ? doc.section.fileUrl : `${API_URL}${doc.section.fileUrl}`}
                          download
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                          title="Download blank form"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      {/* Upload / Re-upload */}
                      {(doc.status === "PENDING" || doc.status === "REJECTED") && !doc.formData && (
                        <>
                          <input
                            ref={(el) => { fileInputRefs.current[sectionId] = el; }}
                            type="file"
                            accept="application/pdf,image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadMutation.mutate({ sectionId, file });
                              }
                            }}
                          />
                          <button
                            onClick={() => fileInputRefs.current[sectionId]?.click()}
                            disabled={uploadMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {uploadMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            {doc.status === "REJECTED" ? "Re-upload PDF" : "Upload PDF"}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* View uploaded file */}
                  {doc.uploadedFileUrl && (
                    <a
                      href={doc.uploadedFileUrl.startsWith('http') ? doc.uploadedFileUrl : `${API_URL}${doc.uploadedFileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title="View your upload"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Web Form Modal */}
      <AnimatePresence>
        {fillingFormDoc && (
          <WebFormModal
            applicationId={application.id}
            doc={fillingFormDoc}
            application={application}
            onClose={() => setFillingFormDoc(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Web Form Modal ───────────────────────────────────────────────────────────

function WebFormModal({
  applicationId,
  doc,
  application,
  onClose
}: {
  applicationId: string;
  doc: any;
  application?: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isReadOnly = doc.status === "UPLOADED" || doc.status === "APPROVED";
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; title: string } | null>(null);

  // Always resolve latest form schema from parent application or current doc
  const currentDoc = application?.documents?.find((d: any) => d.id === doc.id || d.sectionId === doc.sectionId) || doc;
  const formSchema = Array.isArray(currentDoc?.section?.formSchema) && currentDoc.section.formSchema.length > 0
    ? currentDoc.section.formSchema
    : (Array.isArray(doc.section?.formSchema) ? doc.section.formSchema : []);

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const localDraftKey = `reliant_form_draft_${applicationId}_${doc.sectionId}`;
    let localDraft: any = null;
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(localDraftKey);
        if (stored) localDraft = JSON.parse(stored);
      }
    } catch {}

    const initial = {
      ...(doc.formData || {}),
      ...(localDraft || {}),
    };

    // ── Smart Cross-Form Candidate Identity Extraction (Strict Whitelist) ────
    // Only extracts the applicant's genuine personal identity and demographics.
    // Explicitly prevents extracting references, emergency contacts, or physician data.
    const candidateIdentity: Record<string, any> = {};
    const DEMO_WHITELIST = new Set([
      'first_name', 'firstname', 'last_name', 'lastname', 'legal_name', 'full_name',
      'middle_name', 'middle_initial', 'suffix',
      'email', 'applicant_email', 'employee_email',
      'phone', 'telephone', 'telephone_mobile', 'telephone_home', 'cell_phone', 'mobile_phone', 'applicant_phone',
      'address_street', 'street_address', 'address', 'current_address', 'home_address',
      'address_line2', 'apt_number',
      'address_city', 'city', 'county',
      'address_state', 'state',
      'address_zip', 'zip_code', 'zip',
      'dob', 'date_of_birth', 'gender', 'race',
      'ssn', 'social_security_number',
      'dl_number', 'driver_license_num', 'dl_state', 'driver_license_state',
      'signature'
    ]);

    if (Array.isArray(application?.documents)) {
      application.documents.forEach((d: any) => {
        if (d.formData && typeof d.formData === 'object') {
          Object.keys(d.formData).forEach((k) => {
            const kLower = k.toLowerCase();
            const val = d.formData[k];
            // Only extract candidate fields; skip masked SSN values (containing ***) or empty values
            if (
              DEMO_WHITELIST.has(kLower) &&
              typeof val === 'string' &&
              val.trim() &&
              !val.includes('***') &&
              !candidateIdentity[kLower]
            ) {
              candidateIdentity[kLower] = val.trim();
            }
          });
        }
      });
    }

    // ── Smart Cross-Form Document & ID Scan Extraction ────
    // Gathers uploaded documents (Photo ID front/back, SSN card, work auth, voided check, TB clearance)
    // from other application documents, saved drafts, and local storage cache.
    const candidateScans: Record<string, string> = {};

    // 1. Check local storage persistent scans cache
    try {
      if (typeof window !== 'undefined') {
        const cachedScans = localStorage.getItem('reliant_candidate_scans');
        if (cachedScans) {
          const parsed = JSON.parse(cachedScans);
          if (parsed && typeof parsed === 'object') {
            Object.assign(candidateScans, parsed);
          }
        }
      }
    } catch {}

    // 2. Scan all documents in the application (formData and uploadedFileUrl)
    if (Array.isArray(application?.documents)) {
      application.documents.forEach((d: any) => {
        // Check formData from other forms
        if (d.formData && typeof d.formData === 'object') {
          // Photo ID Front
          if (d.formData.id_card_front && !candidateScans.id_front) candidateScans.id_front = d.formData.id_card_front;
          if (d.formData.id_doc_front && !candidateScans.id_front) candidateScans.id_front = d.formData.id_doc_front;
          if (d.formData.drivers_license_front && !candidateScans.id_front) candidateScans.id_front = d.formData.drivers_license_front;
          if (d.formData.photo_id_front && !candidateScans.id_front) candidateScans.id_front = d.formData.photo_id_front;

          // Photo ID Back
          if (d.formData.id_card_back && !candidateScans.id_back) candidateScans.id_back = d.formData.id_card_back;
          if (d.formData.id_doc_back && !candidateScans.id_back) candidateScans.id_back = d.formData.id_doc_back;
          if (d.formData.drivers_license_back && !candidateScans.id_back) candidateScans.id_back = d.formData.drivers_license_back;
          if (d.formData.photo_id_back && !candidateScans.id_back) candidateScans.id_back = d.formData.photo_id_back;

          // SSN / Work Auth Front
          if (d.formData.ssn_card_front && !candidateScans.ssn_front) candidateScans.ssn_front = d.formData.ssn_card_front;
          if (d.formData.work_auth_doc && !candidateScans.ssn_front) candidateScans.ssn_front = d.formData.work_auth_doc;
          if (d.formData.ssn_card && !candidateScans.ssn_front) candidateScans.ssn_front = d.formData.ssn_card;
          if (d.formData.social_security_card && !candidateScans.ssn_front) candidateScans.ssn_front = d.formData.social_security_card;

          // SSN Back
          if (d.formData.ssn_card_back && !candidateScans.ssn_back) candidateScans.ssn_back = d.formData.ssn_card_back;

          // Voided Check / Direct Deposit
          if (d.formData.voided_check_file && !candidateScans.voided_check) candidateScans.voided_check = d.formData.voided_check_file;
          if (d.formData.direct_deposit_proof && !candidateScans.voided_check) candidateScans.voided_check = d.formData.direct_deposit_proof;

          // TB Clearance
          if (d.formData.tb_clearance_file && !candidateScans.tb_clearance) candidateScans.tb_clearance = d.formData.tb_clearance_file;
        }

        // Also check direct document uploads if any
        if (d.uploadedFileUrl && typeof d.uploadedFileUrl === 'string') {
          const secName = (d.section?.name || '').toLowerCase();
          if ((secName.includes('driver') || secName.includes('license') || secName.includes('photo id') || secName.includes('state id')) && !candidateScans.id_front) {
            candidateScans.id_front = d.uploadedFileUrl;
          } else if ((secName.includes('social security') || secName.includes('ssn') || secName.includes('work auth')) && !candidateScans.ssn_front) {
            candidateScans.ssn_front = d.uploadedFileUrl;
          } else if ((secName.includes('voided check') || secName.includes('direct deposit')) && !candidateScans.voided_check) {
            candidateScans.voided_check = d.uploadedFileUrl;
          } else if ((secName.includes('tb') || secName.includes('ppd') || secName.includes('physical')) && !candidateScans.tb_clearance) {
            candidateScans.tb_clearance = d.uploadedFileUrl;
          }
        }
      });
    }

    // 3. Also check unsaved drafts in localStorage
    try {
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`reliant_form_draft_${applicationId}_`)) {
            const rawDraft = localStorage.getItem(k);
            if (rawDraft) {
              const draftData = JSON.parse(rawDraft);
              if (draftData && typeof draftData === 'object') {
                if (draftData.id_card_front && !candidateScans.id_front) candidateScans.id_front = draftData.id_card_front;
                if (draftData.id_doc_front && !candidateScans.id_front) candidateScans.id_front = draftData.id_doc_front;
                if (draftData.id_card_back && !candidateScans.id_back) candidateScans.id_back = draftData.id_card_back;
                if (draftData.id_doc_back && !candidateScans.id_back) candidateScans.id_back = draftData.id_doc_back;
                if (draftData.ssn_card_front && !candidateScans.ssn_front) candidateScans.ssn_front = draftData.ssn_card_front;
                if (draftData.work_auth_doc && !candidateScans.ssn_front) candidateScans.ssn_front = draftData.work_auth_doc;
                if (draftData.ssn_card_back && !candidateScans.ssn_back) candidateScans.ssn_back = draftData.ssn_card_back;
                if (draftData.voided_check_file && !candidateScans.voided_check) candidateScans.voided_check = draftData.voided_check_file;
                if (draftData.tb_clearance_file && !candidateScans.tb_clearance) candidateScans.tb_clearance = draftData.tb_clearance_file;
              }
            }
          }
        }
      }
    } catch {}

    const firstName = (
      initial.first_name ||
      initial.firstname ||
      candidateIdentity.first_name ||
      candidateIdentity.firstname ||
      application?.personalInfo?.firstName ||
      application?.user?.firstName ||
      ''
    ).trim();

    const lastName = (
      initial.last_name ||
      initial.lastname ||
      candidateIdentity.last_name ||
      candidateIdentity.lastname ||
      application?.personalInfo?.lastName ||
      application?.user?.lastName ||
      ''
    ).trim();

    const middleName = (
      initial.middle_name ||
      initial.middle_initial ||
      candidateIdentity.middle_name ||
      candidateIdentity.middle_initial ||
      application?.personalInfo?.middleName ||
      ''
    ).trim();

    const suffix = (
      initial.suffix ||
      candidateIdentity.suffix ||
      application?.personalInfo?.suffix ||
      ''
    ).trim();

    const fullName = (
      initial.legal_name ||
      initial.full_name ||
      initial.applicant_name ||
      candidateIdentity.legal_name ||
      candidateIdentity.full_name ||
      application?.personalInfo?.fullName ||
      `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim() ||
      ''
    ).trim();

    const email = (
      initial.email ||
      initial.applicant_email ||
      initial.employee_email ||
      candidateIdentity.email ||
      candidateIdentity.applicant_email ||
      candidateIdentity.employee_email ||
      application?.personalInfo?.email ||
      application?.user?.email ||
      ''
    ).trim();

    const phone = (
      initial.phone ||
      initial.telephone ||
      initial.telephone_mobile ||
      initial.cell_phone ||
      initial.mobile_phone ||
      initial.applicant_phone ||
      candidateIdentity.phone ||
      candidateIdentity.telephone ||
      candidateIdentity.telephone_mobile ||
      candidateIdentity.cell_phone ||
      candidateIdentity.mobile_phone ||
      candidateIdentity.applicant_phone ||
      application?.personalInfo?.phone ||
      application?.user?.phone ||
      ''
    ).trim();

    const telephoneHome = (
      initial.telephone_home ||
      candidateIdentity.telephone_home ||
      application?.personalInfo?.telephoneHome ||
      ''
    ).trim();

    const street = (
      initial.address_street ||
      initial.street_address ||
      initial.address ||
      initial.current_address ||
      candidateIdentity.address_street ||
      candidateIdentity.street_address ||
      candidateIdentity.address ||
      candidateIdentity.current_address ||
      application?.personalInfo?.address ||
      application?.personalInfo?.address_street ||
      ''
    ).trim();

    const addressLine2 = (
      initial.address_line2 ||
      initial.apt_number ||
      candidateIdentity.address_line2 ||
      candidateIdentity.apt_number ||
      application?.personalInfo?.addressLine2 ||
      ''
    ).trim();

    const city = (
      initial.address_city ||
      initial.city ||
      candidateIdentity.address_city ||
      candidateIdentity.city ||
      application?.personalInfo?.city ||
      application?.personalInfo?.address_city ||
      ''
    ).trim();

    const state = (
      initial.address_state ||
      initial.state ||
      candidateIdentity.address_state ||
      candidateIdentity.state ||
      application?.personalInfo?.state ||
      'PA'
    ).trim();

    const zip = (
      initial.address_zip ||
      initial.zip_code ||
      initial.zip ||
      candidateIdentity.address_zip ||
      candidateIdentity.zip_code ||
      candidateIdentity.zip ||
      application?.personalInfo?.zip ||
      application?.personalInfo?.address_zip ||
      ''
    ).trim();

    const county = (
      initial.county ||
      candidateIdentity.county ||
      application?.personalInfo?.county ||
      ''
    ).trim();

    const dob = (
      initial.dob ||
      initial.date_of_birth ||
      candidateIdentity.dob ||
      candidateIdentity.date_of_birth ||
      application?.personalInfo?.dob ||
      ''
    ).trim();

    const rawSsn = (
      initial.ssn ||
      initial.social_security_number ||
      candidateIdentity.ssn ||
      candidateIdentity.social_security_number ||
      application?.personalInfo?.ssn ||
      ''
    ).trim();
    const cleanSsn = rawSsn && !rawSsn.includes('***') ? rawSsn : '';

    const gender = (
      initial.gender ||
      candidateIdentity.gender ||
      application?.personalInfo?.gender ||
      ''
    ).trim();

    const race = (
      initial.race ||
      candidateIdentity.race ||
      application?.personalInfo?.race ||
      ''
    ).trim();

    const dlNumber = (
      initial.dl_number ||
      initial.driver_license_num ||
      candidateIdentity.dl_number ||
      candidateIdentity.driver_license_num ||
      application?.personalInfo?.dlNumber ||
      ''
    ).trim();

    const dlState = (
      initial.dl_state ||
      initial.driver_license_state ||
      candidateIdentity.dl_state ||
      candidateIdentity.driver_license_state ||
      application?.personalInfo?.dlState ||
      'PA'
    ).trim();

    const localSig = typeof window !== 'undefined' ? localStorage.getItem('reliant_applicant_signature') : null;
    const savedSignature = (
      initial.signature ||
      candidateIdentity.signature ||
      application?.personalInfo?.signature ||
      localSig ||
      ''
    ).trim();

    const positionApplied = application?.job?.title && application?.job?.title !== 'General Application'
      ? application.job.title
      : (application?.roleType === 'skilled' ? 'Skilled Healthcare Professional' : 'Direct Care Worker / Home Health Aide');
    
    const today = new Date().toISOString().split('T')[0];

    // Compute estimated age from DOB if available
    let age = (initial.age || candidateIdentity.age || '').trim();
    if (!age && dob) {
      const birth = new Date(dob);
      if (!isNaN(birth.getTime())) {
        const diff = Date.now() - birth.getTime();
        age = String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
      }
    }

    formSchema.forEach((field: any) => {
      const id = field.id;
      const idLower = String(id).toLowerCase();
      const labelLower = String(field.label).toLowerCase();

      // Check repeaters initialization
      if (field.type === 'repeater_names') {
        if (!Array.isArray(initial[id]) || initial[id].length === 0) {
          initial[id] = [{ first: '', middle: '', last: '', suffix: '' }];
        }
        return;
      }
      if (field.type === 'repeater_addresses') {
        if (!Array.isArray(initial[id]) || initial[id].length === 0) {
          initial[id] = [{ street: street || '', city: city || '', state: state || 'PA', zip: zip || '' }];
        }
        return;
      }
      if (field.type === 'repeater_household') {
        if (!Array.isArray(initial[id]) || initial[id].length === 0) {
          initial[id] = [{ name: '', relationship: 'Parent', gender: 'Female', age: '' }];
        }
        return;
      }

      // ── STRICT CONTEXTUAL BLACKLIST ───────────────────────────────────────────
      // If the field belongs to a third party (references, emergency contacts, physicians,
      // prior employers, specific event dates, or banking), NEVER prefill with candidate personal data!
      const isThirdPartyOrContextual =
        idLower.startsWith('ref') ||
        idLower.includes('reference') ||
        idLower.startsWith('primary_') ||
        idLower.startsWith('secondary_') ||
        idLower.includes('emergency') ||
        idLower.startsWith('physician') ||
        idLower.startsWith('doctor') ||
        idLower.startsWith('clinic') ||
        idLower.startsWith('medical') ||
        idLower.startsWith('hospital') ||
        idLower.startsWith('employer') ||
        idLower.startsWith('company') ||
        idLower.startsWith('supervisor') ||
        idLower.startsWith('trainer') ||
        idLower.startsWith('facilitator') ||
        idLower.startsWith('bank') ||
        idLower.startsWith('routing') ||
        idLower.startsWith('account') ||
        idLower.startsWith('deposit') ||
        idLower.includes('prev_') ||
        idLower.includes('previous_') ||
        idLower.includes('workmens_') ||
        idLower.includes('applied_before') ||
        idLower.includes('cpr_') ||
        idLower === 'position_desired' ||
        idLower === 'position_held' ||
        idLower.includes('license_number') ||
        idLower.includes('license_expiration');

      if (initial[id] === undefined || initial[id] === '' || initial[id] === null) {
        if (isThirdPartyOrContextual) {
          // Do not pollute third-party / contextual fields
          return;
        }

        // Job / Position
        if (idLower === 'position' || idLower === 'position_applied_for' || idLower === 'job_title' || labelLower === 'position applied for') {
          initial[id] = positionApplied;
        }
        // Full / Legal Name
        else if (
          idLower === 'legal_name' || idLower === 'full_name' || idLower === 'applicant_name' ||
          (idLower === 'employee_name' && !idLower.includes('referral') && !idLower.includes('trainer') && !idLower.includes('facilitator'))
        ) {
          initial[id] = fullName;
        }
        // First Name
        else if (idLower === 'first_name' || idLower === 'firstname') {
          initial[id] = firstName;
        }
        // Last Name
        else if (idLower === 'last_name' || idLower === 'lastname') {
          initial[id] = lastName;
        }
        // Middle Name / Initial
        else if (idLower === 'middle_name' || idLower === 'middle_initial') {
          initial[id] = middleName;
        }
        // Suffix
        else if (idLower === 'suffix') {
          initial[id] = suffix;
        }
        // Email
        else if (idLower === 'email' || idLower === 'applicant_email' || idLower === 'employee_email') {
          initial[id] = email;
        }
        // Phone / Mobile
        else if (
          idLower === 'phone' || idLower === 'telephone' || idLower === 'telephone_mobile' ||
          idLower === 'cell_phone' || idLower === 'mobile_phone' || idLower === 'applicant_phone'
        ) {
          initial[id] = phone;
        }
        // Home Phone
        else if (idLower === 'telephone_home') {
          initial[id] = telephoneHome;
        }
        // Street Address
        else if (idLower === 'address_street' || idLower === 'street_address' || idLower === 'address' || idLower === 'current_address') {
          initial[id] = street;
        }
        // Address Line 2 / Apt Number
        else if (idLower === 'address_line2' || idLower === 'apt_number') {
          initial[id] = addressLine2;
        }
        // City
        else if (idLower === 'address_city' || idLower === 'city') {
          initial[id] = city;
        }
        // State
        else if (idLower === 'address_state' || idLower === 'state') {
          initial[id] = state;
        }
        // Zip
        else if (idLower === 'address_zip' || idLower === 'zip_code' || idLower === 'zip') {
          initial[id] = zip;
        }
        // County
        else if (idLower === 'county') {
          initial[id] = county;
        }
        // Date of Birth
        else if (idLower === 'dob' || idLower === 'date_of_birth') {
          initial[id] = dob;
        }
        // Age
        else if (idLower === 'age') {
          initial[id] = age;
        }
        // Social Security Number
        else if (idLower === 'ssn' || idLower === 'social_security_number') {
          initial[id] = cleanSsn;
        }
        // Gender
        else if (idLower === 'gender') {
          initial[id] = gender;
        }
        // Race / Ethnicity
        else if (idLower === 'race') {
          initial[id] = race;
        }
        // Driver's License Number
        else if (idLower === 'dl_number' || idLower === 'driver_license_num') {
          initial[id] = dlNumber;
        }
        // Driver's License State
        else if (idLower === 'dl_state' || idLower === 'driver_license_state') {
          initial[id] = dlState;
        }
        // Signature & Attestation Dates
        else if (
          field.type === 'date' &&
          (idLower.includes('signature_date') || idLower.includes('attest_date') || idLower.includes('date_signed') || idLower.includes('training_date') || idLower === 'today_date')
        ) {
          initial[id] = today;
        }
        // Digital Signature prefill
        else if (field.type === 'signature') {
          if (savedSignature) {
            initial[id] = savedSignature;
          }
        }
        // Document & ID Scan prefill (Driver's License, SSN Card, Work Authorization, etc.)
        else if (field.type === 'file' || field.type === 'file_upload') {
          if (idLower === 'id_card_front' || idLower === 'id_doc_front' || idLower === 'drivers_license_front' || idLower === 'photo_id_front' || idLower === 'driver_license') {
            if (candidateScans.id_front) initial[id] = candidateScans.id_front;
          } else if (idLower === 'id_card_back' || idLower === 'id_doc_back' || idLower === 'drivers_license_back' || idLower === 'photo_id_back') {
            if (candidateScans.id_back) initial[id] = candidateScans.id_back;
          } else if (idLower === 'ssn_card_front' || idLower === 'work_auth_doc' || idLower === 'ssn_card' || idLower === 'social_security_card') {
            if (candidateScans.ssn_front) initial[id] = candidateScans.ssn_front;
          } else if (idLower === 'ssn_card_back') {
            if (candidateScans.ssn_back) initial[id] = candidateScans.ssn_back;
          } else if (idLower === 'voided_check_file' || idLower === 'direct_deposit_proof') {
            if (candidateScans.voided_check) initial[id] = candidateScans.voided_check;
          } else if (idLower === 'tb_clearance_file') {
            if (candidateScans.tb_clearance) initial[id] = candidateScans.tb_clearance;
          }
        }
      }
    });

    return initial;
  });

  // Auto-save progress to local storage continuously on changes
  useEffect(() => {
    if (isReadOnly) return;
    const key = `reliant_form_draft_${applicationId}_${doc.sectionId}`;
    try {
      if (typeof window !== 'undefined' && Object.keys(formData).length > 0) {
        localStorage.setItem(key, JSON.stringify(formData));
      }
    } catch {}
  }, [formData, applicationId, doc.sectionId, isReadOnly]);

  const submitMutation = useMutation({
    mutationFn: (data: any) => applicationsApi.submitWebForm(applicationId, doc.sectionId, data, false),
    onSuccess: () => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`reliant_form_draft_${applicationId}_${doc.sectionId}`);
        }
      } catch {}
      if (formData.signature && typeof formData.signature === 'string' && formData.signature.startsWith('data:image/')) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('reliant_applicant_signature', formData.signature);
          }
        } catch {}
      }
      try {
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('reliant_candidate_scans') || '{}');
          if (formData.id_card_front) existing.id_front = formData.id_card_front;
          if (formData.id_doc_front) existing.id_front = formData.id_doc_front;
          if (formData.id_card_back) existing.id_back = formData.id_card_back;
          if (formData.id_doc_back) existing.id_back = formData.id_doc_back;
          if (formData.ssn_card_front) existing.ssn_front = formData.ssn_card_front;
          if (formData.work_auth_doc) existing.ssn_front = formData.work_auth_doc;
          if (formData.ssn_card_back) existing.ssn_back = formData.ssn_card_back;
          if (formData.voided_check_file) existing.voided_check = formData.voided_check_file;
          if (formData.tb_clearance_file) existing.tb_clearance = formData.tb_clearance_file;
          localStorage.setItem('reliant_candidate_scans', JSON.stringify(existing));
        }
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      onClose();
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: (data: any) => applicationsApi.submitWebForm(applicationId, doc.sectionId, data, true),
    onSuccess: () => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`reliant_form_draft_${applicationId}_${doc.sectionId}`, JSON.stringify(formData));
        }
      } catch {}
      if (formData.signature && typeof formData.signature === 'string' && formData.signature.startsWith('data:image/')) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('reliant_applicant_signature', formData.signature);
          }
        } catch {}
      }
      try {
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('reliant_candidate_scans') || '{}');
          if (formData.id_card_front) existing.id_front = formData.id_card_front;
          if (formData.id_doc_front) existing.id_front = formData.id_doc_front;
          if (formData.id_card_back) existing.id_back = formData.id_card_back;
          if (formData.id_doc_back) existing.id_back = formData.id_doc_back;
          if (formData.ssn_card_front) existing.ssn_front = formData.ssn_card_front;
          if (formData.work_auth_doc) existing.ssn_front = formData.work_auth_doc;
          if (formData.ssn_card_back) existing.ssn_back = formData.ssn_card_back;
          if (formData.voided_check_file) existing.voided_check = formData.voided_check_file;
          if (formData.tb_clearance_file) existing.tb_clearance = formData.tb_clearance_file;
          localStorage.setItem('reliant_candidate_scans', JSON.stringify(existing));
        }
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setSaveSuccessMessage("Progress saved! You can close and return anytime.");
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    },
  });

  const handleSaveDraft = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isReadOnly) return;
    saveDraftMutation.mutate(formData);
  };

  const [noncitizenDocType, setNoncitizenDocType] = useState<'uscis' | 'i94' | 'passport'>(() => {
    if (formData.i94_admission_number) return 'i94';
    if (formData.foreign_passport_number || formData.foreign_passport_country) return 'passport';
    return 'uscis';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return onClose();
    submitMutation.mutate(formData);
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
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b bg-card rounded-t-2xl z-10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold">{doc.section?.name}</h2>
            {doc.section?.description && <p className="text-sm text-muted-foreground">{doc.section.description}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {saveSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {saveSuccessMessage}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {formSchema.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">This form has no fields configured.</p>
          ) : (
            formSchema.map((field: any) => {
              // Check field dependencies if configured
              if (field.dependsOn) {
                const targetVal = String(formData[field.dependsOn.field] || "").toLowerCase();
                const allowed = Array.isArray(field.dependsOn.value) ? field.dependsOn.value : [field.dependsOn.value];
                const isMatch = allowed.some((v: string) => targetVal.includes(String(v).toLowerCase()));
                if (!isMatch) return null;
              }

              // Hide standalone I-9 immigration fields so they render cleanly inside citizenship_status
              const I9_IMMIGRATION_FIELDS = [
                'uscis_number',
                'work_auth_expiration',
                'i94_admission_number',
                'foreign_passport_number',
                'foreign_passport_country',
              ];
              if (I9_IMMIGRATION_FIELDS.includes(field.id)) {
                return null;
              }

              // ── Header / Section Banner ──────────────────────────────────
              if (field.type === "section_header") {
                return (
                  <div key={field.id} className="pt-4 pb-1 border-b border-border/80">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-primary">
                      {field.label}
                    </h3>
                  </div>
                );
              }

              // ── Instruction Banner ─────────────────────────────────────────
              if (field.type === "instruction") {
                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-950 dark:text-blue-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{field.label}</span>
                  </div>
                );
              }

              // ── Tip Banner ─────────────────────────────────────────────────
              if (field.type === "tip") {
                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{field.label}</span>
                  </div>
                );
              }

              // ── Caution / Perjury Banner ───────────────────────────────────
              if (field.type === "caution") {
                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{field.label}</span>
                  </div>
                );
              }

              // ── Repeater: Previous Names ───────────────────────────────────
              if (field.type === "repeater_names") {
                const list = Array.isArray(formData[field.id])
                  ? formData[field.id]
                  : [{ first: '', middle: '', last: '', suffix: '' }];

                return (
                  <div key={field.id} className="space-y-3 pt-2">
                    <label className="text-sm font-semibold flex items-center justify-between">
                      <span>{field.label}</span>
                      <span className="text-xs text-muted-foreground font-normal">Max 5 names</span>
                    </label>
                    <div className="space-y-3">
                      {list.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Name Entry #{idx + 1}</span>
                            {list.length > 1 && !isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = list.filter((_: any, i: number) => i !== idx);
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              disabled={isReadOnly}
                              placeholder="First Name"
                              value={item.first || ''}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], first: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="border rounded-lg px-3 py-2 text-xs bg-background"
                            />
                            <input
                              type="text"
                              disabled={isReadOnly}
                              placeholder="Middle"
                              value={item.middle || ''}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], middle: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="border rounded-lg px-3 py-2 text-xs bg-background"
                            />
                            <input
                              type="text"
                              disabled={isReadOnly}
                              placeholder="Last Name"
                              value={item.last || ''}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], last: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="border rounded-lg px-3 py-2 text-xs bg-background"
                            />
                            <input
                              type="text"
                              disabled={isReadOnly}
                              placeholder="Suffix (e.g. Jr)"
                              value={item.suffix || ''}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], suffix: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="border rounded-lg px-3 py-2 text-xs bg-background"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isReadOnly && list.length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            [field.id]: [...list, { first: '', middle: '', last: '', suffix: '' }],
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Another Previous Name / Alias
                      </button>
                    )}
                  </div>
                );
              }

              // ── Repeater: Previous Addresses ───────────────────────────────
              if (field.type === "repeater_addresses") {
                const list = Array.isArray(formData[field.id])
                  ? formData[field.id]
                  : [{ street: '', city: '', state: 'PA', zip: '' }];

                return (
                  <div key={field.id} className="space-y-3 pt-2">
                    <label className="text-sm font-semibold flex items-center justify-between">
                      <span>{field.label}</span>
                      <span className="text-xs text-muted-foreground font-normal">Max 8 addresses</span>
                    </label>
                    <div className="space-y-3">
                      {list.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Address #{idx + 1}</span>
                            {list.length > 1 && !isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = list.filter((_: any, i: number) => i !== idx);
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              disabled={isReadOnly}
                              placeholder="Street Address (e.g. 123 Main St, Apt 2)"
                              value={item.street || ''}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], street: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="w-full border rounded-lg px-3 py-2 text-xs bg-background"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                disabled={isReadOnly}
                                placeholder="City"
                                value={item.city || ''}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx] = { ...updated[idx], city: e.target.value };
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="border rounded-lg px-3 py-2 text-xs bg-background"
                              />
                              <input
                                type="text"
                                disabled={isReadOnly}
                                placeholder="State"
                                value={item.state || 'PA'}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx] = { ...updated[idx], state: e.target.value };
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="border rounded-lg px-3 py-2 text-xs bg-background"
                              />
                              <input
                                type="text"
                                disabled={isReadOnly}
                                placeholder="ZIP"
                                value={item.zip || ''}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx] = { ...updated[idx], zip: e.target.value };
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="border rounded-lg px-3 py-2 text-xs bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isReadOnly && list.length < 8 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            [field.id]: [...list, { street: '', city: '', state: 'PA', zip: '' }],
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Another Previous Address
                      </button>
                    )}
                  </div>
                );
              }

              // ── Repeater: Household Members ────────────────────────────────
              if (field.type === "repeater_household") {
                const list = Array.isArray(formData[field.id])
                  ? formData[field.id]
                  : [{ name: '', relationship: 'Parent', gender: 'Female', age: '' }];

                return (
                  <div key={field.id} className="space-y-3 pt-2">
                    <label className="text-sm font-semibold flex items-center justify-between">
                      <span>{field.label}</span>
                      <span className="text-xs text-muted-foreground font-normal">Max 10 members</span>
                    </label>
                    <div className="space-y-3">
                      {list.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Household Member #{idx + 1}</span>
                            {list.length > 1 && !isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = list.filter((_: any, i: number) => i !== idx);
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              disabled={isReadOnly}
                              placeholder="Full Name (First, Middle, Last)"
                              value={item.name || ''}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="sm:col-span-2 border rounded-lg px-3 py-2 text-xs bg-background"
                            />
                            <select
                              disabled={isReadOnly}
                              value={item.relationship || 'Parent'}
                              onChange={(e) => {
                                const updated = [...list];
                                updated[idx] = { ...updated[idx], relationship: e.target.value };
                                setFormData({ ...formData, [field.id]: updated });
                              }}
                              className="border rounded-lg px-3 py-2 text-xs bg-background"
                            >
                              <option value="Parent">Parent</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Person who raised you">Person who raised you</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Child">Child</option>
                              <option value="Present / Roommate">Present / Roommate</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="flex gap-2">
                              <select
                                disabled={isReadOnly}
                                value={item.gender || 'Female'}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx] = { ...updated[idx], gender: e.target.value };
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="border rounded-lg px-2 py-2 text-xs bg-background flex-1"
                              >
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                              </select>
                              <input
                                type="text"
                                disabled={isReadOnly}
                                placeholder="Age"
                                value={item.age || ''}
                                onChange={(e) => {
                                  const updated = [...list];
                                  updated[idx] = { ...updated[idx], age: e.target.value };
                                  setFormData({ ...formData, [field.id]: updated });
                                }}
                                className="border rounded-lg px-2 py-2 text-xs bg-background w-14 text-center"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isReadOnly && list.length < 10 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            [field.id]: [...list, { name: '', relationship: 'Parent', gender: 'Female', age: '' }],
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Household Member
                      </button>
                    )}
                  </div>
                );
              }

              // ── Standard Inputs ───────────────────────────────────────────
              return (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    {field.label} {field.required && !isReadOnly && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "select" ? (
                    <div className="space-y-3">
                      <select
                        required={field.required && !isReadOnly}
                        disabled={isReadOnly}
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background disabled:opacity-70 text-sm font-medium"
                      >
                        <option value="">-- Please Select --</option>
                        {field.options?.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      {/* ── Form I-9 Conditional Citizenship Fields ─────────── */}
                      {field.id === "citizenship_status" && (
                        <div className="mt-3">
                          {/* 1. Citizen or 2. Noncitizen National */}
                          {(formData.citizenship_status?.includes("1.") ||
                            formData.citizenship_status?.toLowerCase().includes("citizen of the united states") ||
                            formData.citizenship_status?.includes("2.") ||
                            formData.citizenship_status?.toLowerCase().includes("noncitizen national")) && (
                            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                As a U.S. Citizen / Noncitizen National, no USCIS number, work authorization expiration date, or foreign passport details are required for Section 1.
                              </span>
                            </div>
                          )}

                          {/* 3. Lawful Permanent Resident */}
                          {(formData.citizenship_status?.includes("3.") ||
                            formData.citizenship_status?.toLowerCase().includes("lawful permanent resident")) && (
                            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                                <span>USCIS / Alien Registration Number (A-Number) <span className="text-red-500">*</span></span>
                                <span className="text-[11px] text-muted-foreground font-normal">7 to 9 digits</span>
                              </label>
                              <input
                                type="text"
                                disabled={isReadOnly}
                                value={formData.uscis_number || ""}
                                onChange={(e) => setFormData({ ...formData, uscis_number: e.target.value })}
                                placeholder="e.g. 123456789"
                                className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                              <p className="text-[11px] text-muted-foreground">
                                Lawful permanent residents must enter your 7- to 9-digit Alien Registration Number (A-Number) or USCIS Number.
                              </p>
                            </div>
                          )}

                          {/* 4. Noncitizen Authorized to Work */}
                          {(formData.citizenship_status?.includes("4.") ||
                            formData.citizenship_status?.toLowerCase().includes("noncitizen authorized to work")) && (
                            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-4">
                              {/* Work Authorization Expiration Date */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                                  <span>Work Authorization Expiration Date</span>
                                  <span className="text-[11px] text-muted-foreground font-normal">mm/dd/yyyy</span>
                                </label>
                                <DatePicker
                                  value={formData.work_auth_expiration || ""}
                                  onChange={(val) => setFormData({ ...formData, work_auth_expiration: val })}
                                  disabled={isReadOnly}
                                  placeholder="Select expiration date (or leave blank if N/A)"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                  Enter the expiration date of your employment authorization document. If your employment authorization does not have an expiration date (e.g. refugees, asylees), leave blank.
                                </p>
                              </div>

                              {/* Document Identifier Selection (1 of 3) */}
                              <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 space-y-3">
                                <div>
                                  <label className="text-xs font-bold text-foreground block">
                                    Document Identification <span className="text-red-500">*</span>
                                  </label>
                                  <p className="text-[11px] text-muted-foreground">
                                    Noncitizens authorized to work must provide <strong>ONE</strong> of the following 3 document identifiers:
                                  </p>
                                </div>

                                {/* 3 tabs / selector */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => setNoncitizenDocType("uscis")}
                                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                                      noncitizenDocType === "uscis"
                                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    1. USCIS / A-Number
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => setNoncitizenDocType("i94")}
                                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                                      noncitizenDocType === "i94"
                                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    2. Form I-94 Number
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => setNoncitizenDocType("passport")}
                                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                                      noncitizenDocType === "passport"
                                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    3. Foreign Passport
                                  </button>
                                </div>

                                {/* Inputs based on selected document type */}
                                {noncitizenDocType === "uscis" && (
                                  <div className="space-y-1.5 pt-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      USCIS / Alien Registration Number (A-Number)
                                    </label>
                                    <input
                                      type="text"
                                      disabled={isReadOnly}
                                      value={formData.uscis_number || ""}
                                      onChange={(e) => setFormData({ ...formData, uscis_number: e.target.value })}
                                      placeholder="e.g. 123456789"
                                      className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                  </div>
                                )}

                                {noncitizenDocType === "i94" && (
                                  <div className="space-y-1.5 pt-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      Form I-94 Admission Number (11 digits)
                                    </label>
                                    <input
                                      type="text"
                                      disabled={isReadOnly}
                                      value={formData.i94_admission_number || ""}
                                      onChange={(e) => setFormData({ ...formData, i94_admission_number: e.target.value })}
                                      placeholder="e.g. 12345678901"
                                      className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                  </div>
                                )}

                                {noncitizenDocType === "passport" && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold text-foreground">Foreign Passport Number</label>
                                      <input
                                        type="text"
                                        disabled={isReadOnly}
                                        value={formData.foreign_passport_number || ""}
                                        onChange={(e) => setFormData({ ...formData, foreign_passport_number: e.target.value })}
                                        placeholder="Passport #"
                                        className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs font-semibold text-foreground">Country of Issuance</label>
                                      <input
                                        type="text"
                                        disabled={isReadOnly}
                                        value={formData.foreign_passport_country || ""}
                                        onChange={(e) => setFormData({ ...formData, foreign_passport_country: e.target.value })}
                                        placeholder="e.g. Canada, Mexico, UK"
                                        className="w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      required={field.required && !isReadOnly}
                      disabled={isReadOnly}
                      value={formData[field.id] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background min-h-[100px] disabled:opacity-70 text-sm"
                    />
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        required={field.required && !isReadOnly}
                        disabled={isReadOnly}
                        checked={!!formData[field.id]}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 disabled:opacity-70"
                      />
                      <span className="text-sm">Yes / Confirm</span>
                    </div>
                  ) : field.type === "signature" ? (
                    <SignaturePad
                      value={formData[field.id] || ""}
                      onChange={(val) => setFormData({ ...formData, [field.id]: val })}
                      readOnly={isReadOnly}
                    />
                  ) : field.type === "file" || field.type === "file_upload" ? (
                    <div className="space-y-2">
                      {formData[field.id] ? (() => {
                        const val = formData[field.id];
                        const valStr = typeof val === 'string' ? val : '';
                        const resolvedUrl = resolveMediaUrl(valStr);
                        const isImage = valStr.startsWith('data:image') || !!valStr.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)($|\?)/i);
                        const isPdf = valStr.startsWith('data:application/pdf') || !!valStr.match(/\.pdf($|\?)/i);

                        const rawName = valStr.startsWith('data:')
                          ? (isPdf ? 'Attached Document.pdf' : 'Attached Document Scan.jpg')
                          : valStr.split('/').pop()?.split('?')[0] || 'Attached Document';

                        const isUuidHash = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(rawName);
                        const fileExt = rawName.includes('.') ? `.${rawName.split('.').pop()}` : (isPdf ? '.pdf' : '.jpg');
                        const fileName = isUuidHash
                          ? `${field.label ? field.label.split('(')[0].trim() : 'Document Scan'} ${fileExt}`
                          : rawName;

                        return (
                          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 sm:p-3.5 transition-all shadow-xs">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {isImage ? (
                                  <div
                                    onClick={() => setPreviewModalImage({ url: resolvedUrl, title: field.label || "Document Scan" })}
                                    className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-border bg-white dark:bg-zinc-800 shadow-xs cursor-pointer shrink-0 transition-transform hover:scale-105"
                                    title="Click to preview full scan"
                                  >
                                    <img
                                      src={resolvedUrl}
                                      alt={field.label || "Document preview"}
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        if (!target.dataset.triedFallback && valStr && !valStr.startsWith('data:') && !valStr.includes('/upload/view')) {
                                          target.dataset.triedFallback = 'true';
                                          const baseUrl = API_URL.replace(/\/+$/, "");
                                          target.src = `${baseUrl}/upload/view?url=${encodeURIComponent(valStr)}`;
                                        } else {
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent && !parent.querySelector('.scan-fallback-icon')) {
                                            parent.classList.add('flex', 'items-center', 'justify-center', 'bg-emerald-100', 'dark:bg-emerald-950/60');
                                            const icon = document.createElement('span');
                                            icon.innerHTML = '📄';
                                            icon.className = 'scan-fallback-icon text-xl select-none';
                                            parent.appendChild(icon);
                                          }
                                        }
                                      }}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <ZoomIn className="w-4 h-4 drop-shadow" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 flex flex-col items-center justify-center shrink-0 text-red-600 dark:text-red-400">
                                    <FileText className="w-6 h-6" />
                                    <span className="text-[10px] font-bold uppercase mt-0.5 tracking-wider">PDF</span>
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Attached
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px] sm:max-w-[200px]" title={fileName}>
                                      {fileName}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-foreground mt-1 truncate">
                                    {field.label || "Document Attachment"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {isImage ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewModalImage({ url: resolvedUrl, title: field.label || "Document Scan" })}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                      >
                                        <Eye className="w-3 h-3" /> Preview Full Scan
                                      </button>
                                    ) : (
                                      <a
                                        href={resolvedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                      >
                                        <ExternalLink className="w-3 h-3" /> Open PDF in New Tab
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, [field.id]: "" })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 border border-transparent hover:border-red-200 dark:hover:border-red-900"
                                  title="Remove / Replace file"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Replace</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            required={field.required && !isReadOnly}
                            disabled={isReadOnly || uploadingField === field.id}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingField(field.id);
                              try {
                                const res = await applicationsApi.uploadGenericFile(file);
                                setFormData((prev) => ({ ...prev, [field.id]: res.url }));
                                cacheUploadedScan(field.id, res.url);
                              } catch (err) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const dataUrl = ev.target?.result as string;
                                  setFormData((prev) => ({ ...prev, [field.id]: dataUrl }));
                                  cacheUploadedScan(field.id, dataUrl);
                                };
                                reader.readAsDataURL(file);
                              } finally {
                                setUploadingField(null);
                              }
                            }}
                            className="w-full border rounded-lg px-4 py-2 text-sm bg-background disabled:opacity-70 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                          {uploadingField === field.id && (
                            <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Uploading...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : field.type === "date" ? (
                    <DatePicker
                      value={formData[field.id] || ""}
                      onChange={(val) => setFormData({ ...formData, [field.id]: val })}
                      disabled={isReadOnly}
                      required={field.required && !isReadOnly}
                      placeholder={`Select ${field.label?.toLowerCase() || 'date'}...`}
                    />
                  ) : (
                    <input
                      type="text"
                      required={field.required && !isReadOnly}
                      disabled={isReadOnly}
                      value={formData[field.id] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background disabled:opacity-70 text-sm"
                    />
                  )}
                </div>
              );
            })
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 border py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors">
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {isReadOnly && (
              <button
                type="button"
                disabled={downloadingPdf}
                onClick={async () => {
                  setDownloadingPdf(true);
                  try {
                    const cleanName = `${(doc.section?.name || 'official-document').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-signed.pdf`;
                    await applicationsApi.downloadOfficialPdf(doc.id, cleanName);
                  } catch (err: any) {
                    console.error(err);
                    alert(`Failed to download official PDF: ${err?.message || 'Unknown error'}`);
                  } finally {
                    setDownloadingPdf(false);
                  }
                }}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download Official PDF
              </button>
            )}
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  disabled={saveDraftMutation.isPending || submitMutation.isPending || !!uploadingField}
                  onClick={handleSaveDraft}
                  className="flex-1 border border-primary/30 text-primary hover:bg-primary/5 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saveDraftMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending || saveDraftMutation.isPending || !!uploadingField}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Form
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>

      {/* High-Resolution Document / Scan Lightbox Modal */}
      <AnimatePresence>
        {previewModalImage && (
          <ImageLightboxModal
            image={previewModalImage}
            onClose={() => setPreviewModalImage(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── High-Resolution Image Lightbox Modal ─────────────────────────────────────

function ImageLightboxModal({
  image,
  onClose,
}: {
  image: { url: string; title: string };
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveMediaUrl(image.url);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(resolvedUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanName = `${image.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "document_scan"}.jpg`;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      window.open(resolvedUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] flex flex-col items-center justify-between p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between gap-4 py-2.5 px-5 bg-card/90 dark:bg-card/90 border border-border/60 rounded-2xl backdrop-blur-md z-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-sm sm:text-base font-bold truncate text-foreground">{image.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
            title="Download full scan"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download Scan
          </button>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-all border"
            title="Open full image in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open New Tab</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            title="Close viewer (Esc)"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="w-full max-w-5xl flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {imageError ? (
          <div className="flex flex-col items-center justify-center p-8 bg-card/90 border border-border rounded-2xl max-w-md text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">{image.title}</h4>
              <p className="text-xs text-muted-foreground mt-1.5">
                The document scan is securely attached. You can download it directly or open it in a new browser tab.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Scan
              </button>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-all border"
              >
                <ExternalLink className="w-4 h-4" />
                Open New Tab
              </a>
            </div>
          </div>
        ) : (
          <img
            src={resolvedUrl}
            alt={image.title}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.triedFallback && image.url && !image.url.startsWith('data:') && !image.url.includes('/upload/view')) {
                target.dataset.triedFallback = 'true';
                const baseUrl = API_URL.replace(/\/+$/, "");
                target.src = `${baseUrl}/upload/view?url=${encodeURIComponent(image.url)}`;
              } else {
                setImageError(true);
              }
            }}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none"
          />
        )}
      </div>

      {/* Bottom Hint */}
      <div
        className="text-xs text-white/70 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px]">Esc</kbd> or click anywhere outside to close
      </div>
    </motion.div>
  );
}

// ── Password Change Modal ────────────────────────────────────────────────────

function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const changeMutation = useMutation({
    mutationFn: () => authApi.changePassword(formData.currentPassword, formData.newPassword),
    onSuccess: () => {
      alert("Password changed successfully!");
      onClose();
      // Update the store so the prompt goes away
      const store = useAuthStore.getState();
      if (store.user) {
        store.setAuth({ ...store.user, mustChangePassword: false }, store.token!);
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to change password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    changeMutation.mutate();
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden"
      >
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Change Password</h2>
            <p className="text-xs text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <input
              type="password" required
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <input
              type="password" required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <input
              type="password" required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={changeMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/95 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {changeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update Password
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Floating AI Chatbot Companion ("Reliant Companion") ──────────────────────

function ChatbotCompanion({ activeTab }: { activeTab: "applications" | "courses" | "certificates" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [greetingContext, setGreetingContext] = useState("");
  
  // Entitlement governance switches
  const [eligibility, setEligibility] = useState({ appEnabled: true, lmsEnabled: false });
  const [loadingConfig, setLoadingConfig] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch AI governance switches dynamically on tab changes
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoadingConfig(true);
        const res = await aiApi.checkConfig();
        if (res?.status === "success" && res?.data) {
          setEligibility(res.data);
        }
      } catch (err) {
        console.error("Failed to load user chatbot eligibility:", err);
      } finally {
        setLoadingConfig(false);
      }
    }
    fetchConfig();
  }, [activeTab]);

  // Load chat logs history when opening the chat bubble
  useEffect(() => {
    if (!isOpen) return;

    async function loadHistory() {
      try {
        const res = await aiApi.getHistory();
        if (res?.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
          const latestConv = res.data[0]; // Load latest conversation session
          setConversationId(latestConv.id);
          
          if (Array.isArray(latestConv.messages) && latestConv.messages.length > 0) {
            setMessages(
              latestConv.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender === "USER" ? "user" : "assistant",
                content: m.content,
                timestamp: new Date(m.createdAt),
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    loadHistory();
  }, [isOpen]);

  // Scroll to the bottom of message list whenever messages change or window opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isSending]);

  // Determine visibility based on active workspace tab and administrator configurations
  const isVisible =
    !loadingConfig &&
    ((activeTab === "applications" && eligibility.appEnabled) ||
      (activeTab === "courses" && eligibility.lmsEnabled));

  if (!isVisible) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistically render user message
    const tempUserMsg = {
      id: Math.random().toString(),
      sender: "user",
      content: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const portalType = activeTab === "courses" ? "lms" : "application";
      const res = await aiApi.chat(portalType, userText, conversationId);
      
      if (res?.status === "success" && res?.data) {
        const data = res.data;
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        if (data.greetingContext) {
          setGreetingContext(data.greetingContext);
        }
        if (data.message) {
          const aiMsg = {
            id: data.message.id,
            sender: "assistant",
            content: data.message.content,
            timestamp: new Date(data.message.createdAt),
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      }
    } catch (err: any) {
      console.error("Failed to send chatbot message:", err);
      const errMsg = {
        id: Math.random().toString(),
        sender: "assistant",
        content: err.message || "I apologize, but I encountered an error communicating with the clinical companion servers. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const currentRoleTitle = activeTab === "courses" ? "Clinical Study Mentor" : "Reliant Care Companion";
  const portalPlaceholder = activeTab === "courses" 
    ? "Ask about clinical guidelines, HIPAA privacy, patient hygiene..."
    : "Ask about uploading forms, BLS prerequisites, TB clearances...";

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all relative border border-primary/20"
          >
            <MessageSquare className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-bold items-center justify-center">AI</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 50, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.9, opacity: 0 }}
            className="w-[370px] sm:w-[400px] h-[550px] bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-md relative border-border/80"
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/95 to-primary flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  {activeTab === "courses" ? <Sparkles className="w-5 h-5" /> : <Bot className="w-5 h-5 animate-bounce" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">{currentRoleTitle}</h3>
                  <span className="text-[10px] text-white/80 block mt-0.5 font-medium max-w-[200px] truncate">
                    {greetingContext || (activeTab === "courses" ? "Live Clinical Mentoring" : "Live Onboarding Guide")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/85 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-slate-900/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Welcome to Reliant Assistant!</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                      {activeTab === "courses"
                        ? "Hello! I am your clinical orientator. Ask me any conceptual clinical orientation questions or HIPAA rules!"
                        : "Hi! I am the Reliant Companion. Ask me how to upload files, verify credentials, or check application standings!"}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] ${
                      m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-md"
                          : "bg-card border shadow-sm rounded-tl-none text-foreground font-normal"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground/80 mt-1 px-1">
                      {m.sender === "user" ? "You" : currentRoleTitle} · {m.timestamp ? m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isSending && (
                <div className="flex flex-col mr-auto items-start max-w-[80%]">
                  <div className="bg-card border shadow-sm p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Submission Footer Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-card flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={portalPlaceholder}
                className="flex-1 border rounded-xl px-4 py-2.5 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttestationSignOff({
  courseTitle,
  onAttestationComplete
}: {
  courseTitle: string;
  onAttestationComplete: (signatureUrl: string) => Promise<void>;
}) {
  const [signature, setSignature] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("reliant_applicant_signature") || null;
    }
    return null;
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!signature) {
      alert("Please draw your signature first.");
      return;
    }
    if (!agreed) {
      alert("You must agree to the attestation statement.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onAttestationComplete(signature);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompliance = courseTitle.toLowerCase().includes("compulsory") || courseTitle.toLowerCase().includes("annual");

  const attestationText = isCompliance 
    ? "I attest that I completed the annual OLTL-required training and reviewed each topic in this course curriculum. I understand my responsibilities related to participant rights, incident reporting, complaint resolution, quality management, and fraud and financial abuse prevention. I agree to comply with all applicable agency policies and procedures."
    : "I attest that I have fully read, watched, and completed all required training modules in this clinical onboarding curriculum. I certify that I completed the lessons and exams independently.";

  return (
    <div className="bg-card border rounded-2xl p-6 text-left space-y-5 shadow-sm max-w-lg mx-auto">
      <div className="space-y-1">
        <h3 className="font-extrabold text-lg text-primary">Required E-Signature Attestation</h3>
        <p className="text-xs text-muted-foreground font-semibold">Sign below to confirm you completed this course and issue your certificate.</p>
      </div>

      <div className="bg-muted/15 border rounded-xl p-4 text-xs leading-relaxed text-foreground/90 font-medium">
        {attestationText}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Draw Your Signature</label>
        <SignaturePad value={signature || undefined} onChange={setSignature} />
      </div>

      <div className="flex items-start gap-2.5">
        <input 
          type="checkbox"
          id="attestAgree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5 cursor-pointer"
        />
        <label htmlFor="attestAgree" className="text-xs text-muted-foreground font-semibold leading-normal cursor-pointer select-none">
          I attest under penalty of perjury that the signature above is my own and the information is true and correct.
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !signature || !agreed}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Submit Attestation & Unlock Certificate"
        )}
      </button>
    </div>
  );
}
