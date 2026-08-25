"use client";

// One window, and both kinds of pooling asked what they make of it.
//
// The left grid is the window. The two on the right are what each position is
// owed when a slope of one arrives at that window's answer, which for a maximum
// is one at a single position and for an average is the same fraction
// everywhere. Both the answers and the shares come from the API, which asks the
// layer's own two methods, so the winner shown here is the winner the backward
// pass routes to. The browser lays the three grids out and colours them.

import { ReactNode, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Grid, WindowReading, readWindow } from "@/lib/concepts/pooling";
import { FLAT_PATCH, TOP_LEFT_WINDOW } from "./poolingFixtures";

const CHOICES: { name: string; window: Grid }[] = [
  { name: "The patch’s top left", window: TOP_LEFT_WINDOW },
  {
    name: "Three by three",
    window: [
      [1, 5, 1],
      [4, 2, 4],
      [0, 1, 3],
    ],
  },
  {
    name: "A four-way tie",
    window: FLAT_PATCH.slice(0, 2).map((row) => row.slice(0, 2)),
  },
  {
    name: "One strong reading",
    window: [
      [0, 0],
      [0, 8],
    ],
  },
  {
    name: "Four moderate readings",
    window: [
      [2, 2],
      [2, 2],
    ],
  },
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const CHOSEN_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white dark:border-indigo-500 dark:bg-indigo-500";

function format(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(4)).toString();
}

export function WindowSummaries() {
  const [chosen, setChosen] = useState(0);
  const [reading, setReading] = useState<WindowReading | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReading(await readWindow(CHOICES[chosen].window));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [chosen]);

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap gap-2 pb-3">
        {CHOICES.map((choice, index) => (
          <button
            key={choice.name}
            onClick={() => setChosen(index)}
            className={index === chosen ? CHOSEN_CLASS : BUTTON_CLASS}
          >
            {choice.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        <Panel
          title="The window"
          caption={
            reading
              ? `${reading.positions} cells, summing to ${format(reading.total)}`
              : "…"
          }
        >
          <CellGrid values={reading?.values ?? null} accent="99, 102, 241" />
        </Panel>

        {(reading?.summaries ?? []).map((summary) => (
          <Panel
            key={summary.kind}
            title={summary.kind === "max" ? "Max keeps" : "Average keeps"}
            caption={
              summary.kind === "max"
                ? `${format(summary.answer)}, owed to the cell at row ${summary.winner?.row}, column ${summary.winner?.column}`
                : `${format(summary.answer)}, owed to all ${summary.n_receiving} equally`
            }
          >
            <CellGrid values={summary.shares} accent="16, 185, 129" />
          </Panel>
        ))}

        {!reading && (
          <span className="font-mono text-slate-500 dark:text-slate-400">…</span>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        The two grids on the right are the shares, which are the derivative of
        the answer with respect to each cell. Read down the pair and the whole
        difference between the layers is there.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(reading?.summaries ?? []).map((summary) => (
          <Stat
            key={`${summary.kind}-receiving`}
            label={`Cells ${summary.kind} trains`}
            value={`${summary.n_receiving} of ${reading?.positions ?? 0}`}
          />
        ))}
        {(reading?.summaries ?? []).map((summary) => (
          <Stat
            key={`${summary.kind}-total`}
            label={`${summary.kind} shares total`}
            value={String(summary.share_total)}
          />
        ))}
        {!reading && <Stat label="Cells trained" value="…" />}
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Panel({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      {children}
      <span className="max-w-[13rem] text-center text-xs text-slate-500 dark:text-slate-400">
        {caption}
      </span>
    </div>
  );
}

function CellGrid({
  values,
  accent,
}: {
  values: Grid | null;
  accent: string;
}) {
  if (!values) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-200 font-mono text-slate-500 dark:bg-slate-800">
        …
      </div>
    );
  }
  const brightest = Math.max(1, ...values.flat().map(Math.abs));
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))` }}
    >
      {values.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <div
            key={`${rowIndex}-${columnIndex}`}
            className="flex h-11 w-11 items-center justify-center rounded font-mono text-xs font-semibold text-slate-900 dark:text-slate-100"
            style={{
              backgroundColor: `rgba(${accent}, ${0.12 + 0.6 * Math.min(1, Math.abs(value) / brightest)})`,
            }}
          >
            {format(value)}
          </div>
        )),
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
