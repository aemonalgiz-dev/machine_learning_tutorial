"use client";

// How much each pair's term is worth, and what the cap holds back.
//
// The curve is the weight a count earns, rising with the count until the cap
// and flat at one after it. The ticks along it are the corpus's own counts, so
// the reader can see where the cap falls relative to the pairs that actually
// occurred, and the readouts say how much of the whole objective the single
// commonest pair and the ten commonest pairs carry once the cap has taken their
// share back. The API weighs and totals; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, WeightingReport, fetchWeighting } from "@/lib/concepts/glove";
import { HELD, Legend, Stat, Waiting, colourFor } from "./gloveShared";

const PANEL = { width: 640, height: 220 };
const PAD = { left: 52, right: 16, top: 16, bottom: 40 };

export function GloveWeightingCurve() {
  const [maximumCount, setMaximumCount] = useState(7.5);
  const [exponent, setExponent] = useState(0.75);
  const [report, setReport] = useState<WeightingReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const next = await fetchWeighting(maximumCount, exponent);
        if (!cancelled) {
          setReport(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [maximumCount, exponent]);

  if (!report) return <Waiting message={message} />;

  const innerWidth = PANEL.width - PAD.left - PAD.right;
  const innerHeight = PANEL.height - PAD.top - PAD.bottom;
  const rightmost = report.curve[report.curve.length - 1].count;
  const positionX = (count: number) => PAD.left + (count / rightmost) * innerWidth;
  const positionY = (weight: number) => PAD.top + (1 - weight) * innerHeight;
  const path = report.curve
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${positionX(point.count)},${positionY(point.weight)}`,
    )
    .join(" ");
  const capped = report.pairs.filter((pair) => pair.at_the_cap);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          the cap
          <input
            type="range"
            min={1}
            max={100}
            step={0.5}
            value={maximumCount}
            onChange={(event) => setMaximumCount(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-12 text-right font-mono">{maximumCount.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2">
          how steeply it rises
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={exponent}
            onChange={(event) => setExponent(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-10 text-right font-mono">{exponent.toFixed(2)}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        style={{ opacity: busy ? 0.45 : 1 }}
      >
        <line
          x1={PAD.left}
          y1={positionY(1)}
          x2={PANEL.width - PAD.right}
          y2={positionY(1)}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={positionX(report.maximum_count)}
          y1={PAD.top}
          x2={positionX(report.maximum_count)}
          y2={PAD.top + innerHeight}
          stroke={HELD}
          strokeWidth={1.5}
        />
        <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} />
        {report.pairs.map((pair) => (
          <line
            key={`${pair.word}-${pair.context}`}
            x1={positionX(pair.count)}
            y1={PAD.top + innerHeight}
            x2={positionX(pair.count)}
            y2={PAD.top + innerHeight + 8}
            stroke={pair.at_the_cap ? HELD : colourFor("shared")}
            strokeWidth={1}
            opacity={0.5}
          />
        ))}
        <text
          x={PAD.left - 6}
          y={positionY(1) + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          1.00
        </text>
        <text
          x={PAD.left - 6}
          y={positionY(0) + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0.00
        </text>
        <text
          x={positionX(report.maximum_count)}
          y={PAD.top - 4}
          textAnchor="middle"
          className="text-[10px]"
          fill={HELD}
        >
          the cap
        </text>
        <text
          x={PAD.left + innerWidth / 2}
          y={PANEL.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          what a pair&rsquo;s term is worth, against how often the pair occurred
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pairs at or beyond the cap" value={`${report.n_at_the_cap} of ${report.n_pairs}`} />
        <Stat label="largest count in the corpus" value={report.largest_count.toFixed(1)} />
        <Stat
          label="the commonest pair's share"
          value={`${(report.top_pair_share * 100).toFixed(2)}%`}
        />
        <Stat
          label="the ten commonest pairs' share"
          value={`${(report.top_ten_share * 100).toFixed(2)}%`}
        />
      </div>

      <div className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        {capped.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">
            no pair in this corpus is common enough to reach the cap
          </p>
        ) : (
          <p>
            at or beyond the cap:{" "}
            {capped
              .slice(0, 6)
              .map((pair) => `${pair.word} ~ ${pair.context} ${pair.count.toFixed(1)}`)
              .join(", ")}
            {capped.length > 6 ? `, and ${capped.length - 6} more` : ""}
          </p>
        )}
      </div>

      <Legend>
        The ticks along the bottom are the corpus&rsquo;s own counts. Move the cap
        down and the tallest of them fall under the flat part of the curve, where
        seeing a pair more often buys it nothing further. For
        comparison, weighting every pair alike would give the ten commonest{" "}
        {(report.alike_top_ten_share * 100).toFixed(2)}% of the objective and
        weighting them in proportion to their counts would give them{" "}
        {(report.proportional_top_ten_share * 100).toFixed(2)}%.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
