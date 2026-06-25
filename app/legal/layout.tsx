import { SafetyFooter } from "@/components/marketing/SafetyFooter";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="px-5 py-12">
        <article className="prose-legal mx-auto w-full max-w-content">
          {children}
        </article>
      </main>
      <SafetyFooter />
    </>
  );
}
