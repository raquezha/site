---
title: "Figma to code"
shortTitle: "Figma to code"
date: "2026-11-20"
status: "published"
description: "My build passed in 515ms and still showed a 500px cat. What stale files, Figma drift, and one-shot prompting taught me about building in small verified slices."
routeOverride: "/writing/figma-to-code"
tags:
  - "figma"
  - "design-to-code"
  - "astro"
  - "ai-agents"
  - "design-tokens"
---
In [Figma with AI agents](/writing/figma-with-ai-agents), I got both <img src="/doodle-spaces.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> [**Spaces**](https://github.com/raquezha/spaces) and <img src="/doodle-website.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **raquezha.net** into Figma.

Spaces is a full Kotlin Multiplatform mobile app with multiple screens, shared logic, and actual product stuff I don't want to accidentally mess up haha. If an agent did something weird there, I would have to clean it up across Android and iOS too. There was no way I was letting it loose on that first.

This site was much safer. It is small, I know every part of it, and if the agent broke something, I could just <u>look at it in the browser</u> and laugh at the damage. So raquezha.net became my little test area for the loop.

## One prompt

I had a feeling that asking an agent to build an entire site from one Figma link was probably not going to end perfectly. But I was curious how far it could get before things started going weird.

I set up the Astro repo,[^1] gave it the Figma link, asked it to build the landing page, and let it run. No huge prompt engineering thing. Just that kinda prompt: <mark>here is the design, make the page, let's see what happens.</mark>

I was using Antigravity while it was changing fast. I started with Gemini 4 Hydrogen and Argon, then Neon came out, and the orchestrator model showed up too. So yeah, I tried them all haha.[^2]

The terminal gave me **green checkmarks**: build completed in 515 milliseconds. *Zero errors.*

I opened `localhost:4321`. Instead of my clean minimal header, I got this <img src="/doodle-sweat-smile.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" />:

<figure>
  <img src="/images/2026-11-10-site-drift-giant-cat.png" alt="Crops from the historical comparison: Figma expected a 20 by 14 pixel cat icon, while localhost showed a roughly 500 pixel cat that squished Jan Celada into single letters" loading="lazy" decoding="async" />
  <figcaption>Cropped from the historical comparison: expectation in Figma versus reality on localhost. That's not a header icon anymore haha.</figcaption>
</figure>

A 500-pixel cat was taking over the screen, and my name was squished into a vertical column of single letters. So yeah, the **code** built fine. The page was another story.

## Diagnosis

Before I blame the agent for everything: my Figma MCP quota was already gone. More on that in a bit.

For the cat, two things went wrong:

**1. The agent reused the <span class="mark-circle">wrong source</span>.** It did not parse Figma. It found my <mark class="torn">old Kobweb prototype</mark> files[^3] and copied the CSS line for line. Copying code perfectly also copies its mistakes.

I wanted it to follow Figma, but I had left the old prototype right there in the repo. Of course it found that instead. That's on me too haha. Those scrap files needed to go, or at least be clearly marked as old.

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

`.article img` was more specific, so <span class="mark-circle">`height: auto`</span> won. The SVG had `width="686" height="438"` on it and swallowed the row.

<span class="mark-wavy">Nothing in the build complained</span> about that. I had to actually open the browser to see my name getting crushed by a cat.

## Out of calls

Once I saw the giant cat, I told the agent to stop guessing and read the real design through the Figma MCP server. That immediately hit a wall.

I forgot I had already <mark class="peach">burned my 20 monthly Starter MCP calls</mark> on Spaces. The requests came back with 429 quota errors. <em class="muted">Nice, now I couldn't even ask it to check the thing I wanted it to copy.</em>

| Method | Limit | Cost | Failure mode |
| :--- | :--- | :--- | :--- |
| **Figma MCP (Starter)** | 20 calls a month | Free | Throws 429 quota error mid-task |
| **Local dev plugin + CDP** | Unlimited | Free | Requires local browser setup |
| **Figma paid plan** | High | Paid seat | Adds monthly subscription costs |

A 20-call limit sounds fine until an agent starts inspecting a canvas. One screen lookup can chew through three or four calls just checking frames, component trees, and styles. Mine were already gone.

## The stale export

With the quota gone, I pointed the agent at local files to find an exported `code.js` plugin. It found one in my Downloads folder and used it to generate the layout.

While building the design in Figma, I had been exporting plugin scripts as local backups, tagging each iteration with a version number like version 5 or 7.7. Why the versioning? Nothing fancy. They were just personal checkpoints so I had a rollback point if an experiment went wrong.

<div class="annotated-block">

The problem was that the agent grabbed an old <span class="mark-circle">version 5</span> export from November 6. By then, the active Figma file had already moved to version 7.7. Column widths, font sizes, back-link styling, and highlights were all from an older checkpoint.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>version 5 != version 7.7 haha</span>
</aside>
</div>

So the fallback worked, except it was rebuilding an older design haha. <mark class="sky">Check the version and timestamp before using a local export.</mark> Having a file on disk doesn't mean it's the file you want.

## The assets were wrong too

Figma had a hand-drawn arrow for side notes. Instead of exporting the SVG asset, the agent literally typed <span class="mark-scratch">raw `<path>` coordinates</span> in code. The result was a stiff, awkward curve instead of a loose doodle. The arrow was already there. I just needed the actual arrow, not its interpretation of one.

The cat icons had a similar problem. Large drawings shrunk 31 times made the strokes faint. I replaced them with exports at the size they were meant to appear.

<figure>
  <img src="/images/2026-11-18-asset-drift.png" alt="Side by side: Figma already had the doodle arrow and display-size cat; the agent guessed a stiff path and shrunk the cat until it went faint" />
  <figcaption>Figma already had the assets. The agent guessed instead of grabbing them.</figcaption>
</figure>

## Why it guessed

By this point I had given the agent a Figma link it couldn't read, an old prototype it could read, and an export that wasn't even current. Looking back, that's a <mark class="loose">messy setup</mark> to ask anything to work from.

And even after sorting out the files, some details still didn't match. Figma's yellow was <code class="hex-badge" style="background-color: #EBD38F; color: #141414;">#EBD38F</code>, while the CSS used <code class="hex-badge" style="background-color: #EADBB4; color: #141414;">#EADBB4</code>. I only found that mismatch while checking the finished page.

<div class="callout">
  <strong>Values versus roles:</strong> A raw hex code like <code class="hex-badge" style="background-color: #FD8770; color: #141414;">#FD8770</code> gives a color. <code>theme/primary</code> gives it a job. Shared variable names tell the designer and developer that the color means the same thing in both places.
</div>

To be clear, hex codes didn't make the cat huge. That was the old CSS and the specificity collision. But now I also had colors that didn't match, spacing with no variables, and components that weren't connected. Getting the right file was <u>one problem</u>. Figuring out which bits of that file to trust was another.

## Small steps

After all that, I stopped asking the agent to build the whole page in one go. Colors and spacing first, then individual components, then the full page. I checked each part in the browser before moving on.

Sounds slower, but I was already spending time fixing a giant cat haha.

<div class="annotated-block">
  <p>Then I found out my personal "why is the <span class="mark-circle"><strong>cat huge</strong></span>" process wasn't only mine haha.</p>
  <aside class="annotation">
    <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
    <span>Okay, so the giant cat was a real kind of problem haha.</span>
  </aside>
</div>

- <mark class="mint">**[Google's People + AI Guidebook](https://pair.withgoogle.com/guidebook/)**</mark> has a whole section on feedback and controls. People need a way to review and steer what the AI gives them.[^6]
- <mark class="sky">**[Playwright](https://playwright.dev/docs/test-snapshots)**</mark> compares browser screenshots against a saved version. The code can run and the page can still look wrong.[^7]
- **[ArtifactsBench](https://aclanthology.org/2026.emnlp-main.2229/)** checks generated UI as code, visual presentation, and interaction. Not just "did it compile?"[^8]

**For the UX/UI team:** Keep the current screens clear, use components, and connect colors and spacing to variables. I had already seen what happened when the agent found an old version.

**For developers:** This is the order I'd follow:

1. **Colors and spacing first.** Set up the variables in code.
2. **<mark class="mint">One component at a time.</mark>** Check the fonts, sizes, and actual exported assets.
3. **Check the states.** Hover, active, empty — not just the default view.
4. **Open the browser.** Check desktop and mobile. <span class="mark-circle">The build passed</span> with the giant cat too.
5. **Assemble the page.** Check the spacing between components, then wire up the links.

Checking in the browser also showed me that some things needed changing in Figma, not just in code:

- Figma dimmed rows to 60% on hover. That looked too faint in Chrome, so I kept the 30% dim from [benji.org](https://benji.org).[^4]
- On mobile, `text-wrap: pretty` broke lines awkwardly, so I turned it off on the home page.
- Figma put my name, subtitle, and bio in one 16px stack. The subtitle belongs 2px below my name, then 32px before the bio. In this case, the browser check showed me the design needed a fix too.

<figure>
  <img src="/images/2026-11-17-post-compact-parity.png" alt="Historical Kitchen Sink capture showing sticky table of contents, Index back link, inline marks, and a syntax-highlighted code block" loading="lazy" decoding="async" />
  <figcaption>Historical Kitchen Sink capture after checking the details in the browser.</figcaption>
</figure>

The site now runs <mark class="lilac">21 Playwright checks</mark>[^5] against the [Kitchen Sink](/writing/kitchen-sink). It throws long identifiers, six-column tables, multi-line highlights, and wordy callouts at the layout to check for horizontal scroll and clipped text at 390px wide.

What I'd do differently next time:

- Get the old prototypes out of the way before asking the agent to build anything.
- Check whether it can actually read Figma. If not, check the fallback's version before trusting it.
- Export the assets instead of asking it to draw something that's already there.
- Open the browser after <span class="mark-circle">each</span> small change, not just when the agent says it's done.

<figure>
  <img src="/images/2026-11-10-site-fixed-home.png" alt="Historical home page capture after the layout fixes, with the restored cat icon beside Jan Celada and the Writing list aligned" loading="lazy" decoding="async" />
  <figcaption>Historical home capture after matching the Figma file, restoring the cat icon, and fixing the layout rhythm.</figcaption>
</figure>

## Spaces next

<mark class="lemon">All of that, just for my personal site</mark> haha. Still glad I tried it here before letting it loose on Spaces.

Now I want to take these lessons back to the Mobile Team and try the same loop on one Spaces screen in Kotlin Multiplatform: Jetpack Compose on Android and native SwiftUI on iOS. Once that ships, I'll write about what worked and what broke there too.

[^1]: [Astro](https://astro.build), a web framework for content-driven websites that renders static HTML with zero client JavaScript by default.
[^2]: Antigravity gave me access to different models as the experiment went on: Gemini 4 Hydrogen, Argon, Neon, and its orchestrator model. This is what happened in my setup, not a benchmark or a claim about what every model would do.
[^3]: [Kobweb on GitHub](https://github.com/varabyte/kobweb), a modern web framework built on Kotlin and Compose HTML.
[^4]: [benji.org](https://benji.org) was the visual reference for compact typography and muted hover states.
[^5]: [Playwright](https://playwright.dev) is an automated browser testing tool that launches real browsers to verify page layout, element geometry, and responsive breakpoints in code.
[^6]: Google's [People + AI Guidebook](https://pair.withgoogle.com/guidebook/) is a practical guide for teams building human-centered AI products. Its [feedback and controls chapter](https://pair.withgoogle.com/guidebook/chapters/feedback-and-controls/design-ai-feedback-loops) covers ways people can review and steer AI outputs.
[^7]: Playwright's [visual comparison documentation](https://playwright.dev/docs/test-snapshots) explains how it saves browser screenshots as baselines and compares later screenshots against them.
[^8]: [ArtifactsBench: Bridging the Visual-Interactive Gap in LLM Code Generation Evaluation](https://aclanthology.org/2026.emnlp-main.2229/) evaluates generated visual artifacts across code, visual presentation, and interaction behavior.
