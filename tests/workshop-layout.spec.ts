import { expect, test } from "@playwright/test";

test("the current task and floor lead the page; reference material opens on demand", async ({ page }) => {
  await page.goto("/lab/linear-algebra");
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: "Apply one price list to every customer", exact: true }).click();
  const workshop = page.getByTestId("construction-workshop");
  const floor = workshop.getByLabel("Construction floor", { exact: true });
  await expect(floor).toBeVisible();
  const bounds = (await floor.boundingBox())!;
  expect(bounds.y).toBeLessThan(page.viewportSize()!.height * 0.55);
  expect(bounds.height).toBeGreaterThanOrEqual(400);
  await expect(page.getByRole("complementary", { name: "Lesson notes and saved work" })).not.toBeVisible();
  await expect(workshop.getByLabel("Construction inspector", { exact: true })).toHaveCount(0);
  await expect(workshop.getByRole("combobox", { name: "Active workshop example" })).not.toBeVisible();
  await expect(workshop.getByText("Required result", { exact: true }).first()).not.toBeVisible();

  await page.getByRole("button", { name: /Lesson notes and saved work/ }).click();
  await expect(page.getByRole("button", { name: "Look inside the tools", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Lesson notes and saved work/ }).click();
  await workshop.getByRole("button", { name: "Hide tools", exact: true }).click();
  await expect(workshop.getByLabel("Construction toolbox", { exact: true })).toHaveCount(0);
  expect((await floor.boundingBox())!.width).toBeGreaterThan(bounds.width + 150);
  await workshop.getByRole("button", { name: "Show tools", exact: true }).click();
  await expect(workshop.getByLabel("Construction toolbox", { exact: true })).toBeVisible();
  const floorOffset = () => floor.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
  const beforeAdding = await floorOffset();
  await workshop.getByLabel("Construction toolbox").getByRole("button", { name: "Loaves for each customer", exact: true }).click();
  // Botie's feedback must not move the floor under the learner's pointer.
  expect(await floorOffset()).toBe(beforeAdding);
  await expect(workshop.getByLabel("Construction inspector", { exact: true })).toBeVisible();

  await workshop.locator("summary", { hasText: "Examples and results" }).click();
  await expect(workshop.getByText("Required result", { exact: true }).first()).toBeVisible();
  await workshop.locator("summary", { hasText: "Examples and results" }).click();
  await workshop.locator("summary", { hasText: "Stuck? Inspect a worked construction" }).click();
  await workshop.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await workshop.locator("summary", { hasText: "Stuck? Inspect a worked construction" }).click();
  await workshop.locator("summary", { hasText: "Examples, experiments and workspace controls" }).click();
  await workshop.getByLabel("Animate signals", { exact: true }).uncheck();
  await workshop.locator("summary", { hasText: "Examples, experiments and workspace controls" }).click();
  await workshop.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(workshop.getByTestId("construction-counter")).toContainText("0 failed · 0 not run");
  await workshop.getByRole("button", { name: "Read the challenge", exact: true }).click();
  await expect(workshop.getByText(/How can we calculate everyone's bill from the same price list/).first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "page_feedback/workshop-layout-desktop.png" });

  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  await expect(workshop.getByRole("button", { name: "Return to lesson", exact: true })).toBeVisible();
  await expect(workshop.getByRole("button", { name: "Ask Botie for a hint", exact: true })).toBeVisible();
  await workshop.getByRole("button", { name: "Return to lesson", exact: true }).click();
});

for (const slug of ["statistics", "attention", "linear-algebra", "neuron"]) {
  test(`${slug} keeps workshop controls usable on a narrow screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/lab/${slug}`);
    const workshop = page.getByTestId("construction-workshop").first();
    await expect(workshop.getByRole("button", { name: "Test all examples", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await workshop.getByRole("button", { name: "Hide tools", exact: true }).click();
    await expect(workshop.getByLabel("Construction floor", { exact: true })).toBeVisible();
    await workshop.getByRole("button", { name: "Show tools", exact: true }).click();
    await expect(workshop.getByRole("searchbox", { name: "Find a workshop tool" })).toBeVisible();
    if (slug === "linear-algebra") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: "page_feedback/workshop-layout-mobile.png" });
    }
  });
}
