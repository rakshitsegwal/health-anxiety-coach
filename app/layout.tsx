import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { MetaPixel } from "@/components/MetaPixel";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "A 14-day program to cut the symptom-Googling, body-checking, and reassurance-seeking that keep health worry alive. Built on CBT & ERP methods. Not medical advice.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "The Symptom Spiral Reset",
  description: DESCRIPTION,
  openGraph: {
    title: "The Symptom Spiral Reset",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "The Symptom Spiral Reset",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Symptom Spiral Reset",
    description: DESCRIPTION,
  },
  // Meta (Facebook) domain verification — renders
  // <meta name="facebook-domain-verification" content="…" /> on every page.
  other: {
    "facebook-domain-verification": "eukfluvbdhw1t25cn6zu7c5pcosjfp",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F6F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-bg text-ink">
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
