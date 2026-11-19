---
title: "Design to code drift"
shortTitle: "Design to code drift"
date: "2026-11-18"
status: "published"
description: "My build passed in 515ms and still showed a 500px cat. Six times raquezha.net drifted from Figma, and what I check now before shipping."
routeOverride: "/writing/design-to-code-drift"
acknowledgements:
  - "Inspired by Benji Taylor's writing and minimal design systems."
tags:
  - "figma"
  - "design-to-code"
  - "astro"
  - "ai-agents"
  - "design-tokens"
---
<mark>A green build doesn't mean the page looks right.</mark> My first Astro build for raquezha.net passed in 515 milliseconds. TypeScript passed. The Markdown parsed. Every CSS variable followed the token rules.

On screen, a 500 pixel cat squished my name into a column of single letters haha.

In [Figma with AI agents](/writing/figma-with-ai-agents), both Spaces and raquezha.net made it cleanly into Figma. I shipped **raquezha.net** first (Spaces on Android and iOS is next), and here are the six times the code drifted away from the design.

## 1. The giant cat

![The lounging cat SVG fills the column and squeezes 'Jan Celada' into a column of single letters](/images/2026-11-10-site-drift-giant-cat.png)

Three things went wrong here.

**The agent copied old code instead of reading Figma.** I had an earlier prototype in Kobweb before moving to Astro. I only gave the agent the Figma file name, `raquezha.net`, so it assumed my old prototype CSS was the design and copied it line for line. Copying code perfectly also copies its mistakes.

**A CSS selector won when it shouldn't have.**

```css
/* Specificity (0, 1, 1) */
.article img {
  height: auto;
}

/* Specificity (0, 1, 0), so this loses */
.home-cat {
  height: 0.9em;
}
```

`.article img` is more specific, so `height: auto` won. The SVG had `width="686" height="438"` on it, so it took the whole row and squeezed my name. Every token name in that file was right, and none of it caught this bug.

<u>A passing build is not a visual check.</u> Nobody looked at the page.

## 2. Stale plugin fallback

Next I told the agent: use the Figma MCP server to read every page, style, and variable. If you can't reach Figma, stop and tell me instead of guessing.

I forgot I already burned my 20 monthly Starter MCP calls on another project.

<div class="annotated-block">

The calls failed. The agent didn't tell me. Instead, it found an old `code.js` plugin script in my Downloads folder from my Mac Mini workaround (version 5 from November 6) and treated it as the real design. The actual Figma file was at version 7.7. So it showed me version 5 screenshots and told me everything was 100% aligned.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>version 5 != version 7.7 haha</span>
</aside>
</div>

It wasn't. The column width, font sizes, back link, and highlights were all wrong. Only after I pushed back did it dig into the local Figma cache and find versions 5.2 to 7.7.

Lesson learned: <mark class="sky">if the design source is missing, the agent has to stop and say so.</mark> Never quietly swap in an older file.

![The home page after matching the version 7.7 Figma file](/images/2026-11-10-site-fixed-home.png)

## 3. Messy Figma variables

Once we had the real file, I stopped asking the agent to build the whole page at once. We went piece by piece: tokens first, then header, writing list, footer, post text, navigation, and columns.

Going slowly exposed a bunch of messy spots inside the Figma file itself:

- Some text layers used raw hex colors instead of variables (`#20201E` on my name, `#30302E` on the bio).
- There were no spacing variables, just typed numbers everywhere.
- Text styles used a small 14/20 scale, while older CSS still had a 42px title and 20px body.
- Figma dimmed rows to 60% on hover, which looked too faint in Chrome, so I kept 30% like benji.org.[^1]
- The highlight yellow in Figma (`#EBD38F`) didn't match the CSS (`#EADBB4`).
- On mobile, `text-wrap: pretty` broke lines differently than Figma, so I turned it off on the home page.

When a Figma file disagrees with itself, an agent has to guess or stop. Cleaning up the file first saves a lot of back and forth.

## 4. Breaking other pages

After moving everything to the 14/20 scale, a code heavy post showed three new bugs.

The back arrow was still 24px next to 14px text, so it looked huge. Code blocks and terminal blocks needed different backgrounds too: light gray (`#f8f8f8`) for code, dark (`#141414`) for terminal output and video.

Then my stress test post (wide tables, checklists with code, ten footnotes) broke even more stuff. Table words wrapped one letter at a time. Checklist items turned into flex columns. Footnotes showed up after the acknowledgements.

![A code heavy post with the 14px back arrow and syntax highlighting](/images/2026-11-17-post-compact-parity.png)

Now the site has three test posts and <mark class="lilac">24 Playwright checks</mark> that verify token values, font sizes, icon sizes, footnote order, TOC behavior, and zero horizontal scroll at 1440px, 390px, and 320px.

## 5. Fake agent SVGs

Figma already had a hand drawn arrow for side notes. The agent didn't export it. It typed its own SVG path and guessed the size, which gave me a stiff curve instead of the loose doodle.

The cat icons had the same issue. They were big drawings shrunk 31 times, so the strokes looked faint when zoomed in. I replaced them with real size exports from Figma.

The tests missed all of it because the screenshot diff allowed a 2% change, and a small icon is only 0.1% of the screen.

## 6. When Figma is wrong

I put my home page next to benji.org. Something under my name still felt off.

The code matched Figma. <span class="mark-wavy">Figma was the problem.</span>

Figma put my name, subtitle, and bio in one stack with 16px between everything, so the subtitle floated halfway in the middle. It belongs right under my name (2px away) with 32px before the bio. Figma also used dark text for the first paragraph and gray for the rest, which faded out every link below paragraph one.

I fixed the CSS first. I'll update Figma later.

## What I do now

When I started, my rule was: use Figma for what Figma is good at, and use plain HTML for the rest. Building the site added two more:

> A passing build proves the code is valid. Only a screenshot next to the design proves the page is right.
>
> Build one small piece at a time so messy tokens show up early.

So my loop now is simple:

- [ ] Clean up Figma variables first (colors and spacing).
- [ ] If the design source is missing or old, stop and say so.
- [ ] Build one piece at a time, not the whole page.
- [ ] Check each piece in the browser or simulator at desktop and mobile sizes.
- [ ] If Figma itself is wrong, fix the code, write down why, and sync Figma later.

<mark class="mint">raquezha.net is live now.</mark> Next up is implementing **Spaces** in Jetpack Compose and SwiftUI using the exact same loop.

[^1]: [benji.org](https://benji.org) was the visual reference for the compact typography scale and muted hover states.
