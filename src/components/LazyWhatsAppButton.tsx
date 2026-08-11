"use client";

import dynamic from "next/dynamic";

const WhatsAppButton = dynamic(
  () => import("@/components/WhatsAppButton").then((m) => m.WhatsAppButton),
  { ssr: false }
);

export function LazyWhatsAppButton() {
  return <WhatsAppButton />;
}
