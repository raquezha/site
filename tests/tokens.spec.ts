import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens/raquezha-net.tokens.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "public/site.css"), "utf8");
const SEGMENT_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function resolveValue(rootObj: Record<string, any>, raw: unknown): unknown {
  if (typeof raw !== "string" || !raw.startsWith("{") || !raw.endsWith("}")) return raw;
  const parts = raw.slice(1, -1).split(".");
  let cur: any = rootObj;
  for (const part of parts) cur = cur?.[part];
  return cur && typeof cur === "object" && "$value" in cur ? resolveValue(rootObj, cur.$value) : raw;
}

test.describe("Unit: NoDesign Tokens & Static Assets", () => {
  test("every token follows NoDesign DTCG grammar and matches public/site.css", () => {
    let checkedWebVars = 0;

    function walk(node: Record<string, any>, segments: string[] = []) {
      for (const [key, val] of Object.entries(node)) {
        if (key.startsWith("$")) continue;
        expect(key).toMatch(SEGMENT_RE);
        const next = [...segments, key];
        if (val && typeof val === "object" && "$value" in val) {
          const ext = val.$extensions?.["com.nodesign"];
          expect(ext, `Missing com.nodesign extension on ${next.join(".")}`).toBeTruthy();
          if (ext.collection === "Tokens: Primitive") {
            expect(ext.scopes).toEqual([]);
          }
          const webVar = ext.codeSyntax?.WEB;
          if (webVar) {
            expect(css).toContain(`${webVar}:`);
            const resolved = resolveValue(tokens, val.$value);
            if ((val.$type === "color" || val.$type === "dimension") && typeof resolved === "string") {
              expect(css).toContain(`${webVar}: ${resolved};`);
            }
            checkedWebVars++;
          }
        } else if (val && typeof val === "object") {
          walk(val, next);
        }
      }
    }

    walk(tokens);
    expect(checkedWebVars).toBeGreaterThanOrEqual(20);
  });

  test("media assets referenced by fixtures exist in public/", () => {
    const coreAssets = [
      "public/cat-lounging.svg",
      "public/cat-peekaboo.svg",
      "public/doodle-arrow.svg",
      "public/doodle-blue-cat.svg",
      "public/favicon.svg",
      "public/favicon.ico",
      "public/robots.txt",
      "public/CNAME",
    ];
    const draftAssets = fs.existsSync(path.join(root, "src/content/writing/drafts"))
      ? [
          "public/demo-placeholder.mp4",
          "public/images/2026-11-10-site-fixed-home.png",
          "public/images/2026-11-17-post-compact-parity.png",
        ]
      : [];
    for (const rel of [...coreAssets, ...draftAssets]) {
      expect(fs.existsSync(path.join(root, rel)), `Missing asset: ${rel}`).toBe(true);
    }
  });

  test("static build output (dist/) satisfies SEO, 404, sitemap, and OpSec constraints", () => {
    const distDir = path.join(root, "dist");
    if (!fs.existsSync(distDir)) return;

    for (const file of [
      "index.html",
      "404.html",
      "rss.xml",
      "sitemap-index.xml",
      "sitemap-0.xml",
      "robots.txt",
      "CNAME",
    ]) {
      expect(fs.existsSync(path.join(distDir, file)), `Missing dist/${file}`).toBe(true);
    }

    const robots = fs.readFileSync(path.join(distDir, "robots.txt"), "utf8");
    expect(robots).toContain("Sitemap: https://raquezha.net/sitemap-index.xml");

    const sitemap = fs.readFileSync(path.join(distDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).toContain("<loc>https://raquezha.net/</loc>");
    expect(sitemap).not.toContain("/404");

    const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
    expect(indexHtml).toContain('rel="sitemap" href="/sitemap-index.xml"');
    expect(indexHtml).toContain('name="referrer" content="strict-origin-when-cross-origin"');

    if (!fs.existsSync(path.join(distDir, "writing"))) {
      expect(fs.existsSync(path.join(distDir, "images"))).toBe(false);
      expect(fs.existsSync(path.join(distDir, "demo-placeholder.mp4"))).toBe(false);
      expect(indexHtml).not.toContain('class="writing"');
    }
  });
});
