import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-production",
  outputDir: "./test-results/production",
  workers: 1,
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
