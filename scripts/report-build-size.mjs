import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MIB = 1024 * 1024;
export const AMPLIFY_LIMIT_BYTES = 220 * MIB;
const rounded = number => Number(number.toFixed(2));

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : entry.isFile() ? [filename] : [];
  }))).flat();
}

export async function collectBuildSizes(root) {
  const build = path.join(root, ".next");
  try { await stat(path.join(build, "BUILD_ID")); }
  catch (error) {
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
  const runtimePackages = {};
  const runtimeFiles = [];
  for (const [label, files] of Object.entries(categories)) {
    const sizes = await Promise.all([...files].map(async filename => {
      let size;
      try { size = (await stat(filename)).size; }
      catch (error) { if (error.code !== "ENOENT") throw error; missingFiles++; return 0; }
      if (label === "Additional traced runtime files") {
        const relative = path.relative(root, filename).replaceAll("\\", "/");
        const packagePath = relative.split("node_modules/").at(-1);
        const packageName = relative.includes("node_modules/")
          ? packagePath.split("/").slice(0, packagePath.startsWith("@") ? 2 : 1).join("/")
          : "(project files)";
        runtimePackages[packageName] = (runtimePackages[packageName] ?? 0) + size;
        runtimeFiles.push({ file: relative, bytes: size });
      }
      return size;
    }));
    bytes[label] = sizes.reduce((sum, size) => sum + size, 0);
  }
  const total = Object.values(bytes).reduce((sum, size) => sum + size, 0);
  return {
    bytes,
    totalBytes: total,
    totalMiB: rounded(total / MIB),
    totalMB: rounded(total / 1_000_000),
    missingTracedFiles: missingFiles,
    tracedRuntimePackages: Object.entries(runtimePackages).sort((a, b) => b[1] - a[1]).map(([name, size]) => ({ name, bytes: size, MiB: rounded(size / MIB) })),
    largestTracedFiles: runtimeFiles.sort((a, b) => b.bytes - a.bytes).slice(0, 12),
  };
}

export function enforceBuildBudget(report, limitBytes) {
  if (!Number.isFinite(limitBytes) || limitBytes <= 0 || limitBytes > AMPLIFY_LIMIT_BYTES) {
    throw new Error("The deployment budget must be above zero and at most 220 MiB.");
  }
  if (report.missingTracedFiles) {
    throw new Error(report.missingTracedFiles + " traced files are missing; this deployment estimate is incomplete.");
  }
  if (report.totalBytes > limitBytes) {
    throw new Error("Deployment inputs exceed the " + rounded(limitBytes / MIB) + " MiB budget by " + rounded((report.totalBytes - limitBytes) / MIB) + " MiB. Inspect the runtime-package breakdown before deploying.");
  }
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const maxArg = process.argv.find(arg => arg.startsWith("--max-mib="));
  const limitBytes = maxArg ? Number(maxArg.split("=")[1]) * MIB : AMPLIFY_LIMIT_BYTES;
  const report = await collectBuildSizes(root);
  const limits = { budgetMiB: limitBytes / MIB, amplifyLimitMiB: 220, amplifyLimitBytes: AMPLIFY_LIMIT_BYTES };
  if (process.argv.includes("--json")) console.log(JSON.stringify({ ...report, ...limits }, null, 2));
  else {
    console.log("\nProduction deployment inputs (1 MiB = 1,048,576 bytes):");
    for (const [label, size] of Object.entries(report.bytes)) console.log("  " + label + ": " + rounded(size / MIB) + " MiB");
    console.log("  Total: " + report.totalMiB + " MiB (" + report.totalMB + " MB; " + report.totalBytes + " bytes)");
    console.log("  Build budget: " + limits.budgetMiB + " MiB. Amplify hard limit: 220 MiB (" + AMPLIFY_LIMIT_BYTES + " bytes).");
    console.log("Traced runtime packages (deduplicated):");
    for (const entry of report.tracedRuntimePackages) console.log("  " + entry.name + ": " + entry.MiB + " MiB");
    console.log("Excludes development output, caches and unused dependencies. Amplify's packaged artifact is the final size; Linux and Windows native dependencies differ.");
  }
  enforceBuildBudget(report, limitBytes);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
