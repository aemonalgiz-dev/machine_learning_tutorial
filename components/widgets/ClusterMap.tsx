"use client";

// One small map of a grouping, shared by the gallery widgets on the k-means
// page.
//
// The plane is shaded by which centre is nearest when a region grid is
// supplied, every person is coloured by the group the fit gave them, grey if
// the fit gave them none, and each centre is an X. Nothing here is computed;
// the labels, centres and regions all arrive from the API and this only
// draws them on fixed axes.

import { Point, RegionGrid } from "@/lib/api";
import { groupColour } from "./kMeansFixtures";

export const MAP_DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };

export function ClusterMap({
  points,
  labels,
  centres = [],
  regions,
  width = 300,
  height = 240,
  arrows = [],
  highlight,
}: {
  points: Point[];
  labels?: number[];
  centres?: Point[];
  regions?: RegionGrid;
  width?: number;
  height?: number;
  arrows?: { from: Point; to: Point }[];
  highlight?: number;
}) {
  const pad = { left: 8, right: 8, top: 8, bottom: 8 };
  const plot = { width: width - pad.left - pad.right, height: height - pad.top - pad.bottom };
  const plotX = (x: number) => pad.left + ((x - MAP_DOMAIN.xMin) / (MAP_DOMAIN.xMax - MAP_DOMAIN.xMin)) * plot.width;
  const plotY = (y: number) => pad.top + (1 - (y - MAP_DOMAIN.yMin) / (MAP_DOMAIN.yMax - MAP_DOMAIN.yMin)) * plot.height;
  const cellWidth = regions ? ((regions.x_max - regions.x_min) / regions.cells) * (plot.width / (MAP_DOMAIN.xMax - MAP_DOMAIN.xMin)) : 0;
  const cellHeight = regions ? ((regions.y_max - regions.y_min) / regions.cells) * (plot.height / (MAP_DOMAIN.yMax - MAP_DOMAIN.yMin)) : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
      {regions?.labels.map((row, rowIndex) =>
        row.map((label, columnIndex) => {
          const x = regions.x_min + ((columnIndex + 0.5) / regions.cells) * (regions.x_max - regions.x_min);
          const y = regions.y_min + ((rowIndex + 0.5) / regions.cells) * (regions.y_max - regions.y_min);
          return (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={plotX(x) - cellWidth / 2}
              y={plotY(y) - cellHeight / 2}
              width={cellWidth + 0.5}
              height={cellHeight + 0.5}
              fill={groupColour(label)}
              opacity={0.14}
            />
          );
        }),
      )}
      {arrows.map((arrow, index) => (
        <g key={`a${index}`}>
          <line x1={plotX(arrow.from.x)} y1={plotY(arrow.from.y)} x2={plotX(arrow.to.x)} y2={plotY(arrow.to.y)} className="stroke-slate-500 dark:stroke-slate-400" strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={plotX(arrow.from.x)} cy={plotY(arrow.from.y)} r={3} fill="none" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth={1.5} />
        </g>
      ))}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={plotX(point.x)}
          cy={plotY(point.y)}
          r={index === highlight ? 6 : 4.5}
          fill={groupColour(labels?.[index])}
          stroke={index === highlight ? "#0f172a" : "white"}
          strokeWidth={index === highlight ? 2 : 1}
        />
      ))}
      {centres.map((centre, index) => (
        <g key={`c${index}`} className="text-slate-800 dark:text-slate-100">
          <line x1={plotX(centre.x) - 6} y1={plotY(centre.y) - 6} x2={plotX(centre.x) + 6} y2={plotY(centre.y) + 6} stroke="currentColor" strokeWidth={2.5} />
          <line x1={plotX(centre.x) - 6} y1={plotY(centre.y) + 6} x2={plotX(centre.x) + 6} y2={plotY(centre.y) - 6} stroke="currentColor" strokeWidth={2.5} />
        </g>
      ))}
    </svg>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

export function ChoiceButtons<T extends string>({
  choices,
  value,
  onChange,
}: {
  choices: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
      {choices.map((choice) => (
        <button
          key={choice.value}
          onClick={() => onChange(choice.value)}
          className={
            "rounded px-2 py-0.5 text-xs font-medium transition " +
            (value === choice.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
          }
        >
          {choice.label}
        </button>
      ))}
    </span>
  );
}
