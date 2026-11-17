import { test, expect } from "@playwright/test";

async function hideAstroDevToolbar(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.querySelectorAll("astro-dev-toolbar").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
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

  test("Absurd Stress Post Mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/writing/_absurd-stress-test");
    await hideAstroDevToolbar(page);
    await expect(page).toHaveScreenshot("stress-mobile.png", { fullPage: false });
  });
});
