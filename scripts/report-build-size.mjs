import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const build = path.join(root, ".next");

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : entry.isFile() ? [filename] : [];
  }))).flat();
}

try {
  await stat(path.join(build, "BUILD_ID"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  throw new Error("Run npm run build before measuring the production output.");
}

const server = await filesIn(path.join(build, "server"));
const staticFiles = await filesIn(path.join(build, "static"));
const publicFiles = await filesIn(path.join(root, "public"));
const manifests = (await readdir(build)).filter(name => name.endsWith(".json") || name === "BUILD_ID").map(name => path.join(build, name));
const categories = {
  "Next server and prerendered pages": new Set(server),
  "Browser JavaScript, CSS and fonts": new Set(staticFiles),
  "Public assets, including Python": new Set(publicFiles),
  "Build manifests": new Set(manifests),
  "Additional traced runtime files": new Set(),
};
const included = new Set([...server, ...staticFiles, ...publicFiles, ...manifests]);
const traceFiles = [...server.filter(filename => filename.endsWith(".nft.json")), path.join(build, "next-server.js.nft.json")];
for (const trace of traceFiles) {
  const { files = [] } = JSON.parse(await readFile(trace, "utf8"));
  for (const relative of files) {
    const filename = path.resolve(path.dirname(trace), relative);
    if (!included.has(filename)) {
      categories["Additional traced runtime files"].add(filename);
      included.add(filename);
    }
  }
}

let missingFiles = 0;
const bytes = {};
for (const [label, files] of Object.entries(categories)) {
  const sizes = await Promise.all([...files].map(async filename => {
    try { return (await stat(filename)).size; }
    catch (error) { if (error.code !== "ENOENT") throw error; missingFiles++; return 0; }
  }));
  bytes[label] = sizes.reduce((sum, size) => sum + size, 0);
}
const total = Object.values(bytes).reduce((sum, size) => sum + size, 0);
const mib = size => Number((size / 1024 / 1024).toFixed(2));
const report = { bytes, totalBytes: total, totalMiB: mib(total), missingTracedFiles: missingFiles };
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("\nProduction deployment inputs (MiB):");
  for (const [label, size] of Object.entries(bytes)) console.log(`  ${label}: ${mib(size)}`);
  console.log(`  Total: ${mib(total)} MiB`);
  console.log("Excludes development output, caches and unused dependencies. Amplify's packaged artifact is the final size.");
  if (missingFiles) console.log(`${missingFiles} traced files were absent and could not be counted.`);
}
