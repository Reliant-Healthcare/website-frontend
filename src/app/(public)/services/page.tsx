import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { HeartPulse, PersonStanding, Brain, UserCheck, MessageCircle, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services | Reliant Home Health",
  description: "Explore the full range of home health care services offered by Reliant — skilled nursing, physical therapy, occupational therapy, speech therapy, medical social services, and more.",
};

const services = [
  {
    title: "Skilled Nursing",
    description: "Professional medical care from registered nurses — including wound care, medication management, and chronic disease monitoring — delivered right to your door.",
    icon: HeartPulse,
    link: "/services/skilled-nursing",
  },
  {
    title: "Physical Therapy",
    description: "Personalized rehabilitation programs to restore mobility, strength, and balance after surgery, injury, or illness.",
    // PersonStanding clearly reflects physical rehabilitation & movement — replaces generic Activity/EKG icon
    icon: PersonStanding,
    link: "/services/physical-therapy",
  },
  {
    title: "Occupational Therapy",
    description: "Helping patients regain independence in daily living activities like dressing, bathing, and meal preparation, safely and confidently.",
    icon: Brain,
    link: "/services/occupational-therapy",
  },
  {
    title: "Medical Social Services",
    description: "Licensed social workers providing counseling, community resource navigation, and emotional support to patients and their families.",
    icon: UserCheck,
    link: "/services/medical-social-services",
  },
  {
    title: "Speech Therapy",
    description: "Specialized therapy for communication disorders, voice impairments, and swallowing difficulties from licensed speech-language pathologists.",
    icon: MessageCircle,
    link: "/services/speech-therapy",
  },
  {
    // Combined: Home Health Aide + CNA + Direct Care Worker under one unified service
    title: "Home Health Aide / CNA / Direct Care Worker",
    description: "Compassionate personal care from certified Home Health Aides, CNAs, and Direct Care Workers — bathing, grooming, mobility support, and daily living assistance at home.",
    icon: Heart,
    link: "/services/personal-care",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Our Services"
        description="We offer a comprehensive range of home health care services designed to help you recover and thrive in the comfort of your own home."
      />

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="group relative overflow-hidden rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {service.description}
                  </p>
                  <Link href={service.link} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Not Sure Which Service You Need?</h2>
          <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
            Our care coordinators are happy to assess your situation and recommend the right combination of services for your recovery goals.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow"
          >
            Contact Us for Guidance <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
