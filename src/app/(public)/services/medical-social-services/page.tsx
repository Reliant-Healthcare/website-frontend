import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Medical Social Services | Reliant Home Health",
  description: "Reliant Home Health's licensed medical social workers provide counseling, resource navigation, and emotional support to help patients and families navigate complex healthcare challenges.",
};

const highlights = [
  "Psychosocial assessment and care planning",
  "Emotional support and counseling for patients and families",
  "Community resource identification and referrals",
  "Assistance navigating healthcare systems and insurance",
  "Advance care planning and end-of-life support",
  "Crisis intervention and safety planning",
  "Caregiver stress assessment and support",
  "Coordination with community organizations and support groups",
];

const conditions = [
  "Chronic illness management",
  "Terminal diagnoses and palliative care",
  "Post-stroke recovery support",
  "Caregiver burnout and family stress",
  "Mental health and depression",
  "Social isolation and loneliness",
  "Housing or financial hardship",
];

export default function MedicalSocialServicesPage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Medical Social Services"
        description="Our licensed medical social workers provide the emotional support, counseling, and community resources needed to help patients and families navigate complex healthcare challenges."
      />

      {/* Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Whole-Person Support for You and Your Family
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Healthcare challenges are rarely just physical. Fear, financial pressure, caregiver fatigue, and emotional distress are equally real barriers to recovery. Our licensed clinical social workers address all dimensions of well-being to help you navigate your healthcare journey with clarity and confidence.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Working closely with your entire care team, our social workers develop comprehensive psychosocial plans, connect you with vital community resources, and provide the emotional support that makes a genuine difference.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/social_services.png"
                alt="Social worker meeting with elderly patient"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">How We Support You</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-4 bg-card border border-border p-5 rounded-xl shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Situations We Help With</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our social workers are experienced in supporting patients and families across a wide range of difficult circumstances.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {conditions.map((c) => (
                <span key={c} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">We&apos;re Here for You</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            You don&apos;t have to navigate this alone. Reach out today to speak with a compassionate member of our social services team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-background text-primary font-bold text-sm hover:bg-background/90 transition-colors"
            >
              Request a Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="tel:+15551234567"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md border-2 border-primary-foreground text-primary-foreground font-bold text-sm hover:bg-primary-foreground hover:text-primary transition-colors"
            >
              <Phone className="mr-2 h-4 w-4" /> (555) 123-4567
            </Link>
          </div>
          <div className="mt-10">
            <Link href="/services" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
              ← Back to All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
