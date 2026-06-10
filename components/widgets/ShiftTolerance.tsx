"use client";

// A bright column moved sideways a cell at a time, and what the pooled map did.
//
// The API pools the picture at every offset and counts how many of the picture's
// own cells changed and how many of the pooled map's did, both against the
// unshifted picture, for each kind. The reader slides the offset and watches the
// second count stay at zero until the stroke crosses a window boundary. Every
// pooled number and every count is the library's; the browser draws the grids.

import { ReactNode, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Grid, ShiftReading, poolAcrossShifts } from "@/lib/concepts/pooling";
import { STROKE_COLUMN, verticalStroke } from "./poolingFixtures";

const WINDOW = 2;
const STRIDE = 2;
const OFFSETS = [0, 1, 2, 3];

export function ShiftTolerance() {
  const [offset, setOffset] = useState(0);
  const [reading, setReading] = useState<ShiftReading | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReading(
          await poolAcrossShifts(
            verticalStroke(STROKE_COLUMN),
            WINDOW,
            STRIDE,
            OFFSETS,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const kinds = reading?.by_kind ?? [];
  const current = kinds.map((entry) => ({
    kind: entry.kind,
    map: entry.maps.find((each) => each.shift === offset) ?? entry.maps[0],
  }));
  const first = current[0]?.map ?? null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <label className="flex items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        Columns moved right
        <input
          type="range"
          min={0}
          max={OFFSETS.length - 1}
          value={offset}
          onChange={(event) => setOffset(Number(event.target.value))}
          className="w-32 accent-indigo-600"
        />
        <span className="w-4 font-mono">{offset}</span>
      </label>

      <div className="flex flex-wrap items-start justify-center gap-6">
        <Panel
          title="The picture"
          caption={
            first
              ? `${first.picture_cells_changed} of ${reading?.n_picture_cells} cells differ from the start`
              : "…"
          }
        >
          <SmallGrid values={first?.picture ?? null} size={5} />
        </Panel>

        {current.map((entry) => (
          <Panel
            key={entry.kind}
            title={entry.kind === "max" ? "Pooled by max" : "Pooled by average"}
            caption={
              entry.map
                ? `${entry.map.pooled_cells_changed} of ${reading?.n_pooled_cells} pooled cells differ`
                : "…"
            }
          >
            <SmallGrid values={entry.map?.pooled ?? null} size={9} />
          </Panel>
        ))}

        {!reading && (
          <span className="font-mono text-slate-500 dark:text-slate-400">…</span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {current.map((entry) => (
          <Stat
            key={`${entry.kind}-changed`}
            label={`Pooled cells ${entry.kind} moved`}
            value={
              entry.map
                ? `${entry.map.pooled_cells_changed} of ${reading?.n_pooled_cells}`
                : "…"
            }
          />
        ))}
        {current.map((entry) => (
          <Stat
            key={`${entry.kind}-largest`}
            label={`Largest change under ${entry.kind}`}
            value={entry.map ? String(entry.map.largest_pooled_change) : "…"}
          />
        ))}
        {!reading && <Stat label="Pooled cells moved" value="…" />}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The stroke starts in the third column, and under a window of two at a
        stride of two the third and fourth columns share a window. One step keeps
        it there and two carry it into the next.
      </p>

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

function SmallGrid({ values, size }: { values: Grid | null; size: number }) {
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
      className="grid gap-0.5"
      style={{
        gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))`,
      }}
    >
      {values.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <div
            key={`${rowIndex}-${columnIndex}`}
            className="rounded-sm"
            style={{
              width: `${size * 4}px`,
              height: `${size * 4}px`,
              backgroundColor: `rgba(99, 102, 241, ${0.08 + 0.72 * Math.min(1, Math.abs(value) / brightest)})`,
            }}
          />
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
