export type Data = number | string | boolean | null | Data[] | { [key: string]: Data };
export type Settings = Record<string, number | string>;
export interface Tool {
  title: string;
  why: string;
  inputs: string[];
  settings?: { key: string; label: string; initial: number | string; options?: string[]; min?: number; max?: number; step?: number }[];
  run: (inputs: Data[], settings: Settings) => Data;
}
export type Expression = { source: string } | { op: string; inputs: Expression[]; settings?: Settings };
export const source = (key: string): Expression => ({ source: key });
export const op = (key: string, inputs: Expression[], settings?: Settings): Expression => ({ op: key, inputs, settings });
export const constant = (value: number): Expression => op("constant", [], { value });
export interface Build {
  id: string; title: string; problem: string; challenge: string; why: string;
  sources: Record<string, string>;
  cases: { name: string; data: Record<string, Data>; expected: Data }[];
  recipe: Expression;
  extras?: string[];
  limitation?: string;
}
export interface Piece { id: string; tool: string; x: number; y: number; settings: Settings }
export interface Connection { from: string; to: string; port: number }
export interface Construction { pieces: Piece[]; connections: Connection[] }
export interface Trace { steps: { id: string; inputs: Data[]; output: Data }[]; output?: Data; error?: { id: string; message: string; port?: number } }

export function same(a: Data | undefined, b: Data): boolean {
  if (typeof a === "number" && typeof b === "number") return Number.isFinite(a) && Math.abs(a - b) < .001;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => same(v, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) return Object.keys(a).length === Object.keys(b).length && Object.keys(b).every(k => same(a[k], b[k]));
  return a === b;
}
export const show = (data: Data | undefined): string => data === undefined ? "Waiting for an input" : JSON.stringify(data, (_, v) => typeof v === "number" ? Number(v.toFixed(4)) : v);

export function evaluate(graph: Construction, data: Record<string, Data>, tools: Record<string, Tool>): Trace {
  const trace: Trace = { steps: [] }, done = new Map<string, Data>(), active = new Set<string>();
  function visit(id: string): Data {
    if (done.has(id)) return done.get(id)!;
    if (active.has(id)) { trace.error = { id, message: "This connection loops back to a machine that is still waiting for an answer. Remove one connection so the information can reach the output." }; throw Error("loop"); }
    const piece = graph.pieces.find(p => p.id === id);
    if (!piece) { trace.error = { id, message: "This wire has lost its machine. Connect an output that is still on the floor." }; throw Error("missing"); }
    active.add(id);
    const tool = tools[piece.tool];
    const inputNames = piece.tool === "output" ? ["Your result"] : piece.tool.startsWith("source:") ? [] : tool?.inputs;
    if (!inputNames) { trace.error = { id, message: "This tool is not available in this workshop." }; throw Error("tool"); }
    const inputs = inputNames.map((name, port) => {
      const wire = graph.connections.find(w => w.to === id && w.port === port);
      if (!wire) { trace.error = { id, port, message: `${name} needs a number, list or other value from an earlier machine. Connect a round output to this input.` }; throw Error("unconnected"); }
      return visit(wire.from);
    });
    let output: Data;
    try {
      output = piece.tool === "output" ? inputs[0] : piece.tool.startsWith("source:") ? data[piece.tool.slice(7)] : tool.run(inputs, piece.settings);
      if (output === undefined) throw Error("This source is missing from the example.");
      const check = (v: Data): void => { if (typeof v === "number" && !Number.isFinite(v)) throw Error("The result is not a finite number. Check for division by zero or an invalid input."); if (Array.isArray(v)) v.forEach(check); else if (v && typeof v === "object") Object.values(v).forEach(check); }; check(output);
    } catch (error) { trace.error = { id, message: error instanceof Error ? error.message : "This machine cannot use those inputs." }; throw error; }
    active.delete(id); done.set(id, output); trace.steps.push({ id, inputs, output }); return output;
  }
  try { trace.output = visit("output"); } catch { /* The trace identifies the first broken operation. */ }
  return trace;
}

export function expressionTools(expression: Expression): string[] {
  return "source" in expression ? [`source:${expression.source}`] : [...new Set([...expression.inputs.flatMap(expressionTools), expression.op])];
}
export function assemble(expression: Expression, tools: Record<string, Tool>): Construction {
  const pieces: Piece[] = [], connections: Connection[] = [], shared = new Map<string, string>();
  const depths = new Map<string, number>(), rows = new Map<number, number>();
  function walk(e: Expression): string {
    const key = JSON.stringify(e); if (shared.has(key)) return shared.get(key)!;
    const parents = "source" in e ? [] : e.inputs.map(walk);
    const depth = parents.length ? Math.max(...parents.map(p => depths.get(p)!)) + 1 : 0;
    const row = rows.get(depth) ?? 0; rows.set(depth, row + 1);
    const id = `part-${pieces.length}`, tool = "source" in e ? `source:${e.source}` : e.op;
    pieces.push({ id, tool, x: 36 + depth * 260, y: 70 + row * 260, settings: "source" in e ? {} : { ...Object.fromEntries((tools[e.op].settings ?? []).map(s => [s.key, s.initial])), ...e.settings } });
    parents.forEach((from, port) => connections.push({ from, to: id, port })); shared.set(key, id); depths.set(id, depth); return id;
  }
  const last = walk(expression);
  pieces.push({ id: "output", tool: "output", x: 36 + (depths.get(last)! + 1) * 260, y: 70, settings: {} });
  connections.push({ from: last, to: "output", port: 0 });
  return { pieces, connections };
}
export function plug(graph: Construction, wire: Connection): Construction {
  if (wire.from === wire.to || wire.from === "output") return graph;
  return { ...graph, connections: [...graph.connections.filter(w => w.to !== wire.to || w.port !== wire.port), wire] };
}
