---
title: "Self hosting Outline"
shortTitle: "Self hosting Outline"
date: "2026-11-18"
status: "published"
description: "Why I skip Notion, what I wanted instead, and how my team runs Outline on one small server with Docker and GitLab login."
routeOverride: "/writing/self-hosting-outline"
tags:
  - "outline"
  - "knowledge-base"
  - "self-hosted"
  - "devops"
---
<mark>I'm an anti-Notion kinda guy.</mark> It just doesn't stick with me, so I find ways to validate my claims haha. Most of my colleagues use it, and I still don't like it. I don't think it's bad. Honestly, it's top tier. It's just not my cup of tea.

Here are three things that pushed me to set up our own wiki:

1. **Ownership hell when someone leaves.** A colleague owns the Notion workspace, then leaves the company. Now what? <mark class="peach">Migration hell.</mark> That one is non-negotiable for me.
2. **Free isn't really <del>free</del>.** Limited users, limited blocks, limited everything until you pay per seat.
3. **Local files and <span class="mark-circle">Telegram ping pong</span>.** Before we had a central place, I presided over our weekly meetings and kept the docs, decks, and minutes on my laptop. Sometimes I forgot to share them. When I was absent, I passed the role to a teammate, and they sent the notes back through Telegram as a PDF, Markdown file, doc, or plain text. Then I had to open the file, copy everything, and paste it back into my notes. Doing that every week gets tiring fast.

What I want is zero friction setup. <u>Just log in with your company email, boom, that's it.</u> And one shared place where anyone can drop meeting notes without chasing files in chat.

![Before and after sketch: local laptop files, Telegram ping pong, and Loop vs self hosted Outline with GitLab login and MCP](/outline-before-after.svg)

## Friction

Our docs were scattered everywhere: meeting notes in Microsoft Loop, SOP drafts in local Markdown files, and guides buried in different repos. We tried keeping docs in GitLab at first, but they went stale fast. Writing documentation isn't really our thing. We're developers. Storage wasn't the issue. <u>If writing and sharing a guide is annoying, people stop doing it.</u>

<div class="annotated-block">

For three years we settled for Microsoft Loop because <mark class="sky">it solved the access problem</mark>. Log in with your company email and drop things there. Not trying to call out Microsoft, I just never clicked with Loop's UX. It felt clunky and never really smooth.[^2] It solved access, but it still didn't fit.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>this is really my personal problem hahaha</span>
</aside>
</div>

I didn't want to <del>wait a year</del> wait for a company wide tool. Since I already had access to a Linux server we used, I spun up [Outline](https://www.getoutline.com/)[^1] as a small R&D experiment, and my colleagues started using it. I even wired up its MCP server[^4] to our company Claude and ChatGPT accounts.

## Why Outline fit

Outline is an open source wiki. It feels as fast as Notion, runs in Docker, logs in through the SSO you already have, and has an API.

For my team that meant:

- A clean Markdown editor with nested collections
- Login through our own GitLab, so company email works out of the box and nobody manages a new password
- Share links for demos with other teams
- An API and MCP connection that already works with our Claude and ChatGPT accounts
- No custom docs site to maintain

And because it lives on our own server, <u>nobody owns the workspace personally</u>. If anyone leaves, the docs stay put.

## How I set it up <img src="/doodle-blue-cat.svg" width="44" height="28" alt="" aria-hidden="true" class="post-doodle" />

Everything sits in Docker Compose on one small Linux box: <mark class="sky">Outline, PostgreSQL, Redis, and Caddy</mark> for HTTPS.[^3]

<div class="annotated-block">
  <p>Normally Outline wants <a href="https://docs.getoutline.com/s/hosting/doc/file-storage-N4M0T6Ypu7">S3 or MinIO for file uploads</a>. I skipped that on purpose. This started as an R&D test to prove Outline works, and paying for extra storage or running more containers didn't make sense yet. So I saved uploads straight to the local disk <del>until next sprint</del> <mark class="torn">"for now"</mark>. Funny enough, "for now" is still running fine today haha. The only catch is backups: if the server dies, you need the <mark class="peach">PostgreSQL data folder and the uploads folder</mark>. Redis you can ignore.</p>
  <aside class="annotation">
    <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
    <span>This is my "Utang sa future" task haha ohmygod 😹</span>
  </aside>
</div>

The rest was <span class="mark-wavy">boring on purpose</span>:

- **Login:** GitLab OIDC, because everyone already had a GitLab account with their company email.
- **Database:** PostgreSQL stays on the internal Docker network with no database port exposed on the host.
- **Reverse proxy:** Caddy handles TLS automatically and points to Outline on a private local port since the default port was already taken on that box.

If you try this yourself, point your DNS record at the server before booting Caddy, have your GitLab OIDC keys ready before first launch, and decide <span class="mark-underline">who owns backups</span> before your team starts trusting it. For official configs and other deployment choices, check Outline's [installation methods docs](https://docs.getoutline.com/s/hosting/doc/installation-methods-pSvgz9j0QC).

## How I organize it

I grouped collections by team: <mark class="lilac">Android, Cloud, iOS, and QA</mark>. You can keep a collection private to yourself or your team, and since everyone logs in with their company email, permissions stay simple.

Most Notion features are already here anyway, so switching <mark class="loose">didn't feel like a downgrade</mark>. For weekly meetings, notes follow a simple tree:

```text
Weekly Meeting
  └── 2026
        └── 07 July
              └── 2026-07-23
```

<div class="annotated-block">
  <p>Because I wired up the Outline MCP server, most of us don't even open the browser to update docs. We just ask Claude or ChatGPT to read or update notes directly. The only rule I enforce is <u>keeping human meeting notes apart from automated agent reports</u>, so an AI summary never overwrites what people actually discussed.</p>
  <aside class="annotation">
    <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
    <span>Claude &amp; ChatGPT update docs directly via MCP</span>
  </aside>
</div>

I'm happy I found Outline. Maintaining it is easy anyway: just `docker compose pull`, bring it back up, done. The only thing I half worry about is the day uploads fill up the disk or the server gets overloaded. If that happens, I'll fix it then.

<mark class="mint">Try Outline. It's good!</mark>

[^1]: [Outline](https://www.getoutline.com/) and its [source on GitHub](https://github.com/outline/outline).
[^2]: Microsoft Loop works well if your team already lives inside Microsoft 365. For developers living in GitLab and Markdown, it always felt like extra clicks.
[^3]: [Caddy](https://caddyserver.com/) handles HTTPS certificates automatically with a three line config file.
[^4]: Model Context Protocol (MCP) lets Claude and ChatGPT read and update Outline collections directly without opening the browser.
