---
title: "Kitchen Sink"
shortTitle: "Kitchen Sink"
description: "The public test page for every article component, from normal Figma UI samples to deliberately awful mobile stress cases."
status: "published"
section: "personal"
routeOverride: "/writing/kitchen-sink"
created: "2026-11-17"
---

<mark>This is not a real article haha.</mark> This is the site's **Kitchen Sink**: one public page where I throw every Figma-derived article component together and make sure it still works.

It has two jobs. First, it shows the normal stuff: type, marks, code, tables, figures, videos, notes, footnotes, doodles, and the sticky table of contents. Then I wreak havoc on purpose with stupidly long words, six-column tables, and content that normally breaks mobile layouts. If it looks ridiculous, good. That is the point.

I will keep updating this whenever I add a new article thing or want to try something weird. If a future post looks broken, this is where I check whether I broke the site first haha.

## The normal stuff

Regular `14/20` Inter body at weight `460` with **bold emphasis** (`600`), *italic emphasis*, <em class="muted">muted italic asides</em>, [external link styling](https://raquezha.net), and `inline_code_snippet()` tokens.

These are the little hand-drawn things I keep throwing into articles: <img src="/doodle-spaces.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Spaces, <img src="/doodle-website.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> website, <img src="/doodle-plugin.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> plugin, <img src="/doodle-arch.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Arch, <img src="/doodle-macmini.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Mac Mini, <img src="/doodle-explode.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> mind blown, <img src="/doodle-sweat-smile.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> sweat smile, plus the blue cat hanging out in the heading.

Here are the hand-drawn marks: <mark>default sand brush</mark>, <mark class="mint">mint brush</mark>, <mark class="sky">sky brush</mark>, <mark class="lilac">lilac brush</mark>, <mark class="peach">peach brush</mark>, <mark class="lemon">lemon brush</mark>, <mark class="torn">torn paper</mark>, and <mark class="loose">loose double stroke</mark>. Plus <u>hand-drawn underline</u>, <span class="mark-underline">explicit underline class</span>, <span class="mark-wavy">wavy underline</span>, <del>strikethrough</del>, <span class="mark-strike">explicit strike class</span>, and <span class="mark-scratch">scratch-out</span>.

A circle mark <span class="mark-circle">[makes this link look like a questionable handwritten note](https://developers.figma.com/docs/figma-mcp-server/)</span>, while <em class="muted">this is the muted aside style</em>. Hex badges in both moods: <code class="hex-badge" style="background-color: #EBD38F; color: #141414;">#EBD38F</code> and <code class="hex-badge" style="background-color: #20201E; color: #ffffff;">#20201E</code>.

### Nested subsection (`H3`)

#### Deep subsection (`H4`)

> A normal blockquote needs to look calm before the cursed ones start yelling.

- Bullet list item one with `--marker-bullet`
- Bullet list item two with `inlineCode`
  - Nested bullet with **bold**
  - Nested bullet with a [link](https://raquezha.net)

1. Ordered list item one
2. Ordered list item two with a footnote[^1]

<ul class="doodle-list">
  <li class="is-check">

  Hand-drawn check marker next to a normal wrapped list item, including an inline `code_token()` and a [link](https://raquezha.net).

  </li>
  <li class="is-cross">

  Hand-drawn cross marker when something is not ready yet. This one should still wrap cleanly on `390px`.

  </li>
</ul>

| Component | Token | Expected value |
| :--- | :--- | :--- |
| Body copy | `--type-post-body-size` / weight | `14px / 20px` · `460` |
| Bold / italic | `--type-post-strong-weight` / `em` | `600` · true italic |
| Back icon | `.back-icon` | `14px × 14px` |
| Code surface | `--surface-terminal` | `#141414` |

<div class="note">
  <strong>Normal note:</strong> Dedicated `.note` callout using `--surface-code` and `--outline-subtle`, with a <mark class="sky">sky highlight</mark> inside.
</div>

<div class="callout">
  <strong>Normal callout (`59:2116`):</strong> <code class="hex-badge" style="background-color: #FD8770; color: #141414;">#FD8770</code> is a value. <code>theme/primary</code> is a role. The value may change; the role should keep meaning the same thing.
</div>

<div class="annotated-block">
  <p>This checks the normal annotation state: a short paragraph in the reading column, with a note in the right rail on desktop and underneath on smaller screens.</p>
  <aside class="annotation">
    <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
    <span>normal note, not cursed yet</span>
  </aside>
</div>

```kotlin
package com.nodesign.ui.kitchensink

fun normalSyntaxHighlight(
  copyButton: Boolean = true,
  focusRing: Boolean = true,
): String = "github-light on #f8f8f8 before the cursed lines start"
```

```text
Plain text fence for the copy button, focus ring, padding, and rounded corners without relying on fancy tokens.
```

```bash
$ echo "This is the dark terminal version"
This is the dark terminal version
```

<figure>
  <img src="/images/2026-11-10-site-fixed-home.png" alt="Aligned home page reference figure" />
  <figcaption>A normal image and a normal short caption before the long ones start acting up.</figcaption>
</figure>

Speaking of video fixtures: I got tired of re-encoding article loops by hand, so I shipped <mark>[`@raquezha/story-video`](https://www.npmjs.com/package/@raquezha/story-video)</mark> — an agent skill + npm CLI that renders deterministic local story videos from an HTML scene. Same tool that built the loop below haha.

<figure>
  <video autoplay loop muted playsinline controls preload="metadata" poster="/images/2026-11-10-site-fixed-home.png" aria-label="Kitchen Sink autoplay video test">
    <source src="/images/figma-linux-auto-loop.mp4" type="video/mp4" />
  </video>
  <figcaption>Real local video rendered with <a href="https://www.npmjs.com/package/@raquezha/story-video"><code>@raquezha/story-video</code></a>: autoplay, loop, mute, controls, poster, border, radius, and caption all in one annoying little test.</figcaption>
</figure>

- [x] Checked interactive task with a short description
- [ ] Unchecked interactive task with `code_token()` and a [link](https://raquezha.net)
- [ ] Another unchecked task for keyboard focus and Spacebar toggling

One wrapped sentence with everything fighting for attention: **bold**, *italic*, `code`, [a link](https://raquezha.net), <mark class="peach">peach mark</mark>, <span class="mark-circle">circled note</span>, <img src="/doodle-explode.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> doodle, and a footnote[^2] all on the same line.

---

## Let's wreak havoc

What happens when an author drops `AbstractSingletonProxyFactoryBeanConfigurationStrategyProviderInterfaceImpl` inline next to https://example.com/a/very/absurdly/long/unbroken/url/path/without/hyphens/that/tries/to/blow/out/the/390px/mobile/viewport?query=abcdefghijklmnopqrstuvwxyz0123456789 inside the `14/20` Inter reading column?[^3]

<mark>Here is a deliberately long multi-line hand-drawn sand brush highlight spanning multiple wrapped lines in both 1440px desktop and 390px mobile viewports to verify box-decoration-break: clone aligns the start inset and 8px tail cleanly</mark>, immediately followed by <mark class="mint">mint across wraps</mark>, <mark class="sky">sky across wraps</mark>, <mark class="lilac">lilac highlights</mark>, <mark class="peach">peach ink</mark>, <mark class="lemon">lemon strokes</mark>, <mark class="torn">torn edges</mark>, and <mark class="loose">loose double strokes</mark> plus <u>hand-drawn underlines</u>, <span class="mark-wavy">wavy ink strokes</span>, <del>struck-out obsolete specs</del>, and <span class="mark-scratch">ink scratch-outs</span>.

<div class="note">
  <strong>Abused Note #1:</strong> Some articles abuse note blocks back-to-back. Does spacing hold when two notes sit directly above a third note with inline <code>--surface-code</code> tokens?
</div>

<div class="note">
  <strong>Abused Note #2:</strong> Second consecutive note with a <a href="https://raquezha.net">link</a>, <strong>bold text</strong>, and a <mark class="mint">highlighted phrase</mark> inside the callout itself.
</div>

<div class="annotated-block">
  <p>An agent can edit the local Figma plugin file and rerun it cleanly, with zero copy-paste between browser tabs and Figma Desktop. On wide screens (`>= 1120px`), margin annotations sit in the right `160px` rail (`32px` gutter); below `1120px`, meaningful notes stack inline `16px` below their paragraph while decorative arrows hide.</p>
  <aside class="annotation">
    <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
    <span>the whole trick (`42:1533` text + doodle arrow)</span>
  </aside>
</div>

<div class="annotated-block">
  <p>Second annotated paragraph testing a pure text margin note (`42:1510`) up to 40 words with natural wrapping, zero card backgrounds or shadows, and clean vertical separation from adjacent annotation blocks.</p>
  <aside class="annotation">
    <span>Text-only margin note aligned to paragraph top (`42:1510`), wrapping naturally inside 160px.</span>
  </aside>
</div>

<div class="callout">
  <strong>Scribble Callout (`59:2116`):</strong> <code class="hex-badge" style="background-color: #FD8770; color: #141414;">#FD8770</code> is a value. <code>theme/primary</code> is a role. Even inside an absurdly wordy callout box with `27px 32px` padding on a `390px` screen, text must never clip or collide with borders.
</div>

Note how callout geometry still needs to respect footnote links in Markdown prose right below.[^4]

## Ridiculously Long Section Heading With Doodle To Test Flex Divider Wrapping <img src="/doodle-blue-cat.svg" width="44" height="28" alt="" aria-hidden="true" class="post-doodle" />

Look at the `1px` `#f2f2f2` divider beside this heading when the heading itself wraps onto two lines on mobile.[^5]

### Subheading Level Three (`H3`) That Also Wraps Across Narrow Mobile Viewports Without Breaking Line Height

#### Deep Subheading Level Four (`H4`) Edge Case

> "First blockquote paragraph testing left `#e0e0e0` border and `rgba(0, 0, 0, 0.6)` ink at `13px/18px` inside a multi-paragraph quote block."
>
> Second quote paragraph right under it, still inside the same left border, still supposed to breathe.

- Level 1 bullet with `inline_identifier`
  - Level 2 nested bullet with **bold copy**
    1. Level 3 numbered sub-item inside an unordered list[^6]
    2. Second nested numbered item
- Second Level 1 bullet with a very long sentence that wraps across two or three lines to verify continuation indent alignment while an <img src="/doodle-arch.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Arch doodle and an <img src="/doodle-macmini.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Mac Mini doodle sit mid-sentence

## Abused Wide 6-Column Comparison Table & Media Subtitles

| Token Group | Figma Name | DTCG JSON Path | CSS Custom Property | Kotlin (`commonMain`) | Swift (`SwiftUI`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Surface | `surface/background` | `surface.background` | `--surface-background` | `AppColors.surfaceBackground` | `AppColors.surfaceBackground` |
| Content | `content/link-styled` | `content.link-styled` | `--content-link-styled` | `AppColors.contentLinkStyled` | `AppColors.contentLinkStyled` |
| Layout | `layout/breakpoint/post-column` | `layout.breakpoint.post-column` | `--layout-post-column` | `AppLayout.layoutBreakpointPostColumn` | `AppLayout.layoutBreakpointPostColumn` |
| Long Token | `colors/solid/extremely-verbose-coral-accent/400` | `colors.solid.extremely-verbose-coral-accent.400` | `--colors-solid-extremely-verbose-coral-accent-400` | `AppPrimitive.colorsSolidExtremelyVerboseCoralAccent400` | `AppPrimitive.colorsSolidExtremelyVerboseCoralAccent400` |
| Unbroken | `https://example.com/this/is/an/unbroken/table/cell/url/that/should/scroll/horizontally/instead/of/blowing/out/the/column` | `path.with.no.spaces.at.all` | `--too-long-to-wrap-nicely` | `VeryLongIdentifierWithoutBreakOpportunity` | `VeryLongIdentifierWithoutBreakOpportunity` |

<figure>
  <img src="/images/2026-11-10-site-drift-giant-cat.png" alt="Giant cat drift historical capture" />
  <figcaption>Multi-line wrapped image subtitle at 12px/16px (`--type-post-caption-*`): testing how an unusually long caption wraps below an `8px` rounded border without colliding with adjacent prose, while still looking like a caption and not a second article.</figcaption>
</figure>

<figure>
  <video controls preload="metadata" poster="/images/2026-11-10-site-fixed-home.png" aria-label="Kitchen Sink static video player">
    <source src="/images/figma-plugin-magic.mp4" type="video/mp4" />
  </video>
  <figcaption>Static controls video (`59:1711`, `16:9` `#141414` container with `1px solid #333333` stroke and crisp `8px` corners) paired with a multi-line video subtitle underneath so mobile readers get the whole misery.</figcaption>
</figure>

## Overflowing Code Blocks & Dark Terminal Outputs

```kotlin
// Deliberately 220+ characters on one line to stress-test horizontal scroll inside pre > code without squaring the 8px bottom corners
package com.nodesign.ui.stress.test.ultra.long.package.hierarchy

data class AbsurdlyVerboseComponentConfigurationState(val id: String = "59:1507", val isEnabled: Boolean = true, val tokenPath: String = "colors.solid.paper.100")
```

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 15 L4 9 L10 3 M4 9 H13 Q23 9 20 22" /></svg>
```

```bash
$ ./gradlew :composeApp:connectedDebugAndroidTest --tests "com.nodesign.ui.DesignParityStressTest" && npx @raquezha/nodesign extract "https://www.figma.com/design/tNpJxNOZLyt2s2wiXiWDD2/raquezha.net" --manifest
> Task :composeApp:connectedDebugAndroidTest PASSED (14/14 assertions)
```

## Absurd Interactive Task Checklist (Article / Interactive tasks)

- [x] Verify checked state remains crisp and readable next to a 3-line wrapped task description that spans nearly the entire width of the 550px column and still leaves the checkbox clickable
- [ ] Unchecked item with inline `code_token()`, a [link target](https://raquezha.net), and enough wrapping to prove the 24px left pad still works[^7]
- [ ] Another unchecked task testing Spacebar focus and accessibility target alignment on a long sentence that refuses to shut up

## Acknowledgements

This extended stress test Acknowledgements block validates natural paragraph wrapping at 11px/15px muted ink, sitting directly above the footnote hairline divider.[^8]

Second Acknowledgements paragraph verifying vertical rhythm between consecutive acknowledgement notes and referencing footnotes [^9] and [^10] so the full 10-item footnote block renders cleanly at the very bottom.

[^1]: Primitive tokens hold raw hex/dimension values and always carry empty scopes `[]`.
[^2]: Semantic tokens hold intent roles like `surface/background` and alias primitives. See also an inline [token link](https://www.designtokens.org/) and `surface/background` code in the same footnote.
[^3]: Slash-separated names translate mechanically to `.`, `-`, and camelCase across platforms.
[^4]: Mobile (`390px`) drops the sticky left TOC rail and places `← Index` above `H1`.
[^5]: Never let `.article img` override intrinsic icon widths (`home-cat`, `footer-cat`, `post-doodle`).
[^6]: `.article pre` clips `overflow: hidden !important` while `.article pre code` scrolls horizontally.
[^7]: Terminal fences (`bash`, `sh`, `shell`) use `--surface-terminal` (`#141414`) and `1px solid #333333`.
[^8]: Code blocks use `--surface-code` (`#f8f8f8`), zero border, and `github-light` Shiki highlighting.
[^9]: Footnote rule width is locked to `50px` (`#ededed`) per Figma `57:666`.
[^10]: Final tenth footnote testing two-digit index spacing in both desktop and mobile viewports.
