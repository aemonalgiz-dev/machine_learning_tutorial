import type { Data } from "./engine";
import type { ReadingScene } from "../intuition/types";

const record = (value: Data): value is { [key: string]: Data } => value !== null && typeof value === "object" && !Array.isArray(value);
const properties = (value: Record<string, Data>, excluded: string[]) => Object.entries(value)
  .filter(([key, entry]) => !excluded.includes(key) && (entry === null || typeof entry !== "object"))
  .map(([key, entry]) => `${key}: ${entry === null ? "null" : String(entry)}`);

/** Only explicit graph records are drawn; arbitrary object lists stay records. */
export function graphDisplay(value: Data): Extract<ReadingScene, { kind: "network" }> | undefined {
  if (!record(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges) || value.nodes.length > 12 || value.edges.length > 24) return;
  const nodes = value.nodes;
  if (!nodes.every(node => record(node) && typeof node.id === "string")) return;
  const ids = nodes.map(node => (node as { id: string }).id);
  if (new Set(ids).size !== ids.length) return;
  const edges: [number, number][] = [], edgeLabels: string[] = [];
  for (const edge of value.edges) {
    if (!record(edge) || typeof edge.source !== "string" || typeof edge.target !== "string") return;
    const from = ids.indexOf(edge.source), to = ids.indexOf(edge.target);
    if (from < 0 || to < 0) return;
    edges.push([from, to]);
    edgeLabels.push([typeof edge.type === "string" ? edge.type : "", ...properties(edge, ["id", "source", "target", "type"])].filter(Boolean).join(" · "));
  }
  return {
    kind: "network", directed: true, caption: "The nodes and directed relationships in this value.", edges, edgeLabels,
    nodes: nodes.map(node => {
      const entry = node as { [key: string]: Data };
      return { label: String(entry.id), value: typeof entry.label === "string" ? entry.label : typeof entry.kind === "string" ? entry.kind : undefined,
        details: properties(entry, ["id", "label", "kind"]),
      };
    }),
  };
}
