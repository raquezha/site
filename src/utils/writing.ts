import { getCollection, type CollectionEntry } from "astro:content";
import { isPublished, resolveDate } from "./dates";

/** Fetch all published writing entries sorted newest-first by resolved date. */
export async function getSortedPublishedWriting(): Promise<CollectionEntry<"writing">[]> {
  const entries = await getCollection("writing", isPublished);
  return entries.sort((a, b) => resolveDate(b).localeCompare(resolveDate(a)));
}
