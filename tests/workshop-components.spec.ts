import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, slug: string, example = false) {
  await page.goto(`/lab/${slug}`);
  await page.getByRole("navigation", { name: "Journey stages" }).getByRole("button", { name: /Build your solution/ }).click();
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  if (example) {
    await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
    await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  }
}

async function socketError(page: Page) {
  return page.getByTestId("construction-floor").evaluate(floor => {
    const errors = [...floor.querySelectorAll<SVGPathElement>('[data-testid="connection-path"]')].flatMap(path => {
      const from = floor.querySelector(`[data-piece="${path.dataset.from}"] [data-socket="output"]`)!.getBoundingClientRect();
      const to = floor.querySelector(`[data-input-piece="${path.dataset.to}"][data-input-port="${path.dataset.port}"] [data-socket="input"]`)!.getBoundingClientRect();
      return [[0, from], [path.getTotalLength(), to]].map(([distance, box]) => {
        const p = path.getPointAtLength(distance as number), screen = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM()!);
        const rect = box as DOMRect;
        return Math.hypot(screen.x - rect.x - rect.width / 2, screen.y - rect.y - rect.height / 2);
      });
    });
    return Math.max(...errors);
  });
}

test("cards fit their contents, inputs explain connections, and number edits can be corrected or undone", async ({ page }) => {
  await open(page, "workshop-guide");
  for (const name of ["Sensor reading", "Multiply", "Set a constant"]) await page.getByRole("button", { name, exact: true }).click();
  const source = page.getByRole("group", { name: "Sensor reading machine", exact: true });
  const multiply = page.getByRole("group", { name: "Multiply machine", exact: true });
  expect(await source.evaluate(el => el.clientHeight)).toBeLessThan(await multiply.evaluate(el => el.clientHeight));
  await expect(source.getByTestId("component-value")).toHaveText("3");
  await expect(multiply.getByText("Connect an output here", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Sensor reading output", exact: true }).click();
  await page.getByRole("button", { name: "Multiply input 1: Value", exact: true }).click();
  await expect(multiply.getByText("From Sensor reading", { exact: true })).toBeVisible();
  const field = page.getByLabel("Set a constant Number", { exact: true });
  expect(await field.evaluate(el => el.clientWidth)).toBeGreaterThan(220);
  await field.fill("-");
  await expect(field).toHaveValue("-");
  await expect(page.getByRole("button", { name: "Run this example", exact: true })).toBeDisabled();
  await field.press("Escape");
  await expect(field).toHaveValue("0");
  await field.fill("-2.5");
  await field.press("Enter");
  await expect(page.getByRole("group", { name: "Set a constant machine", exact: true }).getByTestId("component-value")).toHaveText("-2.5");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("0");
  await expect(page.getByTestId("connection-path")).toHaveCount(1);
  await field.fill("");
  await page.getByRole("button", { name: "Inspect or move Set a constant", exact: true }).click();
  await page.keyboard.press("Delete");
  await expect(field).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run this example", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(field).toHaveValue("0");
});

test("three-input components keep their sockets attached as values, zoom and position change", async ({ page }) => {
  await open(page, "numpy-creation", true);
  const component = page.getByRole("group", { name: "Fill a rectangular sheet machine", exact: true });
  await expect(component.locator('[data-socket="input"]')).toHaveCount(3);
  for (const zoom of ["1", "0.5"]) {
    await page.getByLabel("Construction zoom", { exact: true }).selectOption(zoom);
    await expect.poll(() => socketError(page)).toBeLessThan(1);
    await page.getByRole("button", { name: "Test all examples", exact: true }).click();
    await expect(page.getByTestId("construction-counter")).toContainText("0 failed · 0 not run");
    await expect.poll(() => socketError(page)).toBeLessThan(1);
    const rows = await component.locator("button[data-input-port]").evaluateAll(elements => elements.map(el => ({ top: (el as HTMLElement).offsetTop, height: (el as HTMLElement).offsetHeight })));
    for (let i = 1; i < rows.length; i++) expect(rows[i].top).toBeGreaterThanOrEqual(rows[i - 1].top + rows[i - 1].height);
    const handle = component.getByRole("button", { name: /Inspect or move/ });
    await handle.focus(); await handle.press("ArrowDown");
    await expect.poll(() => socketError(page)).toBeLessThan(1);
  }
  await expect(component.locator('[data-socket="input"]').first()).toHaveCSS("width", "36px");
  await expect(component.locator('[data-socket="output"]')).toHaveCSS("width", "42px");
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Fit construction", exact: true }).click();
    await expect.poll(() => socketError(page)).toBeLessThan(1);
  }
});

test("arranging an old crowded draft preserves its work and can be undone", async ({ page }) => {
  const graph = {
    pieces: [
      { id: "s", tool: "source:reading", x: 32, y: 70, settings: {} },
      { id: "c", tool: "constant", x: 32, y: 260, settings: { value: 2 } },
      { id: "m", tool: "multiply", x: 292, y: 70, settings: {} },
      { id: "output", tool: "output", x: 552, y: 70, settings: {} },
    ],
    connections: [{ from: "s", to: "m", port: 0 }, { from: "c", to: "m", port: 1 }, { from: "m", to: "output", port: 0 }],
  };
  await page.addInitScript(graph => localStorage.setItem("fitlab-construction-v1:workshop-guide", JSON.stringify(graph)), graph);
  await open(page, "workshop-guide");
  await page.getByRole("button", { name: "Arrange pieces", exact: true }).click();
  const overlap = await page.locator("[data-piece]").evaluateAll(nodes => {
    const boxes = nodes.map(n => n.getBoundingClientRect());
    return boxes.some((a, i) => boxes.some((b, j) => j > i && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
  });
  expect(overlap).toBe(false);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await expect.poll(() => socketError(page)).toBeLessThan(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator('[data-piece="m"]')).toHaveCSS("left", "292px");
  await expect(page.getByLabel("Set a constant Number", { exact: true })).toHaveValue("2");
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
});
