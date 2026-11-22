import { test, expect } from "@playwright/test";

async function hideAstroDevToolbar(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: "astro-dev-toolbar { display: none !important; }",
  });
}

test.describe("Screenshot Regression: Home & Post Layouts", () => {
  test("Home Desktop 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("home-desktop.png", { fullPage: true });
  });

  test("Home Mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("home-mobile.png", { fullPage: true });
  });

  test("Kitchen Sink Desktop 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/writing/kitchen-sink");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-desktop.png", { fullPage: false });
  });

  test("Kitchen Sink Breakpoint 1120px", async ({ page }) => {
    await page.setViewportSize({ width: 1120, height: 900 });
    await page.goto("/writing/kitchen-sink");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-1120.png", { fullPage: false });
  });

  test("Kitchen Sink 150% Zoom 1090px", async ({ page }) => {
    await page.setViewportSize({ width: 1090, height: 900 });
    await page.goto("/writing/kitchen-sink");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-1090.png", { fullPage: false });
  });

  test("Kitchen Sink Mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/writing/kitchen-sink");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-mobile.png", { fullPage: false });
  });

  test("Footnote backref keeps exponent below top dissolve", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/writing/kitchen-sink");
    await hideAstroDevToolbar(page);

    await page.locator(".post a[data-footnote-ref]").first().click();
    await expect(page.locator(".post .footnotes li").first()).toBeInViewport();
    await page.locator(".post .footnotes a[data-footnote-backref]").first().click({ force: true });
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const ref = document.querySelector(".post a[data-footnote-ref]");
          return ref ? ref.getBoundingClientRect().top : -1;
        })
      )
      .toBeGreaterThanOrEqual(120);

    await expect(page).toHaveScreenshot("footnote-backref-top.png", {
      fullPage: false,
      clip: { x: 0, y: 0, width: 900, height: 220 },
    });
  });
});
