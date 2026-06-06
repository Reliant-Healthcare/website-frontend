"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Briefcase, MapPin, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { jobsApi } from "@/lib/api";

const DEPARTMENTS = ["All Departments", "Skilled Nursing", "Therapy", "Caregiving", "Social Services", "Administration"];
const JOB_TYPES = ["All Types", "Full-Time", "Part-Time", "PRN", "Contract"];

type Job = {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  createdAt: string;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [jobType, setJobType] = useState("All Types");

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getActive({
        search: search || undefined,
        department: department !== "All Departments" ? department : undefined,
        type: jobType !== "All Types" ? jobType : undefined,
      });
      setJobs(data);
    } catch {
      setError("Unable to load job listings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [search, department, jobType]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = () => setSearch(searchInput.trim());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setDepartment("All Departments");
    setJobType("All Types");
  };

  const hasFilters = search || department !== "All Departments" || jobType !== "All Types";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Healthcare Family</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Build a rewarding career making a difference in people&apos;s lives. We&apos;re looking for compassionate professionals to join our team.
          </p>
          <div className="max-w-2xl mx-auto flex items-center bg-background rounded-full border shadow-sm p-2">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search jobs by title, keyword, or location..."
                className="w-full bg-transparent border-none focus:outline-none text-foreground"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold">Open Positions</h2>
              {!isLoading && (
                <p className="text-muted-foreground text-sm mt-1">
                  {jobs.length} {jobs.length === 1 ? "position" : "positions"} found
                  {hasFilters && " · "}
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-primary hover:underline">
                      Clear filters
                    </button>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-primary"
              >
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-primary"
              >
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Active search tag */}
          {search && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Showing results for:</span>
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary/20">
                &ldquo;{search}&rdquo;
                <button onClick={() => { setSearch(""); setSearchInput(""); }} className="hover:text-primary/70 ml-1">×</button>
              </span>
            </div>
          )}

          {/* States */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading open positions...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-destructive">
              <AlertCircle className="w-10 h-10" />
              <p className="font-medium">{error}</p>
              <button onClick={fetchJobs} className="text-sm text-primary hover:underline">Retry</button>
            </div>
          )}

          {!isLoading && !error && jobs.length === 0 && (
            <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-border">
              <Briefcase className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-semibold mb-2">No positions found</h3>
              <p className="text-muted-foreground mb-6">
                {hasFilters
                  ? "No jobs match your current filters."
                  : "There are no open positions at this time. Check back soon!"}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="group border rounded-xl p-6 hover:shadow-md transition-all hover:border-primary/50 bg-card flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors truncate">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" /> {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {job.type}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/careers/apply?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* General application CTA */}
          <div className="mt-12 text-center p-8 bg-secondary/30 rounded-xl border">
            <h3 className="text-xl font-bold mb-2">Don&apos;t see a perfect fit?</h3>
            <p className="text-muted-foreground mb-6">
              Submit a general application and we&apos;ll keep you in mind for future opportunities.
            </p>
            <Link
              href="/careers/apply"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              General Application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
