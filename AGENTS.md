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
- **Self-contained diagram SVGs:** Diagram SVGs using custom fonts (`Caveat`, `Inter`) must embed base64 WOFF2 `@font-face` rules inside `<style>` so they render identically on macOS, Linux, and Obsidian without system font fallbacks.
- **Mirror media to Obsidian:** Whenever an SVG, image, or video in `public/` is added or updated for an article, copy the exact file to the matching `~/RQZ/notes/articles/.../assets/` folder in the same turn so both repos stay byte-identical.

## Showing Images To The User

When the user asks to **see**, **show**, or **compare** images, do not claim they rendered in chat unless the user confirms pixels appeared.

On Cursor↔pi bridge runs, `Read` / `image()` often returns a **text description** of the PNG to the model. Markdown `![](...)` links also do not render local scratch files. Writing “here they are” after a description-only tool result is a lie.

### Required tool call (macOS Preview)

Locate or write the PNG under the repo, then call **Shell** exactly like this (absolute paths):

```text
Shell
command: open /Users/raquezha/RQZ/personal/site/scratch/article-figures/side-by-side/fixed-home.png /Users/raquezha/RQZ/personal/site/scratch/article-figures/side-by-side/compact-parity.png
```

Then tell the user the absolute paths and that Preview should have opened. Ask once whether they can see the images. Do not keep re-calling the same show path hoping chat will suddenly paint pixels.

### Secondary tool calls (inspect only unless the user confirms pixels)

**Read** absolute PNG path — for the agent to inspect composition. Treat the result as a description unless the user says they saw the image:

```text
Read
path: /Users/raquezha/RQZ/personal/site/scratch/article-figures/side-by-side/fixed-home.png
```

**pi__codemode** `tools.read` + `image()` — may attach pixels on some pi surfaces; still not a substitute for Preview on Cursor↔pi bridge:

```js
const block = await tools.read({ path: "/Users/raquezha/RQZ/personal/site/scratch/article-figures/side-by-side/fixed-home.png" });
image(block);
```

If Preview is unavailable: serve a temp copy from the local Astro preview and give a `http://127.0.0.1:4321/...` URL, or paste the absolute path for the user to open.

### Deterministic figure parity

For article-figure parity proofs, also follow `topics/deterministic-media/Deterministic Image Standard.md` in the notes vault: compose historical evidence, do not recreate it, and show side-by-sides with the required `open` Shell tool call above.

## Footnotes & Typography Conventions

Follow the `benji.org` footnote styling in `public/site.css` (`.post sup` and `.post .footnotes`), which applies globally across all articles:

- **Inline footnote references:** `.post sup` uses `color: var(--content-nav-default)`, `font-size: 0.6em`, `font-weight: 460`, `line-height: 1`, and `padding: 0 0 0 0.35em`. `.post sup a` inherits that muted color with `text-decoration: none` and transitions to `var(--content-primary)` on `:hover`.
- **Uniform muted style:** Footnotes use `11px` / `15px` in `var(--content-nav-default)`. `.post .footnotes :is(p, strong, code)` inherits font, size, weight, and color with transparent background. Avoid adding bold or pill code styling inside footnotes.
- **Exponent numbers:** `.post .footnotes ol` uses `list-style: none` with `li::before` (`content: counter(list); font-size: 0.45rem;`) positioned at `right: 100%; top: 0` to render superscript-style footnote numbers.
- **Clickable row backref (no `↩` arrow):** `.post .footnotes a.data-footnote-backref` is visually hidden (`text-indent: -9999px; overflow: hidden`) and stretched over the footnote item (`position: absolute; inset: 0; bottom: 0.5em; z-index: 1`) so clicking anywhere on the footnote line jumps back to the inline reference.
- **Inline footnote links:** `.post .footnotes a` uses `color: inherit`, and `.post .footnotes li p a:not(.data-footnote-backref)` sits at `position: relative; z-index: 2` so inline links remain clickable above the row backref overlay.

## Article Bottom Order & Acknowledgements (benji.org Conventions)

The bottom of an article strictly follows this flow order:
1. **Article Body:** Main prose, headings, code, and figures.
2. **`## Acknowledgements` (if present):** Must be written as an `## Acknowledgements` section heading directly in Markdown. Never use frontmatter `acknowledgements: [...]`.
   - Because it is an `H2`, it automatically appears in the sticky Table of Contents rail (`.post-toc`).
   - It renders cleanly above footnotes, without a section ruler (`display: none` on `::after`).
   - Paragraphs inside are styled at 11px / 15px muted text.
   - Only include Acknowledgements if you are thanking real collaborators, reviewers, or colleagues. If none, omit the heading entirely. Never use filler or specimen credits.
3. **Footnotes (`.footnotes`):** Footnotes sit at the very bottom after Acknowledgements.
   - Preceded only by a 50px hairline divider rule (`var(--outline-rule)`).
   - Footnotes have no section heading and never appear in the Table of Contents.

## Section Spacing, Media & Viewport Fade (benji.org Conventions)

Follow these global layout and breathing room conventions in `public/site.css`:

- **Top viewport scroll dissolve:** `body.is-post::before` renders a 128px (8rem) fixed overlay with `pointer-events: none` and `z-index: 30`. It uses a 12-stop eased linear gradient so text and media floating upward dissolve smoothly into the top edge as the user scrolls.
- **Section breathing room (`h2`):** `.post h2` uses 64px (`--layout-spacing-3xl`) above the heading and 24px (`--layout-spacing-l`) below it.
- **Hairline section ruler:** `.post h2::after` renders a 1px `#f2f2f2` (`var(--outline-subtle)`) horizontal rule that extends from the heading text out to the right margin.
- **Media and figure breathing room:** `.post figure` uses 40px (`var(--layout-spacing-40)`) above and 48px (`var(--layout-spacing-xxl)`) below. Captions are centered, muted, and sized at 13px.
- **Code block spacing:** Code blocks use 32px (`var(--layout-spacing-xl)`) top margin with 8px border radius and tokenized border colors.
