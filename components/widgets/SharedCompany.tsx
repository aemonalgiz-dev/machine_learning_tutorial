"use client";

// What two words were each seen beside, and how much of that they share.
//
// Two columns of bars, one per word, listing every word that fell within two
// positions of it and how much that counted for, with the shared entries
// highlighted. The three stats say how much company the two words kept with
// each other directly and what the fit made of them, which is where the
// surprise is, since a pair that never met can still be placed together. The
// API counts the company with the same window and weighting the fit used; the
// browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CompanyView, fetchCompany } from "@/lib/concepts/a-vector-for-a-word";
import { ACCENT, SHARED_COLOUR, colourOf } from "./wordPositionFixtures";

const PAIRS: [string, string][] = [
  ["sail", "rope"],
  ["sail", "boat"],
  ["oven", "bake"],
  ["sail", "flour"],
];

export function SharedCompany() {
  const [chosen, setChosen] = useState(0);
  const [view, setView] = useState<CompanyView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCompany(PAIRS[chosen][0], PAIRS[chosen][1]));
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, [chosen]);

  if (!view) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const heaviest = Math.max(
    ...view.first_company.map((entry) => entry.weight),
    ...view.second_company.map((entry) => entry.weight),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">the pair</span>
        {PAIRS.map((pair, index) => (
          <button
            key={pair.join("-")}
            onClick={() => setChosen(index)}
            className={
              "rounded px-2 py-0.5 font-mono text-xs transition " +
              (index === chosen
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
            }
          >
            {pair[0]} and {pair[1]}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          { word: view.first, company: view.first_company },
          { word: view.second, company: view.second_company },
        ].map((side) => (
          <div
            key={side.word}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              what {side.word} was seen beside
            </div>
            <svg
              viewBox={`0 0 300 ${side.company.length * 20 + 4}`}
              className="mt-1 w-full select-none"
            >
              {side.company.map((entry, index) => (
                <g key={entry.word} transform={`translate(0 ${index * 20})`}>
                  <rect
                    x={72}
                    y={3}
                    width={Math.max(1, (entry.weight / heaviest) * 150)}
                    height={13}
                    rx={2}
                    fill={
                      view.shared.includes(entry.word)
                        ? colourOf(entry.word)
                        : SHARED_COLOUR
                    }
                    opacity={view.shared.includes(entry.word) ? 0.95 : 0.4}
                  />
                  <text
                    x={68}
                    y={14}
                    textAnchor="end"
                    className="fill-slate-700 font-mono text-[11px] dark:fill-slate-300"
                  >
                    {entry.word}
                  </text>
                  <text
                    x={232}
                    y={14}
                    className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
                  >
                    {entry.weight.toFixed(1)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="company the two kept with each other"
          value={view.between.toFixed(1)}
        />
        <Stat
          label="words they were both seen beside"
          value={view.shared.join(", ") || "none"}
        />
        <Stat label="cosine between their positions" value={view.cosine.toFixed(4)} />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Bars in colour are the words both members of the pair were seen beside.
        A word one position away counts one and a word two positions away counts
        a half, which is the weighting the fit itself used.
      </p>

      {message && (
        <p className="mt-2 text-sm" style={{ color: ACCENT }}>
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
