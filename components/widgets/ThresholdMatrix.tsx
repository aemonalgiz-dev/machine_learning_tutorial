"use client";

// One boundary, one dial, and the four ways a call can go.
//
// The scatter colours each person by which cell of the table they fell into,
// so a wrongly called person is visibly a different colour rather than merely
// counted, and the plane behind them is shaded by the fitted model's own
// answer at every cell. The threshold slider does not refit anything: the
// boundary and every person's chance were computed once, and moving the dial
// only changes where the line between calling somebody adult and calling
// them child is drawn. The table and the readouts follow the dial, and the
// curve at the bottom is precision against recall over every threshold with
// the current one marked. Every chance, every count and every rate comes
// from the library through the API; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint } from "@/lib/api";
import {
  ClassifierEvaluation,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";
import {
  AMBER,
  CELL_COLOUR,
  CELL_TITLE,
  Cell,
  DOMAIN,
  EMERALD,
  IDEAL_CROWD,
  INDIGO,
  OVERLAPPING_CROWD,
  RARE_CROWD,
  buttonClass,
  cellOf,
  randomCrowd,
  rate,
} from "./judgingAClassifierFixtures";

const VIEW = { width: 640, height: 340 };
const PAD = { left: 52, right: 18, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const CURVE_VIEW = { width: 640, height: 200 };
const CURVE_PAD = { left: 56, right: 20, top: 16, bottom: 40 };
const CURVE_PLOT = {
  width: CURVE_VIEW.width - CURVE_PAD.left - CURVE_PAD.right,
  height: CURVE_VIEW.height - CURVE_PAD.top - CURVE_PAD.bottom,
};

const DEBOUNCE_MS = 120;

type CrowdName = "the twelve" | "adults rare" | "an ideal case" | "a random crowd";

const FIXED_CROWDS: Record<Exclude<CrowdName, "a random crowd">, LabelledPoint[]> = {
  "the twelve": OVERLAPPING_CROWD,
  "adults rare": RARE_CROWD,
  "an ideal case": IDEAL_CROWD,
};

function toPixel(point: { x: number; y: number }) {
  return {
    px: PAD.left + ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width,
    py: PAD.top + (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height,
  };
}

export function ThresholdMatrix() {
  const [crowdName, setCrowdName] = useState<CrowdName>("the twelve");
  const [crowd, setCrowd] = useState<LabelledPoint[]>(OVERLAPPING_CROWD);
  const [threshold, setThreshold] = useState(0.5);
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await evaluateAtThreshold(crowd, threshold);
        if (cancelled) return;
        setAnswer(result);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [crowd, threshold]);

  const choose = (name: CrowdName) => {
    setCrowdName(name);
    setCrowd(name === "a random crowd" ? randomCrowd() : FIXED_CROWDS[name]);
  };

  const counts = answer?.counts;
  const rates = answer?.rates;
  const regions = answer?.regions;
  const cellWidth = regions ? PLOT.width / regions.cells : 0;
  const cellHeight = regions ? PLOT.height / regions.cells : 0;
  const regionX = (column: number) =>
    regions
      ? PAD.left + ((regions.x_min + (column / (regions.cells - 1)) * (regions.x_max - regions.x_min) - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width
      : 0;
  const regionY = (row: number) =>
    regions
      ? PAD.top + (1 - (regions.y_min + (row / (regions.cells - 1)) * (regions.y_max - regions.y_min) - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height
      : 0;
  const regionCellWidth = regions ? ((regions.x_max - regions.x_min) / (regions.cells - 1) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width : cellWidth;
  const regionCellHeight = regions ? ((regions.y_max - regions.y_min) / (regions.cells - 1) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height : cellHeight;

  const recallToX = (value: number) => CURVE_PAD.left + value * CURVE_PLOT.width;
  const precisionToY = (value: number) => CURVE_PAD.top + (1 - value) * CURVE_PLOT.height;

  const current = answer?.curve.find((reading) => Math.abs(reading.threshold - threshold) < 1e-9);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-3">
          threshold
          <input
            type="range"
            min={0.05}
            max={0.99}
            step={0.01}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">{threshold.toFixed(2)}</span>
        </label>
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["the twelve", "adults rare", "an ideal case", "a random crowd"] as CrowdName[]).map((name) => (
            <button key={name} onClick={() => choose(name)} className={buttonClass(crowdName === name)}>
              {name}
            </button>
          ))}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {regions &&
          regions.labels.map((row, rowIndex) =>
            row.map((label, columnIndex) => (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                x={regionX(columnIndex) - regionCellWidth / 2}
                y={regionY(rowIndex) - regionCellHeight / 2}
                width={regionCellWidth + 0.5}
                height={regionCellHeight + 0.5}
                fill={label === 1 ? INDIGO : EMERALD}
                opacity={0.12}
              />
            )),
          )}
        {crowd.map((person, index) => {
          const { px, py } = toPixel(person);
          const prediction = answer && answer.predictions.length === crowd.length ? answer.predictions[index] : person.label;
          const cell: Cell = cellOf(person.label, prediction);
          const wrong = cell === "falsePositive" || cell === "falseNegative";
          return (
            <g key={`${index}-${person.x},${person.y}`}>
              <circle cx={px} cy={py} r={wrong ? 7 : 5} fill={CELL_COLOUR[cell]} stroke="white" strokeWidth={1.5} />
              {answer && answer.probabilities.length === crowd.length && crowd.length <= 20 && (
                <text x={px} y={py - 12} textAnchor="middle" className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400">
                  {answer.probabilities[index].toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Height across, weight up, the plane shaded by the fitted model&rsquo;s call at this threshold
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        {(Object.keys(CELL_TITLE) as Cell[]).map((cell) => (
          <span key={cell} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CELL_COLOUR[cell] }} />
            {CELL_TITLE[cell]}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">The confusion matrix at this threshold</div>
          <table className="w-full border-collapse text-center text-sm">
            <tbody className="font-mono">
              <tr>
                <MatrixCell title="called adult, is adult" colour={INDIGO} value={counts ? counts.true_positives : null} />
                <MatrixCell title="called child, is adult" colour={CELL_COLOUR.falseNegative} value={counts ? counts.false_negatives : null} />
              </tr>
              <tr>
                <MatrixCell title="called adult, is child" colour={AMBER} value={counts ? counts.false_positives : null} />
                <MatrixCell title="called child, is child" colour={EMERALD} value={counts ? counts.true_negatives : null} />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="accuracy" value={rates ? rates.accuracy.toFixed(4) : "…"} />
          <Stat label="everybody the majority class" value={answer ? answer.baseline.accuracy.toFixed(4) : "…"} />
          <Stat label="precision" value={rates ? (rates.precision === null ? "nobody called" : rates.precision.toFixed(4)) : "…"} />
          <Stat label="recall" value={rates ? rates.recall.toFixed(4) : "…"} />
          <Stat label="specificity" value={rates ? rates.specificity.toFixed(4) : "…"} />
          <Stat label="F1" value={rates ? rate(rates.f_one) : "…"} />
        </div>
      </div>

      {answer && (
        <svg viewBox={`0 0 ${CURVE_VIEW.width} ${CURVE_VIEW.height}`} className="mt-4 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {[0, 0.5, 1].map((tick) => (
            <g key={tick}>
              <line x1={CURVE_PAD.left} x2={CURVE_PAD.left + CURVE_PLOT.width} y1={precisionToY(tick)} y2={precisionToY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
              <text x={CURVE_PAD.left - 8} y={precisionToY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(1)}</text>
              <text x={recallToX(tick)} y={CURVE_PAD.top + CURVE_PLOT.height + 14} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(1)}</text>
            </g>
          ))}
          <path
            d={answer.precision_recall
              .map((corner, index) => {
                const x = recallToX(corner.recall).toFixed(1);
                const y = precisionToY(corner.precision).toFixed(1);
                if (index === 0) return `M${x},${y}`;
                const previous = answer.precision_recall[index - 1];
                return `L${recallToX(corner.recall).toFixed(1)},${precisionToY(previous.precision).toFixed(1)} L${x},${y}`;
              })
              .join(" ")}
            fill="none"
            strokeWidth={2}
            stroke={INDIGO}
          />
          {current && current.precision !== null && (
            <circle cx={recallToX(current.recall)} cy={precisionToY(current.precision)} r={6} fill={AMBER} stroke="white" strokeWidth={1.5} />
          )}
          <text x={CURVE_PAD.left + CURVE_PLOT.width / 2} y={CURVE_VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
            Recall across, precision up, one corner per distinct chance, the current threshold marked in amber
          </text>
        </svg>
      )}

      {answer && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {crowd.length} people, of whom {Math.round(answer.prevalence * crowd.length)} are adults. The fit ran {answer.epochs_run} passes{answer.converged ? " and converged" : " without converging, which a crowd this separable never does"}.
        </p>
      )}

      {message && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
    </div>
  );
}

function MatrixCell({ title, colour, value }: { title: string; colour: string; value: number | null }) {
  return (
    <td className="border border-slate-200 p-2 dark:border-slate-800">
      <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">{title}</div>
      <div className="text-lg font-semibold" style={{ color: colour }}>{value === null ? "…" : value}</div>
    </td>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
