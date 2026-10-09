import { test, expect, type Page } from "@playwright/test";
import { buildById } from "../lib/builds/catalog";
import { TOOLS } from "../lib/builds/tools";
import { assemble, evaluate, plug } from "../lib/builds/engine";

test("the bookkeeping construction handles different customer counts and prices", () => {
  const build = buildById["linear-algebra"], graph = assemble(build.recipe, TOOLS);
  expect(evaluate(graph, { loaves: [0, 4, 1, 2], bottles: [2, 1, 3, 0], prices: [3, 5] }, TOOLS).output).toEqual([10, 17, 18, 6]);
  const collect = graph.pieces.find(piece => piece.tool === "pack")!;
  const multiply = graph.pieces.find(piece => piece.tool === "matvec")!;
  const incorrectlyArranged = plug(graph, { from: collect.id, to: multiply.id, port: 0 });
  expect(evaluate(incorrectlyArranged, build.cases[0].data, TOOLS).error?.id).toBe(multiply.id);
  expect(evaluate(graph, { loaves: [1, 2], bottles: [1], prices: [2, 3] }, TOOLS).error?.message).toContain("same number");
});

test("the matrix walkthrough connects editable purchases, prices, row calculations and transposition", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/lab/linear-algebra");
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Get to know the tools/ }).click();
  const tutorial = page.getByRole("region", { name: "From purchases to a matrix" });
  const calculation = tutorial.getByTestId("matrix-row-calculation");
  await expect(calculation).toHaveText("Bread: 1 × 2 = 2\nMilk: 2 × 3 = 6\n\n2 + 6 = 8 coins");
  await tutorial.getByLabel("Customer A bread quantity", { exact: true }).fill("2");
  await expect(calculation).toContainText("4 + 6 = 10 coins");
  await tutorial.getByRole("button", { name: "Continue with the purchases", exact: false }).click();
  await tutorial.getByLabel("Bread price in coins", { exact: true }).fill("4");
  await expect(tutorial.getByRole("table", { name: "Calculated results" }).locator("td")).toHaveText(["14", "15", "8"]);
  await tutorial.getByRole("button", { name: "Follow Customer B", exact: true }).click();
  await expect(calculation).toHaveText("Bread: 3 × 4 = 12\nMilk: 1 × 3 = 3\n\n12 + 3 = 15 coins");
  await tutorial.getByRole("button", { name: "Continue with the purchases", exact: false }).click();
  const arrangement = tutorial.getByRole("table", { name: "Arrangement of purchase records" });
  await expect(arrangement.locator("tbody tr")).toHaveCount(2);
  await tutorial.getByRole("button", { name: "Swap rows and columns", exact: true }).click();
  await expect(arrangement.locator("tbody tr")).toHaveCount(3);
  await expect(arrangement.locator("tbody tr").nth(1).locator("td")).toHaveText(["3", "1"]);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `width ${width}`).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 1000 });
  await tutorial.getByRole("button", { name: "2. Keep the customers together", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(tutorial.getByLabel("Milk price in coins")).toBeVisible();
  expect(errors).toEqual([]);
});

async function wire(page: Page, from: string, to: string) {
  await page.getByRole("button", { name: from, exact: true }).click();
  await page.getByRole("button", { name: to, exact: true }).click();
}

test("a learner builds customer rows, catches reversed columns, and inspects the real matrix calculation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const key = "fitlab-construction-v1:linear-algebra";
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      pieces: [{ id: "output", tool: "output", x: 800, y: 70, settings: {} }, { id: "piece-1", tool: "constant", x: 36, y: 70, settings: { value: 8 } }],
      connections: [{ from: "piece-1", to: "output", port: 0 }],
    }));
  });
  await page.goto("/lab/linear-algebra");
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  await expect(page.locator("[data-piece]")).toHaveCount(1);
  for (const name of ["Loaves for each customer", "Milk bottles for each customer", "Prices: bread, then milk", "Collect two results", "Swap rows and columns", "Matrix times vector"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  await wire(page, "Milk bottles for each customer output", "Collect two results input 1: First result");
  await wire(page, "Loaves for each customer output", "Collect two results input 2: Second result");
  await wire(page, "Collect two results output", "Swap rows and columns input 1: Matrix");
  await wire(page, "Swap rows and columns output", "Matrix times vector input 1: Rows of coefficients");
  await wire(page, "Prices: bread, then milk output", "Matrix times vector input 2: Input vector");
  await wire(page, "Matrix times vector output", "Result input 1: Your result");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 3 failed · 0 not run");
  await wire(page, "Loaves for each customer output", "Collect two results input 1: First result");
  await wire(page, "Milk bottles for each customer output", "Collect two results input 2: Second result");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await page.getByRole("button", { name: "Inspect or move Matrix times vector", exact: true }).click();
  const calculation = page.getByRole("region", { name: "Follow the matrix calculation" });
  await expect(calculation.getByTestId("matrix-row-calculation")).toHaveText("Bread: 1 × 4 = 4\nMilk: 2 × 1 = 2\n\n4 + 2 = 6 coins");
  await calculation.getByRole("button", { name: "Follow Customer C", exact: true }).click();
  await expect(calculation.getByTestId("matrix-row-calculation")).toContainText("8 + 0 = 8 coins");
  await expect(page.getByRole("group", { name: "Swap rows and columns machine", exact: true }).getByRole("table")).toHaveCount(1);
  const oldDraft = await page.evaluate(() => JSON.parse(localStorage.getItem("fitlab-construction-v1:linear-algebra")!));
  expect(oldDraft.pieces).toHaveLength(2);
  await page.reload();
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
  await expect(page.locator("[data-piece]")).toHaveCount(7);
  expect(errors).toEqual([]);
});
