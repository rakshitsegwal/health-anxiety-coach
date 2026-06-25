import type { ReactNode } from "react";

// Consistent vertical rhythm + readable single-column width for the funnel.
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-5 py-12 sm:py-16 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-content">{children}</div>
    </section>
  );
}
