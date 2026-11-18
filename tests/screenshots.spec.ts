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

  test("Absurd Stress Post Desktop 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/writing/_absurd-stress-test");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-desktop.png", { fullPage: false });
  });

  test("Absurd Stress Post Breakpoint 1120px", async ({ page }) => {
    await page.setViewportSize({ width: 1120, height: 900 });
    await page.goto("/writing/_absurd-stress-test");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-1120.png", { fullPage: false });
  });

  test("Absurd Stress Post 150% Zoom 1090px", async ({ page }) => {
    await page.setViewportSize({ width: 1090, height: 900 });
    await page.goto("/writing/_absurd-stress-test");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-1090.png", { fullPage: false });
  });

  test("Absurd Stress Post Mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/writing/_absurd-stress-test");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-mobile.png", { fullPage: false });
  });

  test("Kitchen Sink Desktop 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/writing/_ui-kitchen-sink");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("kitchen-desktop.png", { fullPage: false });
  });
});
