import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { resolveDate, resolveSlug } from "../utils/dates";
import { getSortedPublishedWriting, SITE_DESCRIPTION, SITE_TITLE } from "../utils/writing";

export async function GET(context: APIContext) {
  const sorted = await getSortedPublishedWriting();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
