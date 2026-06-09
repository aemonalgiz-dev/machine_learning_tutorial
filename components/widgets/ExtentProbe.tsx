"use client";

// A shape built on its own, with no layer wrapped around it.
//
// This is the one route on the page that can be handed an extent of zero, a
// negative extent, or a side with no extents at all, because a layer
// constructor stops long before any of those reach the object that owns the
// rule. Each button states a pair of sides, and the panel reports the two
// arrangements and the two counts, or the library's refusal word for word.
// The counts are the products of the extents and are computed by the API, so
// the two facts the page keeps apart are never recombined in the browser.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ExtentsCheck,
  checkExtents,
  formatExtents,
} from "@/lib/concepts/shapes-and-flattening";
import { STATED_SHAPES } from "./shapesAndFlatteningFixtures";

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200";

export function ExtentProbe() {
  const [chosen, setChosen] = useState(0);
  const [answer, setAnswer] = useState<ExtentsCheck | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const shape = STATED_SHAPES[chosen];

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const check = await checkExtents(shape.reads, shape.answers);
        if (live) {
          setAnswer(check);
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
  }, [shape.reads, shape.answers]);

  const stated = (extents: number[]) =>
    extents.length === 0 ? "nothing at all" : formatExtents(extents);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 pb-3">
        {STATED_SHAPES.map((option, index) => (
          <button
            key={option.label}
            onClick={() => setChosen(index)}
            className={index === chosen ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Asking for a shape that reads{" "}
          <span className="font-mono text-slate-800 dark:text-slate-100">
            {stated(shape.reads)}
          </span>{" "}
          and answers{" "}
          <span className="font-mono text-slate-800 dark:text-slate-100">
            {stated(shape.answers)}
          </span>
        </p>

        {answer === null && message === null && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">…</p>
        )}

        {answer !== null && answer.refusal === null && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Reads" value={formatExtents(answer.reads)} />
            <Stat
              label="Which is how many numbers"
              value={String(answer.n_reads)}
            />
            <Stat label="Answers" value={formatExtents(answer.answers)} />
            <Stat
              label="Which is how many numbers"
              value={String(answer.n_answers)}
            />
          </div>
        )}

        {answer !== null && answer.refusal !== null && (
          <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
            No shape was built. The library&rsquo;s words are{" "}
            <span className="font-mono">{answer.refusal}</span>
          </div>
        )}

        {message !== null && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            {message}
          </p>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The last three buttons are refusals. Nothing was fitted and no data was
        sent; a shape is integers, and so is everything that can go wrong with
        one.
      </p>
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
