"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TrainingDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium">Redirecting you to the unified portal...</p>
    </div>
  );
}
