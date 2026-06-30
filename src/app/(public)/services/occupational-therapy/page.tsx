import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Occupational Therapy Services | Reliant Home Health",
  description: "Reliant Home Health's occupational therapists help patients rebuild independence in daily activities, safely adapt their home environment, and regain confidence.",
};

const highlights = [
  "Daily living skills assessment and re-training",
  "Dressing, grooming, bathing, and meal preparation support",
  "Fine motor skills and hand function rehabilitation",
  "Cognitive rehabilitation for stroke and brain injury",
  "Home safety evaluation and adaptive equipment training",
  "Energy conservation and work simplification techniques",
  "Adaptive tools and assistive technology training",
  "Caregiver education and family training",
];

const conditions = [
  "Stroke and brain injury recovery",
  "Dementia and cognitive decline",
  "Parkinson's disease",
  "Multiple sclerosis (MS)",
  "Orthopedic surgery recovery",
  "Spinal cord injuries",
  "Vision or sensory impairments",
];

export default function OccupationalTherapyPage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Occupational Therapy"
        description="Rebuild your independence and confidence in daily living with certified occupational therapists who come directly to your home."
      />

      {/* Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Independence Restored at Home
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Illness, injury, or age-related changes can make it difficult to manage the everyday tasks you once took for granted. Our occupational therapists specialize in helping you rediscover your ability to live independently and meaningfully.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We evaluate your home environment and daily routines to identify barriers, then develop a personalized program that improves your safety, efficiency, and quality of life — right where you live.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/occupational_therapy.png"
                alt="Occupational therapist helping patient with daily tasks"
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
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Occupational Therapy Services</h2>
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
            <h2 className="text-3xl font-bold text-foreground mb-6">Conditions We Address</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our occupational therapists work with patients across a wide range of diagnoses and functional challenges.
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Reclaim Your Independence</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Talk to our team today to learn how occupational therapy can make daily living safer and more fulfilling for you or your loved one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-background text-primary font-bold text-sm hover:bg-background/90 transition-colors"
            >
              Request a Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="tel:6105341414"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md border-2 border-primary-foreground text-primary-foreground font-bold text-sm hover:bg-primary-foreground hover:text-primary transition-colors"
            >
              <Phone className="mr-2 h-4 w-4" /> 610-534-1414
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
