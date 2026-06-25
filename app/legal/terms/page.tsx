import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — The Symptom Spiral Reset",
};

// Details filled, but NOT legal sign-off: still needs review by a qualified
// professional before launch. Keep the review notice up.
const UPDATED = "25 June 2026";

export default function TermsPage() {
  return (
    <>
      <p className="mb-6 text-sm text-ink-soft">
        These terms are under legal review and may be updated.
      </p>

      <h1>Terms of Service</h1>
      <p className="text-sm">Last updated: {UPDATED}</p>

      <h2>1. Agreement</h2>
      <p>
        These terms govern your use of The Symptom Spiral Reset, operated by Rakshit
        Segwal, an individual (sole proprietor) based in India. By taking the
        assessment or purchasing the program, you agree to them. If you do not agree,
        please do not use the service.
      </p>

      <h2>2. What this is — and what it is not</h2>
      <p>
        The program is <strong>psychoeducational self-help</strong> built on CBT and
        ERP methods. It is <strong>not medical advice, not therapy, and not a
        diagnosis</strong>, and it does not replace care from a doctor or licensed
        professional. If your distress is severe, please work with a professional
        alongside the program. If you are in crisis or thinking of harming yourself,
        contact your local emergency number or a crisis line immediately.
      </p>

      <h2>3. Eligibility</h2>
      <p>You must be at least 18 years old to purchase and use the program.</p>

      <h2>4. The offer and payment</h2>
      <p>
        The program is a <strong>one-time purchase of ₹999</strong> for the 14-day
        reset. It is <strong>not a subscription</strong> — there is no recurring
        charge and nothing auto-renews. Payments are processed securely by Razorpay.
      </p>

      <h2>5. 30-day money-back guarantee</h2>
      <p>
        If the program isn&apos;t for you — for any reason or no reason — request a
        refund within 30 days of purchase from your dashboard or by emailing
        rakshit1352@gmail.com, and we will refund you in full. Refunds are
        processed within a few business days. <strong>A refund ends your access</strong>{" "}
        to the program. This is a guarantee on the program experience, not a guarantee
        of any health or medical outcome.
      </p>

      <h2>6. Your account</h2>
      <p>
        After purchase you sign in with a one-time code sent to your email. Keep access
        to your email secure; you are responsible for activity under your account.
      </p>

      <h2>7. Acceptable use and intellectual property</h2>
      <p>
        The program content is owned by us and provided for your personal,
        non-commercial use. Please don&apos;t copy, resell, or redistribute it.
      </p>

      <h2>8. Health and safety</h2>
      <p>
        Some optional exercises briefly bring on harmless physical sensations. If you
        have a relevant medical condition, are pregnant, or are unsure, check with your
        doctor first and skip anything not safe for you. You take part at your own
        discretion and assume responsibility for choosing what is appropriate for your
        body.
      </p>

      <h2>9. Disclaimers and limitation of liability</h2>
      <p>
        The program is provided &ldquo;as is&rdquo; without warranties of any kind. To
        the maximum extent permitted by law, we are not liable for indirect or
        consequential losses, and our total liability is limited to the amount you
        paid.
      </p>

      <h2>10. Governing law, changes, and contact</h2>
      <p>
        These terms are governed by the laws of India. We may update them and will
        revise the date above. Questions? Email rakshit1352@gmail.com. See also our{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </>
  );
}
