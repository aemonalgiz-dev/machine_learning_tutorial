"use client";

// Two words compared through everything either of them turned up beside.
//
// For each probe word the two bars are how much of each word's context that
// probe took, and the number on the right is the first divided by the second.
// A probe both words met gives a ratio near one when it tells them apart in no
// way at all; a probe only one of them met has no ratio, because the division
// is by zero. The API counts and divides; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, RatioReport, fetchRatios } from "@/lib/concepts/glove";
import { Choice, Legend, Stat, Waiting, colourFor } from "./gloveShared";

const PAIRS: { label: string; value: string }[] = [
  { label: "chef against astronomer", value: "chef|astronomer" },
  { label: "stirs against orbits", value: "stirs|orbits" },
  { label: "soup against star", value: "soup|star" },
  { label: "moon against planet", value: "moon|planet" },
];

export function GloveRatios() {
  const [pair, setPair] = useState(PAIRS[0].value);
  const [report, setReport] = useState<RatioReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const [first, second] = pair.split("|");
    (async () => {
      try {
        const next = await fetchRatios(first, second);
        if (!cancelled) {
          setReport(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pair]);

  if (!report) return <Waiting message={message} />;

  const widest = Math.max(
    ...report.rows.map((row) =>
      Math.max(row.first_probability, row.second_probability),
    ),
    0.001,
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={PAIRS} value={pair} onChange={setPair} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="probes both words met" value={String(report.n_shared)} />
        <Stat label="probes only the first met" value={String(report.n_only_first)} />
        <Stat label="probes only the second met" value={String(report.n_only_second)} />
        <Stat label="words neither met" value={String(report.n_neither)} />
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-20 shrink-0">probe</span>
          <span className="flex-1 text-center">{report.first_word}</span>
          <span className="flex-1 text-center">{report.second_word}</span>
          <span className="w-20 shrink-0 text-right">the ratio</span>
        </div>
        {report.rows.map((row) => (
          <div key={row.probe} className="flex items-center gap-2">
            <span
              className="w-20 shrink-0 font-mono text-xs"
              style={{ color: colourFor(row.topic) }}
            >
              {row.probe}
            </span>
            <span className="flex h-3 flex-1 justify-end rounded bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-3 rounded"
                style={{
                  width: `${(row.first_probability / widest) * 100}%`,
                  backgroundColor: "#f59e0b",
                }}
              />
            </span>
            <span className="flex h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-3 rounded"
                style={{
                  width: `${(row.second_probability / widest) * 100}%`,
                  backgroundColor: "#6366f1",
                }}
              />
            </span>
            <span className="w-20 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
              {row.ratio === null ? "undefined" : row.ratio.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        The bars are the share of each word&rsquo;s own context that the probe
        took, so a long amber bar beside a missing indigo one is a probe the
        second word never met. The ratio is what the method is built to
        reproduce, and it exists only where both bars do.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
