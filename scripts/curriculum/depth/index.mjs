import numpy from './numpy.mjs';
import dataAndEvaluation from './data-and-evaluation.mjs';
import classicalAndVision from './classical-and-vision.mjs';
import probabilityAndTraining from './probability-and-training.mjs';
import forecastingAndDecisions from './forecasting-and-decisions.mjs';
import rankingAndAnomalies from './ranking-and-anomalies.mjs';
import graphsAndCausality from './graphs-and-causality.mjs';
import deployment from './deployment.mjs';
import neuralAndLanguage from './neural-and-language.mjs';
import modernModels from './modern-models.mjs';
import procedureChallenges from './procedure-challenges.mjs';
import checkpoints from './checkpoints.mjs';

export const depthSupplements = { ...numpy, ...dataAndEvaluation, ...classicalAndVision, ...probabilityAndTraining, ...forecastingAndDecisions, ...rankingAndAnomalies, ...graphsAndCausality, ...deployment, ...neuralAndLanguage, ...modernModels };
for (const [id, practice] of Object.entries(procedureChallenges)) depthSupplements[id].practice.push(...practice);
for (const [id, checkpoint] of Object.entries(checkpoints)) {
  // A checkpoint anchors to an authored explanation, not a fixed page number.
  const extra = depthSupplements[id];
  const part = extra.parts.find(part => part.title === checkpoint.after || part.examples?.some(example => example.title === checkpoint.after));
  if (!part) throw Error(`${id}: unknown checkpoint position ${checkpoint.after}`);
  extra.checkpoint = { ...checkpoint, after: part.title };
}

export function applyDepthSupplements(lessons) {
  for (const lesson of lessons) {
    const extra = depthSupplements[lesson.id];
    if (!extra) continue;
    const offset = lesson.parts.length;
    lesson.parts.push(...extra.parts.map((part, i) => ({ ...part, title: `${offset + i + 1}. ${part.title}` })));
    lesson.practice.push(...extra.practice);
    if (extra.checkpoint) {
      const after = lesson.parts.find(part => part.title === `${offset + extra.parts.findIndex(part => part.title === extra.checkpoint.after) + 1}. ${extra.checkpoint.after}`).title;
      (lesson.checkpoints ??= []).push({ ...extra.checkpoint, after });
    }
  }
}
