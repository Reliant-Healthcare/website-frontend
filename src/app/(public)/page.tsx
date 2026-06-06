import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartPulse, PersonStanding, Brain, UserCheck, Heart, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Over 18 Years of Excellence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Compassionate Care in the <span className="text-primary">Comfort</span> of Your Home
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We provide highly skilled nursing, comprehensive therapy, and exceptional home care services. Trust our certified professionals to bring quality healthcare directly to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Request Care
              </Link>
              <Link
                href="/careers"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Join Our Team
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 rounded-2xl" />
            {/* White home health nurse with elderly white patient in a home setting */}
            <img 
              src="/images/hero_home.png" 
              alt="Home health nurse caring for patient at home" 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Healthcare Services</h2>
            <p className="text-muted-foreground text-lg">
              Tailored medical and personal care programs designed to improve your quality of life at home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {service.description}
                </p>
                <Link href={service.link} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] rounded-2xl overflow-hidden hidden lg:block">
              {/* Warm home-setting photo: caregiver in patient's living room */}
              <img 
                src="/images/why_choose_us.png" 
                alt="Caregiver warmly assisting patient in their home"
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Families Trust Reliant</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We go above and beyond to ensure our patients receive the highest standard of care from thoroughly vetted and compassionate professionals.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Licensed, bonded, and insured professionals",
                  "Personalized care plans tailored to individual needs",
                  "Available 24/7 for emergency support",
                  "Rigorous screening and continuous training",
                  "Seamless coordination with your physician",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  href="/about"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-background border px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Care Journey?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Contact us today for a free consultation. Our care coordinators are ready to help you navigate your options and find the perfect care solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md bg-background px-8 text-sm font-bold text-primary shadow transition-colors hover:bg-background/90"
            >
              Contact Us Now
            </Link>
            <Link
              href="tel:+15551234567"
              className="inline-flex h-12 items-center justify-center rounded-md border-2 border-primary-foreground px-8 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              (555) 123-4567
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const services = [
  {
    title: "Skilled Nursing",
    description: "Professional medical care provided by registered nurses, including wound care, medication management, and disease monitoring.",
    icon: <HeartPulse className="h-6 w-6" />,
    link: "/services/skilled-nursing"
  },
  {
    title: "Physical Therapy",
    // PersonStanding icon conveys physical rehabilitation / movement therapy
    description: "Personalized exercises and treatments to improve mobility, relieve pain, and prevent or limit permanent physical disabilities.",
    icon: <PersonStanding className="h-6 w-6" />,
    link: "/services/physical-therapy"
  },
  {
    title: "Occupational Therapy",
    description: "Helping patients regain the ability to perform daily living activities safely and independently in their home environment.",
    icon: <Brain className="h-6 w-6" />,
    link: "/services/occupational-therapy"
  },
  {
    title: "Medical Social Services",
    description: "Counseling and assistance with community resources to help patients and families cope with social and emotional factors.",
    icon: <UserCheck className="h-6 w-6" />,
    link: "/services/medical-social-services"
  },
  {
    title: "Speech Therapy",
    description: "Specialized therapy for communication disorders, voice impairments, and swallowing difficulties from licensed speech-language pathologists.",
    icon: <MessageCircle className="h-6 w-6" />,
    link: "/services/speech-therapy"
  },
  {
    title: "Home Health Aide / CNA / Direct Care Worker",
    description: "Compassionate personal care from certified Home Health Aides, CNAs, and Direct Care Workers — bathing, grooming, mobility support, and daily living assistance at home.",
    icon: <Heart className="h-6 w-6" />,
    link: "/services/personal-care"
  }
];
