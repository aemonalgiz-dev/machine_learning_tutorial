import { test, expect, type Page, type Locator } from "@playwright/test";
import type { Construction } from "../lib/builds/engine";
import { openFullWorkshop } from "./helpers/open-workshop";

const graph: Construction = {
  pieces: [
    { id: "source", tool: "source:reading", x: 80, y: 90, settings: {} },
    { id: "constant", tool: "constant", x: 450, y: 90, settings: { value: 2 } },
    { id: "multiply", tool: "multiply", x: 800, y: 90, settings: {} },
    { id: "output", tool: "output", x: 1150, y: 90, settings: {} },
  ],
  connections: [
    { from: "source", to: "multiply", port: 0 },
    { from: "constant", to: "multiply", port: 1 },
    { from: "multiply", to: "output", port: 0 },
  ],
};

async function open(page: Page, seeded = true) {
  if (seeded) await page.addInitScript(value => localStorage.setItem("fitlab-construction-v1:workshop-guide", JSON.stringify(value)), graph);
  await openFullWorkshop(page, "workshop-guide");
  const zoom = page.getByLabel("Construction zoom", { exact: true });
  if (!await zoom.isVisible()) await page.locator("summary").filter({ hasText: /workspace controls/i }).click();
  await zoom.selectOption("0.5");
  await page.getByLabel("Construction floor", { exact: true }).scrollIntoViewIfNeeded();
}

async function position(piece: Locator) {
  return piece.evaluate(element => ({ x: parseFloat((element as HTMLElement).style.left), y: parseFloat((element as HTMLElement).style.top) }));
}

async function moveTo(page: Page, name: string, x: number, y: number, zoom: number) {
  const piece = page.getByRole("group", { name: `${name} machine`, exact: true });
  const handle = piece.getByRole("button", { name: `Inspect or move ${name}`, exact: true });
  await handle.hover();
  const before = await position(piece), box = (await handle.boundingBox())!;
  const start = { x: box.x + 25, y: box.y + 12 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + (x - before.x) * zoom, start.y + (y - before.y) * zoom, { steps: 8 });
  const preview = await position(piece);
  await page.mouse.up();
  return { piece, preview };
}

test("zoomed dragging keeps the chosen position through overlaps, undo and redo", async ({ page }) => {
  await open(page);
  const { piece, preview } = await moveTo(page, "Sensor reading", 334, 118, 0.5);
  expect(preview.x).toBeCloseTo(334, 1);
  expect(preview.y).toBeCloseTo(118, 1);
  await expect.poll(() => position(piece)).toEqual(preview);
  // The sensor now overlaps the constant. Its chosen coordinates are off-grid.
  expect(preview.x % 24).not.toBe(0);
  expect(preview.y % 24).not.toBe(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => position(piece)).toEqual({ x: 80, y: 90 });
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect.poll(() => position(piece)).toEqual(preview);
  await piece.getByRole("button", { name: "Inspect or move Sensor reading", exact: true }).press("ArrowRight");
  await expect.poll(() => position(piece)).toEqual({ x: preview.x + 24, y: preview.y });
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
});

test("dragging against the canvas edge uses the same bounds before and after release", async ({ page }) => {
  await open(page);
  const { piece, preview } = await moveTo(page, "Sensor reading", -120, -90, 0.5);
  expect(preview).toEqual({ x: 32, y: 50 });
  await expect.poll(() => position(piece)).toEqual(preview);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => position(piece)).toEqual({ x: 80, y: 90 });
});

test("a shelf drop can overlap an existing piece and be undone without removing that piece", async ({ page }) => {
  await open(page, false);
  await page.getByRole("button", { name: "Sensor reading", exact: true }).click();
  const sensor = page.getByRole("group", { name: "Sensor reading machine", exact: true });
  const sensorPosition = await position(sensor);
  const tool = page.getByRole("button", { name: "Set a constant", exact: true });
  await tool.scrollIntoViewIfNeeded();
  const box = (await tool.boundingBox())!, floor = (await page.getByTestId("construction-floor").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2, { steps: 3 });
  await page.mouse.move(floor.x + (94 + 140) * 0.5, floor.y + (104 + 50) * 0.5, { steps: 10 });
  await page.mouse.up();
  const constant = page.getByRole("group", { name: "Set a constant machine", exact: true });
  await expect(constant).toHaveCount(1);
  await expect.poll(() => position(constant)).toEqual({ x: 94, y: 104 });
  await expect.poll(() => position(sensor)).toEqual(sensorPosition);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(constant).toHaveCount(0);
  await expect(sensor).toHaveCount(1);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect.poll(() => position(constant)).toEqual({ x: 94, y: 104 });
});

test("an overlapping source rises for selection but leaves the destination reachable while wiring", async ({ page }) => {
  const overlap: Construction = {
    pieces: graph.pieces.map(piece => piece.id === "source" ? { ...piece, x: 334, y: 90 }
      : piece.id === "multiply" ? { ...piece, x: 450, y: 90 }
      : piece.id === "constant" ? { ...piece, x: 80, y: 300 } : piece),
    connections: graph.connections.filter(wire => wire.from !== "source"),
  };
  await page.addInitScript(value => localStorage.setItem("fitlab-construction-v1:workshop-guide", JSON.stringify(value)), overlap);
  await open(page, false);
  const source = page.getByRole("group", { name: "Sensor reading machine", exact: true });
  const input = page.getByRole("button", { name: "Multiply input 1: Value", exact: true });
  const reachable = () => input.evaluate(button => {
    const socket = button.querySelector('[data-socket="input"]')!.getBoundingClientRect();
    return document.elementFromPoint(socket.x + socket.width / 2, socket.y + socket.height / 2)?.closest("button") === button;
  });
  await input.hover();
  await expect.poll(reachable).toBe(true);
  // The uncovered left edge of this handle remains selectable. Promoting the
  // source covers the inlet until wiring restores the original stacking order.
  await source.getByRole("button", { name: "Inspect or move Sensor reading", exact: true }).click({ position: { x: 20, y: 12 } });
  await expect(source).toHaveCSS("z-index", "6");
  await expect.poll(reachable).toBe(false);
  const output = source.getByRole("button", { name: "Sensor reading output", exact: true });
  await output.click();
  await expect(output).toHaveAttribute("aria-pressed", "true");
  await expect(source).toHaveCSS("z-index", "2");
  await expect.poll(reachable).toBe(true);
  await input.click();
  await expect(page.locator('[data-testid="connection-path"][data-from="source"][data-to="multiply"][data-port="0"]')).toHaveCount(1);
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await expect(output).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
});
