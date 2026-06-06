import PageHeader from "@/components/PageHeader";

export default function AboutPage() {
  return (
    <div>
      <PageHeader 
        title="About Us" 
        description="Reliant Home Health has been providing exceptional care for over 18 years, putting patients first in everything we do." 
      />
      
      {/* Our Mission & Team Photo */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-8">
                Our mission is to provide the highest quality home health care services with compassion, respect, and clinical excellence. We believe that every patient deserves to receive care that is tailored to their unique needs and delivered in the comfort of their own home.
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Vision</h2>
              <p className="text-lg text-foreground/70 leading-relaxed">
                We strive to be the leading provider of home health care services in our community, recognized for our commitment to patient outcomes and our dedication to supporting families through difficult times.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-[450px] shadow-xl">
              <img 
                src="/images/about_team.png" 
                alt="Reliant Home Health Care Clinical Team"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Families Trust Reliant</h2>
            <p className="text-muted-foreground text-lg">
              We are dedicated to maintaining the highest clinical standards and supporting our patients at every stage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "18+ Years of Care", desc: "Serving our community with dedicated healthcare professionals since 2008." },
              { title: "Certified Clinical Staff", desc: "All our nurses and therapists are certified, licensed, and background-checked." },
              { title: "Customized Care Plans", desc: "Personalized medical and non-medical treatment plans tailored to you." },
              { title: "24/7 Coordination", desc: "Continuous communication and coordination with your primary physicians." },
              { title: "Quality & Excellence", desc: "Committed to delivering evidence-based clinical care and outstanding support." },
              { title: "Compassionate Support", desc: "Caring for patients like family, prioritizing comfort and dignity at home." }
            ].map((item, index) => (
              <div key={index} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <h3 className="font-bold text-lg text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

