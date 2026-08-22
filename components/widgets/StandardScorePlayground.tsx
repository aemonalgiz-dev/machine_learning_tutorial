"use client";

// One column of trunk girths, and the same column measured in its own spread.
//
// The upper line holds the recorded millimetres on a fixed ruler from zero to
// seven hundred, so the picture of the column never quietly rescales itself
// under the reader. The lower line holds the standard scores on a ruler fixed
// at minus four to four, which is where the point is visible: whatever the
// recorded numbers were, the scores land about a centre of zero and a spread of
// one. A value beyond either ruler is drawn faint at the end it fell off.
//
// The readouts carry the two numbers the column taught and the two the
// transformation promises back, and the line underneath carries the two
// invariance checks, since adding a constant to every girth or writing them all
// in centimetres has to leave the lower line where it was. Drag a dot to move a
// girth, click empty space on the upper line to add one, double-click a dot to
// remove it. The API computes every number; the browser turns them into pixels.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ColumnReading,
  standardiseColumn,
} from "@/lib/concepts/the-standard-score";
import {
  EVEN_ROW,
  GIRTH_COLOUR,
  HIGHLIGHT_COLOUR,
  MISTYPED_ROW,
  NURSERY_ROW,
  randomGirths,
} from "./standardScoreFixtures";

const VIEW = { width: 640, height: 210 };
const PAD = { left: 24, right: 24 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right };

const RAW_BASELINE = 62;
const SCORE_BASELINE = 168;
const DOT_RADIUS = 6;
const STACK_STEP = 9;

const RAW_MIN = 0;
const RAW_MAX = 700;
const RAW_TICKS = [0, 175, 350, 525, 700];

const SCORE_MIN = -4;
const SCORE_MAX = 4;
const SCORE_TICKS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

const MIN_VALUES = 2;
const MAX_VALUES = 30;

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

function positionOn(value: number, min: number, max: number): number {
  const clamped = Math.min(max, Math.max(min, value));
  return PAD.left + ((clamped - min) / (max - min)) * PLOT.width;
}

// How many earlier dots already sit at each pixel column, so equal values stack
// upward instead of hiding one another.
function stackHeights(pixelColumns: number[]): number[] {
  const seen = new Map<number, number>();
  return pixelColumns.map((column) => {
    const count = seen.get(column) ?? 0;
    seen.set(column, count + 1);
    return count;
  });
}

export function StandardScorePlayground() {
  const [girths, setGirths] = useState<number[]>([...EVEN_ROW]);
  const [reading, setReading] = useState<ColumnReading | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const surface = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setReading(await standardiseColumn(girths));
        setMessage(null);
      } catch (error) {
        setReading(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [girths]);

  const eventToGirth = useCallback((clientX: number) => {
    const box = surface.current!.getBoundingClientRect();
    const withinView = ((clientX - box.left) / box.width) * VIEW.width;
    const raw = RAW_MIN + ((withinView - PAD.left) / PLOT.width) * (RAW_MAX - RAW_MIN);
    return Math.min(RAW_MAX, Math.max(RAW_MIN, Math.round(raw)));
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (girths.length >= MAX_VALUES) return;
    const dropped = eventToGirth(event.clientX);
    setGirths((current) => [...current, dropped]);
    dragging.current = girths.length;
    surface.current?.setPointerCapture(event.pointerId);
  };

  const onDotPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    surface.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToGirth(event.clientX);
    const index = dragging.current;
    setGirths((current) =>
      current.map((girth, position) => (position === index ? moved : girth)),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removeGirth = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (girths.length <= MIN_VALUES) return;
    setGirths((current) => current.filter((_, position) => position !== index));
  };

  const rawStacks = stackHeights(
    girths.map((girth) => Math.round(positionOn(girth, RAW_MIN, RAW_MAX))),
  );
  const scores = reading?.scores ?? [];
  const scoreStacks = stackHeights(
    scores.map((score) => Math.round(positionOn(score, SCORE_MIN, SCORE_MAX))),
  );
  const widest = girths.indexOf(Math.max(...girths));

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={BUTTON_CLASS} onClick={() => setGirths([...EVEN_ROW])}>
          An even row
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => setGirths([...NURSERY_ROW])}>
          The nursery row
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => setGirths([...MISTYPED_ROW])}>
          One trunk mistyped
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => setGirths(randomGirths())}>
          A fresh orchard
        </button>
      </div>

      <svg
        ref={surface}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <text x={PAD.left} y={20} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          trunk girth as recorded, millimetres
        </text>
        <line
          x1={PAD.left}
          y1={RAW_BASELINE}
          x2={PAD.left + PLOT.width}
          y2={RAW_BASELINE}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        {RAW_TICKS.map((tick) => (
          <g key={`raw-${tick}`}>
            <line
              x1={positionOn(tick, RAW_MIN, RAW_MAX)}
              y1={RAW_BASELINE - 4}
              x2={positionOn(tick, RAW_MIN, RAW_MAX)}
              y2={RAW_BASELINE + 4}
              className="stroke-slate-300 dark:stroke-slate-700"
            />
            <text
              x={positionOn(tick, RAW_MIN, RAW_MAX)}
              y={RAW_BASELINE + 18}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] dark:fill-slate-500"
            >
              {tick}
            </text>
          </g>
        ))}
        {girths.map((girth, index) => (
          <circle
            key={`raw-${index}`}
            cx={positionOn(girth, RAW_MIN, RAW_MAX)}
            cy={RAW_BASELINE - DOT_RADIUS - rawStacks[index] * STACK_STEP}
            r={DOT_RADIUS}
            fill={index === widest ? HIGHLIGHT_COLOUR : GIRTH_COLOUR}
            opacity={girth > RAW_MAX ? 0.35 : 1}
            className="cursor-grab"
            onPointerDown={onDotPointerDown(index)}
            onDoubleClick={removeGirth(index)}
          />
        ))}

        <text x={PAD.left} y={128} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          the same trunks in standard scores, deviations from the average trunk
        </text>
        <line
          x1={PAD.left}
          y1={SCORE_BASELINE}
          x2={PAD.left + PLOT.width}
          y2={SCORE_BASELINE}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <line
          x1={positionOn(0, SCORE_MIN, SCORE_MAX)}
          y1={SCORE_BASELINE - 44}
          x2={positionOn(0, SCORE_MIN, SCORE_MAX)}
          y2={SCORE_BASELINE + 4}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeDasharray="3 3"
        />
        {SCORE_TICKS.map((tick) => (
          <g key={`score-${tick}`}>
            <line
              x1={positionOn(tick, SCORE_MIN, SCORE_MAX)}
              y1={SCORE_BASELINE - 4}
              x2={positionOn(tick, SCORE_MIN, SCORE_MAX)}
              y2={SCORE_BASELINE + 4}
              className="stroke-slate-300 dark:stroke-slate-700"
            />
            <text
              x={positionOn(tick, SCORE_MIN, SCORE_MAX)}
              y={SCORE_BASELINE + 18}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] dark:fill-slate-500"
            >
              {tick}
            </text>
          </g>
        ))}
        {scores.map((score, index) => (
          <circle
            key={`score-${index}`}
            cx={positionOn(score, SCORE_MIN, SCORE_MAX)}
            cy={SCORE_BASELINE - DOT_RADIUS - scoreStacks[index] * STACK_STEP}
            r={DOT_RADIUS}
            fill={index === widest ? HIGHLIGHT_COLOUR : GIRTH_COLOUR}
            opacity={score < SCORE_MIN || score > SCORE_MAX ? 0.35 : 1}
          />
        ))}
      </svg>

      {message && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">{message}</p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="average trunk"
          value={reading ? `${reading.mean.toFixed(2)} mm` : "…"}
        />
        <Stat
          label="its spread"
          value={reading ? `${reading.deviation.toFixed(2)} mm` : "…"}
        />
        <Stat
          label="average score"
          value={reading ? reading.score_mean.toFixed(3) : "…"}
        />
        <Stat
          label="spread of the scores"
          value={reading ? Math.sqrt(reading.score_variance).toFixed(3) : "…"}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {reading ? invarianceNote(reading) : "…"}
      </p>
    </div>
  );
}

// What the two invariance checks came to. Either can be missing, since adding a
// thousand to a column whose trunks differ by a hair leaves every trunk at the
// same number and there is then nothing to compare against.
function invarianceNote(reading: ColumnReading): string {
  const shifted = reading.shifted_largest_gap;
  const stretched = reading.stretched_largest_gap;
  if (shifted === null || stretched === null) {
    return "These trunks differ by so little that adding a thousand millimetres to every one of them lands them all on the same number, so one of the two checks has nothing left to compare against.";
  }
  return `Add 1000 mm to every trunk and the largest score moves by ${shifted.toExponential(1)}; write the same trunks in centimetres and it moves by ${stretched.toExponential(1)}. The lower line is the same picture either way, which is what it means for the unit to have gone.`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="font-mono text-sm text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}
