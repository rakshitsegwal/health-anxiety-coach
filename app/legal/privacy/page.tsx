import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — The Symptom Spiral Reset",
};

// Details filled, but NOT legal sign-off: this still needs review by a qualified
// professional for DPDP/health-data compliance. Keep the review notice up.
const UPDATED = "25 June 2026";

export default function PrivacyPage() {
  return (
    <>
      <p className="mb-6 text-sm text-ink-soft">
        This policy is under legal review and may be updated.
      </p>

      <h1>Privacy Policy</h1>
      <p className="text-sm">Last updated: {UPDATED}</p>

      <h2>1. Who we are</h2>
      <p>
        The Symptom Spiral Reset (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by
        Rakshit Segwal, an individual (sole proprietor) based in India. We are the
        data fiduciary for the personal data described below. For privacy questions,
        email rakshit1352@gmail.com.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Your email address</strong> — captured when you ask us to email
          your assessment results, and used as your login identity after purchase.
        </li>
        <li>
          <strong>Your assessment responses</strong> — the answers you tap during the
          self-reflection assessment, and the resulting Spiral Score, band, and
          dominant driver. These reflect health-related concerns and are treated as
          sensitive.
        </li>
        <li>
          <strong>Your in-program check-ins</strong> — the daily entries you record
          while using the program, and the Spiral Scores computed from them.
        </li>
        <li>
          <strong>Payment information</strong> — handled by our payment processor
          (Razorpay). We do not see or store your full card details; we keep an order
          record (amount, status, processor identifiers).
        </li>
        <li>
          <strong>Basic technical and marketing data</strong> — cookies needed to run
          the site and keep you signed in, and Meta Pixel analytics events. Event
          names are neutral and we do not put health information in event parameters.
        </li>
      </ul>

      <h2>3. Why we use it, and our legal basis</h2>
      <p>
        We use your data to deliver the assessment and program, create and secure your
        account, process your payment and guarantee, send transactional emails, and
        measure marketing performance in aggregate. Where the law requires it, we rely
        on your <strong>consent</strong> (which you give at the point of capture and
        can withdraw at any time) and on the necessity of providing the service you
        purchased.
      </p>

      <h2>4. Cookies and analytics</h2>
      <p>
        We use essential cookies for sessions and security, and the Meta Pixel to
        understand how visitors arrive and convert. We do not sell your data or use
        sensitive health information to target advertising.
      </p>

      <h2>5. Who we share it with</h2>
      <p>
        We share data only with service providers who process it on our behalf:
        Supabase (database and authentication), Razorpay (payments), Resend (email
        delivery), and Meta (analytics). They are bound to use it only to provide
        their service. We do not sell your personal data.
      </p>

      <h2>6. How long we keep it</h2>
      <p>
        We keep your data for as long as your account is active and as needed to
        provide the program, honor the guarantee, and meet legal obligations. You can
        ask us to delete your account and associated data at any time (see your
        rights).
      </p>

      <h2>7. Your rights</h2>
      <p>
        Subject to applicable law, you may request access to, correction of, or
        erasure of your personal data, and you may withdraw consent. To exercise these
        rights, email rakshit1352@gmail.com. We will respond within the timeframe
        the law requires.
      </p>

      <h2>8. Grievance Officer</h2>
      <p>
        In line with DPDP requirements, you may contact our Grievance Officer,
        Rakshit Segwal, at rakshit1352@gmail.com with any concern about how we handle
        your data.
      </p>

      <h2>9. Security, transfers, and children</h2>
      <p>
        We use reasonable technical and organizational measures to protect your data;
        no method is perfectly secure. Some providers may process data outside India.
        This service is intended for adults (18+) and is not directed to children.
      </p>

      <h2>10. Changes and contact</h2>
      <p>
        We may update this policy and will revise the date above. Questions? Email
        rakshit1352@gmail.com. See also our{" "}
        <Link href="/legal/terms">Terms</Link>.
      </p>
    </>
  );
}
