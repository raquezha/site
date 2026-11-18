# raquezha.net

Personal site built with [Astro](https://astro.build). Layout and typography inspired by [Benji Taylor](https://benji.org).

## Writing a post

Add a Markdown file in `src/content/writing/`:

```md
---
title: "Post title"
shortTitle: "Short TOC title"
date: "YYYY-MM-DD"
status: "published"
description: "Short summary for search and sharing."
---

Your article in Markdown.
```

Posts show up on the home page sorted newest first. Optional frontmatter fields:

- `section: "writing" | "personal"` (defaults to `writing`)
- `format: "prose" | "poetry"` (preserves line breaks when set to `poetry`)
- `acknowledgements: ["..."]` (renders below footnotes)
- `routeOverride: "/writing/custom-slug"`

## Local development

```sh
npm install
npm run dev
```

Open `http://localhost:4321`.

## Build and test

```sh
npx astro sync
npx tsc --noEmit
npm run build
npm test
```

The static output lands in `dist/`.

## Deployment

Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

GitHub Pages is enough for this site. It serves static HTML from `dist/` with free HTTPS and respects `public/CNAME` (`raquezha.net`) once your domain DNS records point to GitHub Pages.
