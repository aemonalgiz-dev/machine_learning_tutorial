import { assemble, evaluate, same, type Build, type Construction, type Expression } from "./engine";
import { TOOLS } from "./tools";
import { validConstructionForBuild } from "./workshop-session";

export interface ReusableCalculation {
  sourceMap: Record<string, string>;
  target: Build;
}

/** Only reuse the same calculation with a consistent renaming of its inputs. */
function matchInputs(previous: Expression, next: Expression, mapping: Record<string, string>): boolean {
  if ("source" in previous) {
    if (!("source" in next)) return false;
    if (mapping[previous.source]) return mapping[previous.source] === next.source;
    if (Object.values(mapping).includes(next.source)) return false;
    mapping[previous.source] = next.source;
    return true;
  }
  if ("source" in next || previous.op !== next.op || previous.inputs.length !== next.inputs.length) return false;
  const defaults = Object.fromEntries((TOOLS[previous.op].settings ?? []).map(setting => [setting.key, setting.initial]));
  if (JSON.stringify({ ...defaults, ...previous.settings }) !== JSON.stringify({ ...defaults, ...next.settings })) return false;
  return previous.inputs.every((input, index) => matchInputs(input, next.inputs[index], mapping));
}

export function reusableCalculation(previous: Build, next: Build): ReusableCalculation | undefined {
  function visit(expression: Expression): ReusableCalculation | undefined {
    if ("source" in expression) return;
    const sourceMap: Record<string, string> = {};
    if (matchInputs(previous.recipe, expression, sourceMap) && Object.keys(sourceMap).length) {
      const sources = Object.fromEntries(Object.values(sourceMap).map(key => [key, next.sources[key]]));
      const graph = assemble(expression, TOOLS);
      return { sourceMap, target: { ...next, sources, recipe: expression, cases: next.cases.map(sample => ({
        ...sample, data: Object.fromEntries(Object.keys(sources).map(key => [key, sample.data[key]])),
        expected: evaluate(graph, sample.data, TOOLS).output!,
      })) } };
    }
    for (const input of expression.inputs) {
      const result = visit(input);
      if (result) return result;
    }
  }
  return visit(next.recipe);
}

/** A saved success flag alone cannot establish that a graph is safe to carry. */
export function carryConstruction(raw: unknown, previous: Build, reuse: ReusableCalculation): Construction | undefined {
  if (!validConstructionForBuild(raw, previous, TOOLS)) return;
  if (!previous.cases.every(sample => same(evaluate(raw, sample.data, TOOLS).output, sample.expected))) return;
  // Keep only the connected calculation. Unused experiments remain in the old draft.
  const needed = new Set<string>();
  const visit = (id: string) => {
    if (needed.has(id)) return;
    needed.add(id);
    raw.connections.filter(wire => wire.to === id).forEach(wire => visit(wire.from));
  };
  visit("output");
  const pieces = raw.pieces.filter(piece => needed.has(piece.id)).map(piece => ({ ...piece, settings: { ...piece.settings },
    tool: piece.tool.startsWith("source:") ? `source:${reuse.sourceMap[piece.tool.slice(7)]}` : piece.tool,
  }));
  const graph = { pieces, connections: raw.connections.filter(wire => needed.has(wire.from) && needed.has(wire.to)).map(wire => ({ ...wire })) };
  if (!validConstructionForBuild(graph, reuse.target, TOOLS)) return;
  if (!reuse.target.cases.every(sample => same(evaluate(graph, sample.data, TOOLS).output, sample.expected))) return;
  return graph;
}
