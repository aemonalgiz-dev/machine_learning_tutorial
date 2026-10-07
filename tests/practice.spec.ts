import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

// When the full reference suite has downloaded pinned wheels, reuse those
// exact bytes. Otherwise the browser exercises the ordinary CDN download.
test.beforeEach(async ({ context }) => {
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async (route) => {
    try {
      const bytes = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body: bytes, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch { await route.continue(); }
  });
});

async function openPractice(page: Page, lesson = "simple-linear-regression") {
  await page.goto(`/concepts/${lesson}`);
  await page.getByRole("button", { name: "Go to the coding challenges" }).click();
  await expect(page.locator(".cm-content")).toBeVisible();
}

test("challenge, real Python tests, saved drafts, and local results", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await openPractice(page);
  await expect(page.getByRole("heading", { name: "How would you fit the five people and predict a sixth?" })).toBeVisible();
  await page.locator(".cm-content").fill('print("slope", 999)');
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Test results/ })).toBeVisible();
  await expect(page.getByText("Some tests need another look", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Test counts")).toHaveText("1 passed4 failed");
  await expect(page.getByText("Tests passed for 0 of 4 exercises", { exact: true })).toBeVisible();

  await page.locator(".cm-content").fill("raise ValueError('try again')");
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByLabel("Test counts")).toHaveText("0 passed1 failed4 skipped");

  await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
  await expect(page.getByText("Tests passed for 0 of 4 exercises", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Test counts")).toHaveText("5 passed0 failed");
  await expect(page.getByText("Tests passed for 1 of 4 exercises", { exact: true })).toBeVisible();

  await page.locator(".cm-content").fill('print("my saved draft")');
  await expect(page.getByText("You have edited the code since this run.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Next challenge", exact: false }).click();
  await expect(page.locator(".cm-content")).not.toContainText("my saved draft");
  await page.getByRole("button", { name: "Previous challenge", exact: true }).click();
  await expect(page.locator(".cm-content")).toContainText("my saved draft");
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("my saved draft");
  await expect(page.getByText("Tests passed for 1 of 4 exercises", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Next challenge", exact: false }).click();
  for (let number = 2; number <= 4; number++) {
    await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
    await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
    await page.getByRole("button", { name: "Run tests", exact: true }).click();
    await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
    if (number < 4) await page.getByRole("button", { name: "Next challenge", exact: false }).click();
  }
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("oop_ml.progress.v1") ?? "{}"));
  expect(progress.done["/concepts/simple-linear-regression"].some((section: string) => section.startsWith("practice"))).toBe(true);
  expect(failures).toEqual([]);
});

test("runtime errors, fresh variables, cancellation, and recovery", async ({ page }) => {
  await openPractice(page, "attention");
  const editor = page.locator(".cm-content");
  await editor.fill('answer = 42\nprint("ready")');
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator("pre").filter({ hasText: /^ready\s*$/ })).toBeVisible();
  await editor.fill("print(answer)");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator("pre").filter({ hasText: "NameError" })).toBeVisible();
  await editor.fill("while True:\n    pass");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.getByText("Running your code...", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByText("Stopped. Your code is still here.", { exact: false })).toBeVisible();
  await editor.fill('print("recovered")');
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator("pre").filter({ hasText: /^recovered\s*$/ })).toBeVisible();
});

test("mobile layout, reset, keyboard navigation, and lazy runtime", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const workers: string[] = [];
  page.on("worker", (worker) => workers.push(worker.url()));
  await openPractice(page, "attention");
  expect(workers).toEqual([]);
  const fragment = new URL(page.url()).hash;
  await page.locator(".cm-content").click();
  await page.keyboard.press("ArrowLeft");
  expect(new URL(page.url()).hash).toEqual(fragment);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  expect(await page.locator(".cm-content").evaluate((element) => element === document.activeElement)).toBe(false);
  await page.locator(".cm-content").fill('print("changed")');
  await page.getByRole("button", { name: "Reset code", exact: true }).click();
  await expect(page.locator(".cm-content")).toContainText("import numpy");
  await expect(page.locator(".cm-content")).not.toContainText("changed");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: ".practice-checks/practice-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.getByRole("heading", { name: /How would you reproduce/ }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".practice-checks/practice-desktop.png" });
  await page.getByRole("button", { name: "Switch to the light theme", exact: true }).click();
  await page.screenshot({ path: ".practice-checks/practice-light.png" });
});

test("a failed library download can be retried", async ({ page, context }) => {
  const downloads = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/numpy-*.whl";
  await context.route(downloads, (route) => route.abort());
  await openPractice(page, "attention");
  await page.locator(".cm-content").fill('import numpy as np\nprint("total", np.array([2, 3]).sum())');
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.getByText("Python could not run this time.", { exact: false })).toBeVisible();
  await context.unroute(downloads);
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator("pre").filter({ hasText: /^total 5\s*$/ })).toBeVisible();
});

test("browser fixtures agree for solver signs and an unstable training run", async ({ page }) => {
  for (const [lesson, challenge] of [["a-vector-for-a-word", 1], ["training-a-network", 3]] as const) {
    await openPractice(page, lesson);
    if (challenge > 1) await page.getByRole("button", { name: new RegExp(`^Challenge ${challenge}:`) }).click();
    await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
    await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
    await page.getByRole("button", { name: "Run tests", exact: true }).click();
    await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
  }
});

test("maths primers keep their links and run with NumPy alone", async ({ page }) => {
  const sdkRequests: string[] = [];
  page.on("request", (request) => {
    if (/oop-ml\.zip|sdk-manifest\.json|(?:scipy|pydantic)[^/]*\.whl/.test(request.url())) sdkRequests.push(request.url());
  });
  for (const [lesson, fragment] of [
    ["statistics", "practice-summarising-the-five-people-with-the-library"],
    ["linear-algebra", "practice-vectors-and-matrices-in-the-library"],
    ["calculus", "practice-walking-a-real-bowl-with-the-library"],
  ]) {
    await page.goto(`/primers/${lesson}#${fragment}`);
    await expect(page.locator(".cm-content")).toBeVisible();
    await expect(page.locator(".cm-content")).toContainText("import numpy as np");
    await expect(page.locator(".cm-content")).not.toContainText("oop_ml");
    await page.getByText("Prefer your own editor?", { exact: true }).click();
    await expect(page.getByText("python -m pip install numpy", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
    await page.getByRole("button", { name: "Replace editor with this solution", exact: true }).click();
    await page.getByRole("button", { name: "Run tests", exact: true }).click();
    await expect(page.getByText("All tests passed", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Test counts")).toContainText("0 failed");
  }
  expect(sdkRequests).toEqual([]);
});
