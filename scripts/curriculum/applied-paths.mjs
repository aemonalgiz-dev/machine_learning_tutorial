import software from './applied-software.mjs';
import data from './applied-data.mjs';
import infrastructure from './applied-infrastructure.mjs';
import robotics from './applied-robotics.mjs';
import security from './applied-security.mjs';
import simulation from './applied-simulation.mjs';
import { appliedExamples, appliedDepth } from './applied-examples.mjs';

const records = [...software, ...data, ...infrastructure, ...robotics, ...security, ...simulation];
for (const record of records) {
  const example = appliedExamples[record.id];
  if (example) record.parts[1].examples = [...record.parts[1].examples ?? [], example];
  for (const part of appliedDepth[record.id] ?? []) record.parts.push({ ...part, title: `${record.parts.length + 1}. ${part.title}` });
}
export const appliedJourneys = Object.fromEntries(records.map(record => [record.id, record.journey]));
export const appliedFreshCases = Object.fromEntries(records.map(record => [record.id, record.fresh]));
const lessons = records.map(record => {
  const lesson = { ...record };
  for (const field of ['journey', 'fresh', 'outputLabel', 'checkpointTitle']) delete lesson[field];
  return lesson;
});
export default lessons;
