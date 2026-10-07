import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { strToU8, zipSync } from "fflate";

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(websiteRoot, "public", "python");
const sourceDirectory = path.resolve(process.env.OOP_ML_SOURCE ?? path.join(websiteRoot, "..", "oop_ml"));
const archive = {};
async function gather(directory, relative) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  for (const entry of entries) {
    const name = `${relative}/${entry.name}`;
    if (entry.isDirectory() && entry.name !== "__pycache__") {
      await gather(path.join(directory, entry.name), name);
    } else if (entry.isFile() && (entry.name.endsWith(".py") || entry.name === "py.typed")) {
      await include(path.join(directory, entry.name), name);
    }
  }
}
async function include(filename, name) {
  // ZIP stores a local calendar time. Fixed local components produce identical
  // archives regardless of the builder's timezone.
  archive[name] = [strToU8((await readFile(filename, "utf8")).replaceAll("\r\n", "\n")), { mtime: new Date(2025, 0, 1, 0, 0, 0) }];
}

let sourceAvailable = true;
try { await readdir(sourceDirectory); } catch (error) {
  if (error.code !== "ENOENT") throw error;
  sourceAvailable = false;
}
if (sourceAvailable) {
  // oop_ml's public imports require both of these packages. The optional
  // scikit and pytorch backends, API, tests, data and git metadata stay out.
  await include(path.join(sourceDirectory, "__init__.py"), "oop_ml/__init__.py");
  await include(path.join(sourceDirectory, "py.typed"), "oop_ml/py.typed");
  await gather(path.join(sourceDirectory, "core"), "oop_ml/core");
  await gather(path.join(sourceDirectory, "numpy"), "oop_ml/numpy");
  await include(path.join(sourceDirectory, "..", "LICENSE"), "OOP_ML_LICENSE");
  const bytes = zipSync(archive, { level: 9 });
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(outputDirectory, "oop-ml.zip"), bytes);
  await writeFile(path.join(outputDirectory, "sdk-manifest.json"), JSON.stringify({ sha256, files: Object.keys(archive).length }, null, 2) + "\n");
  console.log(`Bundled ${Object.keys(archive).length} core/NumPy SDK files (${bytes.length} bytes).`);
} else {
  // A website-only checkout or Docker build uses the checked-in snapshot.
  const bytes = await readFile(path.join(outputDirectory, "oop-ml.zip"));
  const manifest = JSON.parse(await readFile(path.join(outputDirectory, "sdk-manifest.json"), "utf8"));
  if (createHash("sha256").update(bytes).digest("hex") !== manifest.sha256) throw new Error("SDK snapshot does not match its manifest. Run npm run prepare:python beside the SDK.");
  console.log("Using the checked-in SDK snapshot.");
}
