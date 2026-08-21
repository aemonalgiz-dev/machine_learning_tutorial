"use client";

// A block of rows through one draw, and the blame sent back through it.
//
// Three rows of units go through the library's dropout layer in one
// training pass, and the grids show what each row read, which entries the
// mask kept, and what each row sent on, so the draw's independence across
// rows is visible in the mask grid itself. Beneath that, a block of blame
// arriving at the outputs is sent back through the same mask, and the
// passed-down grid is the arriving grid multiplied by the mask, checked
// against a finite difference of the forward pass. The rectified block holds
// exact zeros, and the grid marks every entry that reading the mask back off
// the outputs would misfile. Every mask, output, passed-down block and
// finite difference is the library's through the API. The browser lays the
// grids out and picks the next seed.

import { useEffect, useState } from "react";
import { BlockPass, failureMessage, passBlock } from "@/lib/concepts/dropout";
import {
  ACCENT_BUTTON_CLASS,
  BUTTON_CLASS,
  GRADED_ARRIVING,
  RECTIFIED_BLOCK,
  WORKED_BLOCK,
  WORKED_PROBABILITY,
  WORKED_SEED,
  formatValue,
} from "./dropoutFixtures";

type Preset = "worked" | "rectified";

const PRESETS: Record<Preset, { rows: number[][]; arriving: number[][] | undefined }> = {
  worked: { rows: WORKED_BLOCK, arriving: undefined },
  rectified: { rows: RECTIFIED_BLOCK, arriving: GRADED_ARRIVING },
};

export function DropoutBlockPass({
  showBackward = true,
  initialPreset = "worked",
}: {
  showBackward?: boolean;
  initialPreset?: Preset;
}) {
  const [preset, setPreset] = useState<Preset>(initialPreset);
  const [dropProbability, setDropProbability] = useState(WORKED_PROBABILITY);
  const [seed, setSeed] = useState(WORKED_SEED);
  const [answer, setAnswer] = useState<BlockPass | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const chosen = PRESETS[preset];
    const timer = setTimeout(async () => {
      try {
        setAnswer(await passBlock(chosen.rows, dropProbability, seed, chosen.arriving));
        setMessage(null);
      } catch (error) {
        setMessage(failureMessage(error));
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [preset, dropProbability, seed]);

  const rows = PRESETS[preset].rows;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => {
            setPreset("worked");
            setSeed(WORKED_SEED);
            setDropProbability(WORKED_PROBABILITY);
          }}
          className={preset === "worked" ? ACCENT_BUTTON_CLASS : BUTTON_CLASS}
        >
          The worked row, three times
        </button>
        <button
          onClick={() => {
            setPreset("rectified");
            setSeed(WORKED_SEED);
            setDropProbability(WORKED_PROBABILITY);
          }}
          className={preset === "rectified" ? ACCENT_BUTTON_CLASS : BUTTON_CLASS}
        >
          A rectified block
        </button>
        <button onClick={() => setSeed((current) => current + 1)} className={BUTTON_CLASS}>
          Draw again
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          drop probability
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={dropProbability}
            onChange={(event) => setDropProbability(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">{dropProbability.toFixed(2)}</span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Grid
          title="What each row read"
          values={rows}
          tone={() => "plain"}
        />
        <Grid
          title={`The mask (seed ${seed})`}
          values={answer ? answer.mask : rows.map((row) => row.map(() => Number.NaN))}
          tone={(rowIndex, unitIndex) =>
            !answer ? "plain" : answer.kept[rowIndex][unitIndex] ? "kept" : "dropped"
          }
          format={(value, rowIndex, unitIndex) =>
            !answer ? "…" : answer.kept[rowIndex][unitIndex] ? `×${formatValue(value)}` : "0"
          }
          marks={answer ? answer.misfiled : undefined}
        />
        <Grid
          title="What each row sent on"
          values={answer ? answer.training_outputs : rows.map((row) => row.map(() => Number.NaN))}
          tone={(rowIndex, unitIndex) =>
            !answer ? "plain" : answer.kept[rowIndex][unitIndex] ? "kept" : "dropped"
          }
          format={(value) => (answer ? formatValue(value) : "…")}
          marks={answer ? answer.misfiled : undefined}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Scale, 1 / (1 − p)" value={answer ? formatValue(answer.scale) : "…"} />
        <Stat
          label="Kept per row"
          value={answer ? answer.n_kept_per_row.join(", ") : "…"}
        />
        <Stat
          label="Misfiled by reading the outputs"
          value={answer ? `${answer.n_misfiled} of ${rows.length * rows[0].length}` : "…"}
        />
      </div>

      {showBackward && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Grid
              title="Blame arriving at the outputs"
              values={answer ? answer.arriving : rows.map((row) => row.map(() => Number.NaN))}
              tone={() => "plain"}
              format={(value) => (answer ? formatValue(value) : "…")}
            />
            <Grid
              title="Passed down, arriving × mask"
              values={answer ? answer.passed_down : rows.map((row) => row.map(() => Number.NaN))}
              tone={(rowIndex, unitIndex) =>
                !answer ? "plain" : answer.kept[rowIndex][unitIndex] ? "kept" : "dropped"
              }
              format={(value) => (answer ? formatValue(value) : "…")}
              marks={answer ? answer.misfiled : undefined}
            />
            <Grid
              title="Finite difference of the forward pass"
              values={
                answer ? answer.finite_difference : rows.map((row) => row.map(() => Number.NaN))
              }
              tone={() => "plain"}
              format={(value) => (answer ? value.toFixed(4) : "…")}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat
              label="Largest gap to the finite difference"
              value={answer ? answer.largest_finite_difference_gap.toExponential(1) : "…"}
            />
            <Stat
              label="Parameter gradient"
              value={answer ? (answer.gradient_is_none ? "none, nothing to learn" : "present") : "…"}
            />
          </div>
        </>
      )}

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Indigo is kept and grey is silenced, read from the mask the layer
        carried. A rose outline marks an entry that reading the mask back off
        the outputs would have got wrong, a zero that survived.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

type Tone = "plain" | "kept" | "dropped";

function Grid({
  title,
  values,
  tone,
  format = formatValue,
  marks,
}: {
  title: string;
  values: number[][];
  tone: (rowIndex: number, unitIndex: number) => Tone;
  format?: (value: number, rowIndex: number, unitIndex: number) => string;
  marks?: boolean[][];
}) {
  const toneClass: Record<Tone, string> = {
    plain: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    kept: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100",
    dropped: "bg-slate-200 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500",
  };
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{title}</p>
      <div className="space-y-1">
        {values.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            <span className="w-8 shrink-0 self-center font-mono text-[10px] text-slate-400 dark:text-slate-500">
              row {rowIndex + 1}
            </span>
            {row.map((value, unitIndex) => (
              <span
                key={unitIndex}
                className={
                  "flex h-8 flex-1 items-center justify-center rounded font-mono text-xs " +
                  toneClass[tone(rowIndex, unitIndex)] +
                  (marks && marks[rowIndex][unitIndex]
                    ? " ring-2 ring-rose-500 dark:ring-rose-400"
                    : "")
                }
              >
                {format(value, rowIndex, unitIndex)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
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
