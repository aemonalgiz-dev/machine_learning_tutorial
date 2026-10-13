import { section } from '../depth-helpers.mjs';
import { example } from '../authoring.mjs';

export const p = section;
export function worked(title, explanation, code, output, interpretation) {
  return example(title, explanation, `import numpy as np\n${code}`, output, interpretation);
}
export function withProgram(part, program) {
  return { ...part, examples: [...(part.examples ?? []), program] };
}
export const supplement = (reason, parts, practice = []) => ({ reason, parts, practice });
