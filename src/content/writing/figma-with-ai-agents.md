---
title: "Figma with AI agents"
shortTitle: "Figma with AI agents"
date: "2026-11-18"
status: "published"
description: "Why a developer went from Grok images to HTML to our UX/UI team's Figma Design System, what burned tokens, and what I learned for mobile handoffs."
routeOverride: "/writing/figma-with-ai-agents"
tags:
  - "figma"
  - "ai-agents"
  - "spaces"
  - "design-tokens"
---
<mark>I'm not a UX/UI designer.</mark> I'm a chaotic tinkerer haha. I lead platform tooling at work, so I usually break stuff, test ideas, and see if I can rebuild them.

I knew agents could touch Figma, just not how. Once I saw one draw frames on a canvas, my brain went: wait, <span class="mark-circle">[it can do that?](https://developers.figma.com/docs/figma-mcp-server/)</span> So of course I wanted to try [one-shot prompting](https://www.geeksforgeeks.org/artificial-intelligence/one-shot-prompting/) it into Figma. I knew it was farfetched, but I still tried it anyway.

Three things got in the way:

<ul class="doodle-list">
  <li class="is-check">

  **Starter plan limits.** Figma's free plan gives [20 MCP calls a month](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) to read design data.[^1] Iterating with an agent makes those <mark class="peach">20 calls vanish in ten minutes</mark> <img src="/doodle-explode.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" />.

  </li>
  <li class="is-check">

  **Linux vs Mac Mini.** At home on Linux, [debug mode](https://github.com/Figma-Linux/figma-linux) lets the agent edit Figma on its own.[^2] On my office Mac Mini, the official app blocks it.

  </li>
  <li class="is-cross">

  **Direct Figma prompts.** Drawing straight in Figma gave me generic Material screens. Fixing spacing meant prompt after prompt, fine while learning, just frustrating haha.

  </li>
</ul>

<figure>
  <img src="/figma-from-the-dev-side-flow.svg" alt="Hand-drawn Excalidraw style sketch of going from Grok and ChatGPT chat prompts to a website in Chrome, imported via the html.to.design Figma plugin" />
  <figcaption>How I fell into Figma backwards.</figcaption>
</figure>

## How it started

It started while I was playing around with [Spaces](https://github.com/raquezha/spaces), my open source Kotlin Multiplatform app. First I prompted Grok Bot for a UI mock and thought, wow, this actually looks good. Then I brought that image into ChatGPT[^models] to polish it: update this button, fix that card, tweak the layout.

<figure>
  <img src="/images/spaces-phase1-screens.png" alt="Three early Spaces mobile screens: Login, Weekly Report, and Settings" />
  <figcaption>Early Spaces screens from the loop.</figcaption>
</figure>

<div class="annotated-block">

That's where I learned both bots have weird flaws:

- **ChatGPT wins on polish, loses on edits.** Ask it to nudge a button 2px and instead of changing just that part, it <del>moves the button</del> <mark class="peach">regenerates the entire image</mark> and drifts away from what you liked. It's expensive, and it plays it way too safe when you ask it to creatively reimagine a UI.
- **Grok Bot is rougher, but follows orders.** Lower raw quality, way better at creative ideas, and when I said "move this 2px" or "swap that color," it <span class="mark-wavy">actually changed only that piece</span> without messing up the rest.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>Grok Bot for cheap tweaks, ChatGPT for the clean render haha</span>
</aside>
</div>

Once the mock felt close enough, I asked if it could turn the image into HTML. It did, and it looked decent in Zen Browser <em class="muted">(and worked well in other browsers too)</em>.

> *I could have stopped at HTML, except vibe coded HTML isn't a real handoff.* <mark>*My actual goal at work is helping our mobile and UX/UI teams standardize Figma handoffs.*</mark> *So when I discovered `html.to.design`[^3] could turn rendered HTML into editable Figma layers, I pulled the whole thing into Figma.*

## Hitting real Figma pain

Going from image to HTML to Figma got screens onto the canvas, except <del><strong>I'm not a UI designer</strong></del> <em class="muted">(wait, with AI am I a UI designer now? haha)</em> I still barely knew how to use Figma. Digging around those imported layers is where <mark>I discovered components and variables</mark>: you can connect components, link variables across screens, and standardize colors with proper structure. That's when it clicked for me: <span class="mark-wavy">good Figma can be structured just like good code</span>.

Then I talked to Ralph from our UX/UI team, and he showed me the Design System they're building. It felt funny haha, like I was discovering a problem from scratch that they were already fixing and <mark class="mint">miles ahead on</mark>. That's their main work every day, while for me it isn't. He gave me access to their R&D file so I could test with real components and variables instead of raw layers.

That's when the real friction hit. Simple layout tweaks take two seconds in Figma and cost zero AI tokens. Because I'm <u>dumb at Figma</u>, I was <mark class="peach">burning tokens and MCP calls</mark> just to move a button 2 pixels up haha.

## Hacking around the limits

Even <img src="/doodle-plugin.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> `html.to.design` had a free tier wall. For <img src="/doodle-spaces.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **Spaces**, I needed 6 main screens and 13 state variants (empty, loading, and error states). Instead of importing them one by one, I <mark class="sky">stacked 11 states onto one giant HTML page</mark>, imported it in a single shot, and split the frames inside Figma. Later I did the same for **raquezha.net**, drafting pages in HTML, checking them in Zen, and importing them to organize Foundations, Components, and Screens.

To edit inside Figma without burning my 20 monthly MCP calls, I found a second workaround: have the agent generate a local Figma plugin (`manifest.json` and `code.js`), drop it into Figma's `Plugins > Development` menu, and hit **Run**. It <mark>feels like enabling god mode in Figma</mark>. Zero design skills, zero clue what half the buttons do, one click on Run, and suddenly five full mobile screens just spawn on the canvas haha.

<figure>
  <video autoplay loop muted playsinline controls preload="metadata">
    <source src="/images/figma-plugin-magic.webm" type="video/webm" />
    <source src="/images/figma-plugin-magic.mp4" type="video/mp4" />
  </video>
  <figcaption>The local plugin workaround: generate the plugin, drop it into Figma, hit run. Boom! There's your UI! Magic! <img src="/doodle-explode.svg" width="16" height="16" alt="" aria-hidden="true" class="inline-doodle" /> Mind blown!</figcaption>
</figure>

Hooray, right? Except I'm a developer, and I didn't want to manually click buttons every time. I wanted to drive it even further.

Once a development plugin is imported, Figma reads `code.js` fresh from disk on every run. At home on <img src="/doodle-arch.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Arch Linux,[^4] `figma-linux` lets you open a local debug port,[^2] so I wired the agent to update `code.js` and trigger Figma's **Run last plugin** shortcut by itself. You just prompt a change, the agent edits the same plugin and reruns it, and <mark class="mint">the updated UI automatically appears in Figma</mark> with zero clicks.

<figure>
  <img src="/figma-linux-auto-loop.svg" alt="Hand-drawn sketch of the zero-click Arch Linux loop: prompt in terminal updates code.js, triggers Run last plugin over figma-linux debug port, and updates Figma automatically, until the office Mac Mini blocks it" />
  <figcaption>Pushing the hack to zero clicks on Arch Linux, before hitting the Mac Mini wall.</figcaption>
</figure>

<div class="annotated-block">

That could have been the perfect ending for the hack, except the real ending happened at the office. My office <img src="/doodle-macmini.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Mac Mini runs the official macOS Figma app, where debug mode is completely blocked. And since my colleagues on the UX/UI team all use Macs too, an Arch Linux hack doesn't help them at all. So yeah, <del><strong>full automation</strong></del> fuck that hack haha, back to clicking Run on the Mac Mini. Fun times anyway.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span><img src="/doodle-arch.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Arch = 0-click auto, <img src="/doodle-macmini.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Mac Mini = manual click haha</span>
</aside>
</div>

## What it gave me

Getting screens into Figma was never the end goal by itself. <mark>The whole point of this R&D was to learn how Figma handoffs actually work, document everything I found, and bring real dev feedback back to our UX/UI team:</mark>

- Frames on a canvas don't tell a developer or an agent which color is a background, which one is an accent, or what changes together.
- I discovered **DTCG**[^5] <em class="muted">(no, not the <del><strong>Digimon Trading Card Game</strong></del> haha, the W3C **Design Tokens Community Group**)</em>. I didn't even know a whole community for this existed before starting this R&D. Mapping our layers to shared variable names (<mark class="lilac">`surface/*`, `content/*`, `layout/spacing/*`</mark>) in their JSON format keeps the exact same names across Figma, CSS, Kotlin, and Swift.

After documenting all of this, I actually understand the UX/UI team's side too, so I can help standardize our Figma to mobile handoffs instead of guessing from the sidelines.

To be fair, AI is insanely helpful when reading a bunch of components and updating them in real time. **Figma MCP is god tier**, and so is the price haha. Since this is R&D, I stuck to the free tier and pushed those hacks to the limit first to prove whether the whole venture is actually worth it.

On the design side, <mark class="mint">both Spaces and raquezha.net made it cleanly into Figma.</mark> The next headache was turning those Figma files back into production code. I wrote about the six times things broke on raquezha.net in **Design to code drift** (coming next). Spaces is up next too.

[^1]: Our company has a paid Figma plan (200+ calls a day), so my colleagues never hit this. My personal R&D files sit on my free Starter account, where 20 calls a month vanish fast, so I had to hack around it haha. See [Figma's MCP rate limits](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/).
[^2]: Figma has no official Linux desktop app, so the community [figma-linux](https://github.com/Figma-Linux/figma-linux) project is a beast. Because it lets you open remote debugging, my AI agent could control Figma autonomously at home instead of getting locked out like on macOS.
[^3]: [html.to.design](https://html.to.design/) converts rendered browser pages into editable Figma frames. When the initial free imports ran out, registering a free divRIOTS account and logging in and out gave me 10 more imports a month to re-import the states cleanly haha.
[^4]: Turned my old 2018 Asus ROG GLX703GE into a home server running EndeavourOS. Wanna know how I set that up? Writing that post next.
[^5]: Google "DTCG" and the first thing that pops up is the Digimon Trading Card Game haha. The one I discovered here is the W3C [Design Tokens Community Group](https://www.w3.org/community/design-tokens/) ([designtokens.org](https://www.designtokens.org/) and their [2025.10 Format Spec](https://www.designtokens.org/tr/2025.10/format/)), a community of designers and engineers defining a portable JSON standard ($value, $type, and primitive to semantic aliases) so one token file works across Figma, web (CSS), Android (Compose), and iOS (SwiftUI).
[^models]: Models used across the loop: Grok Bot for initial mocks and targeted tweaks, ChatGPT (mostly gpt-5.6-terra and gpt-6.1-sol) for polish, and Gemini 3.8 Flash for fast HTML and code passes.
