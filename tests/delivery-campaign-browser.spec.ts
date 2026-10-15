import { expect, test, type Page } from "@playwright/test";

async function loadWorkedMachine(page: Page) {
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByTestId("construction-counter").filter({ visible: true })).toHaveText("4 passed · 0 failed · 0 not run");
}

test("delivery campaign carries real machines, withholds outcomes, and retains attempt-specific evidence", async ({ page }, testInfo) => {
  await page.goto("/lab/simple-linear-regression");
  const stages = page.getByRole("navigation", { name: "Delivery journey stages" });
  await stages.getByRole("button", { name: "Keep the service running", exact: true }).click();
  await expect(page.getByTestId("delivery-campaign")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fit and dispatch this batch", exact: true })).toBeDisabled();
  await expect(page.getByText("Build and connect your distance machine in the first stage to dispatch these deliveries.", { exact: true })).toBeVisible();

  await stages.getByRole("button", { name: "Estimate a delivery", exact: true }).click();
  await loadWorkedMachine(page);
  await stages.getByRole("button", { name: "Measure the mistakes", exact: true }).click();
  await loadWorkedMachine(page);
  await stages.getByRole("button", { name: "Keep the service running", exact: true }).click();
  await expect(page.getByTestId("campaign-installed-promise")).toHaveText("12 min");
  await expect(page.getByText("Your tested error checker will calculate the batch scores in min.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("campaign-report")).toHaveCount(0);
  await page.getByRole("radio", { name: "Include distance squared Fit an extra correction that can change more quickly on longer routes.", exact: true }).check();
  await page.getByRole("radio", { name: "Decrease", exact: true }).check();
  await page.getByRole("button", { name: "Fit and dispatch this batch", exact: true }).click();
  await expect(page.getByTestId("campaign-score")).toHaveText("0 min");
  await expect(page.getByText(/Your saved error checker calculated these scores/)).toBeVisible();
  await page.getByRole("button", { name: "Order 5 5.5 km", exact: true }).click();
  await expect(page.getByText("Follow Order 5 through the installed machine", { exact: true })).toBeVisible();
  await expect(page.getByText("installed promise: 17 min", { exact: false })).toBeVisible();
  await page.getByText("Include distance squared: inspect the block", { exact: true }).click();
  await page.getByRole("textbox", { name: "Name this correction", exact: true }).fill("Long-route adjustment");
  await page.getByText("Follow the batch through your saved error checker", { exact: true }).click();
  await expect(page.getByText(/^Batch score: 0.*0$/)).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("campaign-score")).toHaveText("0 min");
  await expect(page.getByText("Long-route adjustment: inspect the block", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Try another decision on these records", exact: true }).click();
  await expect(page.getByTestId("campaign-report")).toHaveCount(0);
  await page.getByRole("radio", { name: "Fit a straight correction Allow a fixed adjustment and an adjustment per kilometre.", exact: true }).check();
  await page.getByRole("radio", { name: "Decrease", exact: true }).check();
  await page.getByRole("button", { name: "Fit and dispatch this batch", exact: true }).click();
  await expect(page.getByText(/You had already seen these records' outcomes/)).toBeVisible();
  await page.getByRole("button", { name: "Try a fresh batch without the earlier answers", exact: true }).click();
  await expect(page.getByTestId("campaign-report")).toHaveCount(0);

  const missions = page.getByRole("navigation", { name: "Delivery missions" });
  await missions.getByRole("button", { name: "A record disagrees with the dispatch log", exact: true }).click();
  await page.getByRole("button", { name: "Inspect the dispatch evidence", exact: true }).click();
  await expect(page.getByTestId("dispatch-evidence")).toContainText("conversion error");
  await page.getByRole("radio", { name: "Replace it with 12.5 minutes Use the ordinary-route duration instead of the value in the imported record.", exact: true }).check();
  await page.getByRole("radio", { name: "Decrease", exact: true }).check();
  await page.getByRole("button", { name: "Fit and dispatch this batch", exact: true }).click();
  await expect(page.getByText(/Corrected a record using its source evidence/).first()).toBeVisible();
  await expect(page.getByTestId("campaign-score")).toHaveText("0 min");

  await page.setViewportSize({ width: 390, height: 844 });
  await missions.getByRole("button", { name: "The same distance, a different arrival", exact: true }).click();
  await page.getByRole("radio", { name: "Add the neighborhood input Fit one distance correction plus a separate Hilltop adjustment. Riverside is the reference neighborhood.", exact: true }).check();
  await page.getByRole("combobox", { name: "Address neighborhood", exact: true }).selectOption("Hilltop");
  await expect(page.getByTestId("campaign-installed-promise")).toHaveText("12 min");
  await page.getByRole("radio", { name: "Decrease", exact: true }).check();
  await page.getByRole("button", { name: "Fit and dispatch this batch", exact: true }).click();
  await expect(page.getByTestId("campaign-score")).toHaveText("0 min");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByText("Add the neighborhood input: inspect the block", { exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("campaign-mobile.png"), fullPage: false });
});
