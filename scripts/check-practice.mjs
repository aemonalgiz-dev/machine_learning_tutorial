import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPyodide } from "pyodide";
import { collectExercises, websiteRoot } from "./collect-exercises.mjs";
import { browserOutput, exerciseSignature } from "../lib/practice-fixtures.mjs";

const directory = path.join(websiteRoot, ".practice-checks");
await mkdir(directory, { recursive: true });
const python = await loadPyodide({
  packageBaseUrl: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
  packageCacheDir: directory,
});
await python.loadPackage(["numpy", "scipy", "pydantic"]);
python.unpackArchive(new Uint8Array(await readFile(path.join(websiteRoot, "public/python/oop-ml.zip"))), "zip", { extractDir: "/home/pyodide/course-sdk" });
python.runPython('import sys\nsys.path.insert(0, "/home/pyodide/course-sdk")\nimport oop_ml');
python.runPython(await readFile(path.join(websiteRoot, "public/python/runner.py"), "utf8"));
const run = python.globals.get("run_course_code");
const report = [];
const record = process.argv.includes("--record");
const filter = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
if (record && filter) throw Error("Record the complete course so no old fixture survives by mistake.");
const fixtures = JSON.parse(await readFile(path.join(websiteRoot, "lib/practice-fixtures.json"), "utf8"));
const outputs = {};
for (const lesson of await collectExercises()) {
  if (filter && !lesson.path.includes(filter)) continue;
  for (const exercise of lesson.exercises) {
    const expected = record ? exercise.output : browserOutput(exercise, fixtures);
    const result = JSON.parse(run(exercise.solution, expected));
    const comparison = { passed: result.tests.every((test) => test.status === "passed") };
    if (record && !result.error && result.stdout.trimEnd() !== exercise.output.trimEnd()) {
      outputs[exercise.title] = { signature: exerciseSignature(exercise), output: result.stdout.trimEnd() };
    }
    report.push({ path: lesson.path, title: exercise.title, expected: exercise.output, ...result, ...comparison });
    console.log(`${result.error || !comparison.passed ? "FAIL" : "PASS"} ${lesson.path}: ${exercise.title} (${result.elapsed}ms)${result.error ? " " + result.error.split("\n").at(-1) : ""}`);
    await writeFile(path.join(directory, "report.json"), JSON.stringify(report, null, 2));
  }
}
run.destroy();
if (record && report.every((entry) => !entry.error)) {
  const manifest = JSON.parse(await readFile(path.join(websiteRoot, "public/python/sdk-manifest.json"), "utf8"));
  await writeFile(path.join(websiteRoot, "lib/practice-fixtures.json"), JSON.stringify({ runtime: "314.0.7", sdk: manifest.sha256, outputs }, null, 2) + "\n");
  console.log(`Recorded ${Object.keys(outputs).length} browser-specific outputs. Run the checks again to validate them.`);
}
const failures = report.filter((result) => result.error || !result.passed);
console.log(`${report.length - failures.length}/${report.length} reference solutions passed in browser Python.`);
process.exitCode = (record ? report.some((entry) => entry.error) : failures.length > 0) ? 1 : 0;
