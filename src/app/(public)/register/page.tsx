"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Shield, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      }),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push("/portal");
    },
    onError: (err: Error) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    registerMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Passwords match", met: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
  ];

  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 bg-card border rounded-2xl shadow-xl p-8 relative z-10"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to track your applications and access training.
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">First Name</label>
              <input
                type="text" name="firstName" required
                value={formData.firstName} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Jane"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Last Name</label>
              <input
                type="text" name="lastName" required
                value={formData.lastName} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Email Address</label>
            <input
              type="email" name="email" required
              value={formData.email} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Phone Number</label>
            <input
              type="tel" name="phone"
              value={formData.phone} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} name="password" required
                value={formData.password} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5 pr-12 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Confirm Password</label>
            <input
              type="password" name="confirmPassword" required
              value={formData.confirmPassword} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Password Requirements */}
          <div className="space-y-1.5 pt-1">
            {passwordRequirements.map((req) => (
              <div key={req.label} className={`flex items-center gap-2 text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${req.met ? "text-emerald-500" : "text-muted-foreground/50"}`} />
                {req.label}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 mt-4"
          >
            {registerMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">
                Create Account <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-muted text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
