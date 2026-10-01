import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("la page d'accueil est accessible et respecte le budget de navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Musée MO5" })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);

  const navigationDuration = await page.evaluate(() => {
    const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return navigation.duration;
  });

  expect(navigationDuration).toBeLessThan(3_000);
});
