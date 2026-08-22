"use client";

// One column of raw values, and the same column read on five rulers.
//
// The top line holds the raw values, whole numbers you can drag, add by
// clicking empty space and remove by double-clicking. Each row beneath it is
// the same values after one scaling method, with the centre and spread that
// method read off the column printed at the left and the amber dot's scaled
// value at the right. The amber dot is the same value in every row, so the
// rows are five rulers laid against one number. A value that falls off the
// end of a ruler is drawn as a hollow arrow at that end. Every centre, spread
// and scaled position is the library's through the API; the browser only
// turns numbers into pixels.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  FeatureScalings,
  MethodScaling,
  ScalingMethod,
  scaleFeature,
} from "@/lib/api";
import {
  CROWD_HEIGHTS,
  FIVE_READINGS,
  IDEAL_HEIGHTS,
  TALLEST_INDEX,
  WITH_AN_OUTLIER,
  randomHeights,
} from "./featureScalingFixtures";

const DOMAIN = { min: 0, max: 200 };
const VIEW = { width: 640 };
const PAD = { left: 20, right: 20 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right };

const RAW_HEIGHT = 72;
const RAW_BASELINE = 48;
const RULER_HEIGHT = 56;
const RULER_BASELINE = 34;
const DOT_RADIUS = 6;
const STACK_STEP = 9;

const MAX_VALUES = 30;
const MIN_VALUES = 2;

const RAW_TICKS = [0, 50, 100, 150, 200];

interface Ruler {
  method: ScalingMethod;
  label: string;
  min: number;
  max: number;
  ticks: number[];
}

// Each ruler keeps a fixed range on purpose. If it stretched to fit whatever
// came back, an outlier squashing the other values toward zero would look
// like nothing had happened.
const RULERS: Ruler[] = [
  {
    method: "standardize",
    label: "Standardize",
    min: -3,
    max: 3,
    ticks: [-3, -2, -1, 0, 1, 2, 3],
  },
  {
    method: "min_max",
    label: "Min-max",
    min: 0,
    max: 1,
    ticks: [0, 0.25, 0.5, 0.75, 1],
  },
  {
    method: "max_abs",
    label: "Max-abs",
    min: 0,
    max: 1,
    ticks: [0, 0.25, 0.5, 0.75, 1],
  },
  {
    method: "robust",
    label: "Robust",
    min: -3,
    max: 3,
    ticks: [-3, -2, -1, 0, 1, 2, 3],
  },
  {
    method: "root_mean_square",
    label: "Root mean square",
    min: 0,
    max: 3,
    ticks: [0, 1, 2, 3],
  },
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

function positionOn(value: number, min: number, max: number): number {
  return PAD.left + ((value - min) / (max - min)) * PLOT.width;
}

// How many earlier dots already sit at each pixel column, so equal values
// stack upward instead of hiding one another.
function stackHeights(pixelColumns: number[]): number[] {
  const seen = new Map<number, number>();
  return pixelColumns.map((column) => {
    const count = seen.get(column) ?? 0;
    seen.set(column, count + 1);
    return count;
  });
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function FeatureScalingPlayground() {
  const [values, setValues] = useState<number[]>(FIVE_READINGS);
  const [activeIndex, setActiveIndex] = useState(FIVE_READINGS.length - 1);
  const [answer, setAnswer] = useState<FeatureScalings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await scaleFeature(values));
        setMessage(null);
      } catch (error) {
        setAnswer(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [values]);

  const eventToValue = useCallback((clientX: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const raw =
      DOMAIN.min + ((px - PAD.left) / PLOT.width) * (DOMAIN.max - DOMAIN.min);
    return Math.min(DOMAIN.max, Math.max(DOMAIN.min, Math.round(raw)));
  }, []);

  const showSample = (sample: number[], active = sample.length - 1) => {
    setValues(sample);
    setActiveIndex(active);
  };

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (values.length >= MAX_VALUES) return;
    const dropped = eventToValue(event.clientX);
    setValues((current) => [...current, dropped]);
    setActiveIndex(values.length);
    dragging.current = values.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onDotPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    setActiveIndex(index);
    dragging.current = index;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToValue(event.clientX);
    const index = dragging.current;
    setValues((current) =>
      current.map((value, i) => (i === index ? moved : value)),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removeValue = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (values.length <= MIN_VALUES) return;
    setValues((current) => current.filter((_, i) => i !== index));
    setActiveIndex((current) => {
      if (current === index) return Math.max(0, index - 1);
      if (current > index) return current - 1;
      return current;
    });
  };

  const rawStacks = stackHeights(
    values.map((value) => Math.round(positionOn(value, DOMAIN.min, DOMAIN.max))),
  );
  const activeValue = values[activeIndex];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => showSample(FIVE_READINGS)} className={BUTTON_CLASS}>
          Five readings
        </button>
        <button
          onClick={() => showSample(WITH_AN_OUTLIER)}
          className={BUTTON_CLASS}
        >
          With an outlier
        </button>
        <button
          onClick={() => showSample(CROWD_HEIGHTS, TALLEST_INDEX)}
          className={BUTTON_CLASS}
        >
          The crowd&rsquo;s heights
        </button>
        <button onClick={() => showSample(IDEAL_HEIGHTS)} className={BUTTON_CLASS}>
          An Ideal Case
        </button>
        <button
          onClick={() => showSample(randomHeights())}
          className={BUTTON_CLASS}
        >
          Random heights
        </button>
        <span className="ml-auto text-sm text-slate-600 dark:text-slate-300">
          {values.length} of {MAX_VALUES} values
        </span>
      </div>

      <div className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-x-3 gap-y-1">
        <div className="text-sm">
          <div className="font-medium text-slate-700 dark:text-slate-200">
            Raw values
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            click to add, drag, double-click to remove
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW.width} ${RAW_HEIGHT}`}
          className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          onPointerDown={onBackgroundPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <line
            x1={PAD.left}
            y1={RAW_BASELINE}
            x2={PAD.left + PLOT.width}
            y2={RAW_BASELINE}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
          {RAW_TICKS.map((tick) => {
            const px = positionOn(tick, DOMAIN.min, DOMAIN.max);
            return (
              <g key={`raw-tick-${tick}`}>
                <line
                  x1={px}
                  y1={RAW_BASELINE}
                  x2={px}
                  y2={RAW_BASELINE + 5}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth={1}
                />
                <text
                  x={px}
                  y={RAW_BASELINE + 18}
                  textAnchor="middle"
                  className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {values.map((value, index) => {
            const px = positionOn(value, DOMAIN.min, DOMAIN.max);
            const py = RAW_BASELINE - DOT_RADIUS - 3 - rawStacks[index] * STACK_STEP;
            return (
              <circle
                key={index}
                cx={px}
                cy={py}
                r={DOT_RADIUS}
                className={
                  "cursor-grab stroke-white dark:stroke-slate-900 " +
                  (index === activeIndex ? "fill-amber-500" : "fill-indigo-600")
                }
                strokeWidth={1.5}
                onPointerDown={onDotPointerDown(index)}
                onDoubleClick={removeValue(index)}
              />
            );
          })}
        </svg>

        <div className="text-right font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
          {activeValue === undefined ? "…" : String(activeValue)}
        </div>

        {RULERS.map((ruler) => (
          <RulerRow
            key={ruler.method}
            ruler={ruler}
            scaling={answer?.scalings[ruler.method] ?? null}
            count={values.length}
            activeIndex={activeIndex}
          />
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each row is the same values after one method. The amber dot is the same
        value in every row, and a hollow arrow is a value that fell off the end
        of that ruler.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

interface PlacedDot {
  index: number;
  px: number;
  stack: number;
  beyond: "low" | "high" | null;
}

function RulerRow({
  ruler,
  scaling,
  count,
  activeIndex,
}: {
  ruler: Ruler;
  scaling: MethodScaling | null;
  count: number;
  activeIndex: number;
}) {
  const scaledValues = scaling ? scaling.scaled.slice(0, count) : [];
  const columns = scaledValues.map((scaled) => {
    const clamped = Math.min(ruler.max, Math.max(ruler.min, scaled));
    return Math.round(positionOn(clamped, ruler.min, ruler.max));
  });
  const stacks = stackHeights(columns);

  const dots: PlacedDot[] = scaledValues.map((scaled, index) => ({
    index,
    px: columns[index],
    stack: stacks[index],
    beyond: scaled < ruler.min ? "low" : scaled > ruler.max ? "high" : null,
  }));

  // The amber dot is drawn last so it sits on top of whatever it shares a
  // column with.
  const ordered = [
    ...dots.filter((dot) => dot.index !== activeIndex),
    ...dots.filter((dot) => dot.index === activeIndex),
  ];

  const activeScaled = scaling?.scaled[activeIndex];

  return (
    <>
      <div className="text-sm">
        <div className="font-medium text-slate-700 dark:text-slate-200">
          {ruler.label}
        </div>
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {scaling
            ? `centre ${formatNumber(scaling.centre)} · spread ${formatNumber(scaling.spread)}`
            : "…"}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${RULER_HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          y1={RULER_BASELINE}
          x2={PAD.left + PLOT.width}
          y2={RULER_BASELINE}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        {ruler.ticks.map((tick) => {
          const px = positionOn(tick, ruler.min, ruler.max);
          return (
            <g key={`${ruler.method}-tick-${tick}`}>
              <line
                x1={px}
                y1={RULER_BASELINE}
                x2={px}
                y2={RULER_BASELINE + 5}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth={1}
              />
              <text
                x={px}
                y={RULER_BASELINE + 17}
                textAnchor="middle"
                className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {ordered.map((dot) => {
          const py = RULER_BASELINE - DOT_RADIUS - 3 - dot.stack * STACK_STEP;
          const active = dot.index === activeIndex;
          if (dot.beyond) {
            const direction = dot.beyond === "high" ? 1 : -1;
            const tip = dot.px + direction * DOT_RADIUS;
            const tail = dot.px - direction * DOT_RADIUS;
            return (
              <path
                key={dot.index}
                d={`M ${tail} ${py - DOT_RADIUS} L ${tip} ${py} L ${tail} ${py + DOT_RADIUS} Z`}
                fill="none"
                className={active ? "stroke-amber-500" : "stroke-indigo-600"}
                strokeWidth={2}
              />
            );
          }
          return (
            <circle
              key={dot.index}
              cx={dot.px}
              cy={py}
              r={DOT_RADIUS}
              className={
                "stroke-white dark:stroke-slate-900 " +
                (active ? "fill-amber-500" : "fill-indigo-600")
              }
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      <div className="text-right font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
        {activeScaled === undefined ? "…" : activeScaled.toFixed(2)}
      </div>
    </>
  );
}
