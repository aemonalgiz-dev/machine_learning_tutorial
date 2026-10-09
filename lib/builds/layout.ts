import type { Construction, Piece, Tool } from "./engine";
import { NODE_WIDTH } from "./wires";

// Reserve space for wrapped labels and a bounded value preview before the DOM
// has been measured. The actual cards remain as short as their contents allow.
export function estimatedHeight(piece: Pick<Piece, "tool">, tools: Record<string, Tool>): number {
  const inputs = piece.tool === "output" ? 1 : tools[piece.tool]?.inputs.length ?? 0;
  return 300 + inputs * 88 + (tools[piece.tool]?.settings?.length ?? 0) * 88;
}

export function arrangeConstruction(graph: Construction, tools: Record<string, Tool>, heights: Record<string, number> = {}): Construction {
  const depths = new Map<string, number>(), visiting = new Set<string>();
  function depth(id: string): number {
    if (depths.has(id)) return depths.get(id)!;
    // A learner can make a loop. Layout should still work so they can fix it.
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const parents = graph.connections.filter(wire => wire.to === id);
    const value = parents.length ? Math.max(...parents.map(wire => depth(wire.from))) + 1 : 0;
    visiting.delete(id); depths.set(id, value);
    return value;
  }
  const bottoms = new Map<number, number>();
  return { ...graph, pieces: graph.pieces.map(piece => {
    const column = depth(piece.id), y = bottoms.get(column) ?? 70;
    bottoms.set(column, y + (heights[piece.id] ?? estimatedHeight(piece, tools)) + 72);
    return { ...piece, x: 36 + column * (NODE_WIDTH + 96), y };
  }) };
}
