import { defineConfig } from "@playwright/test";

// HTTP contracts only. These tests do not start a browser or the Next dev server.
export default defineConfig({
  testDir: "./tests",
  testMatch: ["backend-integration.spec.ts", "accounts-proxy.spec.ts", "account-runtime.spec.ts"],
  workers: 1,
  timeout: 60_000,
  reporter: "line",
});
