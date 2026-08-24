"use client";

// How much of a grid of a thousand codes six hundred vectors ever reach.
//
// The API rounds the vectors and counts, for each code, how many of them landed
// on it; the browser draws every code as a small square, shaded by how many it
// holds and left blank where nothing landed, so the share of the grid that is
// never used is a picture rather than a percentage. The second view is the same
// count for the seventy-two word vectors, which is the harder case.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  CostReport,
  WordCollection,
  fetchCostReport,
  fetchWordCollection,
} from "@/lib/concepts/finite-scalar-quantisation";

const COLUMNS = 50;
const CELL = 12;
const GAP = 1;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

const SHADES = [
  "fill-slate-100 dark:fill-slate-800",
  "fill-indigo-200 dark:fill-indigo-900",
  "fill-indigo-400 dark:fill-indigo-700",
  "fill-indigo-500 dark:fill-indigo-500",
  "fill-indigo-700 dark:fill-indigo-300",
];

export function GridUsage() {
  const [report, setReport] = useState<CostReport | null>(null);
  const [collection, setCollection] = useState<WordCollection | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState(0);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const [costs, words] = await Promise.all([
          fetchCostReport(),
          fetchWordCollection(),
        ]);
        if (current) {
          setReport(costs);
          setCollection(words);
        }
      } catch (error) {
        if (current) {
          setMessage(
            error instanceof ApiError ? error.message : "Something went wrong.",
          );
        }
      }
    })();
    return () => {
      current = false;
    };
  }, []);

  if (!report || !collection) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const wordCounts = new Map<number, number>();
  for (const entry of collection.words) {
    wordCounts.set(entry.code_id, (wordCounts.get(entry.code_id) ?? 0) + 1);
  }

  // The six hundred vectors are summarised by how many codes hold how many of
  // them, which is all the count endpoint carries, so the picture is drawn from
  // that summary: the busiest codes first and the empty ones last.
  const drawnCounts: number[] = [];
  if (view === 0) {
    const byWeight = [...report.published_usage].sort(
      (first, second) => second.n_vectors - first.n_vectors,
    );
    for (const row of byWeight) {
      for (let index = 0; index < row.n_codes; index += 1) {
        drawnCounts.push(row.n_vectors);
      }
    }
    while (drawnCounts.length < report.published_codes) {
      drawnCounts.push(0);
    }
  } else {
    const sorted = [...wordCounts.values()].sort(
      (first, second) => second - first,
    );
    for (const held of sorted) {
      drawnCounts.push(held);
    }
    while (drawnCounts.length < collection.n_codes) {
      drawnCounts.push(0);
    }
  }

  const rows = Math.ceil(drawnCounts.length / COLUMNS);
  const width = COLUMNS * (CELL + GAP);
  const height = rows * (CELL + GAP);
  const used = view === 0 ? report.published_distinct : collection.n_distinct_codes;
  const empty = view === 0 ? report.published_empty : collection.n_empty_codes;
  const total = view === 0 ? report.n_rows : collection.n_words;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {["Six hundred vectors", "Seventy-two words"].map((label, position) => (
          <button
            key={label}
            type="button"
            onClick={() => setView(position)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              view === position
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label="Every code of the grid, shaded by how many vectors landed on it"
        >
          {drawnCounts.map((held, position) => (
            <rect
              key={position}
              x={(position % COLUMNS) * (CELL + GAP)}
              y={Math.floor(position / COLUMNS) * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              className={SHADES[Math.min(held, SHADES.length - 1)]}
            />
          ))}
        </svg>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        One square per code, the busiest first and the empty ones last. Pale
        squares hold nothing at all.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Codes in the grid" value={String(report.published_codes)} />
        <Stat label="Vectors rounded" value={String(total)} />
        <Stat label="Codes ever chosen" value={String(used)} />
        <Stat label="Codes never chosen" value={String(empty)} />
      </div>
    </div>
  );
}
