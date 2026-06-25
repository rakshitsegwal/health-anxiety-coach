import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

export const metadata: Metadata = {
  title: "Your Symptom Spiral Assessment",
  robots: { index: false }, // the quiz lives on-domain but shouldn't be indexed
};

export default function AssessmentPage() {
  return (
    <main>
      <AssessmentFlow />
    </main>
  );
}
