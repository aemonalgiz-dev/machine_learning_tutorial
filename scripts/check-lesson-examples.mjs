import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadPyodide } from "pyodide";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let lessons = JSON.parse(await readFile(path.join(root, "lib/lessons/published.json"), "utf8"));
const supplements = JSON.parse(await readFile(path.join(root, 'lib/lessons/supplements.json'), 'utf8'));
lessons.push(...Object.entries(supplements).map(([id, lesson]) => ({ id, quiz: [], ...lesson })));
const filter = process.argv[2];
if (filter) lessons = lessons.filter(lesson => lesson.id.includes(filter));
const examples = lessons.flatMap(lesson => lesson.parts.flatMap(part =>
  (part.examples ?? []).map(example => ({ lesson: lesson.id, ...example }))));
const quizSetups = lessons.flatMap(lesson => lesson.quiz.filter(question => question.given?.code)
  .map(question => ({ lesson: lesson.id, title: question.prompt, code: question.given.code })));
for (const lesson of lessons) for (const checkpoint of [...(lesson.checkpoints ?? []), ...(lesson.checkpoint ? [lesson.checkpoint] : [])]) {
  quizSetups.push(...checkpoint.questions.filter(question => question.given?.code).map(question => ({ lesson: lesson.id, title: question.prompt, code: question.given.code })));
}
if (!examples.length) throw Error("No worked examples found. Generate the curriculum first.");
const cache = path.join(root, ".practice-checks");
await mkdir(cache, { recursive: true });
const python = await loadPyodide({
  packageBaseUrl: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
  packageCacheDir: cache,
});
await python.loadPackage("numpy");
python.runPython(`
import contextlib
import io
import json
import traceback

def check_lesson_example(code):
    output = io.StringIO()
    warnings = io.StringIO()
    error = None
    try:
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(warnings):
            exec(compile(code, "<lesson-example>", "exec"), {"__name__": "__main__"})
    except Exception:
        error = traceback.format_exc()
    return json.dumps({"output": output.getvalue(), "warnings": warnings.getvalue(), "error": error})
`);
const run = python.globals.get("check_lesson_example");
python.runPython(await readFile(path.join(root, "public/python/sql_runner.py"), "utf8"));
const runSql = python.globals.get("run_course_sql");
let failures = 0;
let quizFailures = 0;
try {
  for (const example of examples) {
    const sqlResult = example.language === "sql" ? JSON.parse(runSql(example.code, example.setup)) : undefined;
    const result = sqlResult ? { output: sqlResult.stdout, warnings: sqlResult.stderr, error: sqlResult.error } : JSON.parse(run(example.code));
    const passed = !result.error && !result.warnings && (example.language === "sql"
      ? JSON.stringify(JSON.parse(result.output)) === JSON.stringify(JSON.parse(example.output))
      : result.output.trimEnd() === example.output.trimEnd());
    console.log(`${passed ? "PASS" : "FAIL"} ${example.lesson}: ${example.title}`);
    if (!passed) {
      failures++;
      console.error(result.error || result.warnings || JSON.stringify({ expected: example.output, received: result.output }));
    }
  }
  for (const setup of quizSetups) {
    const result = JSON.parse(run(setup.code));
    if (result.error || result.warnings) {
      quizFailures++;
      console.error(`FAIL quiz setup ${setup.lesson}: ${setup.title}\n${result.error || result.warnings}`);
    }
  }
} finally { run.destroy(); runSql.destroy(); }
console.log(`${examples.length - failures}/${examples.length} worked examples match their displayed output in the browser runtime.`);
console.log(`${quizSetups.length - quizFailures}/${quizSetups.length} question setups execute independently without errors.`);
process.exitCode = failures || quizFailures ? 1 : 0;
