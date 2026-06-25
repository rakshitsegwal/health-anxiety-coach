import { SafetyFooter } from "@/components/marketing/SafetyFooter";

// The funnel layout. The safety footer (not-medical-advice + crisis line +
// privacy/terms) is global across every public page per the compliance rules.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SafetyFooter />
    </>
  );
}
