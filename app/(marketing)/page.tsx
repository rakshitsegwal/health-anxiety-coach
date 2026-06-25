import { Hero } from "@/components/marketing/Hero";
import { TheLoop } from "@/components/marketing/TheLoop";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyItWorks } from "@/components/marketing/WhyItWorks";
import { FounderVideo } from "@/components/marketing/FounderVideo";
import { SocialProof } from "@/components/marketing/SocialProof";
import { FAQ } from "@/components/marketing/FAQ";
import { GuaranteeBadge } from "@/components/marketing/GuaranteeBadge";
import { StickyCTA } from "@/components/marketing/StickyCTA";
import { UtmCapture } from "@/components/marketing/UtmCapture";
import { ViewContentPixel } from "@/components/marketing/ViewContentPixel";

// Landing page. Section order is fixed by spec:
// hero → loop → how-it-works → why-it-works → FounderVideo (above social proof)
// → social proof → FAQ → guarantee → (global safety footer from the layout).
// One job: start the assessment. No price is shown here.
export default function LandingPage() {
  return (
    <main className="pb-24">
      <UtmCapture />
      <ViewContentPixel name="lp" />
      <Hero />
      <TheLoop />
      <HowItWorks />
      <WhyItWorks />
      <FounderVideo />
      <SocialProof />
      <FAQ />
      <GuaranteeBadge />
      <StickyCTA />
    </main>
  );
}
