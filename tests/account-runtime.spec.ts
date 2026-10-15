import { test, expect } from "@playwright/test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Keep this build script in Node's native ESM loader. Playwright otherwise
// transforms .mjs through this repository's CommonJS test configuration.
const loadRuntime = new Function("filename", "return import(filename)") as
  (filename: string) => Promise<typeof import("../scripts/prepare-account-runtime.mjs")>;
let runtime: Awaited<ReturnType<typeof loadRuntime>>;
test.beforeAll(async () => {
  runtime = await loadRuntime(pathToFileURL(path.resolve("scripts/prepare-account-runtime.mjs")).href);
});

test("account runtime preparation replaces stale values and preserves unrelated dotenv contents", () => {
  const { accountRuntimeEnvironment } = runtime;
  const unrelated = '# App settings\r\nOTHER="unchanged"\r\nMULTILINE="first\r\nOOP_ML_ACCOUNTS_URL=inside-the-value\r\nlast"\r\n';
  const existing = unrelated + 'OOP_ML_ACCOUNTS_URL="https://old.example.test"\r\nexport OOP_ML_ACCOUNTS_URL = https://duplicate.example.test\r\n';
  const prepared = accountRuntimeEnvironment(existing, "https://accounts.example.test/");
  expect(prepared).toBe(unrelated + 'OOP_ML_ACCOUNTS_URL="https://accounts.example.test"\r\n');
  expect(accountRuntimeEnvironment(prepared, undefined)).toBe(unrelated + 'OOP_ML_ACCOUNTS_URL=""\r\n');
  expect(accountRuntimeEnvironment(prepared, "https://accounts.example.test")).toBe(prepared);
});

test("account runtime rejects unsafe production URLs and permits loopback HTTP only for development", () => {
  const { accountRuntimeUrl, accountRuntimeEnvironment } = runtime;
  for (const url of ["http://localhost:8001", "http://accounts.example.test", "ftp://accounts.example.test",
    "https://name:password@accounts.example.test", "https://accounts.example.test?token=secret",
    "https://accounts.example.test#fragment", "https://accounts.example.test\nOTHER=value", "https://accounts.example.test\\path"]) {
    expect(() => accountRuntimeUrl(url)).toThrow(/HTTPS service URL/);
  }
  expect(accountRuntimeUrl(" http://localhost:8001/ ", "development")).toBe("http://localhost:8001");
  expect(accountRuntimeUrl("http://127.0.0.1:8001", "development")).toBe("http://127.0.0.1:8001");
  expect(accountRuntimeUrl("http://[::1]:8001", "development")).toBe("http://[::1]:8001");
  expect(() => accountRuntimeUrl("http://accounts.example.test", "development")).toThrow();
  expect(accountRuntimeEnvironment("", "https://accounts.example.test/$version")).toBe('OOP_ML_ACCOUNTS_URL="https://accounts.example.test/\\$version"\n');
});

test("account runtime writes only its allowlisted URL and keeps the original file on invalid configuration", async () => {
  const { prepareAccountRuntime } = runtime;
  const directory = await mkdtemp(path.join(os.tmpdir(), "fitlab-account-runtime-"));
  const filename = path.join(directory, ".env.production");
  try {
    await writeFile(filename, "UNRELATED=keep-me\n");
    await prepareAccountRuntime(filename, { OOP_ML_ACCOUNTS_URL: "https://accounts.example.test", DATABASE_URL: "must-not-be-copied", SESSION_SECRET: "must-not-be-copied" });
    const valid = await readFile(filename, "utf8");
    expect(valid).toBe('UNRELATED=keep-me\nOOP_ML_ACCOUNTS_URL="https://accounts.example.test"\n');
    await expect(prepareAccountRuntime(filename, { OOP_ML_ACCOUNTS_URL: "http://localhost:8001" })).rejects.toThrow();
    expect(await readFile(filename, "utf8")).toBe(valid);
    await prepareAccountRuntime(filename, {});
    expect(await readFile(filename, "utf8")).toBe('UNRELATED=keep-me\nOOP_ML_ACCOUNTS_URL=""\n');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
