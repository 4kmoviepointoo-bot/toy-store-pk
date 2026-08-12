import type { Metadata } from "next";
import { ExternalLink, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio | ToyVerse Pakistan",
  description:
    "Explore our portfolio — successful projects, case studies, and client testimonials from ToyVerse Pakistan.",
};

const PROJECTS = [
  {
    title: "ToyVerse E-commerce Platform",
    category: "Web Development",
    description:
      "Full-featured e-commerce platform with real-time inventory, WhatsApp order integration, and admin dashboard. Built with Next.js, MongoDB, and Tailwind CSS.",
    metrics: { traffic: "15K+ monthly visitors", conversion: "4.2% conversion rate", uptime: "99.9% uptime" },
    color: "brand",
  },
  {
    title: "KidsPlay Mobile App",
    category: "Mobile Development",
    description:
      "Cross-platform mobile app for educational games and interactive learning content for children aged 3-12.",
    metrics: { downloads: "50K+ downloads", rating: "4.8 App Store rating", retention: "65% Day-7 retention" },
    color: "cyan",
  },
  {
    title: "GreenMart Brand Redesign",
    category: "UI/UX Design",
    description:
      "Complete brand identity and e-commerce redesign for an organic grocery delivery service in Lahore.",
    metrics: { sales: "3x increase in online sales", bounce: "40% reduction in bounce rate", nps: "NPS score improved to 72" },
    color: "purple",
  },
  {
    title: "FoodHub Marketing Campaign",
    category: "Digital Marketing",
    description:
      "Multi-channel marketing campaign including SEO, social media, and email automation for a food delivery startup.",
    metrics: { traffic: "200% traffic increase", leads: "5K+ new leads/month", roi: "8x return on ad spend" },
    color: "pink",
  },
];

const TESTIMONIALS = [
  {
    quote: "ToyVerse transformed our online presence. Sales increased 3x within the first quarter of launch.",
    author: "Hassan Malik",
    role: "CEO, KidsPlay",
    emoji: "👨‍💼",
  },
  {
    quote: "The mobile app they built exceeded our expectations. Our users love the smooth experience.",
    author: "Ayesha Khan",
    role: "Product Lead, EduTech PK",
    emoji: "👩‍💻",
  },
  {
    quote: "Professional, responsive, and truly passionate about delivering quality work. Highly recommended!",
    author: "Omar Siddiqui",
    role: "Founder, GreenMart",
    emoji: "👨‍🔬",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  brand: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20" },
  purple: { bg: "bg-purple/10", text: "text-purple", border: "border-purple/20" },
  pink: { bg: "bg-pink/10", text: "text-pink", border: "border-pink/20" },
};

export default function PortfolioPage() {
  return (
    <div className="min-h-dvh bg-navy">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20 mb-6">
            Our Work
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight mb-6">
            Portfolio &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan">
              Case Studies
            </span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            We&apos;ve helped businesses across Pakistan build digital products that users love.
            Here are some of our proudest achievements.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-6xl space-y-8">
          {PROJECTS.map((project) => {
            const colors = COLOR_MAP[project.color];
            return (
              <div
                key={project.title}
                className="rounded-2xl bg-surface border border-border/60 p-8 hover:border-brand/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-block rounded-full ${colors.bg} px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${colors.text} mb-3`}>
                      {project.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-text-primary">{project.title}</h3>
                  </div>
                  <ExternalLink className="h-5 w-5 text-text-muted" />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{project.description}</p>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-navy border border-border/40 px-4 py-2.5">
                      <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">{key}</span>
                      <span className="block text-sm font-bold text-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-5 bg-surface/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple border border-purple/20 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="rounded-2xl bg-navy border border-border/60 p-6 hover:border-brand/30 transition-colors"
              >
                <Quote className="h-6 w-6 text-brand/30 mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{t.author}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
