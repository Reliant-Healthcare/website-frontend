"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Upload, CheckCircle2, Clock, XCircle,
  Loader2, AlertCircle, Lock, ChevronRight, LogOut, User,
  Shield, Bell, KeyRound, BookOpen, Video, Award, Settings,
  Check, Play, ArrowRight, BookOpenCheck, ChevronLeft, Printer,
  MessageSquare, Sparkles, Bot, Send,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, authApi, coursesApi, aiApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import SignaturePad from "@/components/SignaturePad";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export default function PortalPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"applications" | "courses" | "certificates">("applications");
  
  // LMS Player & Certificate Modal States
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<any | null>(null);

  // Query applicant applications
  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.getMyApplications(),
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
                        <div key={course.id} className="bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {course.category}
                              </span>
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
                            <h4 className="font-bold text-base mb-2 group-hover:text-primary line-clamp-1">{course.title}</h4>
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
                              onClick={() => {
                                setActiveCourseId(course.id);
                                setActiveLessonId(null);
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
            onActiveLessonChange={setActiveLessonId}
            onClose={() => {
              setActiveCourseId(null);
              setActiveLessonId(null);
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

  const { data: courseDetails, isLoading } = useQuery({
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
    if (courseDetails?.lessons && courseDetails.lessons.length > 0 && !activeLessonId) {
      // Find the first uncompleted lesson
      const completedList = courseDetails.enrollment?.completedLessons || [];
      const uncompleted = courseDetails.lessons.find((l: any) => !completedList.includes(l.id));
      onActiveLessonChange(uncompleted ? uncompleted.id : courseDetails.lessons[0].id);
    }
  }, [courseDetails, activeLessonId]);

  if (isLoading || !courseDetails) {
    return (
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
          <p className="text-white text-sm font-semibold">Loading curriculum player...</p>
        </div>
      </div>
    );
  }

  const lessons = courseDetails.lessons || [];
  const enrollment = courseDetails.enrollment;
  const progress = enrollment?.progress || 0;
  const completedLessons: string[] = enrollment?.completedLessons || [];

  const activeLesson = lessons.find((l: any) => l.id === activeLessonId) || lessons[0];

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    await completeLessonMutation.mutateAsync(activeLesson.id);

    // Auto-advance to next uncompleted lesson in the sequence
    const currentIndex = lessons.findIndex((l: any) => l.id === activeLesson.id);
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) {
      onActiveLessonChange(nextLesson.id);
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
    <div className="fixed inset-0 bg-background z-50 flex flex-col font-sans">
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
                <p className="text-xs text-muted-foreground mt-1">Recruiters are currently uploading video lectures and readings for this module.</p>
              </div>
            ) : activeLesson ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    Topic {activeLesson.order || 1}
                  </span>
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
                        src={`${API_URL}${activeLesson.videoUrl}`}
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
                  <article className="prose prose-sm max-w-none pt-4 text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap font-sans border-t border-border/80">
                    {activeLesson.content}
                  </article>
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
                      href={`${API_URL}${activeLesson.readingFileUrl}`}
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
            ) : null}
          </div>

          {/* Footer action completion locks */}
          {lessons.length > 0 && activeLesson && (
            <div className="max-w-3xl mx-auto w-full border-t pt-6 mt-8 flex justify-between items-center gap-4 bg-background">
              <div className="text-xs text-muted-foreground font-semibold">
                {completedLessons.includes(activeLesson.id) ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> You've read/watched this topic.
                  </span>
                ) : (
                  <span>Ensure you review all videos and text guides before checking off this module.</span>
                )}
              </div>

              {!completedLessons.includes(activeLesson.id) ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={completeLessonMutation.isPending}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-extrabold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {completeLessonMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Mark Topic Complete
                </button>
              ) : (
                <button
                  onClick={() => {
                    const currentIndex = lessons.findIndex((l: any) => l.id === activeLesson.id);
                    const nextLesson = lessons[currentIndex + 1];
                    if (nextLesson) {
                      onActiveLessonChange(nextLesson.id);
                    } else if (progress >= 100) {
                      alert("You have completed this entire training course! Great job!");
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
              const isSelected = lesson.id === activeLessonId;
              const isDone = completedLessons.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => onActiveLessonChange(lesson.id)}
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
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-snug truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] font-semibold text-muted-foreground/80 uppercase">
                      {lesson.videoUrl && <span className="flex items-center gap-0.5"><Video className="w-3 h-3" /> Video</span>}
                      {lesson.content && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> Reading</span>}
                      {lesson.readingFileUrl && <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> Doc</span>}
                    </div>
                  </div>
                </button>
              );
            })}
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
              <div className="flex justify-between items-end gap-10 mt-14 max-w-xl mx-auto">
                <div className="w-36 border-t border-muted/80 pt-1.5 text-center">
                  <p className="text-[9px] font-semibold font-serif text-[#0d3b66] italic mb-0.5 leading-none">Elizabeth Warren, RN</p>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Clinical Director</p>
                </div>
                <div className="w-36 border-t border-muted/80 pt-1.5 text-center">
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

                <div className="flex items-center gap-2">
                  {/* Web Form or PDF actions */}
                  {(doc.section?.type === "WEB_FORM" || doc.section?.type === "BOTH") && (
                    <>
                      {(doc.status === "PENDING" || doc.status === "REJECTED") && !doc.uploadedFileUrl && (
                        <button
                          onClick={() => setFillingFormDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {doc.status === "REJECTED" ? "Re-fill Form" : "Fill Online"}
                        </button>
                      )}
                      {doc.formData && (doc.status === "UPLOADED" || doc.status === "APPROVED") && (
                        <button
                          onClick={() => setFillingFormDoc(doc)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="View your answers"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                        </button>
                      )}
                    </>
                  )}

                  {(doc.section?.type === "PDF" || doc.section?.type === "BOTH") && (
                    <>
                      {/* Download blank form */}
                      {doc.section?.fileUrl && !doc.formData && (
                        <a
                          href={`${API_URL}${doc.section.fileUrl}`}
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
                      href={`${API_URL}${doc.uploadedFileUrl}`}
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
            onClose={() => setFillingFormDoc(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Web Form Modal ───────────────────────────────────────────────────────────

function WebFormModal({ applicationId, doc, onClose }: { applicationId: string; doc: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isReadOnly = doc.status === "UPLOADED" || doc.status === "APPROVED";
  const [formData, setFormData] = useState<Record<string, any>>(doc.formData || {});
  
  const formSchema = Array.isArray(doc.section?.formSchema) ? doc.section.formSchema : [];

  const submitMutation = useMutation({
    mutationFn: (data: any) => applicationsApi.submitWebForm(applicationId, doc.sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      onClose();
    },
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border my-8"
      >
        <div className="p-6 border-b sticky top-0 bg-card rounded-t-2xl z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{doc.section?.name}</h2>
            {doc.section?.description && <p className="text-sm text-muted-foreground">{doc.section.description}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formSchema.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">This form has no fields configured.</p>
          ) : (
            formSchema.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  {field.label} {field.required && !isReadOnly && <span className="text-red-500">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    required={field.required && !isReadOnly}
                    disabled={isReadOnly}
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background min-h-[100px] disabled:opacity-70"
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
                ) : (
                  <input
                    type={field.type === "date" ? "date" : "text"}
                    required={field.required && !isReadOnly}
                    disabled={isReadOnly}
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background disabled:opacity-70"
                  />
                )}
              </div>
            ))
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 border py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors">
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Form
              </button>
            )}
          </div>
        </form>
      </motion.div>
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
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

