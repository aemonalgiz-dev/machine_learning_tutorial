import { test, expect } from "@playwright/test";
import { lessonLocations } from "../lib/course-navigation";

test("the footer moves between pages and preserves bookmarks, focus and browser history", async ({ page }) => {
  await page.goto("/concepts/agent-prompts");
  const nav = page.getByRole("navigation", { name: "Lesson navigation", exact: true });
  await expect(nav).toHaveCount(1);
  await expect(page.locator("article > header")).toHaveText(await page.locator("h1").innerText());
  await expect(page.getByRole("combobox")).toBeHidden();
  await expect(nav).toContainText("Page 1 of");
  await expect(page.locator("h1")).toBeInViewport();
  await page.screenshot({ path: test.info().outputPath("lesson-navigation-desktop.png"), fullPage: true });
  await expect(nav.getByRole("link", { name: /^Previous lesson/ })).toHaveAttribute("href", `${lessonLocations["/concepts/agent-prompts"].previous!.href}#last-page`);

  const forward = nav.getByRole("link", { name: /^Next page/ });
  const bookmark = await forward.getAttribute("href");
  await forward.click();
  await expect(page).toHaveURL(new RegExp(`${bookmark}$`));
  await expect(nav).toContainText("Page 2 of");
  await expect(nav.getByRole("link", { name: /^Previous page/ })).toHaveAttribute("href", "#history");
  const heading = page.locator("article section:visible > h2").first();
  await expect(heading).toBeFocused();
  const box = await heading.boundingBox();
  expect(box!.y).toBeGreaterThan(50);
  expect(box!.y).toBeLessThan(200);

  await page.keyboard.press("ArrowRight");
  await expect(nav).toContainText("Page 3 of");
  await page.goBack();
  await expect(nav).toContainText("Page 2 of");
  await page.reload();
  await expect(nav).toContainText("Page 2 of");
  await nav.getByRole("link", { name: /^Previous page/ }).click();
  await expect(nav).toContainText("Page 1 of");
});

test("lesson boundaries open the previous last page and next first page", async ({ page }) => {
  await page.goto("/concepts/agent-prompts");
  const nav = page.getByRole("navigation", { name: "Lesson navigation", exact: true });
  await nav.getByRole("link", { name: /^Previous lesson/ }).click();
  const previous = lessonLocations["/concepts/agent-prompts"].previous!;
  await expect(page).toHaveURL(new RegExp(`${previous.href}#(?!last-page).+`));
  await expect(nav.getByRole("link", { name: /^Next lesson/ })).toHaveAttribute("href", "/concepts/agent-prompts");
  const count = await nav.locator("p").first().innerText();
  const numbers = count.match(/\d+/g)!;
  expect(numbers[0]).toBe(numbers[1]);
  await nav.getByRole("link", { name: /^Next lesson/ }).click();
  await expect(page).toHaveURL(/\/concepts\/agent-prompts$/);
  await expect(nav).toContainText("Page 1 of");

  await nav.getByText("Lesson contents", { exact: true }).click();
  const chooser = nav.getByRole("combobox", { name: "Jump to a page" });
  const total = await chooser.locator("option").count();
  await chooser.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(nav).toContainText("Page 1 of");
  await chooser.selectOption(String(total - 1));
  await expect(nav).toContainText(`Page ${total} of ${total}`);
  await expect(nav.getByRole("link", { name: /^Previous page/ })).toBeVisible();
  await nav.getByRole("link", { name: /^Next lesson/ }).click();
  await expect(page).toHaveURL(new RegExp(`${lessonLocations["/concepts/agent-prompts"].next!.href}$`));
  await expect(nav).toContainText("Page 1 of");
});

test("primers, area boundaries and mobile use the same navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/primers/statistics");
  const nav = page.getByRole("navigation", { name: "Lesson navigation", exact: true });
  await expect(nav.getByRole("link", { name: /^Back to learning area/ })).toHaveAttribute("href", lessonLocations["/primers/statistics"].areaHref);
  await nav.getByRole("link", { name: /^Next page/ }).click();
  await expect(nav).toContainText("Page 2 of");
  await nav.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("lesson-navigation-mobile.png") });

  const last = Object.entries(lessonLocations).find(([, lesson]) => lesson.areaHref === "/learn/mathematics-and-programming" && !lesson.next)!;
  await page.goto(`${last[0]}#last-page`);
  await expect(nav.getByRole("link", { name: /^Back to learning area/ })).toHaveAttribute("href", last[1].areaHref);
  await expect(nav.getByRole("link", { name: /^Previous page/ })).toBeVisible();
  await nav.getByRole("link", { name: /^Back to learning area/ }).click();
  await expect(page).toHaveURL(new RegExp(`${last[1].areaHref}$`));
  await expect(nav).toHaveCount(0);
});
