"use client";

// One layer standing at two positions of one chain, and what a single step
// does to it.
//
// The chain holds the same object twice, which is how weight tying is written
// wherever it is wanted. The API builds that chain, runs it forward, scores it,
// walks the blame back down and takes one step, and then reports both
// positions' weights. Because the step rebuilds each position from that
// position's own gradient, the two come back different and nothing is raised.
// The slider is the size of the step, and it changes how far apart they land
// without changing whether they land apart at all. Every number is the API's;
// the browser prints the two matrices and the gap between them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  TiedWeightsStep,
  stepTiedWeights,
} from "@/lib/concepts/shapes-and-flattening";
import { SHARED_LAYER } from "./shapesAndFlatteningFixtures";

const RATES = [0.0001, 0.001, 0.01, 0.1];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200";

export function SharedLayerStep() {
  const [rate, setRate] = useState(0.1);
  const [answer, setAnswer] = useState<TiedWeightsStep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const step = await stepTiedWeights({ ...SHARED_LAYER, learning_rate: rate });
        if (live) {
          setAnswer(step);
          setMessage(null);
        }
      } catch (error) {
        if (!live) return;
        setAnswer(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
  }, [rate]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>Step size</span>
        {RATES.map((option) => (
          <button
            key={option}
            onClick={() => setRate(option)}
            className={option === rate ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        {answer === null && message === null && (
          <p className="text-sm text-slate-500 dark:text-slate-400">…</p>
        )}

        {answer !== null && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Matrix
                title="the one layer, before"
                rows={answer.weights_before}
                accent="text-slate-800 dark:text-slate-100"
              />
              <Matrix
                title="position 0, after one step"
                rows={answer.first_after}
                accent="text-rose-700 dark:text-rose-300"
              />
              <Matrix
                title="position 1, after the same step"
                rows={answer.second_after}
                accent="text-rose-700 dark:text-rose-300"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="One object going in"
                value={answer.same_object_before ? "yes" : "no"}
              />
              <Stat
                label="One object coming out"
                value={answer.same_object_after ? "yes" : "no"}
              />
              <Stat label="Loss before the step" value={answer.loss.toFixed(6)} />
              <Stat
                label="Largest gap between them"
                value={answer.largest_gap.toPrecision(6)}
              />
            </div>
          </>
        )}

        {message !== null && (
          <p className="text-sm text-amber-600 dark:text-amber-400">{message}</p>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Nothing refused this chain, and nothing warned about it. The two
        positions were one layer on the way in and are two layers on the way
        out, at every step size.
      </p>
    </div>
  );
}

function Matrix({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: number[][];
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 dark:bg-slate-900">
      <div className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">
        {title}
      </div>
      {rows.map((row, index) => (
        <div key={index} className={"font-mono text-sm " + accent}>
          {row.map((value) => value.toFixed(5).padStart(9)).join("  ")}
        </div>
      ))}
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
