import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifiedImageRuntime } from "./native-image-runtime.mjs";

const require = createRequire(import.meta.url);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : entry.isFile() ? [filename] : [];
  }))).flat();
}

export async function completeNativeServerTrace(traceFile, nativeFiles, excludedPackages) {
  const trace = JSON.parse(await readFile(traceFile, "utf8"));
  const directory = path.dirname(traceFile);
  for (const relative of trace.files) {
    const absolute = path.resolve(directory, relative).replaceAll("\\", "/");
    if (excludedPackages.some(name => absolute.includes(`/node_modules/${name}/`))) {
      throw new Error(`Unused Sharp package remains in the Next server trace: ${relative}. Check outputFileTracingExcludes before deploying.`);
    }
  }
  const files = new Set(trace.files.map(file => file.replaceAll("\\", "/")));
  for (const file of nativeFiles) files.add(path.relative(directory, file).replaceAll("\\", "/"));
  await writeFile(traceFile, JSON.stringify({ ...trace, files: [...files] }));
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const policy = await verifiedImageRuntime();
  const sharpRequire = createRequire(require.resolve("sharp"));
  const nativeFiles = (await Promise.all(policy.keptPackages.map(name => {
    const packageDirectory = path.dirname(sharpRequire.resolve(`${name}/package`));
    return filesIn(packageDirectory);
  }))).flat();
  await completeNativeServerTrace(path.join(root, ".next", "next-server.js.nft.json"), nativeFiles, policy.excludedPackages);
  console.log(`Image server trace verified: ${policy.runtime}, ${nativeFiles.length} native package files retained.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
