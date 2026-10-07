import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

export const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Read the literal exercise definitions without importing Next or rendering widgets.
export async function collectExercises() {
  const lessons = [];
  for (const area of ["concepts", "primers"]) {
    const directory = path.join(websiteRoot, "app", area);
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const filename = path.join(directory, entry.name, "page.tsx");
      const source = await readFile(filename, "utf8");
      const syntax = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const exercises = [];
      const visit = (node) => {
        if (ts.isCallExpression(node) && node.expression.getText(syntax) === "exercise") {
          const expression = ts.transpileModule(`result = ${node.getText(syntax)}`, {
            compilerOptions: { target: ts.ScriptTarget.ES2022 },
          }).outputText;
          const context = {
            exercise: (title, task, starter, solution, output, extras = {}) =>
              ({ title, task, starter, solution, output, ...extras }),
            numberCheck: (prompt, answer, tolerance, because) => ({ prompt, answer, tolerance, because }),
          };
          vm.runInNewContext(expression, context, { timeout: 1000 });
          exercises.push(context.result);
        }
        ts.forEachChild(node, visit);
      };
      visit(syntax);
      lessons.push({ path: `/${area}/${entry.name}`, exercises });
    }
  }
  return lessons;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const lessons = await collectExercises();
  console.log(JSON.stringify({ lessons: lessons.length, exercises: lessons.reduce((total, lesson) => total + lesson.exercises.length, 0), missing: lessons.filter((lesson) => !lesson.exercises.length).map((lesson) => lesson.path) }));
}
