import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | ToyVerse Pakistan",
  description:
    "Get in touch with ToyVerse Pakistan. Reach out for support, inquiries, or business partnerships.",
};

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: "Email Us",
    value: "support@toyverse.pk",
    href: "mailto:support@toyverse.pk",
    color: "brand",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+92 303 766 3472",
    href: "tel:+923037663472",
    color: "cyan",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/923037663472",
    color: "green",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Lahore, Pakistan",
    href: "#",
    color: "purple",
  },
];

const SUPPORT_TOPICS = [
  "Order Tracking & Status",
  "Returns & Refunds",
  "Product Information",
  "Account Support",
  "Shipping & Delivery",
  "Payment Issues",
];

const LOCATIONS = [
  { city: "Lahore", address: "Main Office — Gulberg III, Lahore", hours: "Mon-Sat: 10AM - 7PM" },
  { city: "Karachi", address: "Branch Office — DHA Phase 5, Karachi", hours: "Mon-Fri: 10AM - 6PM" },
  { city: "Islamabad", address: "Service Center — F-8 Markaz, Islamabad", hours: "Mon-Fri: 11AM - 5PM" },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  brand: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20" },
  green: { bg: "bg-green/10", text: "text-green", border: "border-green/20" },
  purple: { bg: "bg-purple/10", text: "text-purple", border: "border-purple/20" },
};

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-navy">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20 mb-6">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight mb-6">
            Contact{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan">
              Us
            </span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Have a question, need support, or want to partner with us? We&apos;d love to hear from you.
            Reach out through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTACT_METHODS.map((method) => {
            const colors = COLOR_MAP[method.color];
            return (
              <a
                key={method.label}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="rounded-2xl bg-surface border border-border/60 p-6 text-center hover:border-brand/30 transition-colors group"
              >
                <div className={`inline-flex items-center justify-center rounded-xl ${colors.bg} p-3 mb-4 group-hover:scale-105 transition-transform`}>
                  <method.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1">{method.label}</h3>
                <p className="text-xs text-text-secondary">{method.value}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Contact Form + Support */}
      <section className="py-16 px-5 bg-surface/50">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-extrabold text-text-primary mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us more..."
                  className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>

          {/* Support Topics */}
          <div>
            <h2 className="text-2xl font-extrabold text-text-primary mb-6">
              Support Topics
            </h2>
            <div className="space-y-3 mb-8">
              {SUPPORT_TOPICS.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center gap-3 rounded-xl bg-navy border border-border/40 px-4 py-3 hover:border-brand/30 transition-colors cursor-pointer"
                >
                  <div className="h-2 w-2 rounded-full bg-brand shrink-0" />
                  <span className="text-sm text-text-primary">{topic}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-navy border border-border/60 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-text-primary">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>Monday — Friday: 10:00 AM — 7:00 PM</p>
                <p>Saturday: 10:00 AM — 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple border border-purple/20 mb-4">
              <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Our Locations
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary">
              Find Us Across Pakistan
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {LOCATIONS.map((loc) => (
              <div
                key={loc.city}
                className="rounded-2xl bg-surface border border-border/60 p-6 hover:border-brand/30 transition-colors"
              >
                <h3 className="text-lg font-extrabold text-text-primary mb-2">{loc.city}</h3>
                <p className="text-sm text-text-secondary mb-2">{loc.address}</p>
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {loc.hours}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
