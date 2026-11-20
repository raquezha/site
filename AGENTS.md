# AGENTS.md

Guidelines for agents working in `raquezha/site`.

## Environment & Deployment

- **Live source of truth:** `macmini:~/RQZ/personal/site` (SSH host `macmini`).
- If editing from another machine (e.g. Arch Linux), sync changes with `rsync`, run tests on `macmini`, and commit/push from `macmini`:
  ```sh
  rsync -avz <local-file> macmini:~/RQZ/personal/site/<local-file>
  ssh macmini "cd ~/RQZ/personal/site && PATH=/opt/homebrew/bin:/usr/bin:/bin npm test"
  ```
- Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Content & Media Rules

- Posts live in `src/content/writing/*.md`. Keep unfinished posts as `status: "draft"` so they are excluded from production builds.
- `public/images/*` is gitignored by default; explicitly unignore (`!public/images/<asset>`) only media referenced by published posts.

## Footnotes & Typography Conventions

Follow the `benji.org` footnote styling in `public/site.css` (`.post sup` and `.post .footnotes`), which applies globally across all articles:

- **Inline footnote references:** `.post sup` uses `color: var(--content-nav-default)`, `font-size: 0.6em`, `font-weight: 460`, `line-height: 1`, and `padding: 0 0 0 0.35em`. `.post sup a` inherits that muted color with `text-decoration: none` and transitions to `var(--content-primary)` on `:hover`.
- **Uniform muted style:** Footnotes use `11px` / `15px` in `var(--content-nav-default)`. `.post .footnotes :is(p, strong, code)` inherits font, size, weight, and color with transparent background—avoid adding bold or pill code styling inside footnotes.
- **Exponent numbers:** `.post .footnotes ol` uses `list-style: none` with `li::before` (`content: counter(list); font-size: 0.45rem;`) positioned at `right: 100%; top: 0` to render superscript-style footnote numbers.
- **Clickable row backref (no `↩` arrow):** `.post .footnotes a.data-footnote-backref` is visually hidden (`text-indent: -9999px; overflow: hidden`) and stretched over the footnote item (`position: absolute; inset: 0; bottom: 0.5em; z-index: 1`) so clicking anywhere on the footnote line jumps back to the inline reference.
- **Inline footnote links:** `.post .footnotes a` uses `color: inherit`, and `.post .footnotes li p a:not(.data-footnote-backref)` sits at `position: relative; z-index: 2` so inline links remain clickable above the row backref overlay.

## Section Spacing, Media & Viewport Fade (benji.org Conventions)

Follow these global layout and breathing room conventions in `public/site.css`:

- **Top viewport scroll dissolve:** `body.is-post::before` renders a 128px (8rem) fixed overlay with `pointer-events: none` and `z-index: 30`. It uses a 12-stop eased linear gradient so text and media floating upward dissolve smoothly into the top edge as the user scrolls.
- **Section breathing room (`h2`):** `.post h2` uses 64px (`--layout-spacing-3xl`) above the heading and 24px (`--layout-spacing-l`) below it.
- **Hairline section ruler:** `.post h2::after` renders a 1px `#f2f2f2` (`var(--outline-subtle)`) horizontal rule that extends from the heading text out to the right margin.
- **Media and figure breathing room:** `.post figure` uses 40px (`var(--layout-spacing-40)`) above and 48px (`var(--layout-spacing-xxl)`) below. Captions are centered, muted, and sized at 13px.
- **Code block spacing:** Code blocks use 32px (`var(--layout-spacing-xl)`) top margin with 8px border radius and tokenized border colors.
