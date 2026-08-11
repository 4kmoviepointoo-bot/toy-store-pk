import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedToys } from "@/components/FeaturedToys";
import { Features } from "@/components/Features";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ToyVerse Pakistan | Online Toy Store for Kids",
  description:
    "Shop the best toys for boys and girls in Pakistan at ToyVerse Pakistan. Find action figures, building blocks, dolls, remote control cars, and more. Cash on delivery available with fast shipping across Pakistan.",
  keywords: [
    "toys online Pakistan",
    "buy toys Pakistan",
    "boys toys",
    "girls toys",
    "kids toys Pakistan",
    "action figures",
    "building blocks",
    "dolls",
    "remote control toys",
    "educational toys",
    "ToyVerse Pakistan",
  ],
  openGraph: {
    title: "ToyVerse Pakistan | Online Toy Store for Kids",
    description:
      "Shop the best toys for boys and girls in Pakistan. Find action figures, building blocks, dolls, remote control cars, and more. Cash on delivery available.",
    siteName: "ToyVerse Pakistan",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToyVerse Pakistan | Online Toy Store for Kids",
    description:
      "Shop the best toys for boys and girls in Pakistan. Find action figures, building blocks, dolls, remote control cars, and more.",
  },
};

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-navy">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedToys />
        <Features />
      </main>
    </div>
  );
}
