import { getCollection, type CollectionEntry } from "astro:content";
import { formatDayMonth, formatYear, isPublished, resolveDate, resolveSlug } from "./dates";

export type WritingSection = "writing" | "personal";

export interface PostRow {
  title: string;
  shortTitle: string;
  date: string;
  year: string;
  dayMonth: string;
  route: string;
  showYear: boolean;
}

/** Fetch all published writing entries sorted newest-first by resolved date. */
export async function getSortedPublishedWriting(): Promise<CollectionEntry<"writing">[]> {
  const entries = await getCollection("writing", isPublished);
  return entries.sort((a, b) => resolveDate(b).localeCompare(resolveDate(a)));
}

/** Map entries belonging to a Home section (`writing` or `personal`) with per-section year labels. */
export function toSectionRows(
  entries: CollectionEntry<"writing">[],
  section: WritingSection
): PostRow[] {
  let seenYear = "";
  return entries
    .filter((entry) => (entry.data.section ?? "writing") === section)
    .map((entry) => {
      const date = resolveDate(entry);
      const year = formatYear(date);
      const showYear = year !== seenYear;
      seenYear = year;
      return {
        title: entry.data.title,
        shortTitle: entry.data.shortTitle ?? entry.data.title,
        date,
        year,
        dayMonth: formatDayMonth(date),
        route: `/writing/${resolveSlug(entry.id, entry.data.routeOverride)}`,
        showYear,
      };
    });
}
