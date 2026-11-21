/**
 * Text and HTML sanitization utilities for user-submitted content.
 * Conforms to Sections 14, 19, and 24.2 of BUILD_PLAN.md:
 * - Strips all HTML markup, script tags, style blocks, and embedded payloads
 * - Normalizes whitespace and removes ASCII control characters
 * - Preserves native Assamese and Hindi unicode text untouched
 */

/**
 * Strips script tags, style blocks, and HTML elements from text,
 * normalises whitespace, removes non-printable control characters,
 * while leaving Indic (Assamese/Bengali, Devanagari) script characters intact.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return (
    input
      // 1. Remove script tags and their inner content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // 2. Remove style tags and their inner content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // 3. Strip all remaining HTML tags
      .replace(/<[^>]+>/g, "")
      // 4. Strip ASCII control characters (keep tab/newline normalisation)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      // 5. Normalise repeated spaces/newlines to a single space
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Sanitizes all free-text fields in a report submission payload.
 */
export function sanitizeReport<T extends { note: string; place?: string }>(data: T): T {
  return {
    ...data,
    note: sanitizeHtml(data.note),
    place: data.place ? sanitizeHtml(data.place) : undefined,
  };
}
