import type { Metadata } from "next";
import { Check, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | ToyVerse Pakistan",
  description:
    "Simple, transparent pricing plans for ToyVerse Pakistan services. Choose the plan that fits your business.",
};

const PLANS = [
  {
    name: "Starter",
    price: "Rs. 25,000",
    period: "/project",
    description: "Perfect for small businesses just getting started online.",
    features: [
      "Up to 5 pages",
      "Responsive design",
      "Basic SEO setup",
      "Contact form integration",
      "1 month support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "Rs. 75,000",
    period: "/project",
    description: "For growing businesses that need a full-featured solution.",
    features: [
      "Up to 15 pages",
      "E-commerce integration",
      "Advanced SEO & analytics",
      "Admin dashboard",
      "Payment gateway setup",
      "3 months support",
    ],
    cta: "Choose Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for large-scale businesses and startups.",
    features: [
      "Unlimited pages",
      "Custom integrations",
      "Dedicated project manager",
      "CI/CD pipeline setup",
      "Performance monitoring",
      "12 months support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const FAQ = [
  {
    q: "How long does a typical project take?",
    a: "Starter projects take 1-2 weeks, Professional projects 3-6 weeks, and Enterprise projects are scoped individually. We provide a detailed timeline after our initial consultation.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes! We typically split payments into 3 milestones: 40% upfront, 30% at design approval, and 30% on delivery. Custom arrangements are available for Enterprise clients.",
  },
  {
    q: "What technologies do you use?",
    a: "We primarily use Next.js, React, TypeScript, Tailwind CSS, and MongoDB for web projects. For mobile, we use React Native or native Swift/Kotlin. We choose the best stack for each project.",
  },
  {
    q: "Do you provide hosting and domain?",
    a: "We can set up hosting on Vercel, AWS, or your preferred provider. Domain registration is handled separately, but we assist with DNS configuration and SSL setup.",
  },
  {
    q: "What happens after the project is delivered?",
    a: "All plans include a support period (1-12 months depending on the plan). After that, we offer affordable monthly maintenance retainers for ongoing support and updates.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Absolutely! You can start with a Starter plan and upgrade to Professional or Enterprise as your business grows. We'll credit a portion of your initial investment.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-navy">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20 mb-6">
            Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight mb-6">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan">
              Pricing
            </span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            No hidden fees. No surprises. Choose the plan that fits your needs and scale as you grow.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 transition-colors ${
                plan.popular
                  ? "bg-surface border-brand/40 shadow-lg shadow-brand/5"
                  : "bg-surface border-border/60 hover:border-brand/30"
              }`}
            >
              {plan.popular && (
                <span className="inline-block rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-extrabold text-text-primary">{plan.name}</h3>
              <div className="mt-3 mb-2">
                <span className="text-3xl font-extrabold text-text-primary">{plan.price}</span>
                {plan.period && <span className="text-sm text-text-muted">{plan.period}</span>}
              </div>
              <p className="text-sm text-text-secondary mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <span className="text-sm text-text-primary">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className={`block w-full rounded-xl py-3 text-sm font-bold text-center transition-colors ${
                  plan.popular
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "bg-surface-light text-text-primary border border-border/60 hover:border-brand/40"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-5 bg-surface/50">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-cyan/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan border border-cyan/20 mb-4">
              <HelpCircle className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-navy border border-border/60 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-bold text-text-primary hover:text-brand transition-colors">
                  {item.q}
                  <span className="ml-4 shrink-0 text-text-muted group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
