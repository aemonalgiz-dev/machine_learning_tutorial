"use client";

// The four sets of weights, side by side, on the three tests that separate
// them.
//
// The first is a clean step from a column of zeros to a column of ones, where
// every operator answers the sum of its own positive weights, which is the
// arithmetic the page works by hand. The second is the diagonal bar in the
// shared scene, where the four agree about the angle and part company about the
// size. The third is a straight edge drawn at every angle from zero to eighty
// five, run twice: once spread across a couple of pixels the way a lens spreads
// a real edge, and once as a hard one-pixel step. The chart draws the error in
// the reported angle at each of those angles, and the two runs do not order the
// operators the same way. The API computes every number.

import { useEffect, useState } from "react";
import {
  OperatorReading,
  Operators,
  messageFor,
  readOperators,
} from "@/lib/concepts/filters-and-edges";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Failure,
  PANEL_CLASS,
  Stat,
  short,
} from "./filtersAndEdgesShared";

const LINE_COLOURS: Record<string, string> = {
  central_difference: "rgb(148, 163, 184)",
  prewitt: "rgb(217, 119, 6)",
  sobel: "rgb(2, 132, 199)",
  scharr: "rgb(79, 70, 229)",
};

const CHART_WIDTH = 460;
const CHART_HEIGHT = 190;
const LEFT = 44;
const BOTTOM = 26;

export function OperatorGallery() {
  const [operators, setOperators] = useState<Operators | null>(null);
  const [edgeKind, setEdgeKind] = useState<"blurred" | "hard">("blurred");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOperators(await readOperators());
        setMessage(null);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  const readings = operators?.readings ?? [];
  const worstEverywhere = Math.max(
    0.001,
    ...readings.map((one) =>
      edgeKind === "blurred"
        ? one.sweep.blurred_worst_error
        : one.sweep.hard_worst_error,
    ),
  );

  return (
    <div className={PANEL_CLASS}>
      {operators ? (
        <>
          <div className="flex flex-wrap justify-center gap-4">
            {readings.map((reading) => (
              <WeightPanel key={reading.operator} reading={reading} />
            ))}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="py-1 pr-4 font-medium">Weights</th>
                  <th className="py-1 pr-4 font-medium">Positive weights add to</th>
                  <th className="py-1 pr-4 font-medium">Answer on a clean step</th>
                  <th className="py-1 pr-4 font-medium">Angle on the bar</th>
                  <th className="py-1 pr-4 font-medium">Out by</th>
                  <th className="py-1 font-medium">Size on the bar</th>
                </tr>
              </thead>
              <tbody className="font-mono text-slate-700 dark:text-slate-300">
                {readings.map((reading) => (
                  <tr
                    key={reading.operator}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <td className="py-1 pr-4 font-sans">{reading.label}</td>
                    <td className="py-1 pr-4">
                      {short(reading.positive_weight_total)}
                    </td>
                    <td className="py-1 pr-4">
                      {short(reading.clean_step_answer)}
                    </td>
                    <td className="py-1 pr-4">
                      {reading.bar_angle.toFixed(2)}&deg;
                    </td>
                    <td className="py-1 pr-4">
                      {reading.bar_angle_error.toFixed(2)}&deg;
                    </td>
                    <td className="py-1">{reading.bar_magnitude.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
            a straight edge drawn at every angle, and it is
            <button
              onClick={() => setEdgeKind("blurred")}
              className={
                edgeKind === "blurred" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              spread over a couple of pixels
            </button>
            <button
              onClick={() => setEdgeKind("hard")}
              className={edgeKind === "hard" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            >
              a hard one-pixel step
            </button>
          </div>

          {edgeKind === "blurred" ? (
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="mt-2 h-auto w-full"
              role="img"
              aria-label="the error in the reported angle at each drawn angle"
            >
              <line
                x1={LEFT}
                y1={CHART_HEIGHT - BOTTOM}
                x2={CHART_WIDTH - 8}
                y2={CHART_HEIGHT - BOTTOM}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
              />
              <line
                x1={LEFT}
                y1={8}
                x2={LEFT}
                y2={CHART_HEIGHT - BOTTOM}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
              />
              {readings.map((reading) => (
                <polyline
                  key={reading.operator}
                  fill="none"
                  stroke={LINE_COLOURS[reading.operator]}
                  strokeWidth={2}
                  points={reading.sweep.blurred
                    .map((point) => {
                      const x =
                        LEFT +
                        (point.degrees / 85) * (CHART_WIDTH - LEFT - 12);
                      const y =
                        CHART_HEIGHT -
                        BOTTOM -
                        (point.error / worstEverywhere) *
                          (CHART_HEIGHT - BOTTOM - 12);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ")}
                />
              ))}
              {[0, 0.5, 1].map((share) => (
                <text
                  key={share}
                  x={LEFT - 6}
                  y={
                    CHART_HEIGHT -
                    BOTTOM -
                    share * (CHART_HEIGHT - BOTTOM - 12) +
                    3
                  }
                  textAnchor="end"
                  className="fill-slate-500 text-[9px] dark:fill-slate-400"
                >
                  {(share * worstEverywhere).toFixed(1)}
                </text>
              ))}
              {[0, 45, 85].map((degrees) => (
                <text
                  key={degrees}
                  x={LEFT + (degrees / 85) * (CHART_WIDTH - LEFT - 12)}
                  y={CHART_HEIGHT - BOTTOM + 14}
                  textAnchor="middle"
                  className="fill-slate-500 text-[9px] dark:fill-slate-400"
                >
                  {degrees}&deg;
                </text>
              ))}
              <text
                x={LEFT}
                y={CHART_HEIGHT - 4}
                className="fill-slate-500 text-[9px] dark:fill-slate-400"
              >
                the angle the edge was drawn at
              </text>
              <text
                x={6}
                y={16}
                className="fill-slate-500 text-[9px] dark:fill-slate-400"
              >
                degrees out
              </text>
            </svg>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              On a step one pixel wide the curve is not worth drawing, because
              every operator is wrong by nine degrees or more and the reported
              angle jumps between a handful of values rather than following the
              drawn one. The means are in the table below, and the ordering
              above has not survived.
            </p>
          )}

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="py-1 pr-4 font-medium">Weights</th>
                  <th className="py-1 pr-4 font-medium">
                    Spread over pixels, mean
                  </th>
                  <th className="py-1 pr-4 font-medium">worst</th>
                  <th className="py-1 pr-4 font-medium">One-pixel step, mean</th>
                  <th className="py-1 font-medium">worst</th>
                </tr>
              </thead>
              <tbody className="font-mono text-slate-700 dark:text-slate-300">
                {readings.map((reading) => (
                  <tr
                    key={reading.operator}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <td className="py-1 pr-4 font-sans">
                      <span
                        className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                        style={{
                          backgroundColor: LINE_COLOURS[reading.operator],
                        }}
                      />
                      {reading.label}
                    </td>
                    <td className="py-1 pr-4">
                      {reading.sweep.blurred_mean_error.toFixed(4)}&deg;
                    </td>
                    <td className="py-1 pr-4">
                      {reading.sweep.blurred_worst_error.toFixed(4)}&deg;
                    </td>
                    <td className="py-1 pr-4">
                      {reading.sweep.hard_mean_error.toFixed(4)}&deg;
                    </td>
                    <td className="py-1">
                      {reading.sweep.hard_worst_error.toFixed(4)}&deg;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Angles they part by, on the bar"
              value={`${operators.bar_angle_spread.toFixed(4)}°`}
            />
            <Stat
              label="Sizes they part by, on the bar"
              value={`${operators.bar_magnitude_ratio.toFixed(2)} times`}
            />
            <Stat
              label="Edge the bar really runs at"
              value={`${operators.bar_true_angle}°`}
            />
            <Stat
              label="Edge spread, in pixels"
              value={operators.blur_width.toFixed(1)}
            />
          </div>

          <Failure message={message} />
        </>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}
    </div>
  );
}

function WeightPanel({ reading }: { reading: OperatorReading }) {
  return (
    <div className="flex w-40 flex-col items-center gap-1">
      <span className="text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {reading.label}
      </span>
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${reading.n_columns}, minmax(0, 1fr))`,
        }}
      >
        {reading.weights.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <div
              key={`${rowIndex},${columnIndex}`}
              className={
                "flex h-7 w-9 items-center justify-center rounded-sm border border-slate-200 font-mono text-[10px] dark:border-slate-800 " +
                (value > 0
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                  : value < 0
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                    : "bg-white text-slate-400 dark:bg-slate-900 dark:text-slate-500")
              }
            >
              {short(value)}
            </div>
          )),
        )}
      </div>
      <span className="text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {reading.note}
      </span>
    </div>
  );
}
