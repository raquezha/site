import { test, expect } from "@playwright/test";

test.describe("UX & Accessibility Checks", () => {
  test("Home hover dim, row nudge, and keyboard focus ring", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const firstRow = page.locator(".writing li").first().locator("a");
    const secondTitle = page.locator(".writing li").nth(1).locator(".title");

    await firstRow.hover();
    await expect(secondTitle).toHaveCSS("opacity", "0.3");

    await firstRow.focus();
    await page.keyboard.press("Tab");
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBe("A");
  });

  test("Browser zoom thresholds (140%, 150%, 160%) never clip navigation or overflow", async ({ page }) => {
    for (const [label, vw, expectRail] of [
      ["140%", 1171, true],
      ["150%", 1093, false],
      ["160%", 1025, false],
    ] as const) {
      await page.setViewportSize({ width: vw, height: 900 });
      await page.goto("/writing/_absurd-stress-test");

      const metrics = await page.evaluate(() => {
        const overflowX = document.documentElement.scrollWidth > window.innerWidth;
        const toc = document.querySelector(".post-toc") as HTMLElement;
        const tocDisplay = getComputedStyle(toc).display;
        const tocRect = toc.getBoundingClientRect();
        const railRect = document.querySelector(".post .annotation")!.getBoundingClientRect();
        const visibleBack = document.querySelector(
          tocDisplay === "block" ? ".post-toc .back-link" : ".back-link--main"
        )!.getBoundingClientRect();
        return {
          overflowX,
          tocDisplay,
          tocLeft: tocRect.left,
          railRight: railRect.right,
          backLeft: visibleBack.left,
        };
      });

      expect(metrics.overflowX, `${label} zoom (${vw}px) horizontal overflow`).toBe(false);
      expect(metrics.backLeft, `${label} zoom (${vw}px) back link clipped left`).toBeGreaterThanOrEqual(16);
      if (expectRail) {
        expect(metrics.tocDisplay).toBe("block");
        expect(metrics.tocLeft, `${label} zoom left TOC clipped`).toBeGreaterThanOrEqual(16);
        expect(metrics.railRight, `${label} zoom right rail clipped`).toBeLessThanOrEqual(vw);
      } else {
        expect(metrics.tocDisplay).toBe("none");
      }
    }
  });

  test("TOC bottom scroll-spy, smooth top return, footnotes jump, and keyboard code copy", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/writing/_absurd-stress-test");

    // Scroll to bottom -> final TOC item activates
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    const lastToc = page.locator(".post-toc-link").last();
    await expect(lastToc).toHaveClass(/is-active/);
    await expect(lastToc).toHaveCSS("color", "rgba(18, 18, 18, 0.8)");

    // Clicking visible TOC post title returns smoothly to top & restores first item active
    const tocTitle = page.locator(".post-toc-post-title");
    await expect(tocTitle).toHaveCSS("opacity", "1");
    await tocTitle.click();
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(40);
    await expect(page.locator(".post-toc-link").first()).toHaveClass(/is-active/);

    // Verify heading scroll-margin-top prevents top clipping on deep links
    const firstH2 = page.locator(".post h2").first();
    await expect(firstH2).toHaveCSS("scroll-margin-top", "48px");
    await expect(firstH2).toHaveCSS("margin-top", "64px");
    await expect(firstH2).toHaveCSS("margin-bottom", "24px");

    // Verify top scroll dissolve overlay (benji.org style)
    const fadeStyles = await page.evaluate(() => {
      const before = window.getComputedStyle(document.body, "::before");
      return { height: before.height, pointerEvents: before.pointerEvents, position: before.position };
    });
    expect(fadeStyles.height).toBe("128px");
    expect(fadeStyles.pointerEvents).toBe("none");
    expect(fadeStyles.position).toBe("fixed");

    // Footnote ref jump -> backref jump works cleanly
    const fnRef = page.locator(".post a[data-footnote-ref]").first();
    await fnRef.click();
    await expect(page.locator(".post .footnotes li").first()).toBeInViewport();
    await page.locator(".post .footnotes a[data-footnote-backref]").first().click();
    await expect(fnRef).toBeInViewport();

    // Keyboard Enter triggers copy button morph cleanly
    const copyBtn = page.locator(".article .code-copy-btn").first();
    await copyBtn.focus();
    await page.keyboard.press("Enter");
    await expect(copyBtn).toHaveAttribute("aria-label", "Copied");
    await expect(copyBtn).toHaveClass(/is-copied/);

    // Checkbox focus uses tokenized focus outline
    const checkbox = page.locator('.post .task-list-item input[type="checkbox"]').first();
    await checkbox.focus();
    await expect(checkbox).toHaveCSS("outline-width", "2px");
  });

  test("Reduced motion preference + zero console/network errors across all key routes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });
    page.on("response", (res) => {
      if (res.status() >= 400) errors.push(`HTTP ${res.status()}: ${res.url()}`);
    });

    for (const route of [
      "/",
      "/writing/_ui-kitchen-sink",
      "/writing/_figma-samples",
      "/writing/_absurd-stress-test",
    ]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const check = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        const brokenImgs = imgs
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute("src"));
        return {
          overflowX: document.documentElement.scrollWidth > window.innerWidth,
          brokenImgs,
        };
      });
      expect(check.overflowX, `Overflow on ${route}`).toBe(false);
      expect(check.brokenImgs, `Broken images on ${route}`).toEqual([]);
    }

    expect(errors).toEqual([]);

    const notFoundRes = await page.goto("/404", { waitUntil: "networkidle" });
    expect(notFoundRes?.status()).toBe(404);
    await expect(page.locator(".post h1")).toHaveText("404");
    await expect(page.locator(".back-link--main")).toBeVisible();
  });
});
