"use client";

// What a change of lighting does, stage by stage.
//
// The API multiplies every brightness in the scene by one number and adds
// another, then measures three distances for each way of rescaling a block:
// how far the answer moves when only the addition is made, when only the
// multiplication is made, and when both are. The browser draws those three as
// bars on a logarithmic scale, since the numbers they have to hold run from a
// few hundred down to a few times ten to the sixteenth.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  LightingView,
  fetchLighting,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import { Stat } from "./orientedGradientsDrawing";

const FLOOR = 1e-18;
const CEILING = 1e4;

function bar(value: number): number {
  const clamped = Math.max(value, FLOOR);
  const low = Math.log10(FLOOR);
  const high = Math.log10(CEILING);
  return (Math.log10(clamped) - low) / (high - low);
}

function said(value: number): string {
  if (value === 0) return "0";
  if (value < 1e-6) return value.toExponential(1);
  return value.toFixed(3);
}

export function LightingLedger() {
  const [scale, setScale] = useState(1.6);
  const [shift, setShift] = useState(0.15);
  const [view, setView] = useState<LightingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchLighting(scale, shift)
      .then((answer) => live && setView(answer))
      .catch((error) => {
        if (!live) return;
        setView(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      live = false;
    };
  }, [scale, shift]);

  const controls = (
    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
      <label className="flex items-center gap-2">
        every brightness multiplied by
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.05}
          value={scale}
          onChange={(event) => setScale(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-12 text-right font-mono">{scale.toFixed(2)}</span>
      </label>
      <label className="flex items-center gap-2">
        and then shifted by
        <input
          type="range"
          min={-0.5}
          max={12}
          step={0.05}
          value={shift}
          onChange={(event) => setShift(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-12 text-right font-mono">{shift.toFixed(2)}</span>
      </label>
    </div>
  );

  if (!view) {
    return (
      <div>
        {controls}
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message ?? "…"}
        </p>
      </div>
    );
  }

  const columns: { key: keyof LightingView["rows"][number]; label: string }[] = [
    { key: "moved_by_the_shift", label: "shift only" },
    { key: "moved_by_the_scale", label: "multiply only" },
    { key: "moved_by_both", label: "both" },
  ];

  return (
    <div>
      {controls}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pixels in the scene" value={`${view.n_pixels}`} />
        <Stat
          label="pixels the lamp changed"
          value={`${view.n_pixels_changed}`}
        />
        <Stat
          label="how far the pixels moved"
          value={`${view.pixel_moved.toFixed(3)} of ${view.pixel_length.toFixed(3)}`}
        />
        <Stat
          label="how far any edge direction turned"
          value={`${view.largest_direction_difference_degrees.toExponential(1)}°`}
        />
      </div>

      <div className="mt-4 space-y-3">
        {view.rows.map((row) => (
          <div key={row.rule}>
            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium">
                a block {row.rule_label}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                the answer&rsquo;s own length {row.description_length.toFixed(3)}
              </span>
            </div>
            <div className="mt-1 grid gap-1 sm:grid-cols-3">
              {columns.map((column) => {
                const value = row[column.key] as number;
                return (
                  <div key={column.key} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
                      {column.label}
                    </span>
                    <div className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                      <div
                        className={
                          "h-3 rounded " +
                          (value > 1e-10
                            ? "bg-rose-500"
                            : "bg-emerald-500 dark:bg-emerald-400")
                        }
                        style={{ width: `${Math.max(bar(value), 0.02) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      {said(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The bars run on a logarithmic scale from ten to the minus eighteenth to
        ten thousand, so a green bar is a distance small enough to be nothing at
        all. Watch the top row, where nothing is rescaled. Its shift bar stays
        green whatever the shift is, and its multiply bar grows with the
        multiplier; every row below it is green in all three places.
      </p>
    </div>
  );
}
