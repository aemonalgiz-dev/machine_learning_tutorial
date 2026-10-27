import { part, example, history, source, before, construction, sample, s, op, c, configured } from './authoring.mjs';
import { table, flow, challenge } from './design-authoring.mjs';
import { question as q, claim as tf } from './gap-authoring.mjs';
export { part as p, example, history, source, before, construction, sample, s, op, c, configured, table, flow, challenge, q, tf };

// Only structure is shared. Problems, explanations, tests and changed conditions
// are authored beside each lesson and exported separately for the workshop UI.
export function lesson(record) {
  const { questions: authoredQuestions, diagram, ...rest } = record;
  const questions = authoredQuestions.map(question => {
    if (question.kind !== 'choice') return question;
    const size = question.options.length;
    const offset = [...question.prompt].reduce((total, character) => total + character.charCodeAt(0), 0) % size;
    return { ...question, options: question.options.map((_, index) => question.options[(index - offset + size) % size]), answer: (question.answer + offset) % size };
  });
  const parts = record.parts.map((part, index) => ({ ...part, title: `${index + 1}. ${part.title}` }));
  return {
    ...rest, parts, technicalStart: parts[1].title,
    reading: {
      experimentTitle: record.build.title, experimentIntro: record.build.problem,
      connectionTitle: record.parts[0].title, practiceTitle: record.practice[0].title,
      outputLabel: record.outputLabel, exampleNote: record.build.limitation,
    },
    intuition: [diagram],
    checkpoints: [{ after: parts[1].title, title: record.checkpointTitle, questions: questions.slice(0, 2) }],
    quiz: questions.slice(2),
  };
}
export function journey(premise, title, start, outcome, investigation, connections, prompt, carryForward, preparation) {
  return { premise, order: investigation.kind === 'diagnose' ? 'investigate-first' : 'build-first',
    construction: { title, start, outcome }, investigation, connections,
    reflection: { prompt, carryForward }, ...(preparation ? { preparation } : {}) };
}
export const predict = (title, question, outcome) => ({ title, question, outcome, caseIndex: 1, kind: 'predict', predictionLabel: 'Your prediction before running' });
export const diagnose = (title, question, correct, wrong, outcome) => ({ title, question, outcome, caseIndex: 1, kind: 'diagnose', options: [
  { label: correct[0], feedback: correct[1], correct: true }, { label: wrong[0], feedback: wrong[1] },
] });
export const connection = (lessonId, skill, why) => ({ lessonId, skill, why });
export const fresh = (name, prompt, data, expected, why) => ({ name, prompt, data, expected, why });
