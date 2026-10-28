import { part, exercise, example, view } from "./authoring.mjs";
import { pathExamples } from "./path-examples.mjs";

// These helpers share structure only. Each lesson supplies its own explanation,
// data, checks, history, and construction rather than inheriting generic prose.
export const chapter = (title, paragraphs, calculation, interpretation) => part(title, paragraphs, calculation, interpretation);
export const task = (title, instructions, setup, body, output, hints, presentation = {}) => exercise(title, instructions, `${setup}\n# Write your calculation here.\n`, `${setup}\n${body}`, output, hints, presentation);
export const worked = (title, explanation, setup, body, output, interpretation) => example(title, explanation, `${setup}\n${body}`, output, interpretation);
export function lesson(record) {
  return { ...record, parts: record.parts.map((entry, i) => ({ ...entry, title: `${i + 1}. ${entry.title}`,
    ...(i === 2 && pathExamples[record.id] ? { examples: [pathExamples[record.id]] } : {}) })) };
}
export const walkthrough = (title, explanation, rows) => view(title, explanation, rows);

// A compact form for authored lessons. Nothing is filled with stock copy:
// stages, questions, experiments, and explanations remain topic-specific.
export function pathLesson(section, record) {
  const { stages, chapters, experiments, ...rest } = record;
  const parts = chapters.map(args => chapter(...args));
  const practice = experiments.map(args => task(...args));
  return lesson({ ...rest, section, intuition: stages.map(args => view(...args)), parts, practice });
}
