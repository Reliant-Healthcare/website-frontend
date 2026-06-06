"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(formData.email, formData.password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      if (["SUPER_ADMIN", "RECRUITER", "INSTRUCTOR", "CONTENT_MANAGER"].includes(data.user.role)) {
        router.push("/admin");
      } else {
        setError("Access denied. This portal is strictly for administrative users.");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Invalid administrative credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Light Theme Medical Blue/Teal Accents */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/30 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-8 bg-card border rounded-2xl shadow-xl p-8 relative z-10"
      >
        <div className="text-center">
          {/* Company Brand Logo */}
          <div className="relative w-48 h-14 mx-auto mb-4 flex items-center justify-center">
            <Image 
              src="/reliant-logo.png" 
              alt="Reliant Home Health Agency" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Administrative Portal
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground tracking-wider uppercase font-semibold flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            Authorized Personnel Access Only
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Admin Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                placeholder="admin@reliant.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3 pr-12 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-muted text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Return to Main Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
