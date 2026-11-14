# raquezha.net

Personal site built with [Astro](https://astro.build).

## Write

Add a file in `src/content/writing/`:

```md
---
title: "Post title"
date: "YYYY-MM-DD"
description: "Short summary for search and sharing."
---

Your article in Markdown.
```

The build automatically adds it to the home page, sorted newest first. The Markdown becomes a static page at `/writing/<slug>` (or `routeOverride` if set).

## Run locally

```sh
npm install
npm run dev
```

Open <http://localhost:4321>.

## Build the static site

```sh
npm run build
```

The output is `dist/`.

## Deploy

The GitHub Actions workflow deploys every push to `main`. In GitHub, set **Settings > Pages > Source** to **GitHub Actions**. The committed `public/CNAME` file requests `raquezha.net`; configure its DNS records at your domain provider, then enable HTTPS in GitHub Pages.
