import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Speech Therapy Services | Reliant Home Health",
  description: "Reliant Home Health's licensed speech-language pathologists treat communication disorders, voice conditions, and swallowing difficulties in the comfort of your home.",
};

const highlights = [
  "Articulation and language disorder treatment",
  "Voice therapy for vocal cord conditions",
  "Stuttering management and fluency therapy",
  "Dysphagia (swallowing difficulty) evaluation and treatment",
  "Cognitive-communication rehabilitation post-stroke",
  "Aphasia therapy for language recovery",
  "Augmentative and alternative communication (AAC) training",
  "Caregiver and family communication coaching",
];

const conditions = [
  "Stroke and aphasia recovery",
  "Traumatic brain injury (TBI)",
  "Parkinson's disease (voice and swallowing)",
  "Dysphagia and swallowing disorders",
  "Head and neck cancer recovery",
  "Laryngeal and voice disorders",
  "Autism spectrum communication support",
];

export default function SpeechTherapyPage() {
  return (
    <div className="bg-background">
      <PageHeader
        title="Speech Therapy"
        description="Regain your voice, communication, and swallowing abilities with licensed speech-language pathologists who deliver specialized therapy in your home."
      />

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Find Your Voice Again
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                Communication is fundamental to human connection, quality of life, and safety. When a stroke, injury, or illness affects your ability to speak, swallow, or understand language, our licensed speech-language pathologists are here to help.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We conduct thorough evaluations and develop targeted, evidence-based treatment plans that progress at your pace — all in the privacy and comfort of your home.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-80 shadow-xl">
              <img
                src="/images/speech_therapy.png"
                alt="Speech therapist working with patient"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Speech Therapy Services</h2>
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

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Conditions We Treat</h2>
            <p className="text-foreground/70 text-lg mb-12">
              Our speech-language pathologists specialize in a wide range of communication and swallowing conditions.
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

      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Begin Your Journey Back to Communication</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Our compassionate therapists are ready to create a personalized speech therapy plan designed around your unique needs and goals.
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
