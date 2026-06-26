import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import { ViewContentPixel } from "@/components/marketing/ViewContentPixel";

export const metadata: Metadata = {
  title: "Your Symptom Spiral Assessment",
  robots: { index: false }, // the quiz lives on-domain but shouldn't be indexed
};

export default function AssessmentPage() {
  return (
    <main>
      {/* Assessment started → ViewContent */}
      <ViewContentPixel />
      <AssessmentFlow />
    </main>
  );
}
