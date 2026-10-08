import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test.beforeEach(async ({ context }) => {
  await context.route("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/*.whl", async route => {
    try {
      const bytes = await readFile(path.join(process.cwd(), ".practice-checks", path.basename(new URL(route.request().url()).pathname)));
      await route.fulfill({ body: bytes, contentType: "application/zip", headers: { "access-control-allow-origin": "*" } });
    } catch { await route.continue(); }
  });
});

async function dial(page: Page, label: string, value: string) {
  await page.getByRole("slider", { name: label, exact: true }).fill(value);
}
async function send(page: Page, counts: string) {
  await page.getByRole("button", { name: "Send the batch", exact: true }).click();
  await expect(page.getByLabel("Routing results", { exact: true })).toHaveText(counts);
}

test("the workshop teaches weights, bias and activation through actual routing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/lab/neuron/bench");
  await page.getByRole("button", { name: "Open calculation and Python bench", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Bias", exact: true })).toBeDisabled();
  await send(page, "4 correct · 4 incorrect");
  await dial(page, "Mass weight", "-1");
  await expect(page.getByLabel("Routing results", { exact: true })).toHaveCount(0);
  await send(page, "8 correct · 0 incorrect");

  await page.getByRole("button", { name: "Next: Bias" }).click();
  await expect(page.getByRole("slider", { name: "Height weight", exact: true })).toBeDisabled();
  await send(page, "4 correct · 4 incorrect");
  await dial(page, "Bias", "-1.5");
  await send(page, "8 correct · 0 incorrect");

  await page.getByRole("button", { name: "Next: Activation" }).click();
  await send(page, "0 correct · 8 incorrect");
  await page.getByRole("combobox", { name: "Activation function" }).selectOption("sigmoid");
  await send(page, "0 correct · 8 incorrect");
  await page.getByRole("combobox", { name: "Activation function" }).selectOption("step");
  await send(page, "8 correct · 0 incorrect");
  expect(errors).toEqual([]);
});

test("NumPy results operate the belt and checks reject hardcoded or malformed answers", async ({ page }) => {
  await page.goto("/lab/neuron/bench");
  await page.getByRole("button", { name: "Open calculation and Python bench", exact: true }).click();
  await page.getByRole("navigation", { name: "Workshop experiments" }).getByRole("button", { name: "NumPy" }).click();
  await expect(page.locator(".cm-editor")).toBeVisible();
  await page.getByRole("button", { name: "Run code & test", exact: true }).click();
  await expect(page.getByLabel("Code test counts", { exact: true })).toHaveText("0 passed · 5 failed");
  await expect(page.getByLabel("Routing results", { exact: true })).toHaveText("5 correct · 3 incorrect");

  await page.locator(".cm-content").fill("import numpy as np\ndef sort_parts(measurements, weights, bias):\n    scores = measurements @ np.array([1, -1]) - 1.5\n    return scores, (scores >= 0).astype(int)");
  await page.getByRole("button", { name: "Run code & test", exact: true }).click();
  await expect(page.getByLabel("Code test counts", { exact: true })).toHaveText("2 passed · 3 failed");

  await page.locator(".cm-content").fill("def sort_parts(measurements, weights, bias):\n    return 0, 0");
  await page.getByRole("button", { name: "Run code & test", exact: true }).click();
  await expect(page.getByLabel("Code test counts", { exact: true })).toHaveText("0 passed · 5 failed");
  await expect(page.getByLabel("Routing results", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Show the worked solution", exact: true }).click();
  await expect(page.getByLabel("Code test counts", { exact: true })).toHaveText("0 passed · 5 failed");
  await page.getByRole("button", { name: "Use this solution", exact: true }).click();
  await page.getByRole("button", { name: "Run code & test", exact: true }).click();
  await expect(page.getByLabel("Code test counts", { exact: true })).toHaveText("5 passed · 0 failed");
  await expect(page.getByLabel("Routing results", { exact: true })).toHaveText("8 correct · 0 incorrect");

  await page.locator(".cm-content").fill("raise ValueError('inspect this failure')");
  await page.getByRole("button", { name: "Run code & test", exact: true }).click();
  await expect(page.getByLabel("Code test counts", { exact: true })).toHaveText("0 passed · 1 failed · 5 not run");
  await page.reload();
  await page.getByRole("button", { name: "Open calculation and Python bench", exact: true }).click();
  await page.getByRole("navigation", { name: "Workshop experiments" }).getByRole("button", { name: "NumPy" }).click();
  await expect(page.locator(".cm-content")).toContainText("inspect this failure");
});

test("the final experiment reveals the limit and remains usable on small screens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab/neuron/bench");
  await page.getByRole("button", { name: "Open calculation and Python bench", exact: true }).click();
  await page.getByRole("navigation", { name: "Workshop experiments" }).getByRole("button", { name: "The limit" }).click();
  await send(page, "3 correct · 1 incorrect");
  await page.getByRole("button", { name: "Keep adjusting the same neuron", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "one straight boundary" })).toBeVisible();
  await page.getByRole("button", { name: "Combine more than one neuron", exact: true }).click();
  await expect(page.getByRole("link", { name: "See how neurons work together" })).toBeVisible();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole("navigation", { name: "Workshop experiments" }).getByRole("button", { name: "Weights" }).click();
  await page.getByRole("button", { name: "Send the batch", exact: true }).click();
  await page.getByRole("button", { name: "Stop belt", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Mass weight", exact: true })).toBeEnabled();
  await expect(page.getByLabel("Routing results", { exact: true })).toHaveCount(0);
});
