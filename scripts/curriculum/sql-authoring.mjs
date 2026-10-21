import { paragraphs } from './authoring.mjs';

export const sqlExample = (title, explanation, setup, code, output, interpretation) => ({
  title, language: 'sql', setup, code, output,
  paragraphs: paragraphs(explanation), interpretation: paragraphs(interpretation),
});

export const sqlChallenge = (title, task, setup, starter, solution, output, hints, tests) => ({
  title, question: title, language: 'sql', sql: { setup }, task, starter, solution, output, hints,
  tests: tests.map(test => Array.isArray(test) ? { name: test[0], code: test[1] } : test),
});

export function sqlLesson(record) {
  const { checkpointAfter, checkpoint, technicalPart = 3, ...rest } = record;
  const parts = record.parts.map((part, index) => ({ ...part, title: `${index + 1}. ${part.title}` }));
  return {
    ...rest, section: 'SQL', parts, technicalStart: parts[technicalPart - 1].title,
    ...(checkpointAfter ? { checkpoints: [{ after: parts[checkpointAfter - 1].title,
      title: `Questions on Parts 1 to ${checkpointAfter}`, questions: checkpoint }] } : {}),
  };
}
