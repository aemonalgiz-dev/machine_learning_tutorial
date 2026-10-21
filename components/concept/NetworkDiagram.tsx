"use client";

import { useId } from "react";
import type { ReadingScene } from "@/lib/intuition/types";

type Network = Extract<ReadingScene, { kind: "network" }>;
type Point = { x: number; y: number };
type DrawnEdge = { path: string; points: Point[]; labelPoint: Point; anchor: "start" | "middle" | "end" };
const shorten = (text: string, maximum: number) => text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text;

/** The record list preserves properties that do not fit inside the diagram. */
export function NetworkDiagram({ scene }: { scene: Network }) {
  const instance = useId().replace(/:/g, "");
  const marker = `network-arrow-${instance}`;
  const titleId = `network-title-${instance}`, descriptionId = `network-description-${instance}`;
  const count = scene.nodes.length;
  const halfWidth = 90;
  const nodeHeight = Math.max(64, ...scene.nodes.map(node => 28 + 20 * (1 + (node.value ? 1 : 0) + Math.min(3, node.details?.length ?? 0))));
  const halfHeight = nodeHeight / 2;
  const rowSpacing = nodeHeight + 100;
  const positions = scene.nodes.map((_, i) => ({
    x: count === 1 ? 320 : i % 2 === 0 ? 160 : 480,
    y: halfHeight + 60 + Math.floor(i / 2) * rowSpacing,
  }));
  const boundary = (from: Point, toward: Point): Point => {
    const dx = toward.x - from.x, dy = toward.y - from.y;
    if (dx === 0 && dy === 0) return from;
    const ratio = Math.min(dx === 0 ? Infinity : halfWidth / Math.abs(dx), dy === 0 ? Infinity : halfHeight / Math.abs(dy));
    return { x: from.x + dx * ratio, y: from.y + dy * ratio };
  };
  const drawnEdges: (DrawnEdge | undefined)[] = scene.edges.map(([from, to], i) => {
    const a = positions[from], b = positions[to];
    if (!a || !b) return;
    if (from === to) {
      const ordinal = scene.edges.slice(0, i).filter(([u, v]) => u === from && v === to).length;
      const side = a.x < 320 ? -1 : 1;
      const radius = 56 + ordinal * 34;
      const start = { x: a.x + side * halfWidth, y: a.y - halfHeight / 2 };
      const end = { x: start.x, y: a.y + halfHeight / 2 };
      const c1 = { x: start.x + side * radius, y: start.y - radius / 2 };
      const c2 = { x: end.x + side * radius, y: end.y + radius / 2 };
      return {
        path: `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`,
        points: [start, c1, c2, end],
        labelPoint: { x: start.x + side * (radius * 0.75 + 8), y: a.y - ordinal * 18 },
        anchor: side < 0 ? "end" : "start",
      };
    }
    // Skip intervening boxes by taking long same-column connections outside them.
    if (a.x === b.x && Math.abs(from - to) > 2) {
      const side = a.x < 320 ? -1 : 1;
      const ordinal = scene.edges.slice(0, i).filter(([u, v]) => positions[u]?.x === a.x && positions[v]?.x === a.x && Math.abs(u - v) > 2).length;
      const start = { x: a.x + side * halfWidth, y: a.y };
      const end = { x: b.x + side * halfWidth, y: b.y };
      const outside = start.x + side * (48 + ordinal * 28);
      const c1 = { x: outside, y: start.y }, c2 = { x: outside, y: end.y };
      return {
        path: `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`,
        points: [start, c1, c2, end],
        labelPoint: { x: start.x + (outside - start.x) * 0.75 + side * 8, y: (start.y + end.y) / 2 - 8 },
        anchor: side < 0 ? "end" : "start",
      };
    }
    // Every lane uses the same orientation, even when its arrow points backwards.
    const low = Math.min(from, to), high = Math.max(from, to);
    const pair = ([u, v]: [number, number]) => Math.min(u, v) === low && Math.max(u, v) === high;
    const total = scene.edges.filter(pair).length;
    const ordinal = scene.edges.slice(0, i).filter(pair).length;
    const lane = (ordinal - (total - 1) / 2) * 48;
    const dx = positions[high].x - positions[low].x, dy = positions[high].y - positions[low].y;
    const distance = Math.hypot(dx, dy) || 1;
    const control = { x: (a.x + b.x) / 2 - dy / distance * lane, y: (a.y + b.y) / 2 + dx / distance * lane };
    const start = boundary(a, control), end = boundary(b, control);
    return {
      path: `M ${start.x} ${start.y} Q ${control.x} ${control.y}, ${end.x} ${end.y}`,
      points: [start, control, end],
      labelPoint: { x: (start.x + 2 * control.x + end.x) / 4, y: (start.y + 2 * control.y + end.y) / 4 - 8 },
      anchor: "middle",
    };
  });
  // Include curved lanes and their labels without shrinking text to fit the viewport.
  let left = 0, right = 640, top = 0;
  let bottom = Math.max(220, ...positions.map(p => p.y + halfHeight + 60));
  drawnEdges.forEach((edge, i) => {
    if (!edge) return;
    const label = shorten(scene.edgeLabels?.[i] ?? "", 34);
    const labelWidth = label.length * 7;
    const labelLeft = edge.labelPoint.x - (edge.anchor === "end" ? labelWidth : edge.anchor === "middle" ? labelWidth / 2 : 0);
    const labelRight = labelLeft + labelWidth;
    left = Math.min(left, ...edge.points.map(p => p.x - 18), labelLeft - 18);
    right = Math.max(right, ...edge.points.map(p => p.x + 18), labelRight + 18);
    top = Math.min(top, ...edge.points.map(p => p.y - 18), edge.labelPoint.y - 18);
    bottom = Math.max(bottom, ...edge.points.map(p => p.y + 18), edge.labelPoint.y + 18);
  });
  const width = Math.ceil(right - left), height = Math.ceil(bottom - top);
  const relationships = scene.edges.map(([from, to], i) => {
    if (!scene.nodes[from] || !scene.nodes[to]) return null;
    const label = scene.edgeLabels?.[i];
    return `${scene.nodes[from].label} ${scene.directed ? "to" : "connected to"} ${scene.nodes[to].label}${label ? `: ${label}` : ""}`;
  });
  const nodeDescriptions = scene.nodes.map(node => [node.label, node.value, ...(node.details ?? [])].filter(Boolean).join("; "));
  return <div className="min-w-0" data-network-diagram>
    <div className="max-h-[32rem] max-w-full overflow-auto rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" tabIndex={0} role="region" aria-label="Connected records diagram, scroll to explore">
      <svg viewBox={`${left} ${top} ${width} ${height}`} width={width} height={height} role="img" aria-labelledby={titleId} aria-describedby={descriptionId} className="mx-auto block min-w-[640px] max-w-none">
        <title id={titleId}>{scene.caption}</title>
        <desc id={descriptionId}>{`Records: ${nodeDescriptions.join(". ") || "none"}. Relationships: ${relationships.filter(Boolean).join(". ") || "none"}. Full records and relationships are also listed below the diagram.`}</desc>
        <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-teal-500" /></marker></defs>
        {drawnEdges.map((edge, i) => {
          if (!edge) return null;
          const label = scene.edgeLabels?.[i];
          return <g key={i}>
            <path d={edge.path} fill="none" className="stroke-teal-500" strokeWidth="2.5" markerEnd={scene.directed ? `url(#${marker})` : undefined} data-network-edge><title>{relationships[i]}</title></path>
            {label && <text x={edge.labelPoint.x} y={edge.labelPoint.y} textAnchor={edge.anchor} fontSize="12" className="fill-foreground stroke-background" strokeWidth="5" paintOrder="stroke"><title>{label}</title>{shorten(label, 34)}</text>}
          </g>;
        })}
        {scene.nodes.map((node, i) => {
          const lines = [...(node.value ? [node.value] : []), ...(node.details ?? []).slice(0, 3)];
          const firstLine = positions[i].y - (lines.length * 20) / 2 + 5;
          return <g key={i} data-network-node>
            <rect x={positions[i].x - halfWidth} y={positions[i].y - halfHeight} width={halfWidth * 2} height={nodeHeight} rx="12" className="fill-background stroke-accent" strokeWidth="2" />
            <text x={positions[i].x} y={firstLine} textAnchor="middle" fontSize="14" className="fill-foreground"><title>{node.label}</title>{shorten(node.label, 24)}</text>
            {lines.map((line, j) => <text key={j} x={positions[i].x} y={firstLine + (j + 1) * 20} textAnchor="middle" fontSize="12" className="fill-muted"><title>{line}</title>{shorten(line, 27)}</text>)}
          </g>;
        })}
      </svg>
    </div>
    <details className="mt-3 text-xs leading-relaxed text-muted">
      <summary className="cursor-pointer">Nodes and properties ({count})</summary>
      <ul className="mt-2 space-y-2 break-words" aria-label="Nodes and properties">
        {scene.nodes.map((node, i) => <li key={i}><span className="font-semibold text-foreground">{node.label}</span>{node.value && <span> · {node.value}</span>}{node.details?.length ? <ul className="mt-1 space-y-1 pl-3">{node.details.map((detail, j) => <li key={j}>{detail}</li>)}</ul> : null}</li>)}
        {!count && <li>No nodes in this result.</li>}
      </ul>
    </details>
    <ul className="mt-3 space-y-1 break-words text-xs leading-relaxed text-muted" aria-label="Relationships">
      {relationships.map((description, i) => description && <li key={i}>{description}</li>)}
      {!relationships.some(Boolean) && <li>No relationships in this result.</li>}
    </ul>
  </div>;
}
