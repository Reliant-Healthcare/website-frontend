"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, CheckCircle2, PhoneCall } from "lucide-react";
import Link from "next/link";

export interface CountyInfo {
  name: string;
  region: string;
}

export const PA_SERVICED_COUNTIES: CountyInfo[] = [
  // Southeastern PA
  { name: "Bucks", region: "Southeastern PA" },
  { name: "Chester", region: "Southeastern PA" },
  { name: "Delaware", region: "Southeastern PA" },
  { name: "Montgomery", region: "Southeastern PA" },

  // Northeastern PA
  { name: "Carbon", region: "Northeastern PA" },
  { name: "Lackawanna", region: "Northeastern PA" },
  { name: "Lehigh", region: "Northeastern PA" },
  { name: "Luzerne", region: "Northeastern PA" },
  { name: "Monroe", region: "Northeastern PA" },
  { name: "Northampton", region: "Northeastern PA" },
  { name: "Pike", region: "Northeastern PA" },
  { name: "Schuylkill", region: "Northeastern PA" },
  { name: "Susquehanna", region: "Northeastern PA" },
  { name: "Wayne", region: "Northeastern PA" },
  { name: "Wyoming", region: "Northeastern PA" },

  // South Central PA
  { name: "Bedford", region: "South Central PA" },
  { name: "Berks", region: "South Central PA" },
  { name: "Cumberland", region: "South Central PA" },
  { name: "Franklin", region: "South Central PA" },
  { name: "Huntingdon", region: "South Central PA" },
  { name: "Juniata", region: "South Central PA" },
  { name: "Lancaster", region: "South Central PA" },
  { name: "Lebanon", region: "South Central PA" },
  { name: "Mifflin", region: "South Central PA" },
  { name: "Perry", region: "South Central PA" },
  { name: "Snyder", region: "South Central PA" },
  { name: "Somerset", region: "South Central PA" },
  { name: "York", region: "South Central PA" },

  // Central & North Central PA
  { name: "Blair", region: "Central PA" },
  { name: "Bradford", region: "Central PA" },
  { name: "Cambria", region: "Central PA" },
  { name: "Centre", region: "Central PA" },
  { name: "Clinton", region: "Central PA" },
  { name: "Columbia", region: "Central PA" },
  { name: "Lycoming", region: "Central PA" },
  { name: "Montour", region: "Central PA" },
  { name: "Sullivan", region: "Central PA" },
  { name: "Tioga", region: "Central PA" },
  { name: "Union", region: "Central PA" },

  // Western PA
  { name: "Allegheny", region: "Western PA" },
  { name: "Armstrong", region: "Western PA" },
  { name: "Beaver", region: "Western PA" },
  { name: "Fayette", region: "Western PA" },
  { name: "Greene", region: "Western PA" },
  { name: "Indiana", region: "Western PA" },
  { name: "Lawrence", region: "Western PA" },
  { name: "Warren", region: "Western PA" },
  { name: "Washington", region: "Western PA" },
  { name: "Westmoreland", region: "Western PA" },
];

export default function ServiceAreaSection({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const regions = ["All", "Southeastern PA", "Northeastern PA", "South Central PA", "Central PA", "Western PA"];

  const filteredCounties = useMemo(() => {
    return PA_SERVICED_COUNTIES.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesRegion = selectedRegion === "All" || c.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  return (
    <section className="py-20 bg-background border-t border-border" id="service-areas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span>OLTL Authorized Service Areas</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title || "Counties We Service Across Pennsylvania"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {subtitle || "Reliant Home Health Agency is authorized to provide compassionate, high-quality home care services across 49 Pennsylvania counties."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your county in Pennsylvania (e.g. Delaware, Allegheny, Lancaster...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-input bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRegion === region
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {region} {region === "All" ? `(${PA_SERVICED_COUNTIES.length})` : `(${PA_SERVICED_COUNTIES.filter(c => c.region === region).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Counties Grid */}
        <div className="max-w-5xl mx-auto">
          {filteredCounties.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCounties.map((county) => (
                <div
                  key={county.name}
                  className="flex items-center gap-2.5 p-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all group"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="overflow-hidden">
                    <span className="font-semibold text-foreground text-sm block truncate">
                      {county.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {county.region}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-2xl bg-muted/20">
              <p className="text-muted-foreground font-medium mb-2">No counties match "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground">
                We service 49 counties across PA. Please call our team at <strong>610-534-1414</strong> to verify coverage for your specific location.
              </p>
            </div>
          )}
        </div>

        {/* Coverage Note & Call-to-Action */}
        <div className="mt-12 max-w-3xl mx-auto text-center bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="font-bold text-foreground text-base">Authorized by OLTL (Office of Long-Term Living)</h4>
            <p className="text-sm text-muted-foreground">
              Providing Home Health & Community-Based services across 49 Pennsylvania counties.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0 hover:bg-primary/90 transition-colors shadow"
          >
            <PhoneCall className="w-4 h-4" /> Request Care in Your County
          </Link>
        </div>
      </div>
    </section>
  );
}
