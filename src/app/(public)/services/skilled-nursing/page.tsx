import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Skilled Nursing Services | Reliant Home Health",
  description: "Reliant Home Health's registered nurses deliver professional medical care — wound care, medication management, chronic disease monitoring, and more — in the comfort of your home.",
};

const highlights = [
  "Wound care and post-surgical dressing management",
  "IV therapy and catheter care",
  "Medication management and administration",
  "Chronic disease monitoring (diabetes, COPD, CHF, hypertension)",
  "Vital signs monitoring and health assessments",
  "Patient and family education on health conditions",
  "Coordination with physicians and specialists",
  "Pain management consultation and support",
];

const conditions = [
  "Post-operative recovery",
  "Congestive heart failure (CHF)",
  "Chronic obstructive pulmonary disease (COPD)",
  "Diabetes and related complications",
  "Wound care and pressure ulcers",
  "Neurological conditions",
  "Orthopedic injuries and fractures",
];

export default function SkilledNursingPage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Skilled Nursing"
        description="Professional, compassionate nursing care delivered by certified Registered Nurses and Licensed Vocational Nurses — right in the comfort of your home."
      />

      {/* Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Expert Medical Care at Home
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Our skilled nursing program connects you with experienced, licensed nurses who provide the same high-quality medical care you would receive in a clinical setting — but in the familiar and comforting environment of your own home.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Every care plan is developed in close coordination with your physician to ensure your specific medical needs are met with precision, safety, and compassion.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/skilled_nursing.png"
                alt="Nurse caring for patient at home"
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
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">What Our Nurses Provide</h2>
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

      {/* Conditions We Treat */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Conditions We Commonly Support</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our nurses are experienced in managing a wide range of complex medical conditions.
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Our care coordinators are standing by to answer your questions and create a personalized nursing plan for your needs.
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
