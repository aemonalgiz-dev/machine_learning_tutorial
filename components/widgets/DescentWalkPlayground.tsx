"use client";

// One walk downhill, replayed pass by pass.
//
// The scrubber moves through a single recorded walk rather than refitting, so
// what the reader steps through really is the sequence of lines the library
// passed through on one run. The bold line is where the walk stands at the
// chosen pass, the faint line is the answer the closed form gives in one step,
// and the staircase underneath is the loss falling. Push the rate above the
// threshold printed in the readout and the walk runs away rather than
// arriving, which the library refuses by name. Every line, every loss and
// every gradient comes from the API.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  LinePosition,
  RecordedWalk,
  walkDownhill,
} from "@/lib/concepts/gradient-descent-regression";

const VIEW = { width: 640, height: 340 };
const PAD = { left: 52, right: 18, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const LOSS_VIEW = { width: 640, height: 150 };
const LOSS_PAD = { left: 62, right: 18, top: 12, bottom: 30 };
const LOSS_PLOT = {
  width: LOSS_VIEW.width - LOSS_PAD.left - LOSS_PAD.right,
  height: LOSS_VIEW.height - LOSS_PAD.top - LOSS_PAD.bottom,
};

const DEBOUNCE_MS = 160;

// Three people whose first gradient is a pair of whole numbers, the page's
// pencil arithmetic.
const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

// The line page's crowd.
const CROWD: Point[] = [
  { x: 155, y: 54 },
  { x: 158, y: 57 },
  { x: 162, y: 60 },
  { x: 164, y: 61 },
  { x: 167, y: 64 },
  { x: 169, y: 68 },
  { x: 171, y: 69 },
  { x: 173, y: 72 },
  { x: 175, y: 74 },
  { x: 177, y: 76 },
  { x: 180, y: 79 },
  { x: 182, y: 81 },
  { x: 185, y: 84 },
  { x: 188, y: 88 },
  { x: 189, y: 93 },
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function boundsOf(points: Point[]): Bounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xPad = 0.06 * (Math.max(...xs) - Math.min(...xs) || 1);
  const yPad = 0.18 * (Math.max(...ys) - Math.min(...ys) || 1);
  return {
    xMin: Math.min(...xs) - xPad,
    xMax: Math.max(...xs) + xPad,
    yMin: Math.min(...ys) - yPad,
    yMax: Math.max(...ys) + yPad,
  };
}

function toPixel(point: Point, bounds: Bounds) {
  const spanX = bounds.xMax - bounds.xMin || 1;
  const spanY = bounds.yMax - bounds.yMin || 1;
  return {
    px: PAD.left + ((point.x - bounds.xMin) / spanX) * PLOT.width,
    py: PAD.top + (1 - (point.y - bounds.yMin) / spanY) * PLOT.height,
  };
}

// A line is drawn from its level at the mean height and its slope, which is
// the form the API reports and the form the library actually holds.
function lineEnds(
  line: LinePosition,
  meanHeight: number,
  bounds: Bounds,
): { from: Point; to: Point } {
  const at = (x: number) => line.level + line.slope * (x - meanHeight);
  return {
    from: { x: bounds.xMin, y: at(bounds.xMin) },
    to: { x: bounds.xMax, y: at(bounds.xMax) },
  };
}

export function DescentWalkPlayground() {
  const [points, setPoints] = useState<Point[]>(WORKED_THREE);
  const [rate, setRate] = useState(0.02);
  const [maxEpochs, setMaxEpochs] = useState(200);
  const [passIndex, setPassIndex] = useState(0);
  const [answer, setAnswer] = useState<RecordedWalk | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const key = JSON.stringify({ points, rate, maxEpochs });

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const walked = await walkDownhill(points, rate, maxEpochs);
        setAnswer(walked);
        setPassIndex(0);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // The request is a pure function of the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const bounds = boundsOf(points);
  const lastIndex = answer ? answer.passes.length : 0;
  const shown = Math.min(passIndex, lastIndex);
  const standing: LinePosition | null = answer
    ? shown === 0
      ? answer.start
      : answer.passes[shown - 1]
    : null;

  const losses = answer
    ? [answer.start.loss, ...answer.passes.map((pass) => pass.loss)]
    : [];
  const highestLoss = losses.length ? Math.max(...losses) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => {
            setPoints(WORKED_THREE);
            setRate(0.02);
          }}
          className={points === WORKED_THREE ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Three people
        </button>
        <button
          onClick={() => {
            setPoints(CROWD);
            setRate(0.005);
          }}
          className={points === CROWD ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          The crowd
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          step size
          <input
            type="range"
            min={-3}
            max={0}
            step={0.05}
            value={Math.log10(rate)}
            onChange={(event) =>
              setRate(Number((10 ** Number(event.target.value)).toPrecision(3)))
            }
            className="w-40 accent-indigo-600"
          />
          <span className="w-20 font-mono text-sm">{rate.toPrecision(3)}</span>
        </label>
        <label className="flex items-center gap-2">
          passes allowed
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={maxEpochs}
            onChange={(event) => setMaxEpochs(Number(event.target.value))}
            className="w-32 accent-emerald-600"
          />
          <span className="w-10 font-mono text-sm">{maxEpochs}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {answer && (
          <>
            {(() => {
              const ends = lineEnds(
                answer.closed_form,
                answer.mean_height,
                bounds,
              );
              const from = toPixel(ends.from, bounds);
              const to = toPixel(ends.to, bounds);
              return (
                <line
                  x1={from.px}
                  y1={from.py}
                  x2={to.px}
                  y2={to.py}
                  className="stroke-slate-400 dark:stroke-slate-500"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                />
              );
            })()}
            {standing &&
              (() => {
                const ends = lineEnds(standing, answer.mean_height, bounds);
                const from = toPixel(ends.from, bounds);
                const to = toPixel(ends.to, bounds);
                return (
                  <line
                    x1={from.px}
                    y1={from.py}
                    x2={to.px}
                    y2={to.py}
                    className="stroke-indigo-600 dark:stroke-indigo-400"
                    strokeWidth={2.5}
                  />
                );
              })()}
          </>
        )}
        {points.map((point) => {
          const { px, py } = toPixel(point, bounds);
          return (
            <circle
              key={`${point.x},${point.y}`}
              cx={px}
              cy={py}
              r={4}
              className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
              strokeWidth={1.5}
            />
          );
        })}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          The bold line is where the walk stands, the dashed one the closed
          form&rsquo;s answer
        </text>
      </svg>

      {answer && lastIndex > 0 && (
        <label className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          pass
          <input
            type="range"
            min={0}
            max={lastIndex}
            step={1}
            value={shown}
            onChange={(event) => setPassIndex(Number(event.target.value))}
            className="w-full accent-slate-700 dark:accent-slate-300"
          />
          <span className="w-24 font-mono text-sm">
            {shown} of {lastIndex}
          </span>
        </label>
      )}

      {answer && losses.length > 1 && (
        <svg
          viewBox={`0 0 ${LOSS_VIEW.width} ${LOSS_VIEW.height}`}
          className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          <text
            x={LOSS_PAD.left}
            y={LOSS_PAD.top}
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            the loss, pass by pass
          </text>
          <path
            d={losses
              .map((loss, index) => {
                const x =
                  LOSS_PAD.left +
                  (index / (losses.length - 1)) * LOSS_PLOT.width;
                const y =
                  LOSS_PAD.top +
                  (1 - loss / (highestLoss || 1)) * LOSS_PLOT.height;
                return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            strokeWidth={2}
            className="stroke-indigo-600 dark:stroke-indigo-400"
          />
          <line
            x1={
              LOSS_PAD.left + (shown / (losses.length - 1)) * LOSS_PLOT.width
            }
            y1={LOSS_PAD.top}
            x2={
              LOSS_PAD.left + (shown / (losses.length - 1)) * LOSS_PLOT.width
            }
            y2={LOSS_PAD.top + LOSS_PLOT.height}
            className="stroke-amber-500"
            strokeDasharray="3 3"
            strokeWidth={1.5}
          />
        </svg>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Outcome"
          value={answer ? answer.outcome.replace(/_/g, " ") : "…"}
        />
        <Stat
          label="Passes run"
          value={answer ? String(answer.passes_run) : "…"}
        />
        <Stat
          label="Loss where it stands"
          value={standing ? standing.loss.toFixed(4) : "…"}
        />
        <Stat
          label="Closed form's loss"
          value={answer ? answer.closed_form.loss.toFixed(4) : "…"}
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {answer
          ? `A step above ${answer.divergence_threshold.toPrecision(3)} runs away on these people, and the walk keeps ${answer.error_factor_per_pass.toPrecision(3)} of its remaining error each pass.`
          : "…"}
      </p>

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
