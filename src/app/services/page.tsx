import type { Metadata } from "next";
import { Code, Smartphone, Palette, Megaphone, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Services | ToyVerse Pakistan",
  description:
    "Explore ToyVerse Pakistan services — web development, mobile apps, UI/UX design, and digital marketing solutions.",
};

const SERVICES = [
  {
    icon: Code,
    title: "Web Development",
    description:
      "Custom e-commerce solutions, progressive web apps, and full-stack applications built with modern frameworks like Next.js, React, and Node.js.",
    features: ["Custom E-commerce Platforms", "Progressive Web Apps (PWA)", "API Development & Integration", "Performance Optimization"],
    color: "brand",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native and cross-platform mobile applications for iOS and Android, designed for performance and beautiful user experiences.",
    features: ["iOS & Android Native Apps", "React Native Cross-Platform", "App Store Optimization", "Push Notifications & Analytics"],
    color: "cyan",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "User-centered design that transforms complex workflows into intuitive, delightful experiences. From wireframes to high-fidelity prototypes.",
    features: ["User Research & Testing", "Wireframing & Prototyping", "Design Systems", "Accessibility-First Design"],
    color: "purple",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description:
      "Data-driven marketing strategies that increase visibility, drive traffic, and convert visitors into loyal customers.",
    features: ["SEO & Content Strategy", "Social Media Marketing", "Email Campaign Automation", "Analytics & Conversion Optimization"],
    color: "pink",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  brand: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20" },
  purple: { bg: "bg-purple/10", text: "text-purple", border: "border-purple/20" },
  pink: { bg: "bg-pink/10", text: "text-pink", border: "border-pink/20" },
};

export default function ServicesPage() {
  return (
    <div className="min-h-dvh bg-navy">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20 mb-6">
            What We Do
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight mb-6">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan">
              Services
            </span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            From building e-commerce platforms to crafting mobile apps and marketing strategies —
            we deliver end-to-end digital solutions for businesses across Pakistan.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8">
          {SERVICES.map((service) => {
            const colors = COLOR_MAP[service.color];
            return (
              <div
                key={service.title}
                id={service.title.toLowerCase().replace(/ /g, "-")}
                className="rounded-2xl bg-surface border border-border/60 p-8 hover:border-brand/30 transition-colors"
              >
                <div className={`inline-flex items-center justify-center rounded-xl ${colors.bg} p-3 mb-5`}>
                  <service.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h2 className="text-xl font-extrabold text-text-primary mb-3">{service.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{service.description}</p>
                <div className="space-y-2.5">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <Check className={`h-4 w-4 ${colors.text} shrink-0`} />
                      <span className="text-sm text-text-primary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-3xl text-center rounded-2xl bg-surface border border-border/60 p-10">
          <h2 className="text-2xl font-extrabold text-text-primary mb-3">
            Ready to Start Your Project?
          </h2>
          <p className="text-text-secondary mb-6">
            Let&apos;s discuss how we can help bring your vision to life.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
