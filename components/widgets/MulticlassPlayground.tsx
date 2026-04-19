"use client";

// Children, teenagers and adults by height and weight, sorted three ways.
//
// Every dot carries one of three labels, and the plane is shaded by which
// class the fitted model would call each spot. The toggle swaps the route to
// three classes, softmax sharing one unit of probability out across the
// classes, or one-vs-rest asking each class its own yes-or-no question, and
// the readout shows the ringed person's three scores with their total, which
// is one under the first route and whatever the three fits happened to say
// under the second. Click empty space to add a person in the class the
// toggle holds, click a person to ring them, drag them about, double-click
// to remove. Every score is the library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ClassedPoint,
  MulticlassAnswer,
  MulticlassRoute,
  classifyAmongThree,
} from "@/lib/concepts/multiclass-classification";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// Three people on a line, one per class, the page's worked example. The
// middle person sits at the mean of both columns, which is what makes the
// arithmetic clean.
const THREE_PEOPLE: ClassedPoint[] = [
  { x: 120, y: 25, label: 0 },
  { x: 150, y: 50, label: 1 },
  { x: 180, y: 75, label: 2 },
];

// The classification pages' crowd with its middle relabelled as teenagers,
// plus one more child and one more adult.
const CROWD: ClassedPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 145, y: 57, label: 1 },
  { x: 147, y: 41, label: 1 },
  { x: 156, y: 53, label: 1 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 78, label: 2 },
  { x: 180, y: 80, label: 2 },
  { x: 183, y: 83, label: 2 },
  { x: 186, y: 77, label: 2 },
];

// Which person each preset rings when it loads, the middle person of the
// worked example and a teenager in the crowd.
const THREE_PEOPLE_RINGED = 1;
const CROWD_RINGED = 6;

function randomCrowd(): ClassedPoint[] {
  const around = (
    centreX: number,
    centreY: number,
    label: number,
    count: number,
  ): ClassedPoint[] =>
    Array.from({ length: count }, () => ({
      x: Math.round(centreX + (Math.random() - 0.5) * 34),
      y: Math.round(centreY + (Math.random() - 0.5) * 30),
      label,
    }));
  return [
    ...around(125, 30, 0, 6),
    ...around(152, 52, 1, 6),
    ...around(180, 78, 2, 6),
  ];
}

const MAX_POINTS = 100;

const CLASS_NAMES = ["child", "teenager", "adult"];

const POINT_FILLS = ["fill-amber-500", "fill-emerald-600", "fill-indigo-600"];

const REGION_FILLS = [
  "fill-amber-500/15",
  "fill-emerald-500/15",
  "fill-indigo-500/15",
];

const ACTIVE_ADD_CLASSES = [
  "bg-amber-500 text-white",
  "bg-emerald-600 text-white",
  "bg-indigo-600 text-white",
];

const SCORE_TEXT = [
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-indigo-600 dark:text-indigo-400",
];

const ROUTES: { key: MulticlassRoute; label: string }[] = [
  { key: "softmax", label: "Softmax" },
  { key: "one_vs_rest", label: "One vs rest" },
];

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

function passesText(answer: MulticlassAnswer): string {
  if (answer.route === "softmax") {
    return answer.epochs_run === null
      ? "…"
      : String(answer.epochs_run) + (answer.converged ? "" : " (cap)");
  }
  return answer.class_fits
    .map((fit) => String(fit.epochs_run) + (fit.converged ? "" : "*"))
    .join(" · ");
}

function statusText(
  answer: MulticlassAnswer | null,
  route: MulticlassRoute,
  ringed: number,
): string {
  if (!answer || ringed >= answer.row_sums.length) return "…";
  const total = answer.row_sums[ringed].toFixed(2);
  if (route === "softmax") {
    return `The three scores share one unit of probability, so they total ${total} for the ringed person and for everyone else.`;
  }
  return `Three separate fits, never introduced to one another, and their answers total ${total} for the ringed person.`;
}

export function MulticlassPlayground() {
  const [points, setPoints] = useState<ClassedPoint[]>(THREE_PEOPLE);
  const [ringed, setRinged] = useState(THREE_PEOPLE_RINGED);
  const [route, setRoute] = useState<MulticlassRoute>("softmax");
  const [addClass, setAddClass] = useState(1);
  const [answer, setAnswer] = useState<MulticlassAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await classifyAmongThree(points, route));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, route]);

  const load = (preset: ClassedPoint[], ringedIndex: number) => {
    setPoints(preset);
    setRinged(ringedIndex);
  };

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
    setRinged(points.length);
    dragging.current = points.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    setRinged(index);
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
    if (points.length <= 3) return;
    setPoints((current) => current.filter((_, i) => i !== index));
    setRinged((current) =>
      current === index ? 0 : current > index ? current - 1 : current,
    );
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

  const ringedPerson = points[ringed];
  const ringedScores =
    answer && ringed < answer.scores.length ? answer.scores[ringed] : null;
  const ringedTotal =
    answer && ringed < answer.row_sums.length ? answer.row_sums[ringed] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => load(THREE_PEOPLE, THREE_PEOPLE_RINGED)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Three people
        </button>
        <button
          onClick={() => load(CROWD, CROWD_RINGED)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The crowd
        </button>
        <button
          onClick={() => load(randomCrowd(), CROWD_RINGED)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random crowd
        </button>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {CLASS_NAMES.map((name, label) => (
            <button
              key={name}
              onClick={() => setAddClass(label)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (addClass === label
                  ? ACTIVE_ADD_CLASSES[label]
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              Add {name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {ROUTES.map((option) => (
            <button
              key={option.key}
              onClick={() => setRoute(option.key)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (route === option.key
                  ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
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
                className={REGION_FILLS[label % REGION_FILLS.length]}
              />
            );
          }),
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <g key={index}>
              {index === ringed && (
                <circle
                  cx={px}
                  cy={py}
                  r={11}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-slate-700 dark:text-slate-200"
                />
              )}
              <circle
                cx={px}
                cy={py}
                r={6}
                className={
                  "cursor-grab stroke-white dark:stroke-slate-900 " +
                  POINT_FILLS[point.label % POINT_FILLS.length]
                }
                strokeWidth={1.5}
                onPointerDown={onPointPointerDown(index)}
                onDoubleClick={removePoint(index)}
              />
            </g>
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
        Amber is a child, green a teenager, indigo an adult, and the shading is
        the fitted model&rsquo;s call at every spot. The ringed person&rsquo;s
        scores are read out below.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[3fr_2fr]">
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {ringedPerson
              ? `Ringed person, a ${CLASS_NAMES[ringedPerson.label]} at ${ringedPerson.x} cm and ${ringedPerson.y} kg`
              : "Ringed person"}
          </div>
          <table className="mt-1 w-full font-mono text-sm">
            <tbody>
              {CLASS_NAMES.map((name, label) => (
                <tr key={name}>
                  <td className={"py-0.5 " + SCORE_TEXT[label]}>{name}</td>
                  <td className="py-0.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {ringedScores ? ringedScores[label].toFixed(2) : "…"}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-300 dark:border-slate-600">
                <td className="py-0.5 text-slate-600 dark:text-slate-300">
                  total
                </td>
                <td className="py-0.5 text-right text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {ringedTotal !== null ? ringedTotal.toFixed(2) : "…"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Stat
            label="Accuracy"
            value={answer ? answer.accuracy.toFixed(3) : "…"}
          />
          <Stat
            label={
              route === "softmax"
                ? "Passes of the ascent"
                : "Passes, one fit per class"
            }
            value={answer ? passesText(answer) : "…"}
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(answer, route, ringed)}
      </p>
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
