import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { SafetyFooter } from "@/components/marketing/SafetyFooter";

// The funnel layout. A slim header (with Log in for returning users) sits on top,
// and the safety footer (not-medical-advice + crisis line + privacy/terms) is
// global across every public page per the compliance rules.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      {children}
      <SafetyFooter />
    </>
  );
}
