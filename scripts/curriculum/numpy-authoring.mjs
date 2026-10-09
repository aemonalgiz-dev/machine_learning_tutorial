import { example, part, choice, history, source } from "./authoring.mjs";

export const py = code => `import numpy as np\n\n${code}`;
export const worked = (title, why, code, output, meaning) => example(title, why, py(code), output, meaning);
export const lessonPart = (title, why, examples, meaning = "") => part(title, why, null, meaning, examples);
export const question = (prompt, code, options, answer, because, description = "Use this setup. The code is given; its result is for you to work out.") => ({
  ...choice(prompt, options, answer, because), given: { description, code: py(code) },
});
export const numpyHistory = (title, problem, contribution, pages) => history(title,
  pages.map(([name, path]) => source(name, `https://numpy.org/doc/stable/${path}`)), problem, contribution);
export const pythonSection = "Python and NumPy";
