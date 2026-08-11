import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { LazyWhatsAppButton } from "@/components/LazyWhatsAppButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ToyVerse Pakistan - Best Online Toy Store | Shop Kids Toys COD",
    template: "%s | ToyVerse Pakistan",
  },
  description:
    "Pakistan's favorite online toy store. Discover safe, fun, and premium toys for every child — from educational toys to action figures. Shop now with cash on delivery and fast shipping across Pakistan.",
  keywords: [
    "toys Pakistan",
    "buy toys online Pakistan",
    "kids toys Pakistan",
    "toy store Pakistan",
    "cash on delivery toys",
    "educational toys Pakistan",
    "action figures Pakistan",
    "board games Pakistan",
    "outdoor toys Pakistan",
    "baby toys Pakistan",
    "premium toys Pakistan",
    "ToyVerse",
  ],
  authors: [{ name: "ToyVerse Pakistan" }],
  creator: "ToyVerse Pakistan",
  publisher: "ToyVerse Pakistan",
  metadataBase: new URL("https://toyverse.pk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ToyVerse Pakistan - Best Online Toy Store",
    description:
      "Pakistan's favorite online toy store. Discover safe, fun, and premium toys for every child. Shop now with cash on delivery and fast shipping.",
    url: "https://toyverse.pk",
    siteName: "ToyVerse Pakistan",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "ToyVerse Pakistan — Best Online Toy Store",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToyVerse Pakistan - Best Online Toy Store",
    description:
      "Pakistan's favorite online toy store. Premium toys with cash on delivery.",
    images: ["/images/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy text-text-primary">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/hero-banner.png" imageSizes="(max-width: 640px) 280px, (max-width: 1024px) 360px, 520px" />
        <Providers>
          <Sidebar />
          <div className="flex-1 lg:ml-[220px]">
            {children}
          </div>
        </Providers>
        <div className="lg:ml-[220px]">
          <Footer />
        </div>
        <LazyWhatsAppButton />
      </body>
    </html>
  );
}
