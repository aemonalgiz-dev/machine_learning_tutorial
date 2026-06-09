"use client";

// The claim that the support vectors are the model, refitted three ways.
//
// The full fit on the clinic under the radial kernel, then the same fit on
// its support vectors alone with everyone else deleted, then two fits on
// the clinic with a single patient removed, once a patient the boundary did
// not depend on and once a support vector. Each map is the refit's boundary,
// and the readout under it is the largest gap between that refit's decision
// values and the full fit's over a lattice of the plane. Every fit and every
// gap is the API's; the browser draws four maps.

import { useEffect, useState } from "react";
import { ApiError, RefitResult, RegionGrid, SupportOnly, refitOnSupport } from "@/lib/concepts/kernel-trick";
import { CLINIC, HEALTHY_COLOUR, UNWELL_COLOUR } from "./kernelTrickFixtures";

const MAP = { size: 200, pad: 12 };

let pending: Promise<SupportOnly> | null = null;
function refitOnce(): Promise<SupportOnly> {
  if (!pending) pending = refitOnSupport(CLINIC, { name: "rbf", gamma: 1 });
  return pending;
}

function Map({ regions, kept, title, caption }: { regions: RegionGrid; kept: Set<number>; title: string; caption: string }) {
  const cell = (MAP.size - 2 * MAP.pad) / regions.cells;
  const mapX = (column: number) => MAP.pad + column * cell;
  const mapY = (row: number) => MAP.size - MAP.pad - (row + 1) * cell;
  const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
  const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
  return (
    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
      <p className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg viewBox={`0 0 ${MAP.size} ${MAP.size}`} className="w-full select-none rounded bg-slate-50 dark:bg-slate-950">
        {regions.labels.map((row, rowIndex) =>
          row.map((label, columnIndex) => (
            <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 1 ? HEALTHY_COLOUR : UNWELL_COLOUR} opacity={0.22} />
          )),
        )}
        {CLINIC.map((patient, index) => (
          <circle
            key={index}
            cx={personX(patient.x)}
            cy={personY(patient.y)}
            r={kept.has(index) ? 3.5 : 3}
            fill={kept.has(index) ? (patient.label === 1 ? HEALTHY_COLOUR : UNWELL_COLOUR) : "none"}
            stroke={kept.has(index) ? "white" : patient.label === 1 ? HEALTHY_COLOUR : UNWELL_COLOUR}
            strokeWidth={kept.has(index) ? 0.8 : 1.2}
            strokeDasharray={kept.has(index) ? undefined : "1.5 1.5"}
          />
        ))}
      </svg>
      <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">{caption}</p>
    </div>
  );
}

export function SupportVectorRefit() {
  const [answer, setAnswer] = useState<SupportOnly | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await refitOnce());
      } catch (error) {
        pending = null;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const everyone = new Set(CLINIC.map((_, index) => index));
  const refit = (result: RefitResult | null, title: string) =>
    result ? (
      <Map
        regions={result.regions}
        kept={new Set(result.kept_positions)}
        title={title}
        caption={`${result.kept_positions.length} kept, gap ${result.gap.toExponential(1)}`}
      />
    ) : null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Map regions={answer.full_regions} kept={everyone} title="Every patient" caption={`${CLINIC.length} kept, ${answer.full.n_support_vectors} support vectors`} />
        {refit(answer.support_only, "Support vectors only")}
        {refit(answer.dropped_non_support, "One non-support patient removed")}
        {refit(answer.dropped_support, "One support vector removed")}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A hollow dashed marker is a patient the refit never saw. The gap is the
        largest difference in decision value from the full fit, anywhere on a
        lattice of the standardized plane.
      </p>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
