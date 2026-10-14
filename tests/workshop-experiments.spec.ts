import { test, expect, type Page } from "@playwright/test";
import { BUILDS, buildById } from "../lib/builds/catalog";
import { assemble, previewConstruction, evaluate, plug, same } from "../lib/builds/engine";
import { TOOLS } from "../lib/builds/tools";
import { journeyFor } from "../lib/builds/journey";

test("live previews agree with every workshop case, including branches disconnected from Result", () => {
  const before = JSON.stringify(BUILDS);
  for (const build of BUILDS) {
    const graph = assemble(build.recipe, TOOLS);
    for (const sample of build.cases) {
      const live = previewConstruction(graph, sample.data, TOOLS);
      expect(live.issues.size, build.id).toBe(0);
      expect(live.signals.size, build.id).toBe(graph.pieces.length);
      expect(same(live.signals.get("output")!.output, sample.expected), build.id).toBe(true);
      const open = { ...graph, connections: graph.connections.filter(wire => wire.to !== "output") };
      const unfinished = previewConstruction(open, sample.data, TOOLS);
      expect(unfinished.signals.size, build.id).toBe(graph.pieces.length - 1);
      expect(unfinished.issues.get("output")?.port, build.id).toBe(0);
    }
    for (const tool of journeyFor(build.id).tools) {
      expect(tool.example, `${build.id}: ${tool.key}`).toBeDefined();
      expect(same(TOOLS[tool.key].run(tool.example!.inputs, tool.example!.settings), tool.example!.output)).toBe(true);
    }
  }
  expect(JSON.stringify(BUILDS)).toBe(before);
});

test("live inspection reports cycles and invalid math without losing independent branches", () => {
  const build = buildById.statistics, graph = assemble(build.recipe, TOOLS);
  const divider = graph.pieces.find(piece => piece.tool === "divide")!;
  const counter = graph.pieces.find(piece => piece.tool === "count")!;
  const loop = previewConstruction(plug(graph, { from: divider.id, to: counter.id, port: 0 }), build.cases[0].data, TOOLS);
  expect(loop.issues.get("output")?.message).toContain("loops back");
  expect(loop.signals.size).toBeGreaterThan(0);
  const invalid = previewConstruction(graph, { weeklyCounts: [] }, TOOLS);
  expect(invalid.issues.get(divider.id)?.message).toContain("finite number");
  expect(evaluate(graph, build.cases[0].data, TOOLS).output).toBe(40);
  const oversized = previewConstruction(graph, { weeklyCounts: Array(13000).fill(1) }, TOOLS);
  expect(oversized.issues.get("output")?.message).toContain("too large for the live workshop");
});

async function open(page: Page, slug: string, assembled = true) {
  await page.goto(`/lab/${slug}`);
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  if (assembled) {
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  }
}
async function experiment(page: Page) {
  await page.getByText("Try your own inputs", { exact: true }).click();
  await page.getByRole("button", { name: "Experiment with these inputs", exact: true }).click();
}

test("a learner can try an unfinished branch and recover edits with undo, redo and duplication", async ({ page }) => {
  await open(page, "statistics", false);
  for (const name of ["Deaths recorded each week", "Add a list"]) await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Deaths recorded each week output", exact: true }).click();
  await page.getByRole("button", { name: "Add a list input 1: Numbers", exact: true }).click();
  await expect(page.getByRole("group", { name: "Add a list machine", exact: true }).getByTestId("component-value")).toHaveText("200");
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await page.getByLabel("Active workshop example", { exact: true }).selectOption("1");
  await expect(page.getByRole("group", { name: "Add a list machine", exact: true }).getByTestId("component-value")).toHaveText("96");
  await page.getByRole("button", { name: "Inspect or move Add a list", exact: true }).click();
  await page.getByRole("button", { name: "Duplicate this piece", exact: true }).click();
  await expect(page.getByRole("group", { name: "Add a list machine", exact: true })).toHaveCount(2);
  await page.getByLabel("Construction floor", { exact: true }).focus();
  await page.keyboard.press("Control+z");
  await expect(page.getByRole("group", { name: "Add a list machine", exact: true })).toHaveCount(1);
  await page.keyboard.press("Control+Shift+z");
  await expect(page.getByRole("group", { name: "Add a list machine", exact: true })).toHaveCount(2);
  await expect(page.getByTestId("connection-path")).toHaveCount(1);
  await page.getByLabel("Find a workshop tool", { exact: true }).fill("divide");
  await expect(page.getByLabel("Construction toolbox").getByRole("button")).toHaveCount(1);
});

test("custom inputs update live, remain ungraded, and never replace the original tests", async ({ page }) => {
  await open(page, "workshop-guide");
  await experiment(page);
  await page.getByLabel("My prediction", { exact: true }).fill("Doubling a negative reading will produce a negative result.");
  const input = page.getByLabel("Sensor reading", { exact: true });
  await input.fill("-4");
  await expect(page.getByLabel("Experiment result")).toContainText("-8");
  await page.getByRole("button", { name: "Trace these inputs", exact: true }).click();
  await expect(page.getByRole("button", { name: "Back to live values", exact: true })).toBeVisible();
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
  await input.fill("-");
  await expect(page.getByRole("button", { name: "Trace these inputs", exact: true })).toBeDisabled();
  await expect(page.getByLabel("Experiment result")).toHaveCount(0);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await expect(page.getByRole("button", { name: "Run this example", exact: true })).toBeEnabled();
  await expect(page.getByText("Your construction produced", { exact: true })).toHaveCount(3);
  await expect(page.getByLabel("Experiment result")).toHaveCount(0);
});

test("matrix cells are editable, failures remain inspectable, and narrow screens contain the experiment", async ({ page }) => {
  await open(page, "linear-algebra");
  await experiment(page);
  await page.getByLabel("Prices: bread, then milk, item 1", { exact: true }).fill("4");
  await expect(page.getByLabel("Experiment result")).toContainText("10");
  await expect(page.getByLabel("Experiment result")).toContainText("15");
  await expect(page.getByLabel("Experiment result")).toContainText("8");
  await page.screenshot({ path: ".practice-checks/workshop-experiment-desktop.png", fullPage: true });
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: ".practice-checks/workshop-experiment-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 960 });
  await open(page, "attention");
  await experiment(page);
  await page.getByLabel("Translation step query, item 1", { exact: true }).fill("0");
  await page.getByLabel("Keys for the / red / door, row 2, column 1", { exact: true }).fill("0");
  await expect(page.getByLabel("Experiment result")).toContainText("4");
  await page.getByRole("button", { name: "Clear floor", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 2 failed · 0 not run");
  await expect(page.getByText("Your construction produced", { exact: true })).toHaveCount(2);
});

test("a learner can change a list's length, correct invalid JSON, and pause and resume a trace", async ({ page }) => {
  await open(page, "statistics");
  await experiment(page);
  await page.getByRole("button", { name: "Edit Deaths recorded each week as JSON", exact: true }).click();
  const records = page.getByLabel("Deaths recorded each week", { exact: true });
  await records.fill("[10, 20, 30]");
  await expect(page.getByLabel("Experiment result").getByText("20", { exact: true })).toBeVisible();
  await records.fill("[");
  await expect(page.getByRole("button", { name: "Trace these inputs", exact: true })).toBeDisabled();
  await records.fill("[10, 30]");
  await page.getByRole("button", { name: "Edit Deaths recorded each week as cells", exact: true }).click();
  await expect(page.getByLabel("Deaths recorded each week, item 2", { exact: true })).toHaveValue("30");
  await expect(page.getByLabel("Deaths recorded each week, item 3", { exact: true })).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).check();
  await page.getByRole("button", { name: "Trace these inputs", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume trace", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Step through", exact: true }).click();
  await page.getByRole("button", { name: "Resume trace", exact: true }).click();
  await expect(page.getByRole("button", { name: "Back to live values", exact: true })).toBeVisible();
  await expect(page.getByTestId("construction-counter")).toHaveText("0 passed · 0 failed · 3 not run");
});

test("dragging empty floor space pans without moving or changing pieces", async ({ page }) => {
  await open(page, "workshop-guide");
  await page.getByLabel("Construction zoom", { exact: true }).selectOption("1");
  const floor = page.getByLabel("Construction floor", { exact: true });
  await floor.scrollIntoViewIfNeeded();
  await floor.evaluate(element => { element.scrollLeft = 250; element.scrollTop = 50; });
  const before = await page.locator("[data-piece]").evaluateAll(elements => elements.map(element => element.getAttribute("style")));
  await floor.evaluate(element => { element.scrollTop = 0; });
  // Choose visible empty space. The floor can extend behind the sticky site
  // header, so its top edge alone does not identify a reachable point.
  const point = await floor.evaluate(element => {
    const rect = element.getBoundingClientRect();
    for (let y = Math.max(80, rect.top) + 20; y < Math.min(innerHeight, rect.bottom) - 20; y += 30)
      for (let x = rect.left + 180; x < rect.right - 20; x += 30)
        if (document.elementFromPoint(x, y)?.getAttribute("data-testid") === "construction-floor") return { x, y };
    throw Error("No visible empty floor space");
  });
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x - 100, point.y, { steps: 6 });
  await page.mouse.up();
  expect(await floor.evaluate(element => element.scrollLeft)).toBeGreaterThan(300);
  expect(await page.locator("[data-piece]").evaluateAll(elements => elements.map(element => element.getAttribute("style")))).toEqual(before);
});
