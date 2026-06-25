import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-medium tracking-tight transition-colors disabled:opacity-60 disabled:pointer-events-none text-center";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep shadow-sm",
  secondary: "bg-surface text-ink border border-line hover:border-primary",
  ghost: "text-primary hover:text-primary-deep underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-base",
  lg: "px-6 py-4 text-lg w-full sm:w-auto",
};

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...props}>
      {props.children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
