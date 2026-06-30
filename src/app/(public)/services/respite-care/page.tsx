import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Respite Care Services | Reliant Home Health",
  description: "Reliant Home Health provides compassionate respite care to give family caregivers temporary relief while ensuring loved ones remain safe and well cared for.",
};

const highlights = [
  "Temporary relief for family caregivers",
  "Short-term and flexible care schedules",
  "Assistance with daily living activities",
  "Medication reminders and tracking",
  "Meal planning and preparation",
  "Companionship and engagement",
  "Safe and supervised environment",
  "Peace of mind for the whole family",
];

const idealFor = [
  "Family caregivers needing a break",
  "Vacation or travel coverage",
  "Emergency or short-term relief",
  "Caregiver burnout prevention",
  "Post-hospitalization transition",
];

export default function RespiteCarePage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Respite Care Services"
        description="Providing temporary, compassionate relief for primary caregivers so you can rest and recharge, knowing your loved one is in safe hands."
      />

      {/* Overview + Image */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Care for Your Loved One, Rest for You
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Caring for a family member can be incredibly rewarding, but it can also be physically and emotionally exhausting. Our respite care services are designed to give primary caregivers the break they need to recharge.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Whether you need a few hours to run errands, a weekend away, or a longer break for a vacation, our certified professionals step in to provide the same level of care and companionship that you provide, ensuring peace of mind for everyone.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/personal_care.png"
                alt="Caregiver providing respite care"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide */}
      <section className="py-20 bg-secondary/30">
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Who Benefits Most</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our respite care services are ideal for family caregivers needing support and flexibility.
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
            Talk to us today to discuss your loved one's care needs and find the right respite care schedule to fit your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-background text-primary font-bold text-sm hover:bg-background/90 transition-colors">
              Request a Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="tel:6105341414" className="inline-flex items-center justify-center h-12 px-8 rounded-md border-2 border-primary-foreground text-primary-foreground font-bold text-sm hover:bg-primary-foreground hover:text-primary transition-colors">
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
