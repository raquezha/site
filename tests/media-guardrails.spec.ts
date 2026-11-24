import { expect, test } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(process.cwd());
const publicDir = path.join(root, "public");
const publicImagesDir = path.join(publicDir, "images");
const obsidianArticles = path.join(os.homedir(), "RQZ/notes/articles");

const MIRRORED_ASSETS = [
  {
    site: "images/figma-from-the-dev-side-flow.png",
    vault: "AI Design & Implementation/assets/figma-from-the-dev-side-flow.png",
  },
  {
    site: "images/outline-before-after.png",
    vault: "Self-Hosting Outline/assets/outline-before-after.png",
  },
];

function auditSvg(svgPath: string) {
  const svg = fs.readFileSync(svgPath, "utf8");
  const openTag = svg.match(/<svg\b([^>]*)>/i)?.[1] ?? "";
  expect(openTag, `${svgPath} missing viewBox`).toMatch(/\bviewBox=["'][^"']+["']/i);
  expect(openTag, `${svgPath} missing width`).toMatch(/\bwidth=["']\d+["']/i);
  expect(openTag, `${svgPath} missing height`).toMatch(/\bheight=["']\d+["']/i);
  expect(svg, `${svgPath} must not reference external http(s) URLs`).not.toMatch(/(?:href|src|url)\(\s*['"]?https?:\/\//i);
  expect(svg, `${svgPath} must not reference external http(s) href/src`).not.toMatch(/\b(?:href|xlink:href|src)=["']https?:\/\//i);

  const embedded = new Map<string, Set<string>>();
  for (const match of svg.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
    const block = match[1];
    const fam = block.match(/font-family:\s*['"]?([^'";]+)['"]?/i)?.[1]?.trim();
    const weight = block.match(/font-weight:\s*([^;]+)/i)?.[1]?.trim() ?? "400";
    if (fam && /data:font\/woff2;base64,/i.test(block)) {
      if (!embedded.has(fam)) embedded.set(fam, new Set());
      embedded.get(fam)!.add(weight);
    }
  }

  const defaultFamily = svg.match(/<g\b[^>]*\bfont-family=["']([^"',]+)/i)?.[1]?.replace(/['"]/g, "").trim();
  for (const match of svg.matchAll(/<(?:text|tspan)\b([^>]*)>/gi)) {
    const attrs = match[1];
    const fam = attrs.match(/\bfont-family=["']([^"',]+)/i)?.[1]?.replace(/['"]/g, "").trim() ?? defaultFamily;
    const weight = attrs.match(/\bfont-weight=["']([^"']+)["']/i)?.[1]?.trim() ?? "400";
    if (fam === "Caveat" || fam === "Inter") {
      expect(embedded.get(fam)?.has(weight), `${svgPath}: missing embedded base64 WOFF2 for ${fam} weight ${weight}`).toBe(true);
    }
  }
}

test.describe("Article Media Guard Rails", () => {
  test("public/images contains no stray .sb-* temp files", () => {
    const entries = fs.readdirSync(publicImagesDir);
    const junk = entries.filter((name) => /\.sb-/.test(name));
    expect(junk).toEqual([]);
  });

  test("all public/*.svg files are self-contained and mirrored assets match Obsidian", () => {
    for (const name of fs.readdirSync(publicDir)) {
      if (name.endsWith(".svg")) {
        auditSvg(path.join(publicDir, name));
      }
    }
    const hasVault = fs.existsSync(obsidianArticles);
    for (const item of MIRRORED_ASSETS) {
      const sitePath = path.join(publicDir, item.site);
      expect(fs.existsSync(sitePath), `Missing site asset: ${sitePath}`).toBe(true);
      if (hasVault) {
        const vaultPath = path.join(obsidianArticles, item.vault);
        expect(fs.existsSync(vaultPath), `Missing Obsidian mirror: ${vaultPath}`).toBe(true);
        expect(fs.readFileSync(sitePath).equals(fs.readFileSync(vaultPath)), `${item.site} drifted from Obsidian`).toBe(true);
      }
    }
  });
});
