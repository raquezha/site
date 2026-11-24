---
title: "Self-hosting Outline"
shortTitle: "Self-hosting Outline"
date: "2026-11-18"
status: "published"
description: "Why I skipped Notion, why ownership and company login matter, and how my team runs Outline on one small server with Docker and GitLab SSO."
routeOverride: "/writing/self-hosting-outline"
tags:
  - "outline"
  - "knowledge-base"
  - "self-hosted"
  - "devops"
---
<mark>I'm an anti-Notion kinda guy.</mark> It just doesn't stick with me, so I find ways to validate my claims haha. I don't think it's bad. Honestly, it's top tier. It's just not my cup of tea.

My team never lived in Notion. We used Microsoft Loop. Other teams did use Notion seats, and the free limits (users, blocks, the whole per-seat wall) were exactly why I didn't want that path either.

What I actually wanted was simpler than a Notion replacement checklist:

1. **Nobody personally owns the workspace.** If someone leaves, the docs stay.
2. **Login with the company account you already have.** No new password circus.
3. **One shared place** where meeting notes, SOPs, and guides stop bouncing through Telegram and random laptop folders.

Those three pushed me to self-host [Outline](https://www.getoutline.com/).[^1]

![Before and after sketch: local laptop files, Telegram ping pong, and Loop vs self-hosted Outline with GitLab login](/images/outline-before-after.png)

## Friction

Before Outline, our docs were everywhere: meeting notes in Microsoft Loop, SOP drafts in local Markdown files, guides buried in different repos, and weekly notes bouncing through Telegram as PDFs, Markdown, docs, or plain text. I used to run our weekly meetings and keep the files on my laptop. Sometimes I forgot to share them. When I was on leave or tied up elsewhere, a teammate would send the notes back through chat, and I had to open the file, copy everything, and paste it into my notes again. Doing that every week <mark class="peach">got me weak</mark> (no pun intended) haha.

We tried GitLab docs first. They went stale. Writing documentation isn't really our thing. We're developers. Storage wasn't the issue. <u>If writing and sharing a guide is annoying, people stop doing it.</u>

<div class="annotated-block">

For three years we settled for Microsoft Loop because <mark class="sky">it solved the access problem</mark>. Log in with your company email and drop things there. I'm not trying to call out Microsoft; I just never clicked with Loop's UX. It felt clunky and never really smooth.[^2] Access was solved. Ownership, Markdown comfort, and the weekly Telegram mess were not.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>this is really my personal problem haha</span>
</aside>
</div>

I didn't want to <del>wait a year</del> wait for a company-wide tool. Since I already had access to a Linux server we used, I spun up Outline as a small R&D experiment. My colleagues started using it. That was **enough signal** for me.

## Why Outline fit

Outline is an open source wiki. It feels fast, runs in Docker, logs in through the SSO you already have, and has an API.

For my team that meant:

| Before | After Outline |
| :--- | :--- |
| Notes bouncing through Telegram as PDFs, Markdown, docs, or plain text | One Markdown wiki with nested collections |
| New passwords, or waiting on whoever owned the Loop / cloud workspace | Login through our GitLab. Company email, <mark>boom</mark>, that's it |
| Exporting PDFs / praying someone opened the right attachment | Share links for sprint demos and other teams |
| Writing a custom docs site nobody wants to maintain | Drop the note in Outline and move on |
| A colleague owns the workspace, then leaves | It lives on our server. <u>Nobody owns it personally</u> |

I also wired the API into our company Claude and ChatGPT accounts after the basics worked.

I won't pretend it has every Notion feature. For what we needed day to day (Markdown notes, collections, share links, company login), switching <mark class="loose">didn't feel like a downgrade</mark>.

## How I set it up <img src="/doodle-blue-cat.svg" width="44" height="28" alt="" aria-hidden="true" class="post-doodle" />

Everything sits in Docker Compose on one small Linux box: <mark class="sky">Outline, PostgreSQL, Redis, and Caddy</mark> for HTTPS.[^3]

<div class="annotated-block">
  <p>Normally Outline wants <a href="https://docs.getoutline.com/s/hosting/doc/file-storage-N4M0T6Ypu7">S3 or MinIO for file uploads</a>. I skipped that on purpose. This started as an R&D test to prove Outline works, and paying for extra storage or running more containers didn't make sense yet. So I saved uploads straight to the local disk <del>until next sprint</del> <mark class="torn">"for now"</mark>. Funny enough, "for now" is still running fine today haha. The only catch is backups: if the server dies, you need the <mark class="peach">PostgreSQL data folder and the uploads folder</mark>. Redis you can <em class="muted">ignore</em>.</p>
  <aside class="annotation">
    <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
    <span>This is my "Utang sa future" task haha</span>
  </aside>
</div>

The rest was <span class="mark-wavy">boring on purpose</span>:

- **Login:** GitLab OIDC, because everyone already had a GitLab account with their company email.
- **Database:** PostgreSQL stays on the internal Docker network with no database port exposed on the host.
- **Reverse proxy:** Caddy handles TLS automatically and points to Outline on a private local port since the default port was already taken on that box.

If you try this yourself, point your DNS record at the server before booting Caddy, have your GitLab OIDC keys ready before first launch, and decide <span class="mark-underline">who owns backups</span> before your team starts trusting it. For official configs and other deployment choices, check Outline's [installation methods docs](https://docs.getoutline.com/s/hosting/doc/installation-methods-pSvgz9j0QC).

## How we use it now

I grouped collections by team: <mark class="lilac">Android, Cloud, iOS, and QA</mark>. You can keep a collection private to yourself or your team, and since everyone logs in with their company email, permissions stay simple.

I chose one shared Outline instance instead of spinning up separate ones per team. Having one place makes cross-team docs like API contracts, release checklists, and QA test plans easy to reference without switching workspaces. Each team still controls their own space for onboarding guides, SOPs, and internal playbooks.

For weekly meetings, notes follow a simple tree:

```text
Weekly Meeting
  └── 2026
        └── 07 July
              └── 2026-07-23
```

<div class="annotated-block">

Because Outline has an API and MCP server,[^4] most of us don't even open the browser to update docs. We just ask Claude or ChatGPT to read or update notes directly. The only rule I enforce is <u>keeping human meeting notes apart from automated agent reports</u>, so an AI summary never overwrites what people actually discussed.

<aside class="annotation">
  <img src="/doodle-arrow.svg" width="48" height="28" alt="" aria-hidden="true" class="annotation-arrow" />
  <span>Claude &amp; ChatGPT update docs directly via MCP</span>
</aside>
</div>

We also use Outline as our publishing spot instead of building a custom docs site. Whenever we need to show something in a sprint demo or share a guide with another department, we just generate a share link and drop it in chat. No more exporting PDFs or worrying if someone opened an old attachment.

This started in July 2026 as an Android Team R&D experiment. Months later it's still up, colleagues are using it, and the four team collections are live. Maintenance is easy anyway: `docker compose pull`, bring it back up, done.

The half-worry is still real: local uploads can fill the disk, the server can get overloaded, and backups are still an "utang sa future" item. If those break, I'll fix them then. Until that happens, this is the boring setup that finally stopped the Telegram <span class="mark-circle">ping pong</span>.

<mark class="mint">**If you want the same kind of wiki: try [Outline](https://www.getoutline.com/).**</mark> Just decide **who owns DNS, SSO, and backups** before your team trusts it.

[^1]: [Outline](https://www.getoutline.com/) and its [source on GitHub](https://github.com/outline/outline).
[^2]: Microsoft Loop works well if your team already lives inside Microsoft 365. For developers living in GitLab and Markdown, it always felt like extra clicks.
[^3]: [Caddy](https://caddyserver.com/) handles HTTPS certificates automatically with a three-line config file.
[^4]: Model Context Protocol (MCP) lets Claude and ChatGPT read and update Outline collections directly without opening the browser.
