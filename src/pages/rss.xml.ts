import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { isPublished, resolveDate, resolveSlug } from "../utils/dates";

export async function GET(context: APIContext) {
  const entries = await getCollection("writing", isPublished);
  const sorted = entries.sort((a, b) => resolveDate(b).localeCompare(resolveDate(a)));

  return rss({
    title: "Jan Celada",
    description: "Android, Kotlin, and AI tooling.",
    site: context.site!,
    items: sorted.map((entry) => {
      const date = resolveDate(entry);
      return {
        title: entry.data.title,
        pubDate: new Date(`${date}T00:00:00Z`),
        description: entry.data.description,
        link: `/writing/${resolveSlug(entry.id, entry.data.routeOverride)}`,
      };
    }),
  });
}
