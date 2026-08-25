"use client";

// The thing the method survives, beside the thing it does not.
//
// The API describes the scene, the same scene under a different lamp and the
// same scene turned a quarter circle, at six bucket counts and under all five
// ways of rescaling a block, and reports how far each change moved the answer
// as a share of the answer's own length. The browser draws the two shares as
// bars. The point is the gap between them, which is fifteen orders of
// magnitude, and that no setting closes it.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  TurningView,
  fetchTurning,
} from "@/lib/concepts/histogram-of-oriented-gradients";

export function TurnedAgainstRelit() {
  const [view, setView] = useState<TurningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchTurning()
      .then((answer) => live && setView(answer))
      .catch((error) => {
        if (!live) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      live = false;
    };
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
          how far a quarter turn moves the answer, as a share of the
          answer&rsquo;s own length, at six bucket counts
        </p>
        <div className="space-y-1.5">
          {view.rows.map((row) => (
            <div key={row.n_buckets} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-[11px] text-slate-600 dark:text-slate-300">
                {row.n_buckets} buckets of{" "}
                {row.bucket_span_degrees.toFixed(0)}°
              </span>
              <div className="h-3.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-3.5 rounded bg-rose-500"
                  style={{
                    width: `${Math.min(row.turned_share, 1.2) * 80}%`,
                  }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-[10px] text-slate-600 dark:text-slate-300">
                {row.turned_share.toFixed(3)}
              </span>
              <span className="w-20 shrink-0 text-right font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                {(
                  row.moved_by_relighting / row.description_length
                ).toExponential(1)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          The red bar is the turn. The green figure on the right is the same
          measurement for a change of lighting on the same scene, and the two
          rows of a bucket count whose span divides ninety exactly are no
          better off than the others.
        </p>
      </div>

      <div>
        <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
          and the same turn under every way of rescaling a block
        </p>
        <div className="space-y-1.5">
          {view.rules.map((rule) => (
            <div key={rule.rule} className="flex items-center gap-2">
              <span className="w-40 shrink-0 text-[11px] text-slate-600 dark:text-slate-300">
                {rule.rule_label}
              </span>
              <div className="h-3.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-3.5 rounded bg-rose-500"
                  style={{
                    width: `${Math.min(rule.turned_share, 1.2) * 80}%`,
                  }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-[10px] text-slate-600 dark:text-slate-300">
                {rule.turned_share.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
