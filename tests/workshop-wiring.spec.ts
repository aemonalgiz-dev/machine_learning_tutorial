import { test, expect, type Page, type Locator } from "@playwright/test";
import type { Construction } from "../lib/builds/engine";
import { openFullWorkshop, showEarlierWorkshop } from "./helpers/open-workshop";
import { mockAccountBackend, waitForAccountReady } from "./helpers/account-backend";
import { workshopRecord } from "./helpers/workshop-record";

async function open(page: Page, signedIn = false) {
  if (signedIn) {
    await page.goto("/lab/workshop-guide");
    await waitForAccountReady(page);
    await showEarlierWorkshop(page);
  } else await openFullWorkshop(page, "workshop-guide");
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
}
async function point(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw Error("The socket is not visible");
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}
async function drag(page: Page, output: string, input: string) {
  const start = await point(page.getByRole("button", { name: output, exact: true }));
  const end = await point(page.getByRole("button", { name: input, exact: true }).locator('[data-socket="input"]'));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await expect(page.getByTestId("connection-preview")).toBeVisible();
  await expect(page.getByRole("button", { name: input, exact: true })).toHaveClass(/targetInput/);
  await page.mouse.up();
  await expect(page.getByTestId("connection-preview")).toHaveCount(0);
}
async function clickWire(page: Page, output: string, input: string) {
  await page.getByRole("button", { name: output, exact: true }).click();
  await page.getByRole("button", { name: input, exact: true }).click();
}

test("connections start at outputs, support click or drag, replace an input, and cancel cleanly", async ({ page }) => {
  await open(page);
  for (const name of ["Sensor reading", "Multiply", "Set a constant"]) await page.getByRole("button", { name, exact: true }).click();
  await page.getByLabel("Set a constant Number", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Fit construction", exact: true }).click();
  const output = page.getByRole("button", { name: "Sensor reading output", exact: true });
  await page.getByRole("button", { name: "Multiply input 1: Value", exact: true }).click();
  await output.click();
  await expect(page.getByTestId("connection-path")).toHaveCount(0);
  await expect(output).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Multiply input 1: Value", exact: true }).click();
  await expect(page.getByTestId("connection-path")).toHaveCount(1);
  await drag(page, "Set a constant output", "Multiply input 2: Multiplier");
  await drag(page, "Multiply output", "Result input 1: Your result");
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await clickWire(page, "Sensor reading output", "Multiply input 2: Multiplier");
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await clickWire(page, "Set a constant output", "Multiply input 2: Multiplier");
  for(const zoom of ["0.5", "1"]){
    await page.getByLabel("Construction zoom", {exact:true}).selectOption(zoom);
    const floor=page.getByLabel("Construction floor", {exact:true});
    await floor.scrollIntoViewIfNeeded();
    await floor.evaluate(element=>{element.scrollLeft=120;});
    await drag(page, "Set a constant output", "Multiply input 2: Multiplier");
    await expect(page.getByTestId("connection-path")).toHaveCount(3);
  }
  await page.getByRole("button", { name: "Fit construction", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
  await output.click();
  const floor = await page.getByTestId("construction-floor").boundingBox();
  await page.mouse.move(floor!.x + 15, floor!.y + 15);
  await expect(page.getByTestId("connection-preview")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("connection-preview")).toHaveCount(0);
  const start = await point(output);
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  await page.mouse.move(floor!.x + 15, floor!.y + 15, { steps: 5 }); await page.mouse.up();
  await expect(page.getByTestId("connection-path")).toHaveCount(3);
  await expect(output).toHaveAttribute("aria-pressed", "false");
});

test("Delete removes selected pieces and wires, Undo restores them, and editing a field keeps its piece", async ({ page }) => {
  await open(page);
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await page.getByRole("button", { name: "Fit construction", exact: true }).click();
  const pieces = page.locator("[data-piece]"), wires = page.getByTestId("connection-path");
  const field = page.getByLabel("Set a constant Number", { exact: true });
  await field.focus(); await field.press("ControlOrMeta+A"); await field.press("Delete");
  await expect(pieces).toHaveCount(4); await expect(wires).toHaveCount(3);
  await field.fill("2");
  await page.getByRole("group", { name: "Set a constant machine", exact: true }).getByTestId("component-value").click();
  await page.keyboard.press("Delete");
  await expect(pieces).toHaveCount(3); await expect(wires).toHaveCount(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(pieces).toHaveCount(4); await expect(wires).toHaveCount(3);
  const connection = page.getByRole("button", { name: /Select connection 1:/ });
  await connection.focus(); await page.keyboard.press("Enter");
  await expect(wires).toHaveCount(3);
  await expect(connection).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Delete");
  await expect(wires).toHaveCount(2); await expect(pieces).toHaveCount(4);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(wires).toHaveCount(3);
  await page.getByRole("button", { name: "Inspect or move Result", exact: true }).click();
  await page.keyboard.press("Delete");
  await expect(pieces).toHaveCount(4);
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter")).toHaveText("3 passed · 0 failed · 0 not run");
});

for (const direction of ["forward", "backward", "vertical"] as const) {
  test(`wires avoid intervening pieces and meet socket centres when routed ${direction}`, async ({ page }) => {
    const graph: Construction = {
      pieces: [
        { id: "source", tool: "source:reading", x: direction === "backward" ? 950 : 32, y: 100, settings: {} },
        { id: "obstacle", tool: "constant", x: direction === "vertical" ? 32 : 460, y: direction === "vertical" ? 370 : 80, settings: { value: 2 } },
        { id: "output", tool: "output", x: direction === "forward" ? 950 : 32, y: direction === "vertical" ? 650 : 100, settings: {} },
      ], connections: [{ from: "source", to: "output", port: 0 }],
    };
    await mockAccountBackend(page, { records: [{ key: "workshop:workshop-guide:v1", value: workshopRecord(graph) }] });
    await open(page, true);
    await expect(page.getByTestId("connection-path")).toHaveCount(1);
    await page.getByRole("button", { name: "Fit construction", exact: true }).click();
    await page.getByLabel("Construction floor", {exact:true}).scrollIntoViewIfNeeded();
    const check = () => page.evaluate(() => {
      const path = document.querySelector<SVGPathElement>('[data-testid="connection-path"]')!;
      const transform = path.getScreenCTM()!, length = path.getTotalLength();
      const screen = (distance: number) => { const p = path.getPointAtLength(distance); return new DOMPoint(p.x, p.y).matrixTransform(transform); };
      const boxes = [...document.querySelectorAll("[data-piece]")].map(node => node.getBoundingClientRect());
      let intersections = 0;
      for (let i = 1; i < 300; i++) {
        const p = screen(length * i / 300);
        if (boxes.some(b => p.x > b.left + 2 && p.x < b.right - 2 && p.y > b.top + 2 && p.y < b.bottom - 2)) intersections++;
      }
      const out = document.querySelector('[aria-label="Sensor reading output"]')!.getBoundingClientRect();
      const input = document.querySelector('[data-input-piece="output"] span')!.getBoundingClientRect();
      return { intersections, startError: Math.hypot(screen(0).x - out.x - out.width / 2, screen(0).y - out.y - out.height / 2), endError: Math.hypot(screen(length).x - input.x - input.width / 2, screen(length).y - input.y - input.height / 2) };
    });
    await expect.poll(async () => (await check()).intersections).toBe(0);
    const geometry = await check();
    expect(geometry.startError).toBeLessThan(2); expect(geometry.endError).toBeLessThan(2);
    const wire = page.getByTestId("connection-path");
    const reachablePoint = await wire.evaluate(element => {
      const path = element as SVGPathElement, hit = path.parentElement!.querySelector('[role="button"]');
      // The geometric midpoint can lie behind the sticky navigation or outside
      // the scrolled viewport. Click a segment the learner can actually reach.
      const fractions = [0.5, ...Array.from({ length: 19 }, (_, index) => [(19 - index) / 40, (21 + index) / 40]).flat()];
      for (const fraction of fractions) {
        const point = path.getPointAtLength(path.getTotalLength() * fraction);
        const screen = new DOMPoint(point.x, point.y).matrixTransform(path.getScreenCTM()!);
        if (document.elementFromPoint(screen.x, screen.y) === hit) return { x: screen.x, y: screen.y };
      }
      throw Error("No reachable wire segment is visible in the construction viewport");
    });
    await page.mouse.click(reachablePoint.x, reachablePoint.y);
    await expect(page.getByRole("button", { name: /Select connection 1:/ })).toHaveAttribute("aria-pressed", "true");
    await expect(wire).toHaveCount(1);
    await page.getByRole("button", { name: "Remove this connection", exact: true }).click();
    await expect(wire).toHaveCount(0);
  });
}
