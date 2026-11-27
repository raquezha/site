import { test, expect } from "@playwright/test";

test.describe("Gemini NoCapture Figure Verification", () => {
  test("two-panel story layout and clearance", async ({ page }) => {
    await page.goto("file:///Users/raquezha/RQZ/personal/site/media/scenes/gemini-nocapture-loop/scene.html");
    await page.waitForSelector("#capture");

    // 1. Two main cards: Project (left) and Compiler (right)
    const cards = page.locator(".panel-card");
    expect(await cards.count()).toBe(2);

    const left = await cards.nth(0).boundingBox();
    const right = await cards.nth(1).boundingBox();
    expect(left && right).toBeTruthy();

    if (left && right) {
      expect(Math.round(left.y)).toBe(Math.round(right.y));
      expect(Math.abs(left.height - right.height)).toBeLessThanOrEqual(2);
      expect(left.x + left.width).toBeLessThan(right.x);
    }

    // 2. Center transition arrow
    const arrow = await page.locator(".divider svg").boundingBox();
    expect(arrow).toBeTruthy();
    if (arrow && left && right) {
      expect(arrow.x).toBeGreaterThan(left.x + left.width);
      expect(arrow.x + arrow.width).toBeLessThan(right.x);
    }

    // 3. Footer clearance >= 10px
    const panels = await page.locator(".panels").boundingBox();
    const footer = await page.locator(".footer").boundingBox();
    expect(panels && footer).toBeTruthy();
    if (panels && footer) {
      expect(footer.y - (panels.y + panels.height)).toBeGreaterThanOrEqual(10);
    }
  });
});
