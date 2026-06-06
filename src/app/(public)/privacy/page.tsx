import PageHeader from "@/components/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Reliant Home Health",
  description: "Learn about how Reliant Home Health collects, stores, protects, and handles your personal, career, and training information.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            Reliant Home Health Agency, Inc. (&quot;Reliant,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy and security of your personal information.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, register for training courses, submit career applications, or interact with our digital patient services. Please read this policy carefully.
          </p>
        </>
      )
    },
    {
      id: "information-collection",
      title: "2. Information We Collect",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us, register for our services, submit an employment application, or participate in our training courses.
          </p>
          <p className="text-foreground/75 leading-relaxed mb-2 font-medium text-foreground">
            The personal information we collect may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/75 mb-4">
            <li><strong>Contact Details:</strong> First and last name, email address, phone number, and physical address.</li>
            <li><strong>Career Information:</strong> Employment history, education details, certifications, references, resumes, cover letters, and professional licenses.</li>
            <li><strong>Account Credentials:</strong> Passwords, security questions, and verification logs.</li>
            <li><strong>Course Metrics:</strong> Quiz scores, lesson progression data, attendance logs, and digital certifications.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system, and website usage statistics collected via cookies and trackers.</li>
          </ul>
        </>
      )
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            We use the information we collect to run our operations, process applications, deliver excellent training programs, and fulfill legal requirements.
          </p>
          <p className="text-foreground/75 leading-relaxed mb-2 font-medium text-foreground">
            Specifically, we use your personal information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/75 mb-4">
            <li>Process, review, and evaluate your employment applications;</li>
            <li>Create and maintain your training portal and applicant portal accounts;</li>
            <li>Track and verify your progress through certified home health courses;</li>
            <li>Send you transactional notifications, including login links, password reset details, and training updates;</li>
            <li>Respond to support requests and maintain communication;</li>
            <li>Enforce our website terms, ensure network security, and prevent fraudulent activity;</li>
            <li>Comply with federal, state, and local health regulations and employment standards.</li>
          </ul>
        </>
      )
    },
    {
      id: "hipaa-compliance",
      title: "4. Health Insurance Portability & Accountability Act (HIPAA)",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4 font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-200/50">
            HIPAA Notice: As a home health agency, we are fully committed to protecting protected health information (PHI) in compliance with the Health Insurance Portability and Accountability Act (HIPAA).
          </p>
          <p className="text-foreground/75 leading-relaxed">
            Any PHI collected from or about patients receives the highest level of security and privacy protections. Our handling of patient health records is governed by our comprehensive HIPAA Joint Notice of Privacy Practices, which is provided separately to all patients upon initiation of care.
          </p>
        </>
      )
    },
    {
      id: "sharing",
      title: "5. How We Share Your Information",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            We do not sell, rent, or trade your personal information. We only share information with trusted third parties under strict confidentiality terms for functional operational purposes.
          </p>
          <p className="text-foreground/75 leading-relaxed mb-2 font-medium text-foreground">
            We may share information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/75 mb-4">
            <li><strong>Service Providers:</strong> Secure database hosts, cloud-storage engines, email distribution clients (e.g., ZeptoMail, Mailtrap), and analytical tools;</li>
            <li><strong>Regulatory Agencies:</strong> State licensing boards, accreditation bodies, and health inspectors to verify training certifications and clinical compliance;</li>
            <li><strong>Legal Obligation:</strong> If required by court orders, search warrants, or subpoenas, or to protect the safety, property, and rights of Reliant, our patients, and staff.</li>
          </ul>
        </>
      )
    },
    {
      id: "security",
      title: "6. Data Security",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            We utilize robust administrative, technical, and physical security measures to safeguard your personal data. This includes advanced encryption for data at rest and in transit (SSL/TLS protocols), firewalls, access control logging, and periodic security reviews.
          </p>
          <p className="text-foreground/75 leading-relaxed">
            Please be aware, however, that no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.
          </p>
        </>
      )
    },
    {
      id: "retention",
      title: "7. Data Retention",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed">
            We retain your personal information, including training logs and job applications, for as long as your account is active, or as necessary to evaluate career opportunities, fulfill educational certifications, maintain financial records, resolve disputes, and comply with state and federal health agency data retention mandates.
          </p>
        </>
      )
    },
    {
      id: "rights",
      title: "8. Your Privacy Rights",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            Depending on your jurisdiction, you may have specific rights regarding your personal information under state or federal laws.
          </p>
          <p className="text-foreground/75 leading-relaxed mb-2 font-medium text-foreground">
            These rights may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/75 mb-4">
            <li><strong>Access:</strong> The right to request copies of your personal information collected by us;</li>
            <li><strong>Correction:</strong> The right to request that we correct or update inaccurate or incomplete records;</li>
            <li><strong>Deletion:</strong> The right to request that we erase your personal data, subject to regulatory, legal, and financial retention requirements;</li>
            <li><strong>Opt-Out:</strong> The right to unsubscribe from non-essential promotional and educational updates.</li>
          </ul>
        </>
      )
    },
    {
      id: "contact-us",
      title: "9. Contact Us",
      content: (
        <>
          <p className="text-foreground/75 leading-relaxed mb-4">
            If you have questions, comments, or concerns about this Privacy Policy, or if you would like to exercise any of your privacy rights, please contact our privacy compliance team at:
          </p>
          <div className="bg-muted p-6 rounded-2xl border border-border/60 text-sm space-y-1 text-foreground/80 font-medium">
            <p className="font-bold text-foreground">Reliant Home Health Agency, Inc.</p>
            <p>Attn: Privacy Compliance Officer</p>
            <p>123 Healthcare Ave, Suite 100</p>
            <p>Cityville, ST 12345</p>
            <p>Email: privacy@reliant.com</p>
            <p>Phone: (555) 123-4567</p>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <PageHeader 
        title="Privacy Policy" 
        description="We are committed to protecting your privacy. This policy outlines how we handle, process, and secure your personal and professional information." 
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
