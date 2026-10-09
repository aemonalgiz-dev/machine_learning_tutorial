// Small authoring helpers. The generated JSON is consumed by Next and by the
// browser-Python checks; none of this module is shipped to readers.
export const paragraphs = text => text.split("\n\n").filter(Boolean);
export const source = (title, url) => ({ title, url });
export const history = (title, sources, ...blocks) => ({ title, sources, blocks });
export const part = (title, explanation, calculation, interpretation, examples = []) => ({ title, paragraphs: paragraphs(explanation), ...(calculation ? { calculation } : {}), interpretation: paragraphs(interpretation), ...(examples.length ? { examples } : {}) });
export const example = (title, explanation, code, output, interpretation) => ({ title, paragraphs: paragraphs(explanation), code, output, interpretation: paragraphs(interpretation) });
export const view = (title, explanation, rows, scene) => ({ title, explanation, rows, ...(scene ? { scene } : {}) });
export const choice = (prompt, options, answer, because) => ({ kind: "choice", prompt, options, answer, because });
export const truth = (prompt, answer, because) => ({ kind: "trueFalse", prompt, answer, because });
export const exercise = (title, task, starter, solution, output, hints) => ({ title, question: title, task, starter, solution, output, hints });
export const s = key => ({ source: key });
export const op = (key, ...inputs) => ({ op: key, inputs });
export const configured = (key, settings, ...inputs) => ({ op: key, inputs, settings });
export const c = value => configured("constant", { value });
export const sample = (name, data, expected) => ({ name, data, expected });
export const before = (title, id, area = "concepts") => ({ title, href: `/${area}/${id}` });
export function construction(title, problem, challenge, sources, cases, recipe, why, limitation) {
  return { title, problem, challenge, sources, cases, recipe, why, limitation, extras: ["constant", "add", "subtract", "multiply", "divide", "mean", "total", "count", "transpose"], draftVersion: 1 };
}
