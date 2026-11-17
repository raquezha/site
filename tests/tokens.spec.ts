import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens/raquezha-net.tokens.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "public/site.css"), "utf8");
const SEGMENT_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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
    for (const rel of [
      "public/demo-placeholder.mp4",
      "public/cat-lounging.svg",
      "public/cat-peekaboo.svg",
      "public/doodle-arrow.svg",
      "public/doodle-blue-cat.svg",
      "public/images/2026-11-10-site-fixed-home.png",
      "public/images/2026-11-17-post-compact-parity.png",
    ]) {
      expect(fs.existsSync(path.join(root, rel)), `Missing asset: ${rel}`).toBe(true);
    }
  });
});
