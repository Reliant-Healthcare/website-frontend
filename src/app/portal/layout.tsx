"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";
import { LogOut, User, Loader2 } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
          <Link href="/portal" className="text-xl font-bold flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-sm">R</div>
            Reliant Portal
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground border-r pr-4">
              <User className="w-4 h-4" />
              {user?.firstName} {user?.lastName}
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
    </div>
  );
}
