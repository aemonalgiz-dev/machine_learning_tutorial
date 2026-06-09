"use client";

// A search space built from a name the reader typed.
//
// Type the dial's name and the values to try, and the library either builds
// one candidate per value, each rebuilt through the model's own constructor,
// or refuses. A misspelt name is refused before any data is seen, with the
// dials the model does have named in the message; a value the constructor
// will not accept is refused when the candidate is rebuilt. The API builds
// the space and the browser shows what came back.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SpaceOutcome, buildSpace } from "@/lib/concepts/grid-search";
import { BUTTON_CLASS } from "./gridSearchFixtures";

const DEBOUNCE_MS = 200;

const INPUT_CLASS =
  "rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function parseValues(text: string): number[] {
  return text
    .split(/[,\s]+/)
    .filter((piece) => piece.length > 0)
    .map((piece) => Number(piece))
    .filter((value) => Number.isInteger(value));
}

export function SpaceBuilder() {
  const [name, setName] = useState("n_neighbours");
  const [valuesText, setValuesText] = useState("1, 2, 3");
  const [answer, setAnswer] = useState<SpaceOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const built = await buildSpace(name, parseValues(valuesText));
        if (cancelled) return;
        setAnswer(built);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        setAnswer(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name, valuesText]);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          dial
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${INPUT_CLASS} w-36`}
          />
        </label>
        <label className="flex items-center gap-2">
          values
          <input
            type="text"
            value={valuesText}
            onChange={(event) => setValuesText(event.target.value)}
            className={`${INPUT_CLASS} w-40`}
          />
        </label>
        <button onClick={() => setName("n_neighbors")} className={BUTTON_CLASS}>
          Misspell it
        </button>
        <button onClick={() => setValuesText("0, 1")} className={BUTTON_CLASS}>
          Try zero
        </button>
        <button
          onClick={() => {
            setName("n_neighbours");
            setValuesText("1, 2, 3");
          }}
          className={BUTTON_CLASS}
        >
          Reset
        </button>
      </div>

      {answer && (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            The model declares {answer.declared_fields.length} dials,{" "}
            <span className="font-mono">{answer.declared_fields.join(", ")}</span>,
            and the space varies{" "}
            <span className="font-mono">{answer.parameter_names.join(", ")}</span>{" "}
            over {answer.n_candidates} candidate{answer.n_candidates === 1 ? "" : "s"}.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {answer.candidates.map((candidate, index) => (
              <span
                key={index}
                className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              >
                {Object.entries(candidate.assignments)
                  .map(([field, value]) => `${field} = ${value}`)
                  .join(", ")}{" "}
                → built with {candidate.built_n_neighbours}
              </span>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Refused
          </p>
          <p className="mt-1 font-mono text-sm text-rose-700 dark:text-rose-300">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
