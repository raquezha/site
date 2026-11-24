---
title: "Figma with AI agents"
shortTitle: "Figma with AI agents"
date: "2026-11-18"
status: "published"
description: "Why a developer went from Grok Bot images to HTML to our UX/UI team's Figma Design System, what burned tokens, and what I learned for mobile."
routeOverride: "/writing/figma-with-ai-agents"
tags:
  - "figma"
  - "ai-agents"
  - "design-to-code"
  - "design-tokens"
  - "spaces"
---
<mark>I'm not a UX/UI designer.</mark> I'm a chaotic tinkerer haha. I lead platform tooling at work, so I usually break stuff, test ideas, and see if I can rebuild them.

The actual reason I went down this rabbit hole was a little selfish haha. If our UX/UI team can make Figma clearer and more useful for developers, the mobile team has less guessing and rework. If the mobile team has less guessing and rework, <mark class="sky">my life gets easier too</mark>. So I wanted to understand their side properly and help crack it with them.

I knew agents could touch Figma. I just didn't know how. Once I saw one draw frames on a canvas, my brain went: wait, <span class="mark-circle">[it can do that?](https://developers.figma.com/docs/figma-mcp-server/)</span> So of course I wanted to try [one-shot prompting](https://www.geeksforgeeks.org/artificial-intelligence/one-shot-prompting/) my way into Figma. I knew it was far-fetched, but I still tried it anyway.

Three things got in the way:

<ul class="doodle-list">
  <li class="is-check">

  **Starter plan limits.** Figma's free plan gives [20 MCP calls a month](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) to read design data.[^1] Iterating with an agent makes those <mark class="peach">20 calls vanish in ten minutes</mark> <img src="/doodle-explode.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" />.

  </li>
  <li class="is-check">

  **Linux vs Mac Mini.** At home on Linux, [debug mode](https://github.com/Figma-Linux/figma-linux) lets the agent edit Figma on its own.[^2] On my office Mac Mini, the official app blocks it.

  </li>
  <li class="is-cross">

  **Direct Figma prompts.** Drawing straight in Figma gave me <mark class="lilac">generic Material screens</mark>. Fixing spacing meant prompt after prompt. Fine while learning, just frustrating.

  </li>
</ul>

<figure>
  <img src="/images/figma-from-the-dev-side-flow.png" alt="Hand-drawn Excalidraw style sketch of going from Grok Bot and ChatGPT chat prompts to a website in Chrome, imported via the html.to.design Figma plugin" />
  <figcaption>How I fell into Figma backwards.</figcaption>
</figure>

## How it started

It started while I was playing around with [Spaces](https://github.com/raquezha/spaces), my open source Kotlin Multiplatform app. First I prompted Grok Bot for a UI mock and thought, wow, this actually looks good. Then I brought that image into ChatGPT to polish it: update this button, fix that card, tweak the layout.

<figure>
  <img src="/images/spaces-phase1-screens.png" alt="Three early Spaces mobile screens: Login, Weekly Report, and Settings" />
  <figcaption>Early Spaces screens from the loop.</figcaption>
</figure>

I kept bouncing between Grok Bot and ChatGPT for the mocks.[^3] Grok Bot was better when I wanted a weird idea or one targeted tweak. ChatGPT usually gave me the cleaner render, then sometimes regenerated the whole thing when I only asked it to move a button 2px.

Once the mock felt close enough, I asked if it could turn the image into HTML. It did, and it looked decent in Zen Browser <em class="muted">(and worked well in other browsers too)</em>.

> *I could have stopped at HTML, except vibe coded HTML isn't what mobile needs from UX/UI.* *So when I discovered [`html.to.design`](https://html.to.design/)[^4] could turn rendered HTML into editable Figma layers, I pulled the whole thing into Figma.*

## Ralph's file

Going from image to HTML to Figma got screens onto the canvas, except <del><strong>I'm not a UI designer</strong></del> <em class="muted">(wait, with AI am I a UI designer now? haha)</em> I still barely knew how to use Figma. Digging around those imported layers is where <mark>I discovered components and variables</mark>: you can connect components, link variables across screens, and standardize colors with proper structure. That's when it clicked for me: <span class="mark-wavy">good Figma can be structured just like good code</span>.

Then I talked to Ralph from our UX/UI team, and he showed me the Design System they're building. It felt funny haha, like I was discovering a problem from scratch that they were already fixing and miles ahead on. That's their main work every day, while for me it isn't. He gave me access to their R&D file so I could test with real components and variables instead of raw layers.

That's when the real friction hit. Simple layout tweaks take two seconds in Figma and cost zero AI tokens. Because I'm <u>dumb at Figma</u>, I was <mark class="peach">burning tokens</mark> just to move a button 2 pixels up.

## .hack//

Even <img src="/doodle-plugin.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> `html.to.design` had a free tier wall. For <img src="/doodle-spaces.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **Spaces**, I ended up with six main screens and 13 state variants (empty, loading, and error states). Instead of importing them one by one, I stacked 11 states onto one giant HTML page, imported it in a single shot, and split the frames inside Figma. Later I did the same for <img src="/doodle-website.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> **raquezha.net**, drafting pages in HTML, checking them in Zen, and importing them to organize Foundations, Components, and Screens.

To edit inside Figma without burning through the free tier again, I found a second workaround: have the agent generate a local Figma plugin (`manifest.json` and `code.js`), drop it into Figma's `Plugins > Development` menu, and hit **Run**. It <mark>feels like enabling god mode in Figma</mark>. Zero design skills, zero clue what half the buttons do, one click on Run, and suddenly five full mobile screens just spawn on the canvas haha.

<figure>
  <video autoplay loop muted playsinline controls preload="metadata">
    <source src="/images/figma-plugin-magic.mp4" type="video/mp4" />
  </video>
  <figcaption>The local plugin workaround: generate the plugin, drop it into Figma, hit run. Boom! There's your UI! Magic! <img src="/doodle-explode.svg" width="16" height="16" alt="" aria-hidden="true" class="inline-doodle" /> Mind blown! The video is curated by me with the help of Gemini 4 Neon.</figcaption>
</figure>

Hooray, right? Except I'm a developer, and I didn't want to manually click buttons every time. I wanted to drive it <u>even further</u>.

Once a development plugin is imported, Figma reads `code.js` fresh from disk on every run. At home on <img src="/doodle-arch.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> EndeavourOS (Arch Linux),[^5] `figma-linux` lets you open a local debug port,[^2] so I wired the agent to update `code.js` and trigger Figma's **Run last plugin** shortcut by itself. You just prompt a change, the agent edits the same plugin and reruns it, and <mark class="mint">the updated UI automatically appears in Figma</mark> with zero clicks.

<figure>
  <video autoplay loop muted playsinline controls preload="metadata">
    <source src="/images/figma-linux-auto-loop.mp4" type="video/mp4" />
  </video>
  <figcaption>The zero-click loop on EndeavourOS: pi agent updates code.js in Ghostty, triggers Run last plugin via port 9222, and Figma updates live with 0 manual clicks. The video is curated by me with the help of Gemini 4 Neon.</figcaption>
</figure>

<div class="annotated-block">

That could have been the perfect ending for the hack, except the real ending happened at the office. My office <img src="/doodle-macmini.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Mac Mini runs the official macOS Figma app, where debug mode is completely blocked.[^6] And since my colleagues on the UX/UI team all use Macs too, an Arch Linux hack doesn't help them at all. So yeah, <del><strong>full automation</strong></del> fuck that hack haha, back to clicking Run on the Mac Mini. Fun times anyway.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span><img src="/doodle-arch.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Arch = 0-click auto, <img src="/doodle-macmini.svg" width="18" height="18" alt="" aria-hidden="true" class="inline-doodle" /> Mac Mini = manual click haha</span>
</aside>
</div>

## Conclusion

Getting screens into Figma was never the end goal by itself. <mark>The whole point of this R&D was to learn how a Figma file turns into something developers can actually build, document everything I found, and bring real feedback back to our UX/UI team:</mark>

- Frames on a canvas don't tell a developer or an agent which color is a background, which one is an accent, or what changes together.
- I discovered **DTCG**[^7] <em class="muted">(no, not the <del><strong>Digimon Trading Card Game</strong></del> haha, the W3C **Design Tokens Community Group**)</em>. I didn't even know a whole community for this existed before starting this R&D. Mapping our layers to shared variable names (`surface/*`, `content/*`, `layout/spacing/*`) in their JSON format keeps the exact same names across Figma, CSS, Kotlin, and Swift.

After documenting all of this, I actually understand the UX/UI team's side too, so I can help make our Figma to mobile path clearer instead of guessing from the sidelines.

To be fair, from what I could see, Figma MCP is insanely helpful when it can read a bunch of components and update them in real time. <mark class="peach">Powerful, and expensive</mark> haha. Since this is R&D, I stuck to the free tier and pushed those hacks to the limit first to prove whether the whole venture is actually worth it.

On the design side, both [Spaces](https://github.com/raquezha/spaces) and raquezha.net made it cleanly into Figma. The next headache was turning those Figma files back into production code. I wrote about what broke on raquezha.net in [**Figma to code**](/writing/figma-to-code). <em class="muted">Mobile Spaces is the next write-up.</em>

[^1]: Our company has a paid Figma plan (200+ calls a day), so my colleagues never hit this. My personal R&D files sit on my free Starter account, where 20 calls a month vanish fast, so I had to hack around it haha. See [Figma's MCP rate limits](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/).
[^2]: Figma has no official Linux desktop app, so the community [figma-linux](https://github.com/Figma-Linux/figma-linux) project is a beast. Because it lets you open remote debugging, my AI agent could control Figma autonomously at home instead of getting locked out like on macOS.
[^3]: Grok Bot handled the initial mocks and targeted tweaks. ChatGPT, mostly gpt-5.6-terra and gpt-6.1-sol, handled polish. Gemini 3.8 Flash did fast HTML and code passes, while Gemini 4 Neon helped with the video simulation and Spaces states.
[^4]: [html.to.design](https://html.to.design/) converts rendered browser pages into editable Figma frames. When the initial free imports ran out, registering a free divRIOTS account and logging in and out gave me 10 more imports a month to re-import the states cleanly haha.
[^5]: Turned my old 2018 Asus ROG GLX703GE into a home server running EndeavourOS. That home-lab write-up is still sitting in my drafts pile haha.
[^6]: It is hardcoded into Figma Desktop's main Electron bundle (`app.asar`): `process.env.FIGMA_TEST || app.commandLine.removeSwitch("remote-debugging-port")`. Unless you run in their internal test harness (which loads `about:blank`), Figma deletes the debug flag on startup. A forum reply suggested "Reset Figma and Restart", but that only clears cache; the flag deletion is in the app bundle. This really sucks haha. See the [Figma Forum bug report](https://forum.figma.com/report-a-problem-6/remote-debugging-port-not-working-in-figma-desktop-126-1-2-50858).
[^7]: Google "DTCG" and the first thing that pops up is the Digimon Trading Card Game haha. The one I discovered here is the W3C [Design Tokens Community Group](https://www.w3.org/community/design-tokens/) ([designtokens.org](https://www.designtokens.org/) and their [2025.10 Format Spec](https://www.designtokens.org/tr/2025.10/format/)), a community of designers and engineers defining a portable JSON standard ($value, $type, and primitive to semantic aliases) so one token file works across Figma, web (CSS), Android (Compose), and iOS (SwiftUI).
