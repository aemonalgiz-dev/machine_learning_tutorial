import { mockAccountBackend, accountBackendFor, waitForAccountReady, waitForAccountSync } from "./helpers/account-backend";
import { expect, test } from "@playwright/test";
import { assemble } from "../lib/builds/engine";
import { DELIVERY_PREDICTOR_BUILD, DELIVERY_STAGES } from "../lib/builds/regression-journey";
import { TOOLS } from "../lib/builds/tools";

test.beforeEach(async ({ page }) => { await mockAccountBackend(page); });

test("regression opens on one problem brief with its reference material available on demand", async ({ page }) => {
  await page.goto("/lab/simple-linear-regression"); await waitForAccountReady(page);
  const journey = page.getByTestId("regression-journey");
  const reference = journey.getByTestId("delivery-reference");
  await expect(reference).not.toHaveAttribute("open");
  await expect(journey.getByTestId("journey-connections")).not.toBeVisible();
  await expect(journey.getByRole("link", { name: "How to place and connect pieces", exact: true })).not.toBeVisible();
  await expect(journey.getByRole("heading", { name: "How long should we tell the customer?", exact: true })).toBeVisible();
  await expect(journey.getByRole("heading", { name: DELIVERY_PREDICTOR_BUILD.title, exact: true })).toHaveCount(0);
  await expect(journey.getByText(DELIVERY_PREDICTOR_BUILD.problem, { exact: true })).toHaveCount(0);
  await expect(journey.getByText(DELIVERY_PREDICTOR_BUILD.challenge, { exact: true })).toHaveCount(0);
  await expect(journey.locator('[data-testid="construction-floor"]:visible')).toHaveCount(1);
  await expect(journey.getByRole("button", { name: "Test all examples", exact: true })).toBeVisible();

  await reference.locator(":scope > summary").click();
  await expect(journey.getByTestId("journey-connections")).toBeVisible();
  await expect(journey.getByRole("link", { name: "How to place and connect pieces", exact: true })).toBeVisible();
  const history = reference.locator("details").filter({ has: page.locator("summary", { hasText: "Where this fitting problem came from" }) });
  await history.locator(":scope > summary").click();
  await expect(history.getByRole("heading")).toBeVisible();
  await expect(history.getByRole("link").first()).toBeVisible();
  await expect(reference.locator("summary", { hasText: "Build the historical fitting calculation" })).toBeVisible();
  await reference.locator(":scope > summary").click();

  await journey.locator("summary", { hasText: "Name this dispatch machine" }).click();
  await journey.getByRole("textbox", { name: "Name your machine", exact: true }).fill("Neighbourhood dispatch");
  await waitForAccountSync(page); await page.reload(); await waitForAccountReady(page);
  await expect(reference).not.toHaveAttribute("open");
  await journey.locator("summary", { hasText: "Name this dispatch machine" }).click();
  await expect(journey.getByRole("textbox", { name: "Name your machine", exact: true })).toHaveValue("Neighbourhood dispatch");
});

test("compact stage navigation keeps dispatch constants directly editable on a narrow page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  accountBackendFor(page).seed("workshop:regression-delivery-rule:v1", { graph: assemble(DELIVERY_PREDICTOR_BUILD.recipe, TOOLS), attemptId: "layout-fixture", undo: [], redo: [], caseIndex: 0, results: {}, tested: {}, customData: null, prediction: "", hintsShown: 0, example: false, animate: false, zoom: .75 });
  await page.goto("/lab/simple-linear-regression"); await waitForAccountReady(page);
  const stages = page.getByRole("navigation", { name: "Delivery journey stages" });
  await expect(stages.getByRole("button")).toHaveCount(DELIVERY_STAGES.length);
  await stages.getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await expect(stages.getByRole("button", { name: "Measure the mistakes", exact: true })).toHaveAttribute("aria-current", "step");
  const constant = page.getByRole("spinbutton", { name: "Dispatch constant 2", exact: true });
  await expect(constant).toBeVisible();
  await constant.fill("9");
  const dispatch = page.getByRole("region", { name: "Promises from your current machine", exact: true });
  await dispatch.getByRole("button", { name: "Run dispatch batch", exact: true }).click();
  await expect(dispatch.getByRole("button", { name: /Order 1 · 1 km/ })).toContainText("Promised: 11 min");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
