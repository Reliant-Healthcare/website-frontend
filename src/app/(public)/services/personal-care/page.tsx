import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Home Health Aide / CNA / Direct Care Worker Services | Reliant Home Health",
  description: "Reliant Home Health's certified Home Health Aides, CNAs, and Direct Care Workers provide compassionate personal care assistance with daily living activities, helping patients remain safely and comfortably at home.",
};

const roles = [
  {
    title: "Home Health Aide (HHA)",
    description: "HHAs assist with personal care tasks like bathing, grooming, dressing, and light housekeeping, providing the hands-on support that helps patients maintain dignity and independence at home.",
    color: "bg-primary/5 border-primary/20",
    badge: "bg-primary/10 text-primary",
  },
  {
    title: "Certified Nursing Assistant (CNA)",
    description: "CNAs work under nurse supervision to provide basic medical care — monitoring vital signs, assisting with mobility, and supporting activities of daily living — bringing clinical competence to your home.",
    color: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
  },
  {
    title: "Direct Care Worker (DCW)",
    description: "DCWs provide flexible, non-clinical companionship and support — helping with errands, transportation, meal preparation, and social engagement — keeping patients connected and active in their community.",
    color: "bg-sky-50 border-sky-200",
    badge: "bg-sky-100 text-sky-800",
  },
];

const highlights = [
  "Bathing, grooming, and personal hygiene assistance",
  "Dressing and mobility support",
  "Meal planning and light meal preparation",
  "Medication reminders and appointment tracking",
  "Light housekeeping and laundry support",
  "Companionship and social engagement",
  "Ambulation assistance and fall prevention",
  "Vital signs monitoring and health observations",
  "Errand running and transportation support",
  "Post-surgery and hospital discharge recovery support",
];

const idealFor = [
  "Seniors aging in place",
  "Post-surgery recovery support",
  "Patients with chronic illness",
  "Individuals with physical disabilities",
  "Respite care for family caregivers",
  "Patients transitioning from hospital to home",
];

export default function PersonalCarePage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Home Health Aide / CNA / Direct Care Worker"
        description="One unified personal care program — covering Home Health Aides, Certified Nursing Assistants, and Direct Care Workers — delivering compassionate, certified support in the comfort of your home."
      />

      {/* Overview + Image */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Personal Care, Your Way — At Home
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Maintaining independence and dignity at home is one of the most important aspects of well-being. Our certified personal care team — spanning Home Health Aides, CNAs, and Direct Care Workers — provides reliable, kind, and professional assistance tailored to each patient's needs.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Every team member is rigorously screened, background-checked, and trained to Reliant's high care standards. They work seamlessly alongside our skilled nursing and therapy teams to support your comprehensive care plan.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              {/* Warm home health image: white caregiver helping white senior patient at home */}
              <img
                src="/images/personal_care.png"
                alt="Caregiver warmly helping senior patient at home"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Role Breakdown */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">Understanding Each Role</h2>
          <p className="text-foreground/70 text-lg text-center mb-12 max-w-2xl mx-auto">
            Our personal care program combines three distinct but complementary roles under one coordinated service.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roles.map((role) => (
              <div key={role.title} className={`rounded-2xl border p-6 ${role.color}`}>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${role.badge}`}>
                  {role.title}
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Provide */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">What Our Team Provides</h2>
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

      {/* Who Benefits */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Who Benefits Most</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our personal care services are ideal for a wide range of situations and conditions.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {idealFor.map((c) => (
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Arrange Care for Your Loved One</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Talk to us today to discuss your loved one&apos;s care needs and find the right personal care schedule to fit your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-background text-primary font-bold text-sm hover:bg-background/90 transition-colors">
              Request a Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="tel:+15551234567" className="inline-flex items-center justify-center h-12 px-8 rounded-md border-2 border-primary-foreground text-primary-foreground font-bold text-sm hover:bg-primary-foreground hover:text-primary transition-colors">
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
