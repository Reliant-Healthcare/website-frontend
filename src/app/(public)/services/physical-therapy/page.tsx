import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Physical Therapy Services | Reliant Home Health",
  description: "Reliant Home Health's licensed physical therapists deliver personalized rehabilitation programs to restore mobility, strength, and independence — at home.",
};

const highlights = [
  "Post-surgical and post-injury rehabilitation",
  "Balance and fall-prevention training",
  "Gait training and walking re-education",
  "Strength and endurance restoration programs",
  "Pain reduction through therapeutic exercises",
  "Home safety evaluation and modification guidance",
  "Assistive device training (canes, walkers, wheelchairs)",
  "Manual therapy and therapeutic massage",
];

const conditions = [
  "Orthopedic surgery recovery",
  "Hip & knee replacement rehab",
  "Stroke and neurological recovery",
  "Parkinson's disease management",
  "Lower back pain and spinal conditions",
  "Arthritis management",
  "Sports and traumatic injuries",
];

export default function PhysicalTherapyPage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Physical Therapy"
        description="Regain your strength, mobility, and independence with personalized physical therapy programs delivered by licensed therapists in your home."
      />

      {/* Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Rehabilitation on Your Terms
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Recovering from surgery, an injury, or a debilitating illness is challenging. Our licensed physical therapists come to your home to eliminate the transportation burden and deliver tailored, effective therapy in your own space.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We evaluate your current functional abilities, set realistic goals in partnership with you and your physician, and design a progressive therapy plan to get you moving safely and confidently again.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/physical_therapy.png"
                alt="Physical therapist helping patient exercise"
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
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Physical Therapy Services</h2>
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
            <h2 className="text-3xl font-bold text-foreground mb-6">Conditions We Treat</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our therapists are experienced in treating a broad range of physical conditions.
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Start Your Recovery Today</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Our licensed therapists are ready to build a customized recovery plan that fits your lifestyle and goals.
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
