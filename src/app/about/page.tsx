import type { Metadata } from "next";
import { Heart, Users, Briefcase, Star, Target, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | ToyVerse Pakistan",
  description:
    "Learn about ToyVerse Pakistan — our story, our team, and our mission to bring the best toys to kids across Pakistan.",
};

const STATS = [
  { label: "Happy Customers", value: "10,000+", icon: Heart },
  { label: "Products Delivered", value: "25,000+", icon: Star },
  { label: "Cities Covered", value: "50+", icon: Target },
  { label: "5-Star Reviews", value: "2,000+", icon: Shield },
];

const TEAM = [
  { name: "Ahmed Khan", role: "Founder & CEO", emoji: "👨‍💼" },
  { name: "Sara Ali", role: "Head of Operations", emoji: "👩‍💻" },
  { name: "Bilal Ahmed", role: "Lead Developer", emoji: "👨‍🔧" },
  { name: "Fatima Noor", role: "Customer Success", emoji: "👩‍🏫" },
];

const CAREERS = [
  { title: "Full-Stack Developer", type: "Remote", tag: "Engineering" },
  { title: "UI/UX Designer", type: "Hybrid", tag: "Design" },
  { title: "Marketing Specialist", type: "On-site", tag: "Marketing" },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-navy">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20 mb-6">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight mb-6">
            Making Play{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan">
              Magical
            </span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            ToyVerse Pakistan was born from a simple belief: every child deserves access to high-quality,
            inspiring toys. We started in 2023 as a small online store and have grown into Pakistan&apos;s
            trusted destination for premium toys — serving thousands of happy families across the country.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-surface border border-border/60 p-6 text-center hover:border-brand/30 transition-colors"
            >
              <stat.icon className="h-8 w-8 text-brand mx-auto mb-3" />
              <div className="text-2xl font-extrabold text-text-primary">{stat.value}</div>
              <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block rounded-full bg-cyan/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan border border-cyan/20 mb-4">
              Our Mission
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary mb-4">
              Quality Toys, Delivered with Care
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We carefully curate every product in our catalog — from educational building blocks to
              high-speed remote control vehicles. Each toy passes our quality checks before reaching
              your doorstep. Our mission is to make playtime safer, smarter, and more joyful for
              Pakistani families.
            </p>
          </div>
          <div className="rounded-2xl bg-surface border border-border/60 p-8 text-center">
            <div className="text-6xl mb-4">🧸</div>
            <p className="text-text-secondary text-sm italic">
              &quot;Every toy tells a story. We make sure it&apos;s a great one.&quot;
            </p>
            <p className="text-brand text-sm font-bold mt-2">— ToyVerse Team</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-5 bg-surface/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple border border-purple/20 mb-4">
              <Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Our Team
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary">
              The People Behind ToyVerse
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl bg-navy border border-border/60 p-6 text-center hover:border-brand/30 transition-colors"
              >
                <div className="text-4xl mb-3">{member.emoji}</div>
                <h3 className="text-sm font-bold text-text-primary">{member.name}</h3>
                <p className="text-xs text-brand mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-yellow/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow border border-yellow/20 mb-4">
              <Briefcase className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Careers
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary">
              Join Our Growing Team
            </h2>
            <p className="text-text-secondary mt-3">
              We&apos;re always looking for passionate people to help us build the future of e-commerce in Pakistan.
            </p>
          </div>
          <div className="space-y-4">
            {CAREERS.map((job) => (
              <div
                key={job.title}
                className="flex items-center justify-between rounded-2xl bg-surface border border-border/60 p-5 hover:border-brand/30 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{job.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">{job.type}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                  {job.tag}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="mailto:careers@toyverse.pk"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
            >
              Send Your Resume
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
