---
title: "Figma to code"
shortTitle: "Figma to code"
date: "2026-11-20"
status: "draft"
description: "My build passed in 515ms and still showed a 500px cat. Why one-shot prompting fails, the breakdown between Figma and code, and why task slicing is the only way forward."
routeOverride: "/writing/figma-to-code"
acknowledgements:
  - "Inspired by Benji Taylor's writing and minimal design systems."
tags:
  - "figma"
  - "design to code"
  - "astro"
  - "ai agents"
  - "design tokens"
---
In [Figma with AI agents](/writing/figma-with-ai-agents), I got both <img src="/doodle-spaces.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **Spaces** and <img src="/doodle-website.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **raquezha.net** into Figma.

Spaces is a full Kotlin Multiplatform mobile app with multiple screens and shared logic. There was no way I was going to let an AI agent loose on that first haha. I needed something small and simple to test the loop on, and this site was the obvious target.

For the tech stack, I originally wanted to build this using Kobweb,[^1] but I never really had the time to sit down and finish a whole project with it. When it came to shipping this site, I just searched what was popular right now. Astro was sitting right at the top of the pile, so I went with it. No deep reason.

## The one-shot experiment

I set up the Astro repo and had the Figma design ready.

I knew full well one-shot prompting an entire site was a bad idea. But I wanted to try it just for the hell of it: *"Hey agent, here's Figma. Build this."*

The agent ran, and the terminal output gave me green checkmarks: build completed in 515 milliseconds. Zero errors.

I opened `localhost:4321`. Instead of my clean minimal header, I got this:

<figure>
  <img src="/images/2026-11-10-site-drift-giant-cat.png" alt="Side by side comparison: Figma header expectation with a 20px cat icon versus Zen browser reality where a 500px cat squished Jan Celada into single letters" />
  <figcaption>Expectation in Figma versus reality on localhost: 515ms build, zero errors, and a 500px cat haha.</figcaption>
</figure>

A 500 pixel cat was taking over the screen, and my name was squished into a vertical column of single letters haha. A passing build only means the computer did not crash. It does not mean your page actually looks right.

## Diagnosing the crime scene

Why did it fail? It was not just that the AI was dumb. It was an interconnected chain of shortcuts:

**1. The Kobweb heist.** The agent did not parse Figma at all. It took the lazy path: it found my old Kobweb prototype files lying around the repo and copied the old CSS line for line. Copying code perfectly also copies its mistakes.

**2. The CSS specificity trap.**

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

`.article img` was more specific, so `height: auto` won. The SVG had `width="686" height="438"` on it, so it took the whole row and squeezed my name. Every token name in that file was valid, and none of it caught this bug.

**3. The Figma MCP quota trap.** Next I told the agent: stop guessing, use the Figma MCP server to read every layer and variable. But I forgot I already burned my 20 monthly Starter MCP calls on Spaces.

The calls threw 429 quota errors. Did the agent stop and tell me? Nope. It snooped around my `Downloads` folder, found an old `code.js` plugin script from November 6 (version 5), and told me with a straight face that the site matched Figma 100%.

<div class="annotated-block">

The actual Figma file was at version 7.7. The column width, font sizes, back link, and highlights were all wrong. Only after I pushed back did it dig into the local Figma cache and find versions 5.2 to 7.7.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>version 5 != version 7.7 haha</span>
</aside>
</div>

Lesson learned: <mark class="sky">if the design source is missing, the agent has to stop and say so.</mark> Never swap in an older file behind my back.

![The home page after matching the version 7.7 Figma file](/images/2026-11-10-site-fixed-home.png)

**4. The fake doodle.** Figma had a hand drawn arrow for side notes. The agent did not export the SVG asset. It literally typed its own raw `<path>` coordinates in code, giving me a stiff, awkward curve instead of the loose doodle.

The cat icons had the same issue: large drawings shrunk 31 times, so the strokes looked faint when zoomed in. I replaced them with real size exports from Figma.

## The interconnected breakdown

The giant cat was just the symptom. The real issue is the connection between Figma and the developer workflow:

If a Figma screen has disconnected components, raw hex codes instead of variables (`#20201E` on my name, `#30302E` on the bio), and untokenized spacing, no AI model can match it 100%. The agent is forced to guess. When it guesses, it hallucinates or grabs old code.

Combine that with limited context windows, token pricing, and rate limits, and one-shot prompting an entire screen is dead on arrival.

## The lightbulb: task slicing

The only way design to code actually works with AI agents is a disciplined two-sided handshake:

**For the UX/UI team:** Standardize the Figma file. Bind real token variables, kill raw hex codes, and use structured components so the design has a single source of truth. (I am documenting this full feedback for our design team in a separate article on Figma Design Standardization).

**For developers:** Stop one-shot prompting. Slice the build into small, verified tasks:

1. **Tokens and variables first:** Get colors and spacing locked in code.
2. **Components:** Build individual UI pieces with bound variables.
3. **States:** Build component states (empty, active, edge cases).
4. **Manual eye check:** Inspect what the AI built in the browser with real human eyes. Never trust green terminal output alone.
5. **Composed screens:** Assemble the verified pieces into full views.
6. **Navigation:** Connect the screens and page routes.

Going slowly exposed plenty of small details on raquezha.net:
- Figma dimmed rows to 60% on hover, which looked too faint in Chrome, so I kept 30% like benji.org.[^2]
- The highlight yellow in Figma (`#EBD38F`) did not match the CSS (`#EADBB4`).
- On mobile, `text-wrap: pretty` broke lines awkwardly, so I turned it off on the home page.
- Under my name, Figma grouped name, subtitle, and bio into one 16px stack, leaving the subtitle stranded in the middle. It belongs right under my name (2px away) with 32px before the bio. If Figma looks wrong in the browser, code wins.

![A code heavy post with the 14px back arrow and syntax highlighting](/images/2026-11-17-post-compact-parity.png)

To make sure things stay locked down, the site now has three test posts and <mark class="lilac">24 Playwright checks</mark> verifying token values, font sizes, icon sizes, footnote order, and zero horizontal scroll at 1440px, 390px, and 320px.

## Next stop: Spaces on mobile

Testing this on raquezha.net gave me the exact playbook I needed. A small sandbox lets you find where AI breaks before you bring it into a larger architecture.

Now the real challenge begins: taking these exact lessons back to the Mobile Team to build **Spaces** in Kotlin Multiplatform (Jetpack Compose on Android and native SwiftUI on iOS). Once we ship Spaces on mobile, I will update this series with what worked, what broke, and how Compose and SwiftUI handled the exact same loop.

[^1]: [Kobweb on GitHub](https://github.com/varabyte/kobweb), a modern web framework built on Kotlin and Compose HTML.
[^2]: [benji.org](https://benji.org) was the visual reference for the compact typography scale and muted hover states.
