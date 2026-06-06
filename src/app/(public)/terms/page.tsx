import PageHeader from "@/components/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Reliant Home Health",
  description: "Read the terms and conditions for using Reliant Home Health's website, applicant portal, and professional training programs.",
};

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            By accessing and using the website and services of Reliant Home Health Agency, Inc. (&quot;Reliant,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;) and all applicable laws and regulations.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
          </p>
        </>
      )
    },
    {
      id: "eligibility",
      title: "2. Eligibility & Account Security",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            You must be at least 18 years old to apply for jobs or register for courses on our platform. By creating an account or submitting an application, you represent and warrant that all information you provide is accurate, current, and complete.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            You are entirely responsible for maintaining the confidentiality of your account credentials (username and password) and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </>
      )
    },
    {
      id: "medical-disclaimer",
      title: "3. Medical Content Disclaimer",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4 font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200/50">
            IMPORTANT: The content provided on this website, including texts, graphics, images, and training materials, is for informational and educational purposes only.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
          </p>
        </>
      )
    },
    {
      id: "permitted-use",
      title: "4. Permitted Use & Restrictions",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            Reliant grants you a limited, non-exclusive, non-transferable, revocable license to access and use our website and resources strictly for personal, non-commercial purposes, or professional training purposes associated with our certified programs.
          </p>
          <p className="text-foreground/75 leading-relaxed mb-2 font-medium text-foreground">
            Under this license, you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/75 mb-4">
            <li>Modify, copy, or distribute the materials for any commercial purpose or public display;</li>
            <li>Attempt to decompile, reverse engineer, or extract source code from any software on the website;</li>
            <li>Remove any copyright or other proprietary notations from the materials;</li>
            <li>Use automated systems (robots, spiders, scrapers) to access the website;</li>
            <li>Share your training portal or applicant credentials with third parties.</li>
          </ul>
        </>
      )
    },
    {
      id: "intellectual-property",
      title: "5. Intellectual Property Rights",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            All proprietary software, code, designs, graphics, course curriculums, lesson plans, videos, and texts displayed on this website are the intellectual property of Reliant Home Health Agency, Inc. or its licensors and are protected by United States and international intellectual property laws.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            Your use of the site does not transfer to you any right, title, or interest in or to such intellectual property rights.
          </p>
        </>
      )
    },
    {
      id: "limitation-of-liability",
      title: "6. Limitation of Liability",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            In no event shall Reliant or its directors, officers, employees, or partners be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we have been notified orally or in writing of the possibility of such damage.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            Some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, so these limitations may not apply to you.
          </p>
        </>
      )
    },
    {
      id: "termination",
      title: "7. Account Termination",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed">
            We reserve the right, without notice and in our sole discretion, to terminate your license to use the website, and to block or prevent your future access to and use of the website if you violate any of these Terms, or if we deem it necessary for security or legal reasons.
          </p>
        </>
      )
    },
    {
      id: "governing-law",
      title: "8. Governing Law & Jurisdiction",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of the State in which Reliant Home Health Agency operates, without regard to its conflict of law principles. You irrevocably submit to the exclusive jurisdiction of the state and federal courts in that State.
          </p>
        </>
      )
    },
    {
      id: "changes",
      title: "9. Changes to Terms",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            Reliant may revise these Terms of Service for its website at any time without prior notice. By using this website, you are agreeing to be bound by the then-current version of these Terms.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            We encourage you to periodically review this page to stay informed of any changes. Your continued use of the platform constitutes your acceptance of the updated terms.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <PageHeader 
        title="Terms of Service" 
        description="Please read these terms carefully before using our platform, applying for careers, or enrolling in training courses." 
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/4 lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">On This Page</h2>
              <nav className="flex flex-col gap-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="text-sm text-foreground/70 hover:text-primary hover:translate-x-1 transition-all duration-200 font-medium"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last Updated: May 21, 2026
                </p>
              </div>
            </div>
          </aside>

          {/* Core Content */}
          <div className="lg:w-3/4 bg-card border border-border p-8 sm:p-12 rounded-3xl shadow-sm space-y-12">
            {sections.map((section) => (
              <section 
                key={section.id} 
                id={section.id} 
                className="scroll-mt-24 pb-8 border-b border-border last:border-b-0 last:pb-0"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {section.title}
                </h2>
                <div className="text-foreground/80">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
