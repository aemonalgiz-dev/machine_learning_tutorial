export type Values = Record<string, number | string | string[]>;
export type Control =
  | { kind: "number"; key: string; label: string; min: number; max: number; step: number; help?: string }
  | { kind: "choice"; key: string; label: string; options: { value: string; label: string }[]; help?: string }
  | { kind: "order"; key: string; label: string; items: string[]; help?: string }
  | { kind: "select"; key: string; label: string; items: string[]; help?: string };
export type Value = number | string | number[] | string[];
export type Reading = { label: string; input: string; actual: Value; expected: Value; tolerance?: number; work?: string };
export type Scene =
  | { kind: "plot"; points: [number, number, number?][]; line?: [number, number][]; x: string; y: string }
  | { kind: "pixels"; panels: { label: string; cells: number[][] }[] }
  | { kind: "tokens"; input: string; pieces: string[] }
  | { kind: "path"; cells: string[]; path: number[]; width: number };
export type Result = { readings: Reading[]; scene?: Scene; note?: string };
export interface Mission {
  id: string;
  title: string;
  story: string;
  task: string;
  controls: Control[];
  initial: Values;
  solution: Values;
  hint: string;
  success: string;
  rule: string;
  run: (values: Values, batch: number) => Result;
}
export const num = (v: Values, k: string) => Number(v[k]);
export const str = (v: Values, k: string) => String(v[k]);
export const list = (v: Values, k: string) => v[k] as string[];
export const dial = (key: string, label: string, min: number, max: number, step = 1, help?: string): Control => ({ kind: "number", key, label, min, max, step, help });
export const choose = (key: string, label: string, options: string[], help?: string): Control => ({ kind: "choice", key, label, options: options.map(value => ({ value, label: value })), help });
export const row = (label: string, input: string, actual: Value, expected: Value, work?: string, tolerance = 0.001): Reading => ({ label, input, actual, expected, work, tolerance });
export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
export const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
export const softmax = (xs: number[]) => { const m = Math.max(...xs); const ex = xs.map(x => Math.exp(x - m)); const s = ex.reduce((a, b) => a + b, 0); return ex.map(x => x / s); };
export const format = (v: Value): string => Array.isArray(v) ? `[${v.map(x => format(x)).join(", ")}]` : typeof v === "number" ? Number.isFinite(v) ? Number(v.toFixed(4)).toString() : "Undefined for these settings" : v;
export function passed(r: Reading): boolean {
  const a = Array.isArray(r.actual) ? r.actual : [r.actual];
  const b = Array.isArray(r.expected) ? r.expected : [r.expected];
  return a.length === b.length && a.every((value, i) => typeof value === "number" && typeof b[i] === "number" ? Number.isFinite(value) && Math.abs(value - Number(b[i])) <= (r.tolerance ?? .001) : value === b[i]);
}

/** A process-order mission, with the operation and its reason visible on each card. */
export function sequence(id: string, title: string, story: string, task: string, items: string[], hint: string, success: string): Mission {
  return { id, title, story, task, controls: [{ kind: "order", key: "steps", label: "Put the operations in order", items }], initial: { steps: [...items.slice(1), items[0]] }, solution: { steps: [...items] }, hint, success,
    rule: "Each operation needs the result of the operation before it.",
    run: v => ({ readings: list(v, "steps").map((item, i) => row(`Step ${i + 1}`, i === 0 ? "Start here" : `After: ${list(v, "steps")[i - 1]}`, item, items[i])), scene: { kind: "tokens", input: "The route through the machine", pieces: list(v, "steps") } }) };
}
