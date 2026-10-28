import { evaluate, same, type Build, type Construction, type Tool } from "./engine";
import { NODE_WIDTH } from "./wires";

const MAX_PIECES = 36;
// Auto-layout can extend beyond the manual drag boundary. Allow a full-depth
// chain at layout.ts's column spacing while keeping saved coordinates bounded.
const MAX_SAVED_X = 36 + (MAX_PIECES - 1) * (NODE_WIDTH + 96);

export interface WorkshopOutcome {
  passed: boolean;
  graph: Construction;
  usedSolution: boolean;
  usedHints: boolean;
  attemptId?: string;
}

export function workshopRecordKey(build: Pick<Build, "id" | "draftVersion">, recordId?: string) {
  return `workshop:${recordId ?? build.id}:v${build.draftVersion ?? 1}`;
}

/** Check saved or carried pieces before the renderer inspects tools and ports. */
export function validConstructionForBuild(
  raw: unknown,
  build: Pick<Build, "sources">,
  tools: Record<string, Tool>,
): raw is Construction {
  if (!raw || typeof raw !== "object") return false;
  const graph = raw as Construction;
  if (!Array.isArray(graph.pieces) || graph.pieces.length > MAX_PIECES ||
      !Array.isArray(graph.connections) || graph.connections.length > 120) return false;
  const validPieces = graph.pieces.every(piece => piece && typeof piece.id === "string" &&
    Number.isFinite(piece.x) && piece.x >= 0 && piece.x <= MAX_SAVED_X &&
    Number.isFinite(piece.y) && piece.y >= 0 && piece.y <= 5000 &&
    piece.settings && typeof piece.settings === "object" && !Array.isArray(piece.settings) &&
    Object.values(piece.settings).every(value => typeof value === "string" || typeof value === "number" && Number.isFinite(value)) &&
    typeof piece.tool === "string" && (piece.tool === "output" ||
      piece.tool.startsWith("source:") && Object.hasOwn(build.sources, piece.tool.slice(7)) || Object.hasOwn(tools, piece.tool)));
  if (!validPieces || new Set(graph.pieces.map(piece => piece.id)).size !== graph.pieces.length ||
      !graph.pieces.some(piece => piece.id === "output" && piece.tool === "output")) return false;
  return graph.connections.every(wire => {
    if (!wire || typeof wire.from !== "string" || typeof wire.to !== "string" || !Number.isInteger(wire.port) || wire.port < 0) return false;
    const from = graph.pieces.find(piece => piece.id === wire.from);
    const to = graph.pieces.find(piece => piece.id === wire.to);
    if (!from || from.tool === "output" || !to) return false;
    const inputCount = to.tool === "output" ? 1 : to.tool.startsWith("source:") ? 0 : tools[to.tool].inputs.length;
    return wire.port < inputCount;
  });
}

/** Explicit checks use the authored cases, even after a custom-input experiment. */
export function testConstruction(
  build: Build,
  graph: Construction,
  tools: Record<string, Tool>,
  support: Pick<WorkshopOutcome, "usedSolution" | "usedHints">,
) {
  const traces = build.cases.map(sample => evaluate(graph, sample.data, tools));
  const outcomes = traces.map((trace, index) => !trace.error && same(trace.output, build.cases[index].expected));
  return {
    traces,
    outcomes,
    outcome: { passed: outcomes.length > 0 && outcomes.every(Boolean), graph: structuredClone(graph), ...support } satisfies WorkshopOutcome,
  };
}
