import { sanitizeStepsHtml } from "@/lib/sanitize";

// Rendu lecture seule d'une procédure (partagé VA + portail). Le HTML est
// re-sanitizé au rendu (défense en profondeur : il l'est déjà à l'écriture).
export default function ProcedureContent({ steps }: { steps: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-ink [&_a]:text-ink [&_a]:underline [&_a]:decoration-orange [&_blockquote]:border-l-4 [&_blockquote]:border-orange [&_blockquote]:not-italic [&_h2]:mb-2 [&_h2]:mt-5 [&_h3]:mb-1 [&_h3]:mt-4 [&_strong]:text-ink [&_ul]:list-disc"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizeStepsHtml(steps) }}
    />
  );
}
