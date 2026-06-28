import { createHash } from "node:crypto";

/** Stable id from a canonical URL (strips query/hash + trailing slash). */
export function idFromUrl(url: string): string {
  let canonical = url.trim();
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    canonical = u.toString();
  } catch {
    // keep raw url if it isn't parseable
  }
  canonical = canonical.replace(/\/+$/, "").toLowerCase();
  return createHash("sha1").update(canonical).digest("hex").slice(0, 16);
}

/** Strip HTML tags and collapse whitespace from a snippet. */
export function stripHtml(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n));
}
