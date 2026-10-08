import { test, expect, type Page } from "@playwright/test";
import { FACTORY_JOBS, connect, traceCircuit, placement, type Circuit } from "../lib/factory";

test("every factory job needs a change and its assembled example sorts the actual parts", () => {
  for (const job of FACTORY_JOBS) {
    expect(job.batch.every(p => traceCircuit(job.example, p).output === p.bin), job.title).toBe(true);
    expect(job.batch.every(p => traceCircuit(job.starter, p).output === p.bin), job.title).toBe(false);
    expect(JSON.stringify(job)).not.toContain("\u2014");
  }
  // A different multiplier also solves the second job. Passing is not a configuration flag.
  const alternative = structuredClone(FACTORY_JOBS[1].example);
  alternative.machines.find(m => m.kind === "weight")!.value = 2.5;
  expect(FACTORY_JOBS[1].batch.every(p => traceCircuit(alternative, p).output === p.bin)).toBe(true);
});

test("the circuit follows inputs, shares outputs, replaces connections, and explains broken paths", () => {
  const sample = { id: "test", height: 4, mass: 2, bin: 1 as const };
  const bare = FACTORY_JOBS[0].starter;
  expect(traceCircuit(bare, sample).problem).toMatchObject({ node: "gate", port: 0 });
  const graph: Circuit = { machines: [
    ...bare.machines,
    { id: "sum", kind: "sum", value: 0, x: 400, y: 200 },
    { id: "weight", kind: "weight", value: -.5, x: 650, y: 200 },
  ], wires: [
    { from: "height", to: "sum", port: 0 }, { from: "height", to: "sum", port: 1 },
    { from: "sum", to: "weight", port: 0 }, { from: "weight", to: "gate", port: 0 },
  ] };
  const trace = traceCircuit(graph, sample);
  expect(trace.steps.map(s => s.output)).toEqual([4, 8, -4, 0]);
  expect(trace.steps.filter(s => s.id === "height")).toHaveLength(1);
  const replaced = connect(graph, { from: "height", to: "gate", port: 0 });
  expect(replaced.wires.filter(w => w.to === "gate")).toHaveLength(1);
  expect(traceCircuit(replaced, sample).output).toBe(1);
  const cycle = connect(graph, { from: "weight", to: "sum", port: 0 });
  expect(traceCircuit(cycle, sample).problem?.message).toContain("forms a loop");
  expect(traceCircuit(cycle, sample).output).toBeNull();
  expect(connect(graph, { from: "height", to: "sum", port: .5 })).toBe(graph);
  expect(connect(graph, { from: "gate", to: "weight", port: 0 })).toBe(graph);
  expect(placement(bare, 24, 120)).toBeNull();
  expect(placement(bare, 457, 218)).toEqual({ x: 456, y: 216 });
});

async function open(page: Page) {
  await page.goto("/lab/neuron/bench");
  await page.getByLabel("Animate", { exact: true }).uncheck();
}
async function wire(page: Page, from: string, to: string) {
  await page.getByRole("button", { name: from, exact: true }).click();
  await page.getByRole("button", { name: to, exact: true }).click();
}
async function checkDelivery(page: Page, counts: string) {
  await page.getByRole("button", { name: "Run delivery", exact: true }).click();
  await expect(page.getByLabel("Factory test counts", { exact: true })).toHaveText(counts);
  await expect(page.getByRole("button", { name: "Pause belt", exact: true })).toHaveCount(0);
}

test("one connection teaches the first job, and a signal can be followed manually", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await open(page);
  await page.getByRole("button", { name: "Send one part", exact: true }).click();
  await expect(page.getByText(/Sorting gate needs a number at its input/)).toBeVisible();
  await expect(page.getByLabel("Factory test counts", { exact: true })).toHaveText("0 passed · 0 failed · 4 not run");
  await wire(page, "Height sensor output", "Sorting gate input 1");
  await page.getByRole("button", { name: "Step a signal", exact: true }).click();
  await expect(page.getByLabel("Height sensor signal", { exact: true })).toHaveText("1");
  await expect(page.getByLabel("Sorting gate signal", { exact: true })).toHaveText("No signal yet");
  await page.getByRole("button", { name: "Step a signal", exact: true }).click();
  await expect(page.getByLabel("Sorting gate signal", { exact: true })).toHaveText("0 · Storage");
  await page.getByRole("button", { name: "Step a signal", exact: true }).click();
  await expect(page.getByLabel("Factory test counts", { exact: true })).toHaveText("1 passed · 0 failed · 3 not run");
  await checkDelivery(page, "4 passed · 0 failed · 0 not run");
  const remove = page.getByRole("button", { name: "Remove wire from Height sensor to Sorting gate input 1" });
  await remove.focus(); await page.keyboard.press("Delete");
  await expect(page.getByLabel("Factory test counts", { exact: true })).toHaveText("0 passed · 0 failed · 4 not run");
  await page.getByRole("button", { name: "Undo edit", exact: true }).click();
  await expect(remove).toHaveCount(1);
  await page.getByRole("button", { name: "Open calculation and Python bench", exact: true }).click();
  await page.getByRole("button", { name: "Back to the factory floor", exact: false }).click();
  await expect(remove).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("placing, moving, wiring and adjusting a weight change the delivery", async ({ page }) => {
  await open(page);
  await page.getByRole("navigation", { name: "Factory jobs" }).getByRole("button", { name: /Add a weight/ }).click();
  await checkDelivery(page, "2 passed · 2 failed · 0 not run");
  await page.getByRole("button", { name: "Place Weight", exact: true }).click();
  const floor = page.getByTestId("factory-floor");
  await floor.click({ position: { x: 536, y: 287 } });
  const weight = page.getByRole("group", { name: "Weight machine", exact: true });
  await expect(weight).toBeVisible();
  const header = page.getByRole("button", { name: "Move or inspect Weight", exact: true });
  const before = await weight.boundingBox();
  await header.focus(); await page.keyboard.press("ArrowRight");
  expect((await weight.boundingBox())!.x).toBe(before!.x + 24);
  await wire(page, "Height sensor output", "Weight input 1");
  await wire(page, "Weight output", "Sorting gate input 1");
  await page.getByRole("button", { name: "Increase Weight setting", exact: true }).click({ clickCount: 2 });
  await expect(page.getByLabel("Weight setting", { exact: true })).toHaveText("× 2");
  await checkDelivery(page, "4 passed · 0 failed · 0 not run");
  await page.getByRole("button", { name: "Increase Weight setting", exact: true }).click();
  await checkDelivery(page, "4 passed · 0 failed · 0 not run");
  await header.click();
  await page.getByRole("button", { name: "Remove this machine", exact: true }).click();
  await expect(weight).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Remove wire/ })).toHaveCount(0);
});

test("dragging a wire connects its endpoints without leaving a second connection pending", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Fit floor", exact: true }).click();
  await page.getByTestId("factory-floor").scrollIntoViewIfNeeded();
  const from = await page.getByRole("button", { name: "Height sensor output", exact: true }).boundingBox();
  const to = await page.getByRole("button", { name: "Sorting gate input 1", exact: true }).boundingBox();
  await page.mouse.move(from!.x + 22, from!.y + 22);
  await page.mouse.down();
  await page.mouse.move(to!.x + 22, to!.y + 22, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole("button", { name: /^Remove wire/ })).toHaveCount(1);
  await expect(page.locator('[data-socket][aria-pressed="true"]')).toHaveCount(0);
  await checkDelivery(page, "4 passed · 0 failed · 0 not run");
});

test("examples still need tests, all jobs run, and the floor stays inside narrow pages", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  for (const job of FACTORY_JOBS) {
    await page.getByRole("navigation", { name: "Factory jobs" }).getByRole("button", { name: new RegExp(job.title) }).click();
    await page.getByRole("button", { name: "Show an example setup", exact: true }).click();
    await page.getByRole("button", { name: "Assemble this example", exact: true }).click();
    await expect(page.getByLabel("Factory test counts", { exact: true })).toHaveText(`0 passed · 0 failed · ${job.batch.length} not run`);
    await checkDelivery(page, `${job.batch.length} passed · 0 failed · 0 not run`);
  }
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `at ${width}`).toBe(true);
    await page.getByRole("button", { name: "Fit floor", exact: true }).click();
  }
  await page.getByRole("button", { name: "Write the machine in NumPy", exact: false }).click();
  await expect(page.locator(".cm-editor")).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard placement, dragging, expanded view and revisiting a job preserve the learner's machine", async ({ page }) => {
  await open(page);
  const jobs = page.getByRole("navigation", { name: "Factory jobs" });
  await jobs.getByRole("button", { name: /Add a weight/ }).click();
  await page.getByRole("button", { name: "Place Weight", exact: true }).focus();
  await page.keyboard.press("Enter");
  const weight = page.getByRole("group", { name: "Weight machine", exact: true });
  await expect(weight).toHaveCount(1);
  const header = page.getByRole("button", { name: "Move or inspect Weight", exact: true });
  await header.scrollIntoViewIfNeeded();
  const start = (await header.boundingBox())!;
  await page.mouse.move(start.x + 70, start.y + 18); await page.mouse.down();
  await page.mouse.move(start.x + 166, start.y + 18, { steps: 6 }); await page.mouse.up();
  expect((await header.boundingBox())!.x).toBe(start.x + 96);
  await jobs.getByRole("button", { name: /Connect the sensor/ }).click();
  await jobs.getByRole("button", { name: /Add a weight/ }).click();
  await expect(weight).toHaveCount(1);
  await page.getByRole("button", { name: "Expand workshop", exact: true }).click();
  await expect(page.getByRole("button", { name: "Return to lesson view", exact: true })).toBeVisible();
  await expect.poll(async () => {
    const board = (await page.getByTestId("factory-floor").boundingBox())!;
    const view = (await page.getByLabel("Scrollable factory floor", { exact: true }).boundingBox())!;
    return board.height <= view.height + 1 && board.width <= view.width + 1;
  }).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Expand workshop", exact: true })).toBeVisible();
});
