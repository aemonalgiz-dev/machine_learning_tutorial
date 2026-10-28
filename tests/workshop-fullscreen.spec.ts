import { mockAccountBackend, accountBackendFor, waitForAccountReady } from "./helpers/account-backend";
import { expect, test, type Locator } from "@playwright/test";
import { assemble } from "../lib/builds/engine";
import { DELIVERY_PREDICTOR_BUILD } from "../lib/builds/regression-journey";
import { TOOLS } from "../lib/builds/tools";

const bounds = async (locator: Locator) => {
  const rectangle = await locator.boundingBox();
  if (!rectangle) throw new Error("The workspace element is not visible.");
  return rectangle;
};
const floorScroll = (floor: Locator) => floor.evaluate(element => ({ left: element.scrollLeft, top: element.scrollTop }));

test.beforeEach(async ({ page }) => { await mockAccountBackend(page); });

test("expanded desktop workspace reaches every edge and gives its height to the floor and toolbox", async ({ page }) => {
  await page.goto("/lab/statistics"); await waitForAccountReady(page);
  const workshop = page.getByTestId("construction-workshop");
  const expand = workshop.getByRole("button", { name: "Expand floor", exact: true });
  await expand.scrollIntoViewIfNeeded();
  const initial = await page.evaluate(() => ({
    scroll: window.scrollY,
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
  }));
  await expand.click();
  const fullscreen = page.getByRole("dialog", { name: "Expanded workshop", exact: true });
  await expect(fullscreen).toBeVisible();
  const surface = await bounds(fullscreen), viewport = page.viewportSize()!;
  expect(surface.x).toBeCloseTo(0, 0);
  expect(surface.y).toBeCloseTo(0, 0);
  expect(surface.width).toBeCloseTo(viewport.width, 0);
  expect(surface.height).toBeCloseTo(viewport.height, 0);

  const floor = fullscreen.getByLabel("Construction floor", { exact: true });
  const toolbox = fullscreen.getByLabel("Construction toolbox", { exact: true });
  const floorBefore = await bounds(floor), shelf = await bounds(toolbox);
  expect(floorBefore.height).toBeGreaterThan(viewport.height * 0.8);
  expect(floorBefore.y + floorBefore.height).toBeCloseTo(viewport.height, 0);
  expect(shelf.y).toBeCloseTo(floorBefore.y, 0);
  expect(shelf.height).toBeCloseTo(floorBefore.height, 0);

  const detailsButton = fullscreen.getByRole("button", { name: "Workshop details", exact: true });
  await expect(detailsButton).toHaveAttribute("aria-expanded", "false");
  await detailsButton.click();
  const details = fullscreen.getByRole("complementary", { name: "Workshop details", exact: true });
  await expect(details).toBeVisible();
  await expect(details).toBeFocused();
  expect(await bounds(floor)).toEqual(floorBefore);
  await page.keyboard.press("Escape");
  await expect(details).not.toBeVisible();
  await expect(detailsButton).toBeFocused();
  await expect(fullscreen).toBeVisible();
  expect(await bounds(floor)).toEqual(floorBefore);

  expect(await page.evaluate(() => [getComputedStyle(document.body).overflow, getComputedStyle(document.documentElement).overflow].includes("hidden"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(fullscreen).toHaveCount(0);
  await expect(expand).toBeFocused();
  expect(await page.evaluate(() => ({ bodyOverflow: document.body.style.overflow, htmlOverflow: document.documentElement.style.overflow }))).toEqual({ bodyOverflow: initial.bodyOverflow, htmlOverflow: initial.htmlOverflow });
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(initial.scroll, 0);
});

test("expanding and opening details preserve the learner's layout, zoom, scroll and calculation", async ({ page }) => {
  const graph = assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS);
  graph.pieces = graph.pieces.map(piece => ({ ...piece, ...(
    piece.tool.startsWith("source:") ? { x: 80, y: 90 }
      : piece.tool === "constant" ? { x: 430, y: piece.settings.value === 2 ? 90 : 400 }
      : piece.tool === "multiply" ? { x: 800, y: 90 }
      : piece.tool === "add" ? { x: 1200, y: 220 }
      : { x: 2400, y: 1600 }
  ) }));
  accountBackendFor(page).seed("workshop:regression-delivery-rule:v1", { graph, attemptId: "fullscreen-fixture", undo: [], redo: [], caseIndex: 0, results: {}, tested: {}, customData: null, prediction: "", hintsShown: 0, example: false, animate: false, zoom: .75 });
  await page.goto("/lab/simple-linear-regression"); await waitForAccountReady(page);
  const workshop = page.getByTestId("construction-workshop").filter({ visible: true });
  const floor = workshop.getByLabel("Construction floor", { exact: true });
  await floor.evaluate(element => { element.scrollLeft = 123; element.scrollTop = 117; });
  const originalScroll = await floorScroll(floor);
  const scale = await workshop.getByTestId("construction-floor").evaluate(element => getComputedStyle(element).transform);
  const savedGraph = () => accountBackendFor(page).value<{ graph: typeof graph }>("workshop:regression-delivery-rule:v1")!.graph;
  expect(await savedGraph()).toEqual(graph);
  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  expect(await floorScroll(floor)).toEqual(originalScroll);
  expect(await workshop.getByTestId("construction-floor").evaluate(element => getComputedStyle(element).transform)).toBe(scale);
  expect(await savedGraph()).toEqual(graph);

  const details = workshop.getByRole("button", { name: "Workshop details", exact: true });
  await details.click();
  expect(await floorScroll(floor)).toEqual(originalScroll);
  await details.click();
  await workshop.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(workshop.getByTestId("construction-counter")).toHaveText("4 passed · 0 failed · 0 not run");
  expect(await savedGraph()).toEqual(graph);
  await workshop.getByRole("button", { name: "Return to lesson", exact: true }).click();
  expect(await floorScroll(floor)).toEqual(originalScroll);
  expect(await workshop.getByTestId("construction-floor").evaluate(element => getComputedStyle(element).transform)).toBe(scale);
  expect(await savedGraph()).toEqual(graph);
});

test("a narrow expanded workspace keeps the drawer usable without widening or shifting the canvas", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab/statistics"); await waitForAccountReady(page);
  const workshop = page.getByTestId("construction-workshop");
  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  const fullscreen = page.getByRole("dialog", { name: "Expanded workshop", exact: true });
  await expect(fullscreen).toBeVisible();
  await fullscreen.getByRole("button", { name: "Hide tools", exact: true }).click();
  const floor = fullscreen.getByLabel("Construction floor", { exact: true });
  const originalFloor = await bounds(floor);
  expect(originalFloor.width).toBeGreaterThan(350);
  await fullscreen.getByRole("button", { name: "Workshop details", exact: true }).click();
  const drawer = fullscreen.getByRole("complementary", { name: "Workshop details", exact: true });
  const rectangle = await bounds(drawer);
  expect(rectangle.x).toBeGreaterThanOrEqual(0);
  expect(rectangle.x + rectangle.width).toBeLessThanOrEqual(390);
  expect(await bounds(floor)).toEqual(originalFloor);
  await drawer.locator("summary", { hasText: /^Context for this challenge$/ }).click();
  await expect(drawer.getByTestId("construction-context")).toContainText("invented weekly death counts");
  await drawer.locator("summary", { hasText: /^Examples and results$/ }).click();
  await expect(drawer.getByText("Required result", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("workshop-fullscreen-mobile.png") });
  await fullscreen.getByRole("button", { name: "Workshop details", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await fullscreen.getByRole("button", { name: "Show tools", exact: true }).click();
  await expect(fullscreen.getByRole("searchbox", { name: "Find a workshop tool", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await fullscreen.getByRole("button", { name: "Return to lesson", exact: true }).click();
  await expect(workshop.getByRole("button", { name: "Expand floor", exact: true })).toBeFocused();
});

test("a constructed customer-billing matrix has room to inspect in the expanded workspace", async ({ page }, testInfo) => {
  await page.goto("/lab/linear-algebra"); await waitForAccountReady(page);
  await page.getByRole("navigation", { name: "Journey stages", exact: true }).getByRole("button", { name: "Apply one price list to every customer", exact: true }).click();
  const workshop = page.getByTestId("construction-workshop");
  await workshop.locator("summary", { hasText: /^Stuck\? Inspect a worked construction$/ }).click();
  await workshop.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await workshop.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(workshop.getByTestId("construction-counter")).toContainText("0 failed · 0 not run");
  await workshop.getByRole("button", { name: "Expand floor", exact: true }).click();
  const fullscreen = page.getByRole("dialog", { name: "Expanded workshop", exact: true });
  await fullscreen.getByRole("button", { name: "Fit construction", exact: true }).click();
  await expect(fullscreen.getByRole("group", { name: "Result machine", exact: true }).getByTestId("component-value")).toBeInViewport();
  await expect(fullscreen.getByLabel("Construction floor", { exact: true })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("linear-algebra-fullscreen-desktop.png") });
});
