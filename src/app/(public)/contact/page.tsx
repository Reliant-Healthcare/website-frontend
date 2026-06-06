"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { contactApi } from "@/lib/api";
import { CheckCircle2, Loader2, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await contactApi.submit(form);
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Contact Us"
        description="We're here to help. Reach out to us with any questions about our services or to schedule a consultation."
      />

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Get in Touch</h2>
              <p className="text-foreground/60 text-lg mb-10 leading-relaxed">
                Whether you need to learn more about our services, schedule a consultation, or have a question for our care team — we'd love to hear from you.
              </p>
              <div className="space-y-8">
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Our Office</h3>
                    <p className="text-foreground/60">123 Health Way, Suite 100<br />City, State 12345</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Phone</h3>
                    <p className="text-foreground/60">(123) 456-7890</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Email</h3>
                    <p className="text-foreground/60">info@relianthealth.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 border rounded-3xl shadow-sm">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Message Sent!</h3>
                  <p className="text-foreground/60 max-w-sm">
                    Thank you for reaching out. A member of our team will get back to you within one business day.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          First Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          placeholder="Jane"
                          className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Last Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          placeholder="Doe"
                          className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="jane@example.com"
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
                      >
                        <option value="">Select a topic...</option>
                        <option>General Inquiry</option>
                        <option>Request Care Services</option>
                        <option>Skilled Nursing</option>
                        <option>Physical Therapy</option>
                        <option>Occupational Therapy</option>
                        <option>Speech Therapy</option>
                        <option>Personal Care / Home Health Aide</option>
                        <option>Medical Social Services</option>
                        <option>Career / Employment</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none"
                      />
                    </div>

                    {status === "error" && (
                      <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
