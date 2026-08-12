import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { WishlistProvider } from "@/context/WishlistContext";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { LazyWhatsAppButton } from "@/components/LazyWhatsAppButton";
import { SmoothScroll } from "@/components/SmoothScroll";

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
    default: "ToyVerse",
    template: "%s | ToyVerse",
  },
  description:
    "Pakistan's favorite online toy store. Discover safe, fun, and premium toys for every child.",
  keywords: [
    "toys",
    "Pakistan",
    "kids",
    "educational",
    "action figures",
  ],
  authors: [{ name: "ToyVerse Pakistan" }],
  creator: "ToyVerse Pakistan",
  publisher: "ToyVerse Pakistan",
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
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <SmoothScroll>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <Providers>
                  <Sidebar />
                  <div className="flex-1 lg:ml-[220px]">
                    {children}
                  </div>
                </Providers>
              </SmoothScroll>
              <div className="lg:ml-[220px]">
                <Footer />
              </div>
              <LazyWhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}