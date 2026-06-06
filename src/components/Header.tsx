"use client";

import Link from "next/link";
import { HeartPulse, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/lib/auth-store";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    {
      name: isAuthenticated ? "Learning Center" : "Training Portal",
      href: isAuthenticated ? "/portal?tab=courses" : "/training",
    },
    { name: "Contact", href: "/contact" },
  ];

  const isAdmin = user && (user.role === "SUPER_ADMIN" || user.role === "RECRUITER");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-40 h-12">
              <Image 
                src="/reliant-logo.png" 
                alt="Reliant Home Health Agency" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center gap-4 ml-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link 
                  href="/portal" 
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Candidate Portal
                </Link>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Log in
              </Link>
            )}
            <Link 
              href="/contact" 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Request Care
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-2" />
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-base font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Link 
                  href="/portal" 
                  className="text-base font-semibold text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Candidate Portal
                </Link>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-base font-medium text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
            )}
            <Link 
              href="/contact" 
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Request Care
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
