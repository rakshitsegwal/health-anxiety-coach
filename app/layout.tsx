import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-bg text-ink">
        {children}
        {PIXEL_ID ? (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${PIXEL_ID}');fbq('track','PageView');
            `}</Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
