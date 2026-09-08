"use client";

// The four first-layer filters of the network, before training and after, each
// beside the hand-designed Sobel grid its trained shape is closest to.
//
// The Sobel grid is the one the filters and edges page sweeps, turned in
// eighths of a turn so that every direction is on offer. Closeness is a
// cosine with each filter's mean taken off, since a Sobel grid sums to zero
// and a learned filter need not, and it only means something beside the
// baseline underneath, which is how close grids of nine random numbers
// already come. The API computes and the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchNetworkReport,
  SEEDS,
  VariantReport,
} from "@/lib/concepts/convolutional-networks";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
} from "@/components/widgets/filtersAndEdgesShared";
import {
  CellMap,
  Framed,
  Loading,
  percent,
  share,
} from "@/components/widgets/convolutionalNetworksShared";

function largestIn(...grids: number[][][]): number {
  return Math.max(1e-9, ...grids.flat(2).map((value) => Math.abs(value)));
}

export function CnnFilterBoard() {
  const [seed, setSeed] = useState<number>(0);
  const [report, setReport] = useState<VariantReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchNetworkReport("reference", seed)
      .then((answer) => current && setReport(answer))
      .catch(
        (error) =>
          current &&
          setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
    return () => {
      current = false;
    };
  }, [seed]);

  const shown = report && report.seed === seed ? report : null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-600 dark:text-slate-400">weight seed:</span>
        {SEEDS.map((value) => (
          <button
            key={value}
            className={value === seed ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            onClick={() => setSeed(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {!shown ? (
        <Loading message={message} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.filters.map((filter) => {
              const largest = largestIn(filter.kernel, filter.start_kernel);
              return (
                <div
                  key={filter.index}
                  className={
                    "rounded-lg border p-3 " +
                    (filter.nearly_silent
                      ? "border-slate-200 opacity-80 dark:border-slate-800"
                      : "border-indigo-300 dark:border-indigo-800")
                  }
                >
                  <p className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                    filter {filter.index + 1}
                    {filter.nearly_silent ? ", nearly silent" : ""}
                  </p>
                  <div className="flex gap-2">
                    <Framed title="at the start" width="w-20">
                      <CellMap rows={filter.start_kernel} scale="signed" largest={largest} label="starting weights" />
                    </Framed>
                    <Framed title="trained" width="w-20">
                      <CellMap rows={filter.kernel} scale="signed" largest={largest} label="trained weights" />
                    </Framed>
                    <Framed title="closest Sobel" note={filter.closest} width="w-20">
                      <CellMap rows={filter.closest_grid} scale="signed" largest={2} label="the closest hand-designed grid" />
                    </Framed>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <Stat label="closeness, trained" value={share(filter.closeness)} />
                    <Stat label="closeness, at the start" value={share(filter.closeness_at_start)} />
                    <Stat label="moved, share of its start" value={share(filter.moved, 2)} />
                    <Stat label="answers above zero" value={percent(filter.active_share)} />
                    <Stat label="nine weights sum to" value={share(filter.weight_total, 2)} />
                    <Stat label="bias" value={share(filter.bias, 2)} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Indigo is a positive weight and amber a negative one, drawn against the largest weight of that filter at either time. Nine random numbers come this close to their nearest Sobel grid: median {share(shown.edge_baseline.median)}, and one draw in ten comes closer than {share(shown.edge_baseline.ninetieth_percentile)}, over {shown.edge_baseline.n_draws} draws.
          </p>
        </>
      )}
    </div>
  );
}
