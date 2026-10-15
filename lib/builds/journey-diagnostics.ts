import { evaluate, same, type Build, type Construction, type Trace } from "./engine";
import { TOOLS } from "./tools";
import { validConstructionForBuild } from "./workshop-session";

export interface JourneyDiagnosticResult {
  graph: Construction;
  trace: Trace;
  result: "works" | "different" | "blocked";
  earlierResult?: Trace;
}

/** Execute the learner's wires and settings. A correct general rule is not a fault. */
export function inspectJourneyChange(graph: Construction, changed: Build["cases"][number], earlier: Build["cases"][number], build: Build): JourneyDiagnosticResult | null {
  if (!validConstructionForBuild(graph, build, TOOLS)) return null;
  const copy = structuredClone(graph);
  const trace = evaluate(copy, changed.data, TOOLS);
  return {
    graph: copy,
    trace,
    earlierResult: evaluate(copy, earlier.data, TOOLS),
    result: trace.error ? "blocked" : same(trace.output, changed.expected) ? "works" : "different",
  };
}

export function diagnosticPieceName(graph: Construction, id: string, build: Build) {
  const piece = graph.pieces.find(piece => piece.id === id);
  if (!piece) return "Missing piece";
  if (piece.tool === "output") return "Result";
  return piece.tool.startsWith("source:") ? build.sources[piece.tool.slice(7)] : TOOLS[piece.tool]?.title ?? piece.tool;
}
