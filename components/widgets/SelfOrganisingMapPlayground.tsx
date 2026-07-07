"use client";

// A net of units draped over unlabelled people.
//
// Nothing here carries a label. Each small square is a unit of the map, the
// lines join it to its neighbours on a grid that never changes, and fitting
// drapes that net over the people, every person pulling the nearest unit and
// its grid neighbours toward them. Each dot takes the colour of the unit that
// won it, and the colours run with the grid, hue along the columns and shade
// down the rows, so squares that are neighbours on the grid wear neighbouring
// colours and the arrangement can be read off the picture. The sliders set
// the grid and the epoch budget, and every move of one is a fresh fit from
// the same seed rather than a step of one fit, because the schedules that
// drive the walk are fractions of the budget. Click to add people, drag them,
// double-click to remove. Every unit position and every winner is the
// library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, OrganisedMap, Point, organiseMap } from "@/lib/api";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// Eight people in two tight clumps whose group means are whole numbers, the
// k-means page's worked example, which this page drapes a one-by-two map over.
const WORKED_PEOPLE: Point[] = [
  { x: 118, y: 24 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 124, y: 27 },
  { x: 178, y: 78 },
  { x: 180, y: 80 },
  { x: 182, y: 83 },
  { x: 184, y: 79 },
];

// The classification pages' crowd with its labels stripped away.
const CROWD: Point[] = [
  { x: 147, y: 41 },
  { x: 156, y: 53 },
  { x: 145, y: 57 },
  { x: 159, y: 57 },
  { x: 162, y: 61 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 118, y: 24 },
  { x: 180, y: 80 },
  { x: 183, y: 83 },
  { x: 178, y: 78 },
];

const MAX_POINTS = 100;

const MIN_SIDE = 1;
const MAX_SIDE = 6;
const MIN_EPOCHS = 1;
const MAX_EPOCHS = 200;
const DEFAULT_WIDTH = 2;
const DEFAULT_HEIGHT = 1;
const DEFAULT_EPOCHS = 100;

const UNIT_SIZE = 12;

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const SLIDER_LABEL_CLASS =
  "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300";

// A colour for each place on the grid rather than a palette cycled by index,
// so the colours carry the arrangement. The hue runs along the columns from
// indigo, and the shade darkens down the rows.
function unitColour(
  row: number,
  column: number,
  width: number,
  height: number,
): string {
  const hue = (230 + (300 * column) / width) % 360;
  const lightness = height > 1 ? 60 - (22 * row) / (height - 1) : 50;
  return `hsl(${hue.toFixed(0)} 65% ${lightness.toFixed(0)}%)`;
}

function toPixel(point: Point) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number): Point {
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high, Math.max(low, Math.round(value)));
  return {
    x: clamp(
      DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
      DOMAIN.xMin,
      DOMAIN.xMax,
    ),
    y: clamp(
      DOMAIN.yMin +
        (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin),
      DOMAIN.yMin,
      DOMAIN.yMax,
    ),
  };
}

interface NetLine {
  key: string;
  from: Point;
  to: Point;
}

// The joins of the net, each unit to the unit on its right and the unit
// below it, read from the row-major order the units arrive in.
function netLines(answer: OrganisedMap): NetLine[] {
  const lines: NetLine[] = [];
  const unitAt = (row: number, column: number) =>
    answer.units[row * answer.grid_width + column];
  for (const unit of answer.units) {
    if (unit.column + 1 < answer.grid_width) {
      const right = unitAt(unit.row, unit.column + 1);
      lines.push({
        key: `h${unit.row}-${unit.column}`,
        from: unit,
        to: right,
      });
    }
    if (unit.row + 1 < answer.grid_height) {
      const below = unitAt(unit.row + 1, unit.column);
      lines.push({
        key: `v${unit.row}-${unit.column}`,
        from: unit,
        to: below,
      });
    }
  }
  return lines;
}

export function SelfOrganisingMapPlayground() {
  const [points, setPoints] = useState<Point[]>(WORKED_PEOPLE);
  const [gridWidth, setGridWidth] = useState(DEFAULT_WIDTH);
  const [gridHeight, setGridHeight] = useState(DEFAULT_HEIGHT);
  const [epochs, setEpochs] = useState(DEFAULT_EPOCHS);
  const [answer, setAnswer] = useState<OrganisedMap | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await organiseMap(points, gridWidth, gridHeight, epochs));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, gridWidth, gridHeight, epochs]);

  const eventToData = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return toData(px, py);
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (points.length >= MAX_POINTS) return;
    const dropped = eventToData(event.clientX, event.clientY);
    setPoints((current) => [...current, dropped]);
    dragging.current = points.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToData(event.clientX, event.clientY);
    const index = dragging.current;
    setPoints((current) =>
      current.map((point, i) => (i === index ? moved : point)),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removePoint = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (points.length <= 2) return;
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  const lines = answer ? netLines(answer) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => setPoints(WORKED_PEOPLE)} className={BUTTON_CLASS}>
          An Ideal Case
        </button>
        <button onClick={() => setPoints(CROWD)} className={BUTTON_CLASS}>
          The crowd, unlabelled
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-3">
        <label className={SLIDER_LABEL_CLASS}>
          Width
          <input
            type="range"
            min={MIN_SIDE}
            max={MAX_SIDE}
            step={1}
            value={gridWidth}
            onChange={(event) => setGridWidth(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{gridWidth}</span>
        </label>
        <label className={SLIDER_LABEL_CLASS}>
          Height
          <input
            type="range"
            min={MIN_SIDE}
            max={MAX_SIDE}
            step={1}
            value={gridHeight}
            onChange={(event) => setGridHeight(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{gridHeight}</span>
        </label>
        <label className={SLIDER_LABEL_CLASS}>
          Epochs
          <input
            type="range"
            min={MIN_EPOCHS}
            max={MAX_EPOCHS}
            step={1}
            value={epochs}
            onChange={(event) => setEpochs(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-8 font-mono text-sm">{epochs}</span>
        </label>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* the net, each unit joined to its grid neighbours */}
        {lines.map((line) => {
          const from = toPixel(line.from);
          const to = toPixel(line.to);
          return (
            <line
              key={line.key}
              x1={from.px}
              y1={from.py}
              x2={to.px}
              y2={to.py}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeWidth={2}
            />
          );
        })}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          const winner = answer?.winners[index];
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              fill={
                winner && answer
                  ? unitColour(
                      winner.row,
                      winner.column,
                      answer.grid_width,
                      answer.grid_height,
                    )
                  : undefined
              }
              className={
                "cursor-grab stroke-white dark:stroke-slate-900" +
                (winner ? "" : " fill-slate-500")
              }
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
          );
        })}

        {/* the units, where each came to rest */}
        {answer?.units.map((unit) => {
          const { px, py } = toPixel(unit);
          return (
            <rect
              key={`u${unit.row}-${unit.column}`}
              x={px - UNIT_SIZE / 2}
              y={py - UNIT_SIZE / 2}
              width={UNIT_SIZE}
              height={UNIT_SIZE}
              fill={unitColour(
                unit.row,
                unit.column,
                answer.grid_width,
                answer.grid_height,
              )}
              stroke="currentColor"
              className="text-slate-800 dark:text-slate-100"
              strokeWidth={2}
            >
              <title>
                {`unit (${unit.row}, ${unit.column}) at (${unit.x.toFixed(1)}, ${unit.y.toFixed(1)})`}
              </title>
            </rect>
          );
        })}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height (cm)
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Weight (kg)
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each square is a unit, joined to its neighbours on the grid, and each
        person wears the colour of the unit that won them. Every change here is
        a fresh fit from the same seed, not a step of one fit. Hover a square
        for where it rests.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Epochs run"
          value={answer ? String(answer.epochs_run) : "…"}
        />
        <Stat
          label="Final movement"
          value={answer ? answer.final_movement.toFixed(3) : "…"}
        />
        <Stat
          label="Quantisation error"
          value={answer ? answer.quantisation_error.toFixed(2) : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
