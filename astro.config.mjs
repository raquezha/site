import fs from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://raquezha.github.io",
  base: "/site",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404/") && !page.endsWith("/404"),
    }),
    {
      name: "prune-draft-only-media",
      hooks: {
        "astro:build:done": ({ dir }) => {
          const writingDir = new URL("./writing/", dir);
          if (!fs.existsSync(writingDir)) {
            fs.rmSync(new URL("./images", dir), { recursive: true, force: true });
            fs.rmSync(new URL("./demo-placeholder.mp4", dir), { force: true });
          }
        },
      },
    },
  ],
  markdown: {
    shikiConfig: {
      theme: "github-light",
      wrap: false,
    },
  },
});
