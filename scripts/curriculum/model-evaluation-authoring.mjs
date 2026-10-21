import { construction } from './authoring.mjs';
export { part as p, example, history, source, before, sample, s, op } from './authoring.mjs';
export { table, flow, challenge, q, tf } from './design-authoring.mjs';
export const section = 'Evaluating and Improving Models';
export function lesson(record) {
  const { checkpointAfter, checkpoint, technicalIndex, ...rest } = record;
  const parts = record.parts.map((entry, i) => ({ ...entry, title: `${i + 1}. ${entry.title}` }));
  return { section, ...rest, parts, technicalStart: parts[technicalIndex].title,
    checkpoints: [{ after: parts[checkpointAfter - 1].title, title: `Questions on Parts 1 to ${checkpointAfter}`, questions: checkpoint }] };
}
export function build(...args) { return { ...construction(...args), extras: [], hints: args[9] }; }
export const invalid = call => `try:\n    ${call}\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("Expected ValueError")`;
export const vectors = `def aligned(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    if a.ndim != 1 or b.shape != a.shape or a.size == 0:
        raise ValueError("Use aligned nonempty one-dimensional arrays")
    if not np.isfinite(a).all() or not np.isfinite(b).all():
        raise ValueError("Values must be finite")
    return a, b
`;
