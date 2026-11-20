import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z
    .object({
      title: z.string(),
      shortTitle: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD").optional(),
      created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD").optional(),
      description: z.string().optional(),
      routeOverride: z.string().optional(),
      draft: z.boolean().optional(),
      status: z.string().optional(),
      section: z.enum(["writing", "personal"]).optional(),
      format: z.enum(["prose", "poetry"]).optional(),
    })
    .passthrough()
    .refine((data) => Boolean(data.date || data.created), {
      message: "Markdown frontmatter must include 'date' or 'created' (YYYY-MM-DD)",
    }),
});

export const collections = { writing };
