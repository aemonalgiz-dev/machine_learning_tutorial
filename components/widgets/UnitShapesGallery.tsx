"use client";

// The shape of one unit away, drawn six times.
//
// Every panel is the same lattice of cells, and in each one the library was
// asked how far every cell sits from the centre under one metric. Cells the
// metric puts within one unit are shaded indigo, the cells it puts at exactly
// one unit are darker, and everything further out deepens toward slate with
// distance. Three of the panels keep their shape wherever the centre goes and
// three do not, so click anywhere on a panel to move the centre and see which
// is which. Every distance comes from the API, not the browser.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  METRIC_NAMES,
  METRIC_TITLES,
  MetricName,
  UnitShape,
  unitShape,
} from "@/lib/concepts/distance-metrics";

const ORIGIN: Point = { x: 0, y: 0 };
const ONE_ONE: Point = { x: 1, y: 1 };

// The lattice's side, used only to size an empty panel before its answer
// arrives; every drawn panel reads the side from the answer itself.
const PLACEHOLDER_CELLS = 41;

type ShapesByMetric = Partial<Record<MetricName, UnitShape>>;

export function UnitShapesGallery() {
  const [centre, setCentre] = useState<Point>(ORIGIN);
  const [shapes, setShapes] = useState<ShapesByMetric>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const answers = await Promise.all(
          METRIC_NAMES.map((metric) => unitShape(metric, centre)),
        );
        if (stale) return;
        const byMetric: ShapesByMetric = {};
        for (const answer of answers) byMetric[answer.metric] = answer;
        setShapes(byMetric);
        setMessage(null);
      } catch (error) {
        if (stale) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      stale = true;
    };
  }, [centre]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setCentre(ORIGIN)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          From the origin
        </button>
        <button
          onClick={() => setCentre(ONE_ONE)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          From (1, 1)
        </button>
        <span className="ml-auto text-sm text-slate-600 dark:text-slate-300">
          Centre{" "}
          <span className="font-mono">
            ({centre.x.toFixed(1)}, {centre.y.toFixed(1)})
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {METRIC_NAMES.map((metric) => (
          <ShapePanel
            key={metric}
            metric={metric}
            shape={shapes[metric]}
            onPick={setCentre}
          />
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Indigo cells sit within one unit of the centre under that metric, and
        the darker ones exactly one unit away. Click a panel to move the
        centre.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function ShapePanel({
  metric,
  shape,
  onPick,
}: {
  metric: MetricName;
  shape: UnitShape | undefined;
  onPick: (centre: Point) => void;
}) {
  const cells = shape?.cells ?? PLACEHOLDER_CELLS;

  // How far the furthest cell in this panel sits beyond one unit, so the
  // slate shading has a top to reach.
  let furthestBeyondOne = 0;
  if (shape) {
    for (const row of shape.distances) {
      for (const distance of row) {
        if (distance - 1 > furthestBeyondOne) furthestBeyondOne = distance - 1;
      }
    }
  }

  // The lattice is integers over a fixed count of steps per unit, and the
  // API computes its cell coordinates the same way, so a picked centre lands
  // on a cell exactly rather than a rounding error away from it.
  const stepsPerUnit = shape
    ? Math.round((shape.cells - 1) / (shape.x_max - shape.x_min))
    : 0;

  const pickCentre = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!shape) return;
    const rectangle = event.currentTarget.getBoundingClientRect();
    const clampIndex = (index: number) =>
      Math.min(shape.cells - 1, Math.max(0, index));
    const column = clampIndex(
      Math.floor(
        ((event.clientX - rectangle.left) / rectangle.width) * shape.cells,
      ),
    );
    const rowFromTop = clampIndex(
      Math.floor(
        ((event.clientY - rectangle.top) / rectangle.height) * shape.cells,
      ),
    );
    const row = shape.cells - 1 - rowFromTop;
    onPick({
      x: (column + shape.x_min * stepsPerUnit) / stepsPerUnit,
      y: (row + shape.y_min * stepsPerUnit) / stepsPerUnit,
    });
  };

  const centreColumn = shape
    ? Math.round((shape.centre.x - shape.x_min) * stepsPerUnit)
    : 0;
  const centreRow = shape
    ? Math.round((shape.centre.y - shape.y_min) * stepsPerUnit)
    : 0;
  const originColumn = shape ? Math.round(-shape.x_min * stepsPerUnit) : 0;
  const originRow = shape ? Math.round(-shape.y_min * stepsPerUnit) : 0;

  return (
    <div>
      <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        {METRIC_TITLES[metric]}
      </div>
      <svg
        viewBox={`0 0 ${cells} ${cells}`}
        shapeRendering="crispEdges"
        className="w-full cursor-crosshair select-none rounded-md bg-slate-100 dark:bg-slate-900"
        onClick={pickCentre}
      >
        {shape?.distances.map((row, rowIndex) =>
          row.map((distance, columnIndex) => {
            const inside = shape.inside[rowIndex][columnIndex];
            const onBoundary = shape.on_boundary[rowIndex][columnIndex];
            const beyondOne = Math.max(0, distance - 1);
            const shade =
              furthestBeyondOne > 0
                ? 0.08 + 0.42 * Math.min(1, beyondOne / furthestBeyondOne)
                : 0.08;
            return (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                x={columnIndex}
                y={cells - 1 - rowIndex}
                width={1}
                height={1}
                className={
                  onBoundary
                    ? "fill-indigo-600 dark:fill-indigo-400"
                    : inside
                      ? "fill-indigo-300 dark:fill-indigo-800"
                      : "fill-slate-500 dark:fill-slate-500"
                }
                fillOpacity={onBoundary || inside ? 1 : shade}
              />
            );
          }),
        )}

        {shape && (
          <>
            <line
              x1={originColumn + 0.5}
              y1={0}
              x2={originColumn + 0.5}
              y2={cells}
              stroke="currentColor"
              strokeWidth={0.12}
              className="text-slate-500 dark:text-slate-400"
            />
            <line
              x1={0}
              y1={cells - 1 - originRow + 0.5}
              x2={cells}
              y2={cells - 1 - originRow + 0.5}
              stroke="currentColor"
              strokeWidth={0.12}
              className="text-slate-500 dark:text-slate-400"
            />
            <circle
              cx={centreColumn + 0.5}
              cy={cells - 1 - centreRow + 0.5}
              r={0.8}
              strokeWidth={0.3}
              className="fill-white stroke-slate-900 dark:fill-slate-950 dark:stroke-white"
            />
          </>
        )}
      </svg>
      <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
        {shape
          ? `${shape.inside_count} within one, ${shape.boundary_count} exactly one`
          : "…"}
      </div>
    </div>
  );
}
