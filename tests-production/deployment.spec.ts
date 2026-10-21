import { test, expect } from "@playwright/test";
import { expandedLessons } from "../lib/lessons";
import { buildById } from "../lib/builds/catalog";
import { openFullWorkshop } from "../tests/helpers/open-workshop";

test("published agent, model evaluation and database lessons survive the production build", async ({ request }) => {
  test.setTimeout(180_000);
  for (const lesson of expandedLessons.filter(lesson => ["Agents", "Prompting, Evaluation and Iteration", "Evaluating and Improving Models", "SQL", "NoSQL", "Graph Databases"].includes(lesson.section))) {
    const response = await request.get(`/concepts/${lesson.id}`);
    expect(response.status(), lesson.id).toBe(200);
    expect(await response.text(), lesson.id).toContain(lesson.id);
  }
});

test("authored lesson pages cache on first visit and unknown lesson IDs stay missing", async ({ request }) => {
  for (const id of ["agent-prompts", "sql-tables", "nosql-documents", "graph-pattern-matching"]) {
    const first = await request.get(`/concepts/${id}`);
    expect(first.status(), id).toBe(200);
    expect(await first.text(), id).toContain("Botie");
    const repeated = await request.get(`/concepts/${id}`);
    expect(repeated.status(), id).toBe(200);
    expect(repeated.headers()["x-nextjs-cache"], id).toBe("HIT");
  }
  for (const id of ["does-not-exist", "constructor", "__proto__"]) {
    expect((await request.get(`/concepts/${id}`)).status(), id).toBe(404);
  }
});

test("workshops generate and cache, while old and invalid addresses retain their behavior", async ({ request }) => {
  for (const id of ["linear-algebra", "agent-langfuse", "agent-prompts", "agent-authorization", "agent-resource-budgets", "sql-left-joins", "sql-transactions", "nosql-conflicts", "graph-traversal-cycles"]) {
    const first = await request.get(`/lab/${id}`);
    expect(first.status(), id).toBe(200);
    expect(await first.text()).toContain("Full workspace and earlier draft");
    const repeated = await request.get(`/lab/${id}`);
    expect(repeated.status(), id).toBe(200);
    expect(repeated.headers()["x-nextjs-cache"], id).toBe("HIT");
  }
  for (const id of ["does-not-exist", "constructor"]) {
    expect((await request.get(`/lab/${id}`)).status(), id).toBe(404);
  }
  // Check the very first response too: a cached page-level redirect can hide
  // duplicate Location headers produced during first-visit static generation.
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await request.get("/lab/neurons-and-activations", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe("/lab/neuron");
  }
});

test("the retained image runtime serves an optimized banner", async ({ request }) => {
  const response = await request.get("/_next/image?url=%2Fbranding%2Ffitlab-banner.png&w=640&q=75", {
    headers: { Accept: "image/webp" },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/webp");
  expect((await response.body()).byteLength).toBeGreaterThan(1000);
});

test("a cached workshop still hydrates and tests the learner's construction", async ({ page }) => {
  await openFullWorkshop(page, "agent-langfuse");
  await page.getByRole("checkbox", { name: "Animate signals", exact: true }).uncheck();
  await page.getByText("Stuck? Inspect a worked construction", { exact: true }).click();
  await page.getByRole("button", { name: "Assemble an example", exact: true }).click();
  await page.getByRole("button", { name: "Test all examples", exact: true }).click();
  await expect(page.getByText(`${buildById["agent-langfuse"].cases.length} passed`, { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId("connection-path").first()).toBeAttached();
});
