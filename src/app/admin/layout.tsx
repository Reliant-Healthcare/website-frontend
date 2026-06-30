"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  BookOpen, 
  LogOut, 
  Bell, 
  Search, 
  Briefcase, 
  FileUp, 
  Shield, 
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Persistent sidebar collapsible state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(newVal));
      return newVal;
    });
  };

  const isAdminLogin = pathname === "/admin/login";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isAdminLogin) return;
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (!["SUPER_ADMIN", "RECRUITER", "INSTRUCTOR", "CONTENT_MANAGER"].includes(user?.role || "")) {
      router.push("/portal");
    }
  }, [isMounted, isAuthenticated, user, router, isAdminLogin]);

  // Query live counts for the badge count
  const { data: stats } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => applicationsApi.getDashboardStats(),
    enabled: isMounted && isAuthenticated && !isAdminLogin,
    refetchInterval: 10000,
  });

  const { data: contactStats } = useQuery({
    queryKey: ["contactUnreadCount"],
    queryFn: async () => {
      const { contactApi } = await import("@/lib/api");
      return contactApi.getUnreadCount();
    },
    enabled: isMounted && isAuthenticated && !isAdminLogin,
    refetchInterval: 30000,
  });

  const pendingCount = stats?.pendingApplications ?? 0;
  const unreadContactCount = contactStats?.count ?? 0;

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (isAdminLogin) {
    return <>{children}</>;
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !["SUPER_ADMIN", "RECRUITER", "INSTRUCTOR", "CONTENT_MANAGER"].includes(user?.role || "")) {
    return null;
  }

  const NavLink = ({ href, icon: Icon, children, badge }: { href: string, icon: any, children: React.ReactNode, badge?: number }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        title={isCollapsed ? String(children) : undefined}
        className={`flex items-center rounded-lg font-medium transition-all duration-200 relative ${
          isCollapsed 
            ? "justify-center w-12 h-12 mx-auto" 
            : "gap-3 px-4 py-2.5"
        } ${
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{children}</span>}
        {badge !== undefined && badge > 0 && (
          isCollapsed ? (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {badge}
            </span>
          ) : (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-background"}`}>
              {badge}
            </span>
          )
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className={`bg-card border-r flex flex-col shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-[76px]" : "w-64"
      }`}>
        <div className={`p-4 border-b flex items-center justify-between transition-all duration-300 ${
          isCollapsed ? "justify-center" : "px-6"
        }`}>
          {!isCollapsed && (
            <Link href="/admin" className="relative w-36 h-10 flex items-center">
              <Image 
                src="/reliant-logo.png" 
                alt="Reliant Home Health Agency" 
                fill
                className="object-contain"
                priority
              />
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              R
            </Link>
          )}
          <button 
            onClick={toggleSidebar} 
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isCollapsed ? (
            <hr className="my-4 border-muted/60" />
          ) : (
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Overview</div>
          )}
          <NavLink href="/admin" icon={LayoutDashboard}>Dashboard</NavLink>

          {isCollapsed ? (
            <hr className="my-4 border-muted/60" />
          ) : (
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-4">Recruiting</div>
          )}
          <NavLink href="/admin/applications" icon={Users} badge={pendingCount}>Applications</NavLink>
          <NavLink href="/admin/contacts" icon={Mail} badge={unreadContactCount}>Contact Inbox</NavLink>
          <NavLink href="/admin/jobs" icon={Briefcase}>Jobs Management</NavLink>
          <NavLink href="/admin/documents" icon={FileUp}>Document Sections</NavLink>
          <NavLink href="/admin/compliance" icon={ShieldCheck}>Compliance Tracking</NavLink>

          {isCollapsed ? (
            <hr className="my-4 border-muted/60" />
          ) : (
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-4">Learning</div>
          )}
          <NavLink href="/admin/courses" icon={BookOpen}>Courses (LMS)</NavLink>

          {user?.role === "SUPER_ADMIN" && (
            <>
              {isCollapsed ? (
                <hr className="my-4 border-muted/60" />
              ) : (
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-4">System</div>
              )}
              <NavLink href="/admin/accounts" icon={Shield}>Admin Users</NavLink>
              <NavLink href="/admin/cms" icon={FileText}>Website CMS</NavLink>
              <NavLink href="/admin/settings" icon={Settings}>Settings</NavLink>
            </>
          )}
        </nav>
        <div className="p-4 border-t space-y-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div 
                title={`${user?.firstName} ${user?.lastName}`}
                className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm border shadow-sm cursor-help"
              >
                {user?.firstName?.charAt(0) || ""}{user?.lastName?.charAt(0) || ""}
              </div>
              <button 
                onClick={handleLogout} 
                title="Log out"
                className="w-10 h-10 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  {user?.firstName?.charAt(0) || ""}{user?.lastName?.charAt(0) || ""}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{user?.role?.replace("_", " ")}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg font-medium transition-colors">
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search applicants, courses, or content..." 
                className="w-full bg-muted/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
