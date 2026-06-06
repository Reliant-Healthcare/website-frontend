import Link from "next/link";
import { BookOpen, Video, Award, Users } from "lucide-react";

export default function TrainingPortal() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/training_banner.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Reliant Learning Center</h1>
            <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed">
              Empowering healthcare professionals with state-of-the-art training, continuing education, and certification programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/training/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-md bg-background px-8 text-sm font-bold text-primary shadow transition-colors hover:bg-background/90"
              >
                Access My Dashboard
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border-2 border-primary-foreground px-8 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-foreground hover:text-primary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-20">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-lg border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Video Lessons",
    description: "High-quality clinical demonstration videos and interactive modules.",
    icon: <Video className="w-6 h-6" />
  },
  {
    title: "Continuing Education",
    description: "Earn CEUs to maintain your licenses and certifications.",
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    title: "Instant Certificates",
    description: "Download verified PDF certificates immediately upon completion.",
    icon: <Award className="w-6 h-6" />
  },
  {
    title: "Community Learning",
    description: "Connect with other healthcare professionals in discussion forums.",
    icon: <Users className="w-6 h-6" />
  }
];
