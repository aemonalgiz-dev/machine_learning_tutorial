import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDirectory = path.join(websiteRoot, "public", "python", "runtime");
const packageDirectory = path.join(websiteRoot, "node_modules", "pyodide");
await mkdir(runtimeDirectory, { recursive: true });
for (const filename of ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]) {
  await copyFile(path.join(packageDirectory, filename), path.join(runtimeDirectory, filename));
}
console.log("Prepared the pinned browser Python runtime.");

await import("./bundle-sdk.mjs");

if (process.argv.includes("--verify")) {
  const manifest = JSON.parse(await readFile(path.join(websiteRoot, "public/python/sdk-manifest.json"), "utf8"));
  const fixtures = JSON.parse(await readFile(path.join(websiteRoot, "lib/practice-fixtures.json"), "utf8"));
  const runtime = JSON.parse(await readFile(path.join(packageDirectory, "package.json"), "utf8"));
  if (manifest.sha256 !== fixtures.sdk || runtime.version !== fixtures.runtime) {
    throw new Error("The Python runtime or SDK changed. Run npm run record:practice, review its output changes, then npm run test:practice before building.");
  }
}
