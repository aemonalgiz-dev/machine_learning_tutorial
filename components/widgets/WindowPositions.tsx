"use client";

// Where a window can start along one side, and how many extents that leaves.
//
// A convolution and a pooling layer both answer with as many positions as
// their window can start at, and the reader sets the window, the stride and
// the padding and watches that count change. The API builds the layer and
// reports the extents it answers with; the browser draws one side of the
// picture as cells, adds the padded cells at each end, and marks off exactly
// as many window positions as the API said there were. Push the window past
// what it reads and the library refuses the layer, in its own words, with the
// sum written out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { LayerReport, checkStack } from "@/lib/concepts/shapes-and-flattening";
import { SMALL_PICTURE } from "./shapesAndFlatteningFixtures";

const SIDE = SMALL_PICTURE[1];

const CELL = 26;
const GAP = 3;
const ROW_HEIGHT = 12;

const BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 text-sm font-medium leading-7 text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

interface Settings {
  kernel: number;
  stride: number;
  padding: number;
  summary: "conv" | "pool";
}

function specFor(settings: Settings) {
  return settings.summary === "conv"
    ? {
        kind: "conv" as const,
        reads: SMALL_PICTURE,
        n_filters: 4,
        kernel_size: settings.kernel,
        stride: settings.stride,
        padding: settings.padding,
      }
    : {
        kind: "pool" as const,
        reads: SMALL_PICTURE,
        summary: "max" as const,
        window: settings.kernel,
        stride: settings.stride,
      };
}

export function WindowPositions() {
  const [settings, setSettings] = useState<Settings>({
    kernel: 3,
    stride: 1,
    padding: 0,
    summary: "conv",
  });
  const [report, setReport] = useState<LayerReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const key = JSON.stringify(settings);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const check = await checkStack([specFor(settings)]);
        if (live) {
          setReport(check.layers[0]);
          setMessage(null);
        }
      } catch (error) {
        if (!live) return;
        setReport(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
    // The request is a pure function of the settings, so their text is the one
    // dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const padded = SIDE + 2 * settings.padding;
  const positions = report?.answers?.[1] ?? 0;
  const refused = report !== null && report.refusal !== null;

  const width = padded * (CELL + GAP) + GAP;
  const height = 44 + Math.max(1, positions) * ROW_HEIGHT + 10;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-1.5">
          layer
          <select
            value={settings.summary}
            onChange={(event) =>
              setSettings({
                ...settings,
                summary: event.target.value as "conv" | "pool",
                padding:
                  event.target.value === "pool" ? 0 : settings.padding,
              })
            }
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="conv">convolution</option>
            <option value="pool">pooling</option>
          </select>
        </label>
        <Stepper
          label="window"
          value={settings.kernel}
          min={1}
          max={10}
          onChange={(kernel) => setSettings({ ...settings, kernel })}
        />
        <Stepper
          label="stride"
          value={settings.stride}
          min={1}
          max={4}
          onChange={(stride) => setSettings({ ...settings, stride })}
        />
        <Stepper
          label="padding"
          value={settings.padding}
          min={0}
          max={3}
          disabled={settings.summary === "pool"}
          onChange={(padding) => setSettings({ ...settings, padding })}
        />
      </div>

      <div className="overflow-x-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: `${width}px`, maxWidth: "100%" }}
          role="img"
          aria-label="one side of the picture, with each window position marked beneath it"
        >
          {Array.from({ length: padded }, (_, cell) => {
            const isPadding =
              cell < settings.padding || cell >= settings.padding + SIDE;
            return (
              <rect
                key={cell}
                x={GAP + cell * (CELL + GAP)}
                y={8}
                width={CELL}
                height={CELL}
                rx={3}
                className={
                  isPadding
                    ? "fill-slate-200 dark:fill-slate-800"
                    : "fill-indigo-200 dark:fill-indigo-900"
                }
              />
            );
          })}

          {!refused &&
            Array.from({ length: positions }, (_, position) => (
              <rect
                key={position}
                x={GAP + position * settings.stride * (CELL + GAP)}
                y={44 + position * ROW_HEIGHT}
                width={settings.kernel * (CELL + GAP) - GAP}
                height={ROW_HEIGHT - 4}
                rx={2}
                className="fill-emerald-500/70 dark:fill-emerald-400/60"
              />
            ))}
        </svg>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="The side it reads" value={String(SIDE)} />
          <Stat
            label="With the padding"
            value={String(padded)}
          />
          <Stat
            label="Window positions"
            value={refused ? "none" : report === null ? "…" : String(positions)}
          />
          <Stat
            label="Numbers answered"
            value={
              refused
                ? "refused"
                : report === null
                  ? "…"
                  : String(report.n_answers)
            }
          />
        </div>

        {refused && (
          <p className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
            No layer was built. The refusal reads{" "}
            <span className="font-mono">{report?.refusal}</span>
          </p>
        )}

        {message !== null && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            {message}
          </p>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each green bar is one place the window can start. Count them and you
        have the extent the layer answers with along that side.
      </p>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className={BUTTON_CLASS}
        aria-label={`fewer ${label}`}
      >
        −
      </button>
      <span className="w-6 text-center font-mono text-slate-800 dark:text-slate-100">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className={BUTTON_CLASS}
        aria-label={`more ${label}`}
      >
        +
      </button>
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
