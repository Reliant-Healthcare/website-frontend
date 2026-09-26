"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cmsApi } from "@/lib/api";

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(false);

  const { data: bannerData, isLoading } = useQuery({
    queryKey: ["cms", "global", "banner"],
    queryFn: () => cmsApi.getSection("global", "banner"),
  });

  useEffect(() => {
    // Show only if not dismissed and if the CMS says it's active
    const dismissed = sessionStorage.getItem("dismissed-notice-banner");
    
    // Default to true if not set yet, but obey CMS if available
    const cmsIsActive = bannerData?.content?.isActive ?? true;
    
    if (!dismissed && cmsIsActive && !isLoading) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [bannerData, isLoading]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("dismissed-notice-banner", "true");
  };

  const defaultBannerText = "IMPORTANT: Reliant Home Health Agency is a fully accredited nursing agency. We are NOT affiliated with 'Reliant at Home Care' which recently closed operations.";
  const text = bannerData?.content?.text || defaultBannerText;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-destructive text-destructive-foreground overflow-hidden shadow-md relative z-[100]"
        >
          <div className="container mx-auto px-4 py-3 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div className="bg-white/20 p-1.5 rounded-md shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <strong className="text-xs sm:text-sm font-black tracking-wide uppercase">
                  Important Notice
                </strong>
                <span className="text-xs sm:text-sm font-medium opacity-90 leading-snug">
                  {text}
                </span>
                <Link 
                  href="/notice" 
                  className="text-xs sm:text-sm font-bold underline decoration-white/40 underline-offset-4 hover:decoration-white transition-all inline-flex items-center group mt-1 sm:mt-0 shrink-0"
                >
                  Read Official Statement
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            
            <button 
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0 -mr-2"
              title="Dismiss"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
