import { test, expect } from "@playwright/test";

function parseRgb(str: string) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(str || "");
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
}
function luminance([r, g, b]: number[]) {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}
function contrastRatio(a: number[], b: number[]) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test.describe("Parity & Stress: Home & Article Layouts", () => {
  for (const width of [1440, 390]) {
    test(`Home parity at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflowX).toBe(false);

      const styles = await page.evaluate(() => {
        const b = getComputedStyle(document.body);
        const h1 = getComputedStyle(document.querySelector(".homepage h1")!);
        const row = getComputedStyle(document.querySelector(".writing .title")!);
        const footer = getComputedStyle(document.querySelector(".footer")!);
        const homeCat = document.querySelector(".home-cat")!.getBoundingClientRect();
        const footerCat = document.querySelector(".footer-cat")!.getBoundingClientRect();
        return {
          bg: b.backgroundColor,
          fg: b.color,
          font: b.fontFamily,
          h1Size: h1.fontSize,
          h1Lh: h1.lineHeight,
          rowSize: row.fontSize,
          rowLh: row.lineHeight,
          footerSize: footer.fontSize,
          footerLh: footer.lineHeight,
          homeCat: { w: Math.round(homeCat.width), h: Math.round(homeCat.height) },
          footerCat: { w: Math.round(footerCat.width), h: Math.round(footerCat.height) },
        };
      });

      expect(styles.bg).toBe("rgb(253, 253, 252)");
      expect(styles.fg).toBe("rgb(17, 17, 17)");
      expect(styles.font).toMatch(/Inter/i);
      expect(styles.h1Size).toBe("16px");
      expect(styles.h1Lh).toBe("24px");
      expect(styles.rowSize).toBe("14px");
      expect(styles.rowLh).toBe("17px");
      expect(styles.footerSize).toBe("12px");
      expect(styles.footerLh).toBe("18px");
      expect(styles.homeCat).toEqual({ w: 22, h: 14 });
      expect(styles.footerCat).toEqual({ w: 22, h: 12 });
    });
  }

  test("Kitchen-sink & Figma sample parity on Desktop 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/writing/_ui-kitchen-sink");

    await expect(page.locator(".footer")).toHaveCount(0);
    const backLink = page.locator(".post-toc .back-link");
    const tocTitle = page.locator(".post-toc-post-title");
    const activeTocLink = page.locator(".post-toc-link.is-active");
    const inactiveTocLink = page.locator(".post-toc-link:not(.is-active)").first();
    await expect(backLink).toHaveCSS("color", "rgba(18, 18, 18, 0.4)");
    await expect(backLink).toHaveCSS("font-weight", "460");
    await expect(tocTitle).toHaveCSS("opacity", "0");
    await expect(tocTitle).toHaveCSS("color", "rgba(18, 18, 18, 0.4)");
    await expect(tocTitle).toHaveCSS("font-weight", "460");
    await expect(activeTocLink).toHaveCSS("color", "rgba(18, 18, 18, 0.8)");
    await expect(activeTocLink).toHaveCSS("font-weight", "460");
    await expect(inactiveTocLink).toHaveCSS("color", "rgba(18, 18, 18, 0.4)");
    await expect(inactiveTocLink).toHaveCSS("font-weight", "460");

    // Scroll past H1 -> TOC title appears softly
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(tocTitle).toHaveCSS("opacity", "1");
    await expect(tocTitle).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");

    // Scroll back to top -> first TOC item stays/returns active
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(activeTocLink).toBeVisible();
    await expect(page.locator(".post-toc-link").first()).toHaveClass(/is-active/);

    // Verify code block copy button morphs into copied state
    const copyBtn = page.locator(".article .code-copy-btn").first();
    await expect(copyBtn).toHaveAttribute("aria-label", "Copy code");
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute("aria-label", "Copied");
    await expect(copyBtn).toHaveClass(/is-copied/);

    const metrics = await page.evaluate(() => {
      const icon = document.querySelector(".post-toc .back-icon")!.getBoundingClientRect();
      const pre = getComputedStyle(document.querySelector(".article pre")!);
      const code = getComputedStyle(document.querySelector(".article pre code")!);
      const video = getComputedStyle(document.querySelector(".post video")!);
      const caption = getComputedStyle(document.querySelector(".post figcaption")!);
      const spans = Array.from(document.querySelectorAll('.article pre code span[style*="color"]'))
        .slice(0, 12)
        .map((el) => getComputedStyle(el).color);
      return {
        icon: { w: Math.round(icon.width), h: Math.round(icon.height) },
        preBg: pre.backgroundColor,
        preOverflow: pre.overflow,
        preRadius: pre.borderRadius,
        codeOverflowX: code.overflowX,
        videoRadius: video.borderRadius,
        videoBorder: video.borderTopColor,
        captionSize: caption.fontSize,
        captionLh: caption.lineHeight,
        spans,
      };
    });

    expect(metrics.icon).toEqual({ w: 14, h: 14 });
    expect(metrics.preBg).toBe("rgb(248, 248, 248)");
    expect(metrics.preOverflow).toBe("hidden");
    expect(metrics.preRadius).toBe("8px");
    expect(metrics.codeOverflowX).toBe("auto");
    expect(metrics.videoRadius).toBe("8px");
    expect(metrics.videoBorder).toBe("rgb(51, 51, 51)");
    expect(metrics.captionSize).toBe("12px");
    expect(metrics.captionLh).toBe("16px");

    const bg = parseRgb(metrics.preBg);
    for (const fgStr of metrics.spans) {
      expect(contrastRatio(parseRgb(fgStr), bg)).toBeGreaterThanOrEqual(3.0);
    }
  });

  for (const width of [1440, 1120, 1090, 768, 390]) {
    test(`Absurd stress test layout & responsiveness at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writing/_absurd-stress-test");

      // Interactive task checkbox click toggles state
      const unchecked = page.locator('.post .task-list-item input[type="checkbox"]').nth(1);
      await expect(unchecked).not.toBeChecked();
      await unchecked.click();
      await expect(unchecked).toBeChecked();

      const res = await page.evaluate(() => {
        const postRect = document.querySelector(".post")!.getBoundingClientRect();
        const toc = document.querySelector(".post-toc") as HTMLElement;
        const tocCs = getComputedStyle(toc);
        const tocRect = toc.getBoundingClientRect();
        const fn = document.querySelector(".post .footnotes")!.getBoundingClientRect();
        const ack = document.querySelector(".post .acknowledgements")!.getBoundingClientRect();
        const rail = document.querySelector(".post .annotation")!.getBoundingClientRect();
        const arrowEl = document.querySelector(".post .annotation-arrow") as HTMLImageElement | SVGElement | null;
        const arrow = getComputedStyle(arrowEl!);
        const arrowRect = arrowEl!.getBoundingClientRect();
        const taskLi = getComputedStyle(document.querySelector(".post .task-list-item")!);
        const th = document.querySelector(".article th")!.getBoundingClientRect();
        return {
          overflowX: document.documentElement.scrollWidth > window.innerWidth,
          footnotesCount: document.querySelectorAll(".post .footnotes li").length,
          footnotesBeforeAck: fn.bottom <= ack.top + 1,
          inRightRail: rail.left >= postRect.right + 28,
          tocDisplay: tocCs.display,
          tocLeft: tocRect.left,
          arrowDisplay: arrow.display,
          arrowTag: arrowEl!.tagName.toLowerCase(),
          arrowRect: { w: Math.round(arrowRect.width), h: Math.round(arrowRect.height) },
          taskDisplay: taskLi.display,
          thHeight: Math.round(th.height),
        };
      });

      expect(res.overflowX).toBe(false);
      expect(res.footnotesCount).toBe(10);
      expect(res.footnotesBeforeAck).toBe(true);
      expect(res.taskDisplay).toBe("block");
      expect(res.thHeight).toBeLessThanOrEqual(40);
      expect(res.arrowTag).toBe("img");
      if (width >= 1120) {
        expect(res.tocDisplay).toBe("block");
        expect(res.tocLeft).toBeGreaterThanOrEqual(8);
        expect(res.inRightRail).toBe(true);
        expect(res.arrowDisplay).toBe("block");
        expect(res.arrowRect).toEqual({ w: 48, h: 28 });
      } else {
        expect(res.tocDisplay).toBe("none");
        expect(res.inRightRail).toBe(false);
        expect(res.arrowDisplay).toBe("none");
      }
    });
  }
});
