"use client";

// Four descriptions of the same corpus, judged on the same two questions.
//
// Every word can be described by its row of raw counts, by its row of scores
// with or without the flattening, or by the four numbers a decomposition of
// those scores gives it. For each, two bars: how alike two words of one topic
// are on average, and how alike a word of each topic are. A method that has
// found the topics has a long first bar and a short second one. The API
// computes all four and their nearest lists; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  ReadingsReport,
  fetchReadings,
} from "@/lib/concepts/pointwise-mutual-information";
import {
  ABOVE,
  BELOW,
  Choice,
  Legend,
  Waiting,
  colourFor,
} from "./mutualInformationShared";

const WORDS = [
  { label: "flour", value: "flour" },
  { label: "rope", value: "rope" },
  { label: "and", value: "and" },
];

export function ReadingComparison() {
  const [word, setWord] = useState("flour");
  const [report, setReport] = useState<ReadingsReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchReadings(word);
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
  }, [word]);

  if (!report) return <Waiting message={message} />;

  const widest = Math.max(
    ...report.readings.map((reading) =>
      Math.max(reading.within_topic ?? 0, reading.across_topic ?? 0),
    ),
    0.001,
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="text-xs">nearest words to</span>
        <Choice options={WORDS} value={word} onChange={setWord} />
      </div>

      <div className="space-y-3">
        {report.readings.map((reading) => (
          <div
            key={reading.name}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {reading.label}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {reading.numbers_per_word} numbers a word, apart by{" "}
                {reading.gap === null ? "none" : reading.gap.toFixed(4)}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              {[
                {
                  label: "two words of one topic",
                  value: reading.within_topic,
                  colour: ABOVE,
                },
                {
                  label: "a word of each topic",
                  value: reading.across_topic,
                  colour: BELOW,
                },
              ].map((bar) => (
                <div key={bar.label} className="flex items-center gap-2">
                  <span className="w-40 shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                    {bar.label}
                  </span>
                  <span className="flex h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                    <span
                      className="block h-3 rounded"
                      style={{
                        width: `${(Math.max(bar.value ?? 0, 0) / widest) * 100}%`,
                        backgroundColor: bar.colour,
                      }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {bar.value === null ? "none" : bar.value.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-2 flex flex-wrap gap-2 font-mono text-[11px]">
              {reading.nearest.map((near) => (
                <span key={near.word} style={{ color: colourFor(near.topic) }}>
                  {near.word} {near.similarity.toFixed(4)}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <Legend>
        The two questions do not agree. Scoring the counts drops the second bar,
        which is what it was invented to do, and it drops the first bar as well,
        so the gap between them narrows; only the four numbers underneath widen
        it again.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
