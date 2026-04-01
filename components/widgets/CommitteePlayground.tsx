"use client";

// A committee of deep trees, and what changes as it grows.
//
// The people are the trees page's tangled crowd, and the slider sets how many
// trees sit on the committee, each grown to full depth on its own bootstrap
// resample. The regions are the committee's majority answer at every spot, so
// one member draws the trees page's confetti and a crowd smooths it. The
// readouts carry the two scores worth comparing, the flattering one measured
// on the training people and the honest out-of-bag one, plus the census of
// which feature each member's first question used, which is where bagging and
// the random forest part company. Every committee is the library's through
// the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  CommitteeAnswer,
  LabelledPoint,
  fitCommittee,
} from "@/lib/api";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const CLEAN_PEOPLE: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
];

// The trees page's tangled crowd, where a lone deep tree memorises.
const TANGLED_PEOPLE: LabelledPoint[] = [
  ...CLEAN_PEOPLE,
  { x: 145, y: 45, label: 0 },
  { x: 145, y: 55, label: 1 },
  { x: 151, y: 45, label: 1 },
  { x: 151, y: 55, label: 0 },
  { x: 157, y: 45, label: 0 },
  { x: 157, y: 55, label: 1 },
  { x: 148, y: 50, label: 1 },
  { x: 154, y: 50, label: 0 },
  { x: 160, y: 50, label: 1 },
  { x: 147, y: 58, label: 0 },
  { x: 153, y: 58, label: 1 },
  { x: 150, y: 42, label: 1 },
  { x: 156, y: 42, label: 0 },
  { x: 143, y: 50, label: 0 },
];


// Fifteen cleanly separated people, the ideal case, one question's worth of
// structure that any committee size gets right.
const IDEAL_PEOPLE: LabelledPoint[] = [
  ...CLEAN_PEOPLE,
  { x: 128, y: 30, label: 0 },
  { x: 140, y: 38, label: 0 },
  { x: 168, y: 66, label: 1 },
  { x: 174, y: 70, label: 1 },
];

function randomCrowd(): LabelledPoint[] {
  const around = (
    centreX: number,
    centreY: number,
    label: number,
    count: number,
  ): LabelledPoint[] =>
    Array.from({ length: count }, () => ({
      x: Math.round(centreX + (Math.random() - 0.5) * 34),
      y: Math.round(centreY + (Math.random() - 0.5) * 30),
      label,
    }));
  return [...around(132, 36, 0, 8), ...around(168, 66, 1, 8)];
}

const MAX_POINTS = 100;

function toPixel(point: { x: number; y: number }) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number) {
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

export function CommitteePlayground({
  kind,
}: {
  kind: "bagging" | "random-forest";
}) {
  const [points, setPoints] = useState<LabelledPoint[]>(TANGLED_PEOPLE);
  const [nMembers, setNMembers] = useState(25);
  const [addClass, setAddClass] = useState(0);
  const [answer, setAnswer] = useState<CommitteeAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitCommittee(kind, points, nMembers));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [kind, points, nMembers]);

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
    setPoints((current) => [...current, { ...dropped, label: addClass }]);
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
      current.map((point, i) => (i === index ? { ...point, ...moved } : point)),
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

  const regions = answer?.regions;
  const cellWidth = regions ? PLOT.width / regions.cells : 0;
  const cellHeight = regions ? PLOT.height / regions.cells : 0;

  const regionPixel = (column: number, row: number) => {
    if (!regions) return { px: 0, py: 0 };
    const x =
      regions.x_min +
      ((column + 0.5) / regions.cells) * (regions.x_max - regions.x_min);
    const y =
      regions.y_min +
      ((row + 0.5) / regions.cells) * (regions.y_max - regions.y_min);
    return toPixel({ x, y });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setPoints(TANGLED_PEOPLE)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Tangled crowd
        </button>
        <button
          onClick={() => setPoints(IDEAL_PEOPLE)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          An Ideal Case
        </button>
        <button
          onClick={() => setPoints(randomCrowd())}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random crowd
        </button>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[
            { label: "Add children", value: 0 },
            { label: "Add adults", value: 1 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setAddClass(option.value)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (addClass === option.value
                  ? option.value === 0
                    ? "bg-amber-500 text-white"
                    : "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Trees
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={nMembers}
            onChange={(event) => setNMembers(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-6 font-mono text-sm">{nMembers}</span>
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
        {regions?.labels.map((row, rowIndex) =>
          row.map((label, columnIndex) => {
            const { px, py } = regionPixel(columnIndex, rowIndex);
            return (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                x={px - cellWidth / 2}
                y={py - cellHeight / 2}
                width={cellWidth + 0.5}
                height={cellHeight + 0.5}
                className={
                  label === 1 ? "fill-indigo-500/15" : "fill-amber-500/15"
                }
              />
            );
          }),
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              className={
                point.label === 1
                  ? "cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
                  : "cursor-grab fill-amber-500 stroke-white dark:stroke-slate-900"
              }
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
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

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Training accuracy"
          value={answer ? answer.accuracy.toFixed(3) : "…"}
        />
        <Stat
          label="Out-of-bag score"
          value={answer ? answer.out_of_bag_score.toFixed(3) : "…"}
        />
        <Stat
          label="Roots on height"
          value={answer ? String(answer.roots_on_height) : "…"}
        />
        <Stat
          label="Roots on weight"
          value={answer ? String(answer.roots_on_weight) : "…"}
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
