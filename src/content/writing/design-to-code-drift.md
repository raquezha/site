---
title: "Figma to code"
shortTitle: "Figma to code"
date: "2026-11-20"
status: "draft"
description: "My build passed in 515ms and still showed a 500px cat. Why one-shot prompting fails, the breakdown between Figma and code, and why task slicing is the only way forward."
routeOverride: "/writing/figma-to-code"
tags:
  - "figma"
  - "design to code"
  - "astro"
  - "ai agents"
  - "design tokens"
---
In [Figma with AI agents](/writing/figma-with-ai-agents), I got both <img src="/doodle-spaces.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **Spaces** and <img src="/doodle-website.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **raquezha.net** into Figma.

Spaces is a full Kotlin Multiplatform mobile app with multiple screens and shared logic. There was no way I was going to let an AI agent loose on that first haha. I needed something small and simple to test the loop on, and this site was the obvious target.

For the tech stack, I originally wanted to build this using Kobweb,[^1] but I never really had the time to sit down and finish a whole project with it. When it came to shipping this site, I just searched what was popular right now. Astro[^2] was sitting right at the top of the pile, so I went with it. No deep reason.

## The one-shot experiment

I set up the Astro repo and had the Figma design ready.

I knew full well one-shot prompting an entire site was a bad idea. But I wanted to try it anyway just to see how far it could get. I gave the agent the Figma link, asked it to build the landing page in Astro, and let it run.

The agent ran, and the terminal output gave me green checkmarks: build completed in 515 milliseconds. Zero errors.

I opened `localhost:4321`. Instead of my clean minimal header, I got this:

<figure>
  <img src="/images/2026-11-10-site-drift-giant-cat.png" alt="Side by side comparison: Figma header expectation with a 20px cat icon versus Zen browser reality where a 500px cat squished Jan Celada into single letters" />
  <figcaption>Expectation in Figma versus reality on localhost: 515ms build, zero errors, and a 500px cat haha.</figcaption>
</figure>

A 500 pixel cat was taking over the screen, and my name was squished into a vertical column of single letters. A passing build only means the computer did not crash. It does not mean your page actually looks right.

## Diagnosing the crime scene

Why did a passing build look like a disaster? Two things went wrong:

**1. The agent took a shortcut.** It did not parse Figma at all.[^3] It found my old Kobweb prototype files lying around the repo and copied the old CSS line for line. Copying code perfectly also copies its mistakes.

Lesson learned: set up your repo the right way and put real guard rails in place. An agent will always look for the path of least resistance. If you leave old scrap files or obsolete prototypes lying around, the agent will treat them as ground truth instead of reading the design.

**2. A silent CSS collision.**

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

`.article img` was more specific, so `height: auto` won. The SVG had `width="686" height="438"` on it, so it took over the row and crushed my name into single letters.

The terminal gave me green checkmarks in 515 milliseconds, but the browser was unusable. That was the first lesson: a passing build only proves your syntax is valid. It cannot tell you if the visual design actually survived.

## Hitting the tool limits

Once I saw the giant cat, I told the agent to stop guessing and read the real design through the Figma MCP server. That immediately hit a wall.

I forgot I had already burned my 20 monthly Starter MCP calls on Spaces. The calls threw 429 quota errors.

| Method | Limit | Cost | Failure mode |
| :--- | :--- | :--- | :--- |
| **Figma MCP (Starter)** | 20 calls a month | Free | Throws 429 quota error mid-task |
| **Local dev plugin + CDP** | Unlimited | Free | Requires local browser setup |
| **Figma paid plan** | High | Paid seat | Adds monthly subscription costs |

A 20-call limit sounds fine until an agent starts inspecting a canvas. A single screen lookup can chew through three or four calls just inspecting frames, component trees, and styles. Halfway through the build, the free tier shuts the door.

## Stale backups and version drift

To keep moving without waiting a month for my quota to reset, I pointed the agent to local files to find any exported scripts. It found an exported `code.js` plugin file in my `Downloads` folder and used it to generate the layout.

That introduced two new silent failures:

<div class="annotated-block">

**1. Version drift.** While building the design in Figma, I had been exporting plugin scripts as local backups, tagging each iteration with a version number like version 5 or 7.7. Why the versioning? Nothing fancy. They were just personal checkpoints so I had a rollback point if an experiment went wrong.

The problem was that the agent grabbed an old version 5 export from November 6. By then, the active Figma file had already moved forward to version 7.7. Column widths, font sizes, back link styling, and highlights were all from an older checkpoint.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>version 5 != version 7.7 haha</span>
</aside>
</div>

Lesson learned: <mark class="sky">if you fall back to local exports, verify the version timestamp first.</mark> An agent will gladly trust whatever file you give it, even if your design has moved five versions ahead.

**2. Asset hallucinations.** Figma had a hand drawn arrow for side notes. Instead of exporting the SVG asset, the agent literally typed raw `<path>` coordinates in code. The result was a stiff, awkward curve instead of a loose doodle.

The cat icons had the same problem: large drawings shrunk 31 times, so the strokes looked faint when zoomed in. I replaced them with real size exports from Figma.

<figure>
  <img src="/images/2026-11-10-site-fixed-home.png" alt="The home page after matching the version 7.7 Figma file with restored 14px cat and aligned layout" />
  <figcaption>The home page after matching the real version 7.7 Figma file: 14px cat icon restored and layout rhythm aligned.</figcaption>
</figure>

## The interconnected breakdown

The giant cat was just the symptom. The real issue is the connection between Figma and the developer workflow:

If a Figma screen has disconnected components, raw hex codes instead of variables (`#20201E` on my name, `#30302E` on the bio), and untokenized spacing, no AI model can match it 100%. The agent is forced to guess. When it guesses, it hallucinates or grabs old code.

<div class="callout">
  <strong>Values versus roles:</strong> A raw hex code like <code>#FD8770</code> is just a value. <code>theme/primary</code> is a role. When a Figma canvas only has raw values and loose padding, the AI is forced to guess the intent. When it guesses, the build drifts.
</div>

Combine that with limited context windows, token pricing, and rate limits, and one-shot prompting an entire screen is dead on arrival.

## The lightbulb: task slicing

I do not think this is the only way to do it. But on a super simple personal site like this, the working pattern I landed on was a disciplined two-sided handshake:

**For the UX/UI team:** Standardize the Figma file. Bind real token variables, kill raw hex codes, and use structured components so the design has a single source of truth. (I am documenting this full feedback for our design team in a separate article on Figma Design Standardization).

**For developers:** Stop one-shot prompting. Slice the build into small, verified tasks:

1. **Tokens and variables first:** Get colors and spacing locked in code.
2. **Components:** Build individual UI pieces with bound variables.
3. **States:** Build component states (empty, active, edge cases).
4. **Manual eye check:** Inspect what the AI built in the browser with real human eyes. Never trust green terminal output alone.
5. **Composed screens:** Assemble the verified pieces into full views.
6. **Navigation:** Connect the screens and page routes.

Going slowly exposed plenty of small details on raquezha.net:
- Figma dimmed rows to 60% on hover, which looked too faint in Chrome, so I kept 30% like benji.org.[^4]
- The highlight yellow in Figma (`#EBD38F`) did not match the CSS (`#EADBB4`).
- On mobile, `text-wrap: pretty` broke lines awkwardly, so I turned it off on the home page.
- Under my name, Figma grouped name, subtitle, and bio into one 16px stack, leaving the subtitle stranded in the middle. It belongs right under my name (2px away) with 32px before the bio. If Figma looks wrong in the browser, code wins.

<figure>
  <img src="/images/2026-11-17-post-compact-parity.png" alt="Article post with 160px sticky table of contents, 14px back arrow, and syntax-highlighted code block" />
  <figcaption>Article layout with compact typography, 160px sticky table of contents, and syntax highlighted code blocks.</figcaption>
</figure>

To make sure things stay locked down, the site now runs <mark class="lilac">24 Playwright checks</mark> against an [absurd stress test post](/writing/_absurd-stress-test). It throws unbroken identifiers, 6-column tables, multi-line brush highlights, and wordy callout boxes with 27px 32px padding at the layout to verify zero horizontal scroll and zero text clipping on 390px mobile screens.

## Next stop: Spaces on mobile

Testing this on raquezha.net gave me the exact playbook I needed. A small sandbox lets you find where AI breaks before you bring it into a larger architecture.

Now the real challenge begins: taking these exact lessons back to the Mobile Team to build **Spaces** in Kotlin Multiplatform (Jetpack Compose on Android and native SwiftUI on iOS). Once we ship Spaces on mobile, I will update this series with what worked, what broke, and how Compose and SwiftUI handled the exact same loop.

[^1]: [Kobweb on GitHub](https://github.com/varabyte/kobweb), a modern web framework built on Kotlin and Compose HTML.
[^2]: [Astro](https://astro.build), a web framework for content driven websites that renders static HTML with zero client JavaScript by default.
[^3]: The test ran on my daily setup using Gemini 3.8 Flash and Grok Bot, not frontier models like GPT 6.1 Astra or Fable. Maybe a top model could parse the whole canvas in one shot, but I work with what I have, and everyday agents look for the nearest shortcut.
[^4]: [benji.org](https://benji.org) was the visual reference for the compact typography scale and muted hover states.
