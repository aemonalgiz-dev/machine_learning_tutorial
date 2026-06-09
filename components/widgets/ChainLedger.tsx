"use client";

// Every step of one chain, with the count of numbers at each of them.
//
// The chain is two convolutions each followed by a pooling layer, a bridge and
// two dense layers, over the twenty-eight by twenty-eight picture the rest of
// the page uses. Each row prints what the layer reads and what it answers
// with, as an arrangement and as a bare count, and the bar beside it is that
// count on a common scale, so the reader can see where the picture is at its
// largest and where it becomes a row. The switch takes the bridge out, and the
// seam it was holding turns red with the library's own words. Every extent,
// every count and every message is the API's; the browser lays out the rows
// and scales the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  StackCheck,
  checkStack,
  formatExtents,
} from "@/lib/concepts/shapes-and-flattening";
import {
  DEEP_CHAIN,
  DEEP_CHAIN_WITHOUT_THE_BRIDGE,
} from "./shapesAndFlatteningFixtures";

const KIND_NAMES = {
  conv: "convolution",
  pool: "pooling",
  flatten: "bridge",
  dense: "dense",
} as const;

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200";

// Both chains are fixed requests, so they are fetched once for the whole page
// and shared by whatever asks for them.
let cached: Promise<[StackCheck, StackCheck]> | null = null;

function bothChains(): Promise<[StackCheck, StackCheck]> {
  if (cached === null) {
    cached = Promise.all([
      checkStack(DEEP_CHAIN),
      checkStack(DEEP_CHAIN_WITHOUT_THE_BRIDGE),
    ]);
  }
  return cached;
}

export function ChainLedger() {
  const [chains, setChains] = useState<[StackCheck, StackCheck] | null>(null);
  const [withBridge, setWithBridge] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setChains(await bothChains());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (chains === null) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const chain = withBridge ? chains[0] : chains[1];
  const largest = Math.max(
    ...chain.layers.map((layer) => layer.n_answers ?? 0),
    chain.layers[0].n_reads ?? 1,
  );
  const width = (count: number) => `${Math.max(1, (count / largest) * 100)}%`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setWithBridge(true)}
          className={withBridge ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
        >
          With the bridge
        </button>
        <button
          onClick={() => setWithBridge(false)}
          className={withBridge ? BUTTON_CLASS : ACTIVE_BUTTON_CLASS}
        >
          With the bridge taken out
        </button>
      </div>

      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="w-24 shrink-0">layer</span>
          <span className="w-36 shrink-0">answers</span>
          <span className="w-16 shrink-0 text-right">numbers</span>
          <span className="flex-1" />
        </div>

        <div className="flex items-center gap-2 py-1.5 text-xs">
          <span className="w-24 shrink-0 text-slate-500 dark:text-slate-400">
            the picture
          </span>
          <span className="w-36 shrink-0 font-mono text-slate-700 dark:text-slate-200">
            {formatExtents(chain.layers[0].reads)}
          </span>
          <span className="w-16 shrink-0 text-right font-mono text-slate-700 dark:text-slate-200">
            {chain.layers[0].n_reads ?? "…"}
          </span>
          <span className="flex-1">
            <span
              className="block h-2 rounded-sm bg-slate-300 dark:bg-slate-700"
              style={{ width: width(chain.layers[0].n_reads ?? 0) }}
            />
          </span>
        </div>

        {chain.layers.map((layer, position) => {
          const seam = chain.joins[position - 1];
          const broken = seam !== undefined && seam.verdict === "fails";
          return (
            <div key={position}>
              {broken && (
                <p className="my-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                  {seam.message ??
                    "this seam fails too, and the library stops at the first one that does"}
                </p>
              )}
              <div className="flex items-center gap-2 py-1.5 text-xs">
                <span className="w-24 shrink-0 text-slate-600 dark:text-slate-300">
                  {KIND_NAMES[layer.kind]}
                </span>
                <span className="w-36 shrink-0 font-mono text-slate-800 dark:text-slate-100">
                  {formatExtents(layer.answers)}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-slate-800 dark:text-slate-100">
                  {layer.n_answers ?? "…"}
                </span>
                <span className="flex-1">
                  <span
                    className={
                      "block h-2 rounded-sm " +
                      (layer.kind === "flatten"
                        ? "bg-amber-400 dark:bg-amber-500"
                        : "bg-indigo-400 dark:bg-indigo-500")
                    }
                    style={{ width: width(layer.n_answers ?? 0) }}
                  />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="The chain reads"
          value={chain.holds ? formatExtents(chain.reads) : "refused"}
        />
        <Stat
          label="Seams holding"
          value={`${chain.joins.filter((join) => join.verdict === "holds").length} of ${chain.joins.length}`}
        />
        <Stat
          label="The chain answers"
          value={chain.holds ? formatExtents(chain.answers) : "refused"}
        />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The amber bar is the bridge, and it is the one step whose count does not
        change. Every other step changes how many numbers there are as well as
        how they are arranged.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
