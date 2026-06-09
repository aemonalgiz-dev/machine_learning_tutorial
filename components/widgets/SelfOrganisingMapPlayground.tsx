"use client";

// A net of cells draped over unlabelled people.
//
// Nothing here carries a label. Each small square is one cell of the map, the
// lines join it to its neighbours on a grid that never changes, and fitting
// drapes that net over the people, every person pulling the nearest cell and
// its grid neighbours toward them. Each dot takes the colour of the cell that
// won it, and the colours run with the grid, hue along the columns and shade
// down the rows, so cells that are neighbours on the grid wear neighbouring
// colours and the arrangement can be read off the picture. The reach control
// is the page's central claim made adjustable: shrinking is the ordinary
// schedule, held wide leaves every cell moving with every winner all the way
// through, and switched off leaves only winners moving, which is the plain
// grouping method. Every change of a slider or a dot is a fresh fit from the
// same seed rather than a step of one fit, because the two schedules are
// fractions of the epoch budget. Click to add people, drag them, double-click
// to remove. The API computes every cell position and every winner; the
// browser only draws them.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  FittedMap,
  ReachSetting,
  fitMap,
} from "@/lib/concepts/self-organising-map";
import {
  ARCH,
  BUTTON_CLASS,
  CROWD,
  DOMAIN,
  SLIDER_LABEL_CLASS,
  TWO_CLUMPS,
  cellColour,
  randomCrowd,
} from "./selfOrganisingMapFixtures";

const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const MAX_POINTS = 100;

const MIN_SIDE = 1;
const MAX_SIDE = 6;
const MIN_EPOCHS = 1;
const MAX_EPOCHS = 200;
const DEFAULT_WIDTH = 4;
const DEFAULT_HEIGHT = 1;
const DEFAULT_EPOCHS = 100;

const UNIT_SIZE = 12;

// A reach held at ten never falls below the diagonal of the largest grid the
// API will build, so every cell moves with every winner for the whole walk.
const HELD_WIDE = 10;

type ReachChoice = "shrinking" | "wide" | "off";

const REACH_CHOICES: { key: ReachChoice; label: string }[] = [
  { key: "shrinking", label: "shrinking" },
  { key: "wide", label: "held wide" },
  { key: "off", label: "switched off" },
];

function reachFor(choice: ReachChoice): ReachSetting | undefined {
  if (choice === "wide") return { start: HELD_WIDE, end: HELD_WIDE };
  if (choice === "off") return { start: 0, end: 0 };
  return undefined;
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
      DOMAIN.xMin +
        ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
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

// The joins of the net, each cell to the cell on its right and the cell below
// it, read from the row-major order the cells arrive in.
function netLines(answer: FittedMap): NetLine[] {
  const lines: NetLine[] = [];
  const cellAt = (row: number, column: number) =>
    answer.units[row * answer.grid_width + column];
  for (const cell of answer.units) {
    if (cell.column + 1 < answer.grid_width) {
      lines.push({
        key: `h${cell.row}-${cell.column}`,
        from: cell,
        to: cellAt(cell.row, cell.column + 1),
      });
    }
    if (cell.row + 1 < answer.grid_height) {
      lines.push({
        key: `v${cell.row}-${cell.column}`,
        from: cell,
        to: cellAt(cell.row + 1, cell.column),
      });
    }
  }
  return lines;
}

export function SelfOrganisingMapPlayground() {
  const [points, setPoints] = useState<Point[]>(CROWD);
  const [gridWidth, setGridWidth] = useState(DEFAULT_WIDTH);
  const [gridHeight, setGridHeight] = useState(DEFAULT_HEIGHT);
  const [epochs, setEpochs] = useState(DEFAULT_EPOCHS);
  const [reach, setReach] = useState<ReachChoice>("shrinking");
  const [answer, setAnswer] = useState<FittedMap | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(
          await fitMap(points, gridWidth, gridHeight, epochs, reachFor(reach)),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, gridWidth, gridHeight, epochs, reach]);

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
        <button onClick={() => setPoints(ARCH)} className={BUTTON_CLASS}>
          An Ideal Case
        </button>
        <button onClick={() => setPoints(CROWD)} className={BUTTON_CLASS}>
          The crowd, unlabelled
        </button>
        <button onClick={() => setPoints(TWO_CLUMPS)} className={BUTTON_CLASS}>
          Two clumps of four
        </button>
        <button
          onClick={() => setPoints(randomCrowd())}
          className={BUTTON_CLASS}
        >
          A fresh crowd
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
        <span className={SLIDER_LABEL_CLASS}>
          Reach
          <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {REACH_CHOICES.map((choice) => (
              <button
                key={choice.key}
                onClick={() => setReach(choice.key)}
                className={
                  "rounded px-2 py-0.5 text-xs font-medium transition " +
                  (reach === choice.key
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                {choice.label}
              </button>
            ))}
          </span>
        </span>
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
                  ? cellColour(
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

        {answer?.units.map((cell) => {
          const { px, py } = toPixel(cell);
          return (
            <rect
              key={`u${cell.row}-${cell.column}`}
              x={px - UNIT_SIZE / 2}
              y={py - UNIT_SIZE / 2}
              width={UNIT_SIZE}
              height={UNIT_SIZE}
              fill={cellColour(
                cell.row,
                cell.column,
                answer.grid_width,
                answer.grid_height,
              )}
              stroke="currentColor"
              className="text-slate-800 dark:text-slate-100"
              strokeWidth={2}
            >
              <title>
                {`cell (${cell.row}, ${cell.column}) at (${cell.x.toFixed(1)}, ${cell.y.toFixed(1)})`}
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
        Each square is a cell, joined to its neighbours on the grid, and each
        person wears the colour of the cell that won them. Switch the reach off
        and the net falls apart into an ordinary grouping. Every change here is
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
