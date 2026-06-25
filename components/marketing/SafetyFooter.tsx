import Link from "next/link";

// Global footer across the funnel: "not medical advice", crisis line, and the
// privacy/terms links (compliance — non-negotiable, on every page).
export function SafetyFooter() {
  return (
    <footer className="border-t border-line bg-surface px-5 py-10">
      <div className="mx-auto w-full max-w-content space-y-4 text-sm text-ink-soft">
        <p>
          This program is psychoeducational self-help, not medical advice or
          treatment, and doesn&apos;t replace professional care. If you&apos;re in
          crisis or thinking of harming yourself, contact your local emergency number
          or a crisis line.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-ink">
            Privacy
          </Link>
          <Link href="/legal/terms" className="underline underline-offset-4 hover:text-ink">
            Terms
          </Link>
        </nav>
        <p className="text-xs">
          © {new Date().getFullYear()} The Symptom Spiral Reset. Not a diagnosis.
        </p>
      </div>
    </footer>
  );
}
