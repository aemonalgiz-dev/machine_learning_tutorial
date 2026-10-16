import { test, expect } from "@playwright/test";

const pages = ["/backend/docs", "/backend/docs/oauth2-redirect", "/backend/redoc"];

for (const page of pages) {
  test(`${page} is answered here and never proxied to the compute API`, async ({ request }) => {
    const response = await request.get(page, { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(await response.text()).toBe("");
  });
}

test("the rest of the compute API is still proxied", async ({ request }) => {
  const response = await request.get("/backend/openapi.json");
  expect(response.status()).not.toBe(404);
});
