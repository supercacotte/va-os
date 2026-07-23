import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "code",
  "pre",
];

export function sanitizeStepsHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { "*": ["href", "target", "rel", "class"] },
  });
}

export function htmlHasTextContent(html: string): boolean {
  return sanitizeStepsHtml(html).replace(/<[^>]*>/g, "").trim().length > 0;
}
