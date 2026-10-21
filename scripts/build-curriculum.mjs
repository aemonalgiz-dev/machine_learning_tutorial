import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from 'node:fs';
import numpy from "./curriculum/numpy.mjs";
import data from "./curriculum/data.mjs";
import evaluation from "./curriculum/evaluation.mjs";
import modelEvaluation from "./curriculum/model-evaluation.mjs";
import probability from "./curriculum/probability-gaps.mjs";
import classical from "./curriculum/classical-gaps.mjs";
import vision from "./curriculum/vision-gaps.mjs";
import neuralVision from "./curriculum/neural-vision-gaps.mjs";
import forecasting from "./curriculum/forecasting.mjs";
import reinforcement from "./curriculum/reinforcement-path.mjs";
import probabilistic from "./curriculum/probabilistic-path.mjs";
import optimisation from "./curriculum/optimisation-path.mjs";
import recommendations from "./curriculum/recommendations-path.mjs";
import anomalies from "./curriculum/anomaly-path.mjs";
import graphs from "./curriculum/graph-path.mjs";
import causal from "./curriculum/causal-path.mjs";
import deployment from "./curriculum/deployment-path.mjs";
import projects from "./curriculum/projects-path.mjs";
import designProblem from "./curriculum/design-problem.mjs";
import designResources from "./curriculum/design-resources.mjs";
import designComparisons from "./curriculum/design-comparisons.mjs";
import designEvidence from "./curriculum/design-evidence.mjs";
import agentFoundations from "./curriculum/agents-foundations.mjs";
import agentFrameworks from "./curriculum/agents-frameworks.mjs";
import agentObservability from "./curriculum/agents-observability.mjs";
import agentGuardrails from "./curriculum/agents-guardrails.mjs";
import agentReliability from "./curriculum/agents-reliability.mjs";
import agentAssurance from "./curriculum/agents-assurance.mjs";
import { introduction, promptExamples, frameworkTests, errorAnalysis, ablationExperiments, iterationProject, improvementSection } from './curriculum/agents-iteration.mjs';
import sqlFoundations from "./curriculum/sql-foundations.mjs";
import sqlAnalysis from "./curriculum/sql-analysis.mjs";
import sqlSystems from "./curriculum/sql-systems.mjs";
import { nosqlFoundationLessons } from "./curriculum/nosql-foundations.mjs";
import { nosqlSystemLessons } from "./curriculum/nosql-systems.mjs";
import { graphDatabaseLessons } from "./curriculum/graph-databases.mjs";
import { readingVoice } from "./curriculum/reading-voice.mjs";
import { readingExtensions } from "./curriculum/reading-extensions.mjs";
import { deepenProbability } from "./curriculum/depth-probability.mjs";
import { deepenTraining } from "./curriculum/depth-training.mjs";
import { deepenProjects } from "./curriculum/depth-projects.mjs";
import { applyDepthSupplements, depthSupplements } from "./curriculum/depth/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paths = [...forecasting, ...reinforcement, ...probabilistic, ...optimisation, ...recommendations, ...anomalies, ...graphs, ...causal, ...deployment, ...projects];
const agents = [
  introduction,
  ...agentFoundations,
  ...agentReliability.filter(lesson => lesson.id === 'agent-or-workflow'),
  ...agentFrameworks,
  ...agentGuardrails,
  ...agentReliability.filter(lesson => lesson.id !== 'agent-or-workflow'),
  ...[
    promptExamples,
    ...agentObservability.slice(0, 3),
    frameworkTests,
    agentObservability[3],
    errorAnalysis,
    ablationExperiments,
    agentObservability[4],
    ...agentAssurance,
    iterationProject,
  ].map(lesson => ({ ...lesson, section: improvementSection, topic: ({
    'agent-evaluation-datasets': 'Building Evaluation Cases',
    'agent-model-judges': 'Reviewing Answer Quality',
    'agent-release-checks': 'Deciding Whether to Release',
  })[lesson.id] ?? lesson.topic })),
];
const gaps = [...probability, ...classical, ...vision, ...neuralVision, ...paths, ...designProblem, ...designResources, ...designComparisons, ...designEvidence, ...agents];
const sqlLessons = [...sqlFoundations, ...sqlAnalysis, ...sqlSystems];
const databaseLessons = [...sqlLessons, ...nosqlFoundationLessons, ...nosqlSystemLessons, ...graphDatabaseLessons];
const lessons = [...numpy, ...databaseLessons, ...data, ...evaluation, ...modelEvaluation, ...gaps].map(lesson => ({ ...lesson, reading: lesson.reading ?? readingVoice[lesson.id],
  intuition: [...lesson.intuition, ...(readingExtensions[lesson.id] ? [readingExtensions[lesson.id]] : [])] }));
// Existing quiz bookmarks keep working as the preceding explanation grows.
for (const lesson of lessons) lesson.quizId=`questions-on-parts-1-to-${lesson.parts.length}`;
deepenProbability(lessons);
deepenTraining(lessons);
deepenProjects(lessons);
applyDepthSupplements(lessons);
// Existing lessons lead into the new diagnostics without moving their URLs.
const evaluationFollowups = {
  'baseline-predictions': ['model-residual-analysis', 'What are the errors trying to tell us?'],
  'learning-curves': ['model-iteration-project', 'Fit and check a specific model repair'],
  'decision-thresholds': ['model-precision-recall', 'Follow the inspection queue through precision and recall'],
  'probability-calibration': ['model-selective-prediction', 'Measure the work a model accepts or sends for review'],
  'grouped-validation': ['model-nested-validation', 'Keep model selection inside an outer assessment'],
  'distribution-shift': ['model-evaluation-slices', 'Inspect the group errors behind the overall change'],
  'bootstrap-uncertainty': ['model-paired-comparisons', 'Resample a paired model comparison'],
  'model-versioning': ['model-iteration-project', 'Keep evidence with a fitted model revision'],
  'agent-ablation-experiments': ['model-paired-comparisons', 'Compare numerical model losses on shared cases'],
};
for (const lesson of lessons) {
  const next = evaluationFollowups[lesson.id];
  if (next) lesson.appliedIn = [...lesson.appliedIn ?? [], { title: next[1], href: `/concepts/${next[0]}` }];
  if (lesson.id === 'bootstrap-uncertainty') {
    const part = lesson.parts.find(part => part.title === '5. Resample the Independent Units');
    if (part) { part.id = '5-resample-the-independent-units'; part.title = '5. Keep Readings from the Same Greenhouse Together'; }
  }
}
// The displayed tables come from the same SQLite setup the learner will run.
// SQLite ships inside the existing browser runtime; no database server is needed.
if (sqlLessons.length) {
  const { loadPyodide } = await import('pyodide');
  const python = await loadPyodide();
  python.runPython(await readFile(path.join(root, 'public/python/sql_runner.py'), 'utf8'));
  const describe = python.globals.get('describe_sql_tables');
  const run = python.globals.get('run_course_sql');
  try {
    for (const lesson of lessons) {
      for (const exercise of lesson.practice) if (exercise.language === 'sql') {
        if (typeof exercise.sql?.setup !== 'string') throw Error(`${lesson.id}: SQL practice needs its database setup.`);
        exercise.sql.tables = JSON.parse(describe(exercise.sql.setup));
        const result = JSON.parse(run(exercise.solution, exercise.sql.setup));
        if (result.error || JSON.stringify(JSON.parse(result.stdout)) !== JSON.stringify(JSON.parse(exercise.output))) throw Error(`${lesson.id}: SQL solution ${exercise.title}: ${result.error ?? result.stdout}`);
        exercise.sql.expectedTable = result.table;
      }
      for (const part of lesson.parts) for (const example of part.examples ?? []) if (example.language === 'sql') {
        if (typeof example.setup !== 'string') throw Error(`${lesson.id}: SQL example needs its database setup.`);
        example.tables = JSON.parse(describe(example.setup));
        const result = JSON.parse(run(example.code, example.setup));
        if (result.error || JSON.stringify(JSON.parse(result.stdout)) !== JSON.stringify(JSON.parse(example.output))) throw Error(`${lesson.id}: SQL example ${example.title}: ${result.error ?? result.stdout}`);
        example.resultTable = result.table;
      }
    }
  } finally { describe.destroy(); run.destroy(); }
}
for (const [id, supplement] of Object.entries(depthSupplements)) {
  if (!lessons.some(lesson => lesson.id === id) && !existsSync(path.join(root, 'app', 'concepts', id, 'page.tsx'))) throw Error(`${id}: supplement has no lesson.`);
  if (!supplement.reason?.trim() || !supplement.parts.length) throw Error(`${id}: explain the gap this supplement addresses.`);
  if (JSON.stringify(supplement).includes('\u2014')) throw Error(`${id}: remove the em dash.`);
  const titles = new Set();
  for (const part of supplement.parts) {
    if (!part.title?.trim() || titles.has(part.title) || !part.paragraphs.some(text => text.trim())) throw Error(`${id}: incomplete or repeated supplementary explanation.`);
    titles.add(part.title);
    for (const example of part.examples ?? []) {
      if (!example.code || !example.output || !example.paragraphs.length || !example.interpretation.length) throw Error(`${id}: incomplete supplementary program.`);
      if (supplement.practice.some(exercise => exercise.solution.trim() === example.code.trim())) throw Error(`${id}: practice repeats the demonstrated program without a further task.`);
    }
  }
  for (const exercise of supplement.practice) {
    if (!exercise.task.length || !exercise.starter || !exercise.solution || !exercise.output || !exercise.hints.length || !exercise.tests?.length) throw Error(`${id}: a reusable procedure needs its contract, hints and behaviour tests.`);
  }
  if (supplement.checkpoint && (!titles.has(supplement.checkpoint.after) || !supplement.checkpoint.questions.every(question => question.given?.data))) throw Error(`${id}: checkpoint needs an existing explanation and self-contained questions.`);
}
const dataOrder = ["record-quality", "missing-measurements", "categorical-encoding", "cyclical-features", "data-leakage", "class-imbalance"];
const navigation = [...numpy, ...databaseLessons, ...[...data].sort((a,b) => dataOrder.indexOf(a.id) - dataOrder.indexOf(b.id)), ...evaluation, ...modelEvaluation, ...gaps];
const ids = new Set();
for (const lesson of lessons) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.id) || ids.has(lesson.id)) throw Error(`Invalid or repeated lesson ID: ${lesson.id}`);
  ids.add(lesson.id);
  if (!lesson.reading || Object.values(lesson.reading).some(value => !value?.trim())) throw Error(`${lesson.id}: describe the lesson's experiment and reading transitions.`);
  if (JSON.stringify(lesson).includes("\u2014")) throw Error(`${lesson.id}: remove the em dash.`);
  if (lesson.history.blocks.length < 2 || !lesson.history.sources.length || !lesson.parts.length || !lesson.practice.length || !lesson.quiz.length || !lesson.intuition.length || lesson.build.cases.length < 2) throw Error(`${lesson.id}: incomplete lesson.`);
  for (const part of lesson.parts) if (!part.title?.trim() || !part.paragraphs.some(text=>text.trim())) throw Error(`${lesson.id}: an explanation needs a title and authored content.`);
  if (lesson.technicalStart && !lesson.parts.some(part => part.title === lesson.technicalStart)) throw Error(`${lesson.id}: technicalStart must name an existing explanation.`);
  for (const checkpoint of lesson.checkpoints ?? []) if (!lesson.parts.some(part=>part.title===checkpoint.after) || !checkpoint.questions.length) throw Error(`${lesson.id}: put each checkpoint after an existing explanation.`);
  for (const entry of lesson.history.sources) if (new URL(entry.url).protocol !== "https:") throw Error(`${lesson.id}: use a primary HTTPS source.`);
  for (const exercise of lesson.practice) if (!exercise.solution || !exercise.output || !exercise.hints.length) throw Error(`${lesson.id}: incomplete programming challenge.`);
  for (const part of lesson.parts) for (const reference of part.references ?? []) {
    if (!reference.title || !reference.code || !reference.description?.length || !reference.setup?.length || !reference.interpretation?.length) throw Error(`${lesson.id}: explain how to run and interpret the framework reference.`);
    if (!["python", "yaml", "json", "bash", "sql", "cypher", "sparql"].includes(reference.language) || !/^\d{4}-\d{2}-\d{2}$/.test(reference.checkedOn) || new URL(reference.source.url).protocol !== "https:") throw Error(`${lesson.id}: framework reference needs a language, checked date and HTTPS documentation.`);
  }
  for (const part of lesson.parts) for (const example of part.examples ?? []) {
    if (!example.title || !example.code || !example.output || !example.paragraphs.length || !example.interpretation.length) throw Error(`${lesson.id}: incomplete worked example.`);
    if (lesson.practice.some(exercise => exercise.solution.trim() === example.code.trim())) throw Error(`${lesson.id}: the explanation must not publish the practice program verbatim.`);
  }
  if (lesson.section === "Python and NumPy") for (const question of lesson.quiz) {
    if (!question.given?.description || (!question.given.code && !question.given.data)) throw Error(`${lesson.id}: supply the setup on every NumPy question card.`);
  }
}

const navigationIds = new Set(navigation.map(lesson => lesson.id));
if (navigationIds.size !== navigation.length || navigationIds.size !== ids.size || [...ids].some(id => !navigationIds.has(id))) {
  throw Error('Published lessons and navigation must contain the same unique lesson IDs.');
}

// Navigation and workshop data are separate artifacts so client navigation
// never imports every lesson's prose, Python solutions, and quiz explanations.
const json = value => JSON.stringify(value, null, 2) + "\n";
const outputs = new Map([
  ["supplements.json", json(Object.fromEntries(Object.entries(depthSupplements).filter(([id]) => !ids.has(id))))],
  ["published.json", json(lessons)],
  ["navigation.json", json(navigation.map(({ id, title, section, topic, blurb }) => ({ id, title, section, topic, blurb })))],
  ["histories.json", json(Object.fromEntries(lessons.map(lesson => [lesson.id, lesson.history])))],
  ["builds.json", json(lessons.map(lesson => ({ id: lesson.id, ...lesson.build })))],
  ["ids.ts", `// Generated by scripts/build-curriculum.mjs.\nexport const expandedLessonIds = ${JSON.stringify([...ids], null, 2)} as const;\nexport type ExpandedLessonId = typeof expandedLessonIds[number];\n`],
]);
for (const [name, content] of outputs) {
  const filename = path.join(root, "lib", "lessons", name);
  if (process.argv.includes("--check")) {
    const actual = await readFile(filename, "utf8");
    if (actual !== content) throw Error(`${name} is stale. Run npm run curriculum:generate.`);
  } else await writeFile(filename, content);
}
console.log(`${lessons.length} complete expansion lessons ${process.argv.includes("--check") ? "verified" : "generated"}.`);
