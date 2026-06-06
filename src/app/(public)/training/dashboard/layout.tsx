import Link from "next/link";
import { LayoutDashboard, BookOpen, Award, Settings, LogOut, Search, Bell } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r flex flex-col shrink-0">
        <div className="p-6 border-b">
          <Link href="/training" className="font-bold text-xl text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            LMS Portal
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/training/dashboard" className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/training/courses" className="flex items-center gap-3 text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-3 rounded-lg font-medium transition-colors">
            <VideoIcon className="w-5 h-5" />
            My Courses
          </Link>
          <Link href="/training/certificates" className="flex items-center gap-3 text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-3 rounded-lg font-medium transition-colors">
            <Award className="w-5 h-5" />
            Certificates
          </Link>
        </nav>
        <div className="p-4 border-t space-y-2">
          <Link href="/settings" className="flex items-center gap-3 text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-2 rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="w-full bg-muted/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              JD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
