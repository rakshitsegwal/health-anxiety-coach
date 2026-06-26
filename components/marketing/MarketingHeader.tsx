import Link from "next/link";

// Slim header across the marketing pages. Gives returning users a visible way back
// in (Log in → /login) so they don't have to redo the assessment. Kept minimal so
// it doesn't compete with the funnel's single primary CTA.
export function MarketingHeader() {
  return (
    <header className="border-b border-line/70 bg-bg/80">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3">
        <Link href="/" className="font-display text-sm text-ink">
          The Symptom Spiral Reset
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:text-primary-deep"
        >
          Log in
        </Link>
      </div>
    </header>
  );
}
