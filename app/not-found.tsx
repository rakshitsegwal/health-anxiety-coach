import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <div className="max-w-content text-center">
        <p className="font-display text-5xl text-primary">404</p>
        <h1 className="mt-3 text-2xl">We couldn&apos;t find that page.</h1>
        <p className="mt-2 text-ink-soft">
          The link may be broken, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 font-medium text-white hover:bg-primary-deep"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
