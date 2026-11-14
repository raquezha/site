import type { CollectionEntry } from "astro:content";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parts(iso: string): [string, string, string] {
  const m = ISO_DATE.exec(iso);
  if (!m) throw new Error(`Expected YYYY-MM-DD, got "${iso}"`);
  return [m[1], m[2], m[3]];
}

/** "2026-10-23" -> "October 23, 2026" (Figma Post screen format) */
export function formatLongDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/** "2026-10-23" -> "Oct 23, 2026" */
export function formatShortDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${SHORT_MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/** "2026-10-23" -> "2026" (Figma v7.7 Home left year column) */
export function formatYear(iso: string): string {
  const [y] = parts(iso);
  return y;
}

/** "2026-10-23" -> "23/10" (Figma v7.7 Home right day/month column) */
export function formatDayMonth(iso: string): string {
  const [, m, d] = parts(iso);
  return `${d}/${m}`;
}

/** Resolve post slug from routeOverride or filename id */
export function resolveSlug(id: string, routeOverride?: string): string {
  if (routeOverride) {
    return routeOverride.replace(/^\/writing\//, "").replace(/\/$/, "");
  }
  const base = id.split("/").pop() ?? id;
  return base.replace(/\.md$/, "").replaceAll("_", "-");
}

/** Resolve ISO date from either `date` or vault `created` field */
export function resolveDate(entry: CollectionEntry<"writing">): string {
  return (entry.data.date ?? entry.data.created)!;
}

/** Exclude drafts during production builds while keeping them visible in local dev */
export function isPublished(entry: CollectionEntry<"writing">): boolean {
  if (import.meta.env.DEV) return true;
  if (entry.data.draft === true) return false;
  if (entry.data.status?.toLowerCase() === "draft") return false;
  return true;
}
