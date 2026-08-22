"use client";

// What subtracting an average and dividing by a spread does not do.
//
// The shape panel puts one lopsided column on its own ruler and then in
// deviations, drawn at the same width, so the reader can see that the two
// pictures are the same picture with different numbers under it, and reads the
// lopsidedness back off both. The outlier panel retypes one trunk with a stray
// digit and reports what that did to the average and the spread and to where
// every ordinary tree then lands. The tiny panel takes nine readings a machine
// epsilon apart, which is a real spread and is treated as one. The API measures
// all of it.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Limits, fetchLimits } from "@/lib/concepts/the-standard-score";
import { GIRTH_COLOUR, HIGHLIGHT_COLOUR } from "./standardScoreFixtures";

export type ShapePanel = "shape" | "outlier" | "tiny";

const SKEWED_COLUMN = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 6, 9, 20];

const VIEW = { width: 640, height: 132 };
const PAD = { left: 108, right: 24 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right };

export function ShapeSurvives({ panel }: { panel: ShapePanel }) {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLimits(await fetchLimits());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!limits) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  if (panel === "outlier") {
    const mistyped = limits.mistyped;
    return (
      <div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the orchard&rsquo;s trunks
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                as measured
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                with one stray digit
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "the average trunk, mm",
                mistyped.before_mean.toFixed(3),
                mistyped.after_mean.toFixed(3),
              ],
              [
                "its spread, mm",
                mistyped.before_deviation.toFixed(3),
                mistyped.after_deviation.toFixed(3),
              ],
              [
                "the widest real trunk, in deviations",
                mistyped.widest_real_score_before.toFixed(4),
                mistyped.widest_real_score_after.toFixed(4),
              ],
              [
                "how far apart the other twenty-three sit",
                mistyped.others_span_before.toFixed(4),
                mistyped.others_span_after.toFixed(4),
              ],
            ].map((row) => (
              <tr
                key={row[0]}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                  {row[0]}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row[1]}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {row[2]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          The mistyped trunk itself lands at{" "}
          {mistyped.mistyped_score.toFixed(3)} deviations, and the twenty-three
          real ones are pressed into the stretch from{" "}
          {mistyped.others_lowest_after.toFixed(3)} to{" "}
          {mistyped.others_highest_after.toFixed(3)}.
        </p>
      </div>
    );
  }

  if (panel === "tiny") {
    return (
      <div>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Nine readings, each one machine epsilon further along than the last.
          Their spread is {limits.tiny_deviation.toExponential(3)}, which is a
          positive number, so the quotient exists and the nine land evenly from{" "}
          {Math.min(...limits.tiny_scores).toFixed(4)} to{" "}
          {Math.max(...limits.tiny_scores).toFixed(4)}.
        </p>
        <div className="mt-3 flex flex-wrap gap-1 font-mono text-xs text-slate-700 dark:text-slate-300">
          {limits.tiny_scores.map((score, index) => (
            <span
              key={index}
              className="rounded border border-slate-200 px-2 py-1 dark:border-slate-800"
            >
              {score.toFixed(4)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          A column of nine identical readings has a spread of exactly zero and
          no standard score at all, and{" "}
          {limits.constant_defined ? "was accepted" : "is refused"}. A single
          reading has the same problem, since its one deviation from its own
          average is exactly zero, and it{" "}
          {limits.single_row_defined ? "was accepted" : "is refused"} too.
        </p>
      </div>
    );
  }

  const values = SKEWED_COLUMN;
  const smallest = Math.min(...values);
  const largest = Math.max(...values);
  const across = (value: number) =>
    PAD.left + ((value - smallest) / (largest - smallest)) * PLOT.width;
  const scoreSmallest = -1;
  const scoreLargest = limits.skewed.largest_score;
  const acrossScore = (index: number) => {
    const share = (values[index] - smallest) / (largest - smallest);
    return PAD.left + share * PLOT.width;
  };

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <text x={PAD.left} y={18} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          fifteen readings with a long tail to the right, as recorded
        </text>
        <line x1={PAD.left} y1={46} x2={PAD.left + PLOT.width} y2={46} className="stroke-slate-300 dark:stroke-slate-700" />
        <text x={PAD.left - 8} y={50} textAnchor="end" className="fill-slate-600 text-[11px] dark:fill-slate-300">
          {smallest} to {largest}
        </text>
        {values.map((value, index) => (
          <circle key={`raw-${index}`} cx={across(value)} cy={46} r={5} fill={GIRTH_COLOUR} opacity={0.8} />
        ))}

        <text x={PAD.left} y={86} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          the same fifteen in deviations, and the same picture
        </text>
        <line x1={PAD.left} y1={114} x2={PAD.left + PLOT.width} y2={114} className="stroke-slate-300 dark:stroke-slate-700" />
        <text x={PAD.left - 8} y={118} textAnchor="end" className="fill-slate-600 text-[11px] dark:fill-slate-300">
          {scoreSmallest.toFixed(2)} to {scoreLargest.toFixed(2)}
        </text>
        {values.map((_, index) => (
          <circle
            key={`score-${index}`}
            cx={acrossScore(index)}
            cy={114}
            r={5}
            fill={index === values.length - 1 ? HIGHLIGHT_COLOUR : GIRTH_COLOUR}
            opacity={0.8}
          />
        ))}
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The lopsidedness is {limits.skewed.skew_before.toFixed(10)} before and{" "}
        {limits.skewed.skew_after.toFixed(10)} after, the order of the fifteen
        is {limits.skewed.order_kept ? "unchanged" : "changed"}, and{" "}
        {(limits.skewed.share_within_one * 100).toFixed(1)}% of them fall inside
        one deviation where a bell curve would put{" "}
        {(limits.normal_within_one * 100).toFixed(1)}%.
      </p>
    </div>
  );
}
