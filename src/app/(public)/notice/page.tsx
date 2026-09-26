"use client";

import { ShieldAlert, Phone, Mail, Building, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cmsApi } from "@/lib/api";

export default function NoticePage() {
  const { data: noticeData, isLoading } = useQuery({
    queryKey: ["cms", "public", "notice-statement"],
    queryFn: () => cmsApi.getSection("public", "notice-statement"),
  });

  const title = noticeData?.content?.title || "Official Notice of Non-Affiliation";
  const defaultBody = `It has come to our attention that an entity operating under the name "Reliant at Home Care" (or "Rekiant at Home Care") has recently ceased operations. Due to the similarity in names and unauthorized use of branding elements resembling ours from over a decade ago, there has been significant confusion in the community.

We are deeply sympathetic to the former employees and clients of "Reliant at Home Care" who are currently seeking missing paychecks or disruption in services due to their closure. However, because we are an entirely different corporation, we cannot process payments, retrieve records, or assist with employment matters regarding that company.`;

  const body = noticeData?.content?.body || defaultBody;

  return (
    <div className="flex-1 bg-muted/20 pb-20 font-sans">
      {/* Header */}
      <section className="bg-primary pt-24 pb-32 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 font-medium max-w-2xl mx-auto">
            Clarification regarding Reliant Home Health Agency and the unaffiliated entity known as "Reliant at Home Care".
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-xl border overflow-hidden">
            <div className="p-8 md:p-12 space-y-8 text-foreground/80 leading-relaxed">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p>Loading official statement...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-semibold text-lg text-foreground">To Our Community, Partners, and the General Public:</p>
                  
                  {body.split('\n').map((paragraph: string, idx: number) => (
                    paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                  
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 my-8">
                    <h3 className="font-bold text-destructive text-xl mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-6 h-6" /> Please Be Advised
                    </h3>
                    <p className="text-destructive font-medium">
                      <strong>Reliant Home Health Agency Inc.</strong> is a separate, independent, and fully accredited clinical home health agency. We have absolutely <strong>zero affiliation</strong>, shared ownership, or business relationship with the non-medical home care company known as "Reliant at Home Care".
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6 pt-6 border-t border-border">
                <h3 className="text-2xl font-bold text-foreground">How We Are Different</h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" /> Accredited Health Agency
                    </h4>
                    <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                      We are a fully accredited medical home health agency employing registered nurses and clinical staff, adhering to strict state regulations (55 Pa. Code).
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 border rounded-xl p-6">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <Building className="w-5 h-5 text-muted-foreground" /> The Closed Entity
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      "Reliant at Home Care" was an unaccredited, non-medical home care company that provided non-clinical services and did not employ medical nurses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <p>
                  We pride ourselves on our integrity, clinical excellence, and commitment to our staff and patients. We will continue to serve our community with the high standards of care we have always maintained.
                </p>
                <p>
                  If you are a former client of the closed agency seeking new, accredited home health services, we welcome you to contact our intake team to see how we can properly support your care needs.
                </p>
                <p className="font-semibold text-foreground pt-4">
                  Sincerely,<br/>
                  The Management Team<br/>
                  Reliant Home Health Agency Inc.
                </p>
              </div>

            </div>

            {/* Footer Contact Section */}
            <div className="bg-muted/30 p-8 md:px-12 border-t">
              <h4 className="font-bold text-foreground mb-4">Contact Our Actual Agency</h4>
              <div className="flex flex-col sm:flex-row gap-6">
                <a href="tel:1234567890" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Call our Office</span>
                </a>
                <Link href="/contact" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Contact Form</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
