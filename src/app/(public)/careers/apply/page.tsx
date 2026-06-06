"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronRight, UploadCloud, Download, MessageSquare,
  Loader2, X, Copy, KeyRound, FileText, Clock,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { applicationsApi, documentSectionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function ApplyPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const totalSteps = 3;
  const [accountInfo, setAccountInfo] = useState<{
    email: string;
    password: string | null;
    isNew: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleType: "skilled",
  });

  // Fetch default sections for the selected role type (preview on step 2)
  const { data: defaultSections = [] } = useQuery({
    queryKey: ["default-sections", formData.roleType],
    queryFn: () => documentSectionsApi.getDefaults(formData.roleType),
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitApplication = useMutation({
    mutationFn: async (data: any) => applicationsApi.submit(data),
    onSuccess: (result) => {
      const authData = result.data?.auth;
      if (authData) {
        setAccountInfo({
          email: authData.email,
          password: authData.generatedPassword,
          isNew: authData.isNewAccount,
        });
      }
      setStep(4); // Success step
    },
    onError: (error: Error) => {
      alert("There was an error submitting your application. Please try again.");
    },
  });

  const handleSubmit = () => {
    submitApplication.mutate(formData);
  };

  // Success / Account Created step
  if (step === 4) {
    const isNewUser = accountInfo?.isNew && accountInfo.password;

    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-lg border max-w-lg w-full mx-4 overflow-hidden"
        >
          {/* Header band */}
          <div className="bg-emerald-50 border-b border-emerald-100 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Application Submitted!</h2>
            <p className="text-emerald-700 text-sm">
              {isNewUser
                ? "We've created a portal account for you — log in to track your application and submit documents."
                : "Log in to your existing portal to track this application and submit documents."}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* NEW USER: credentials */}
            {isNewUser && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold">Your Login Credentials</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve also emailed these to you. Copy and save them before continuing.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-amber-200">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-0.5">Email</p>
                      <p className="font-mono text-sm font-bold text-amber-900">{accountInfo!.email}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(accountInfo!.email)}
                      className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600"
                      title="Copy email"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-0.5">Temporary Password</p>
                      <p className="font-mono text-xl font-bold text-amber-900 tracking-widest">{accountInfo!.password}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(accountInfo!.password!)}
                      className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600"
                      title="Copy password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-3 py-2 rounded-lg">
                  <AlertIcon />
                  You&apos;ll be prompted to set a new password on first login.
                </p>
              </motion.div>
            )}

            {/* RETURNING USER */}
            {!isNewUser && (
              <div className="bg-muted/40 rounded-xl p-4 text-sm text-muted-foreground flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>Use your existing account credentials to log in and track this application.</p>
              </div>
            )}

            {/* What's next */}
            <div>
              <p className="text-sm font-semibold mb-3">What happens next:</p>
              <ol className="space-y-2.5">
                {[
                  isNewUser ? "Log in using the credentials above" : "Log in to your portal",
                  "Our team reviews your application",
                  "Required documents are released to your portal",
                  "Upload or fill in documents to complete your application",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Log In to Portal →
              </Link>
              <Link
                href="/"
                className="flex-1 inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Return Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-muted/30 py-12 relative">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-8">
          <Link href="/careers" className="text-sm text-primary hover:underline font-medium mb-4 inline-block">
            &larr; Back to Careers
          </Link>
          <h1 className="text-3xl font-bold">Application Portal</h1>
          <p className="text-muted-foreground mt-2">Join our compassionate healthcare team.</p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />

            {["Personal Info", "Review Documents", "Submit"].map((label, i) => {
              const stepNumber = i + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;

              return (
                <div key={label} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                      isActive
                        ? "bg-primary border-primary text-primary-foreground scale-110"
                        : isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 absolute -bottom-6 w-max ${
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden mb-24">
          <div className="p-8">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Let&apos;s Get Started</h2>
                  <p className="text-muted-foreground text-sm">Tell us about yourself to begin the application process.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name *</label>
                    <input
                      type="text" name="firstName" required
                      value={formData.firstName} onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name *</label>
                    <input
                      type="text" name="lastName" required
                      value={formData.lastName} onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
                    <input
                      type="email" name="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input
                      type="tel" name="phone"
                      value={formData.phone} onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Which role are you applying for? *</label>
                    <select
                      name="roleType" value={formData.roleType} onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    >
                      <option value="skilled">Skilled Professional (RN, PT, OT, MSW, etc.)</option>
                      <option value="non-skilled">Non-Skilled Professional (HHA, Caregiver, etc.)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review documents that will be assigned */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Application Documents</h2>
                  <p className="text-muted-foreground text-sm">
                    These are the initial documents you&apos;ll need to complete. After submission, you can download, fill, and upload them from your portal. Additional documents may be released as your application progresses.
                  </p>
                </div>

                {defaultSections.length === 0 ? (
                  <div className="border rounded-xl p-8 text-center bg-muted/30">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-muted-foreground">
                      No default documents configured yet.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You can still submit your application. Documents will be made available in your portal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {defaultSections.map((section: any, i: number) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{section.name}</h3>
                          {section.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                          Will be available in portal
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    After submitting, an account will be created for you so you can log in, download forms, and upload completed documents.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Review &amp; Submit</h2>
                  <p className="text-muted-foreground text-sm">Please verify your information before submitting.</p>
                </div>

                <div className="bg-muted/30 p-6 rounded-xl border space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Applicant Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{formData.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Role Type</p>
                        <p className="font-medium">
                          {formData.roleType === "skilled" ? "Skilled Professional" : "Non-Skilled Professional"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {defaultSections.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                        Documents ({defaultSections.length})
                      </h3>
                      <div className="space-y-2">
                        {defaultSections.map((s: any) => (
                          <div key={s.id} className="flex items-center gap-2.5 text-sm bg-background p-2.5 rounded-lg border">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-medium">{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <AlertIcon />
                    By submitting, an account will be created for you. Login credentials will be shown on the next screen.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-muted/30 border-t p-6 flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={step === 1 || submitApplication.isPending}
              className="px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              Previous
            </button>
            <button
              onClick={step === totalSteps ? handleSubmit : nextStep}
              disabled={submitApplication.isPending || (step === 1 && (!formData.firstName || !formData.lastName || !formData.email))}
              className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
            >
              {submitApplication.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : step === totalSteps ? (
                "Submit Application"
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
            <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
              <div>
                <h3 className="font-bold">Reliant Assistant</h3>
                <p className="text-xs opacity-90">HR &amp; Application Support</p>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-primary-foreground/20 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/20">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm border">
                  Hi! I&apos;m your AI HR assistant. Do you need any help figuring out which forms to download or what information is required for your role?
                </div>
              </div>
            </div>

            <div className="p-3 border-t bg-background">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-muted border-none rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-primary focus:ring-1 focus:ring-primary"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] flex items-center justify-center group relative border-4 border-background"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}

          {!isChatOpen && (
            <>
              <span className="absolute right-full mr-4 bg-foreground text-background text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Need help applying?
              </span>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-primary"></span>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
