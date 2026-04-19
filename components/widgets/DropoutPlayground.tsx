"use client";

// One row of units, a coin tossed over each, and the survivors turned up.
//
// The left bars are one training pass through the library's dropout layer.
// Every unit is silenced with the slider's probability, a silenced unit is
// greyed, and a survivor is raised by one over the keep probability, with a
// dashed outline where it would have stood untouched. The right bars are the
// same row passed while predicting, which silences nothing and scales
// nothing. Draw again moves on to the next seed, and the chart underneath
// watches the mean of each unit's training output over four hundred draws
// settle onto the dashed line at its predicting output, which is the claim
// the raising makes. Every mask, every output and every running mean is the
// library's through the API. The browser edits the row, chooses the next
// seed, and lays the bars out.

import { useEffect, useState } from "react";
import {
  DropoutApplication,
  applyDropout,
  failureMessage,
} from "@/lib/concepts/dropout";

// The page's worked example, four units at a drop probability of one half
// under the seed whose first draw keeps the first and third.
const WORKED_VALUES = [1, 2, 3, 4];
const WORKED_PROBABILITY = 0.5;
const WORKED_SEED = 10;
const DRAW_COUNT = 400;
const MAX_UNITS = 8;
const VALUE_LIMIT = 100;

const BARS = { width: 640, height: 290 };
const BARS_PAD = { top: 36, bottom: 64 };
const BARS_PLOT_HEIGHT = BARS.height - BARS_PAD.top - BARS_PAD.bottom;
const PANEL = { left: 32, width: 272, gap: 32 };
const PREDICTING_PANEL_LEFT = PANEL.left + PANEL.width + PANEL.gap;

const CHART = { width: 640, height: 300 };
const CHART_PAD = { left: 56, right: 96, top: 16, bottom: 44 };
const CHART_PLOT = {
  width: CHART.width - CHART_PAD.left - CHART_PAD.right,
  height: CHART.height - CHART_PAD.top - CHART_PAD.bottom,
};

const UNIT_FILLS = [
  "fill-indigo-600",
  "fill-amber-500",
  "fill-emerald-600",
  "fill-rose-500",
  "fill-sky-500",
  "fill-violet-500",
  "fill-orange-500",
  "fill-teal-600",
];

const UNIT_STROKES = [
  "stroke-indigo-600",
  "stroke-amber-500",
  "stroke-emerald-600",
  "stroke-rose-500",
  "stroke-sky-500",
  "stroke-violet-500",
  "stroke-orange-500",
  "stroke-teal-600",
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

interface Span {
  low: number;
  high: number;
}

// The vertical range a set of values needs, always including zero so every
// bar has a baseline to grow from.
function spanOf(values: number[]): Span {
  const low = Math.min(0, ...values);
  let high = Math.max(0, ...values);
  if (high === low) high = low + 1;
  return { low, high };
}

function valueToY(
  value: number,
  span: Span,
  top: number,
  height: number,
): number {
  return top + ((span.high - value) / (span.high - span.low)) * height;
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function clampValue(value: number): number {
  return Math.max(-VALUE_LIMIT, Math.min(VALUE_LIMIT, value));
}

export function DropoutPlayground() {
  const [values, setValues] = useState<number[]>(WORKED_VALUES);
  const [drafts, setDrafts] = useState<string[]>(WORKED_VALUES.map(String));
  const [dropProbability, setDropProbability] = useState(WORKED_PROBABILITY);
  const [seed, setSeed] = useState(WORKED_SEED);
  const [answer, setAnswer] = useState<DropoutApplication | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(
          await applyDropout(values, dropProbability, seed, DRAW_COUNT),
        );
        setMessage(null);
      } catch (error) {
        setMessage(failureMessage(error));
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [values, dropProbability, seed]);

  // The text in each box and the number behind it are kept apart, so a
  // half-typed entry is left alone until it reads as a number.
  const rewriteRow = (next: number[]) => {
    setValues(next);
    setDrafts(next.map(String));
  };

  const editUnit = (index: number, text: string) => {
    setDrafts((current) =>
      current.map((draft, position) => (position === index ? text : draft)),
    );
    const parsed = Number(text);
    if (text.trim() === "" || !Number.isFinite(parsed)) return;
    setValues((current) =>
      current.map((value, position) =>
        position === index ? clampValue(parsed) : value,
      ),
    );
  };

  const resetToWorkedExample = () => {
    rewriteRow(WORKED_VALUES);
    setDropProbability(WORKED_PROBABILITY);
    setSeed(WORKED_SEED);
  };

  const unitCount = answer ? answer.predicting_output.length : 0;
  const barSpan = answer
    ? spanOf([...answer.training_output, ...answer.predicting_output])
    : { low: 0, high: 1 };
  const baseline = valueToY(0, barSpan, BARS_PAD.top, BARS_PLOT_HEIGHT);
  const slot = unitCount > 0 ? PANEL.width / unitCount : PANEL.width;
  const barWidth = slot * 0.6;

  const barFor = (value: number) => {
    const edge = valueToY(value, barSpan, BARS_PAD.top, BARS_PLOT_HEIGHT);
    return {
      y: Math.min(edge, baseline),
      height: Math.abs(baseline - edge),
      labelY:
        value >= 0
          ? Math.min(edge, baseline) - 6
          : Math.max(edge, baseline) + 14,
    };
  };

  const chartSpan = answer
    ? spanOf([...answer.running_means.flat(), ...answer.predicting_output])
    : null;
  const drawToX = (drawNumber: number) =>
    CHART_PAD.left +
    ((drawNumber - 1) / Math.max(1, (answer?.n_draws ?? 1) - 1)) *
      CHART_PLOT.width;
  const meanToY = (mean: number) =>
    chartSpan ? valueToY(mean, chartSpan, CHART_PAD.top, CHART_PLOT.height) : 0;

  const drawTicks = answer
    ? [
        1,
        ...[0.25, 0.5, 0.75, 1].map((share) =>
          Math.round(share * answer.n_draws),
        ),
      ]
    : [];

  const keptThisDraw = answer ? answer.kept.filter(Boolean).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={resetToWorkedExample} className={BUTTON_CLASS}>
          The worked example
        </button>
        <button
          onClick={() => setSeed((current) => current + 1)}
          className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900"
        >
          Draw again
        </button>
        <button
          onClick={() => rewriteRow([0, ...values.slice(1)])}
          className={BUTTON_CLASS}
        >
          A unit already at zero
        </button>
        <button
          onClick={() => rewriteRow([...values, values.length + 1])}
          disabled={values.length >= MAX_UNITS}
          className={BUTTON_CLASS}
        >
          Add a unit
        </button>
        <button
          onClick={() => rewriteRow(values.slice(0, -1))}
          disabled={values.length <= 1}
          className={BUTTON_CLASS}
        >
          Remove a unit
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-3">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          The row
        </span>
        {drafts.map((draft, index) => (
          <label
            key={index}
            className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
          >
            u{index + 1}
            <input
              type="number"
              value={draft}
              step={0.5}
              min={-VALUE_LIMIT}
              max={VALUE_LIMIT}
              onChange={(event) => editUnit(index, event.target.value)}
              className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          drop probability
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={dropProbability}
            onChange={(event) => setDropProbability(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">
            {dropProbability.toFixed(2)}
          </span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${BARS.width} ${BARS.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[PANEL.left, PREDICTING_PANEL_LEFT].map((panelLeft) => (
          <line
            key={`baseline${panelLeft}`}
            x1={panelLeft}
            y1={baseline}
            x2={panelLeft + PANEL.width}
            y2={baseline}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
        ))}

        {answer &&
          answer.training_output.map((output, index) => {
            const x = PANEL.left + index * slot + (slot - barWidth) / 2;
            const input = answer.predicting_output[index];
            const kept = answer.kept[index];
            const untouched = barFor(input);
            const bar = barFor(kept ? output : input);
            return (
              <g key={`training${index}`}>
                <rect
                  x={x}
                  y={untouched.y}
                  width={barWidth}
                  height={untouched.height}
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-400 dark:text-slate-600"
                  strokeWidth={1}
                />
                <rect
                  x={x}
                  y={bar.y}
                  width={barWidth}
                  height={bar.height}
                  className={
                    kept
                      ? UNIT_FILLS[index % UNIT_FILLS.length]
                      : "fill-slate-300 dark:fill-slate-700"
                  }
                  opacity={kept ? 1 : 0.6}
                />
                <text
                  x={x + barWidth / 2}
                  y={bar.labelY}
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-xs dark:fill-slate-200"
                >
                  {formatValue(output)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={BARS.height - 44}
                  textAnchor="middle"
                  className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
                >
                  u{index + 1}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={BARS.height - 30}
                  textAnchor="middle"
                  className={
                    kept
                      ? "fill-slate-700 text-[10px] dark:fill-slate-200"
                      : "fill-slate-400 text-[10px] dark:fill-slate-500"
                  }
                >
                  {kept ? `kept ×${formatValue(answer.scale)}` : "dropped"}
                </text>
              </g>
            );
          })}

        {answer &&
          answer.predicting_output.map((output, index) => {
            const x =
              PREDICTING_PANEL_LEFT + index * slot + (slot - barWidth) / 2;
            const bar = barFor(output);
            return (
              <g key={`predicting${index}`}>
                <rect
                  x={x}
                  y={bar.y}
                  width={barWidth}
                  height={bar.height}
                  className={UNIT_FILLS[index % UNIT_FILLS.length]}
                />
                <text
                  x={x + barWidth / 2}
                  y={bar.labelY}
                  textAnchor="middle"
                  className="fill-slate-700 font-mono text-xs dark:fill-slate-200"
                >
                  {formatValue(output)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={BARS.height - 44}
                  textAnchor="middle"
                  className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
                >
                  u{index + 1}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={BARS.height - 30}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] dark:fill-slate-500"
                >
                  as is
                </text>
              </g>
            );
          })}

        <text
          x={PANEL.left + PANEL.width / 2}
          y={BARS.height - 10}
          textAnchor="middle"
          className="fill-slate-600 text-xs font-semibold dark:fill-slate-300"
        >
          While training, one draw (seed {seed})
        </text>
        <text
          x={PREDICTING_PANEL_LEFT + PANEL.width / 2}
          y={BARS.height - 10}
          textAnchor="middle"
          className="fill-slate-600 text-xs font-semibold dark:fill-slate-300"
        >
          While predicting
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        A dashed outline is where each bar would stand untouched. A survivor is
        raised by the scale, a silenced unit is greyed, and predicting touches
        nothing.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Scale, 1 / (1 − p)"
          value={answer ? formatValue(answer.scale) : "…"}
        />
        <Stat
          label="Kept this draw"
          value={answer ? `${keptThisDraw} of ${unitCount}` : "…"}
        />
        <Stat
          label={`Largest gap after ${DRAW_COUNT} draws`}
          value={answer ? answer.largest_gap.toFixed(2) : "…"}
        />
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="mt-4 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={CHART_PAD.left}
          y1={CHART_PAD.top}
          x2={CHART_PAD.left}
          y2={CHART_PAD.top + CHART_PLOT.height}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <line
          x1={CHART_PAD.left}
          y1={CHART_PAD.top + CHART_PLOT.height}
          x2={CHART_PAD.left + CHART_PLOT.width}
          y2={CHART_PAD.top + CHART_PLOT.height}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        {drawTicks.map((drawNumber) => (
          <text
            key={`tick${drawNumber}`}
            x={drawToX(drawNumber)}
            y={CHART_PAD.top + CHART_PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {drawNumber}
          </text>
        ))}

        {chartSpan && (
          <>
            <text
              x={CHART_PAD.left - 8}
              y={CHART_PAD.top + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {formatValue(chartSpan.high)}
            </text>
            <text
              x={CHART_PAD.left - 8}
              y={CHART_PAD.top + CHART_PLOT.height + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {formatValue(chartSpan.low)}
            </text>
          </>
        )}

        {answer &&
          answer.predicting_output.map((input, index) => (
            <g key={`target${index}`}>
              <line
                x1={CHART_PAD.left}
                y1={meanToY(input)}
                x2={CHART_PAD.left + CHART_PLOT.width}
                y2={meanToY(input)}
                strokeDasharray="4 4"
                className={UNIT_STROKES[index % UNIT_STROKES.length]}
                strokeWidth={1}
                opacity={0.7}
              />
              <text
                x={CHART_PAD.left + CHART_PLOT.width + 6}
                y={meanToY(input) + 4}
                className={
                  UNIT_FILLS[index % UNIT_FILLS.length] +
                  " font-mono text-[10px]"
                }
              >
                u{index + 1} → {formatValue(input)}
              </text>
            </g>
          ))}

        {answer &&
          answer.predicting_output.map((_, index) => (
            <path
              key={`mean${index}`}
              d={answer.running_means
                .map(
                  (means, drawIndex) =>
                    `${drawIndex === 0 ? "M" : "L"} ${drawToX(drawIndex + 1)} ${meanToY(means[index])}`,
                )
                .join(" ")}
              fill="none"
              className={UNIT_STROKES[index % UNIT_STROKES.length]}
              strokeWidth={1.5}
            />
          ))}

        <text
          x={CHART_PAD.left + CHART_PLOT.width / 2}
          y={CHART.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Draws so far
        </text>
        <text
          x={16}
          y={CHART_PAD.top + CHART_PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${CHART_PAD.top + CHART_PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Mean training output
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each line is the mean of one unit&rsquo;s training output over the
        draws so far, and each dashed line is that unit&rsquo;s predicting
        output. The lines settle onto the dashes.
      </p>

      {answer && (
        <div className="mt-3 flex flex-wrap gap-2">
          {answer.times_kept.map((count, index) => (
            <span
              key={`survivals${index}`}
              className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              u{index + 1} kept {count} of {answer.n_draws}, mean{" "}
              {formatValue(answer.mean_output[index])}
            </span>
          ))}
        </div>
      )}

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
