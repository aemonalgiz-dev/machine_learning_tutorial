"use client";

// One vector taken all the way through: squashed, rounded, read as digits.
//
// The API does the squashing, the rounding and the composing, and returns the
// whole per-coordinate ladder; the browser draws each coordinate as a row of
// levels with a marker where the squashed value landed and a ring on the level
// it was rounded to, and prints the digits and the single number they make. The
// buttons load a word's own four numbers, so the same machinery serves the
// hand-checkable example and the free exploration.

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  QuantisedVector,
  WordCollection,
  fetchWordCollection,
  quantiseVector,
} from "@/lib/concepts/finite-scalar-quantisation";
import { CHOSEN_VECTOR, LEVEL_CHOICES } from "./finiteScalarFixtures";

const WIDTH = 660;
const LEFT = 96;
const RIGHT = WIDTH - 96;
const ROW_HEIGHT = 46;
const TOP = 20;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function QuantiserPlayground() {
  const [values, setValues] = useState<number[]>([...CHOSEN_VECTOR]);
  const [levelChoice, setLevelChoice] = useState(0);
  const [answer, setAnswer] = useState<QuantisedVector | null>(null);
  const [collection, setCollection] = useState<WordCollection | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const levels = LEVEL_CHOICES[levelChoice].levels;
  const key = useMemo(
    () => JSON.stringify([values, levels]),
    [values, levels],
  );

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchWordCollection();
        if (current) {
          setCollection(loaded);
        }
      } catch {
        // The word buttons simply do not appear; the sliders still work.
      }
    })();
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const computed = await quantiseVector(values, [...levels]);
        if (current) {
          setAnswer(computed);
          setMessage(null);
        }
      } catch (error) {
        if (current) {
          setMessage(
            error instanceof ApiError ? error.message : "Something went wrong.",
          );
        }
      }
    })();
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const height = TOP + ROW_HEIGHT * values.length + 24;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {LEVEL_CHOICES.map((choice, position) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => setLevelChoice(position)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              levelChoice === position
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {collection && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Load a word&rsquo;s four numbers
          </span>
          {collection.named.map((entry) => (
            <button
              key={entry.word}
              type="button"
              onClick={() => setValues([...entry.values])}
              className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {entry.word}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setValues([...CHOSEN_VECTOR])}
            className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Back to the four chosen numbers
          </button>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {values.map((value, index) => (
          <label key={index} className="block">
            <span className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Coordinate {index + 1}</span>
              <span className="font-mono">{value.toFixed(3)}</span>
            </span>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.01}
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = Number(event.target.value);
                setValues(next);
              }}
              className="w-full accent-indigo-600"
            />
          </label>
        ))}
      </div>

      {!answer ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${WIDTH} ${height}`}
              className="w-full"
              role="img"
              aria-label="Each coordinate squashed onto a bounded line and rounded to one of its levels"
            >
              {answer.steps.map((step) => {
                const y = TOP + ROW_HEIGHT * step.index + 14;
                const at = (position: number) =>
                  LEFT + ((position + 1) / 2) * (RIGHT - LEFT);
                const rungs = Array.from(
                  { length: step.n_levels },
                  (_, rung) => -1 + (2 * rung) / (step.n_levels - 1),
                );
                return (
                  <g key={step.index}>
                    <text
                      x={LEFT - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-500 text-[11px] dark:fill-slate-400"
                    >
                      {step.n_levels} levels
                    </text>
                    <line
                      x1={LEFT}
                      y1={y}
                      x2={RIGHT}
                      y2={y}
                      className="stroke-slate-300 dark:stroke-slate-700"
                    />
                    {rungs.map((rung) => (
                      <line
                        key={rung}
                        x1={at(rung)}
                        y1={y - 6}
                        x2={at(rung)}
                        y2={y + 6}
                        className="stroke-slate-400 dark:stroke-slate-600"
                      />
                    ))}
                    <circle
                      cx={at(step.rung)}
                      cy={y}
                      r={7}
                      className="fill-none stroke-indigo-500"
                      strokeWidth={2}
                    />
                    <line
                      x1={at(step.squashed)}
                      y1={y - 11}
                      x2={at(step.squashed)}
                      y2={y + 11}
                      className="stroke-rose-500"
                      strokeWidth={2}
                    />
                    <text
                      x={RIGHT + 10}
                      y={y + 4}
                      className="fill-slate-600 font-mono text-[11px] dark:fill-slate-300"
                    >
                      digit {step.digit}
                    </text>
                  </g>
                );
              })}
              <text
                x={LEFT}
                y={height - 6}
                className="fill-slate-500 text-[11px] dark:fill-slate-400"
              >
                &minus;1
              </text>
              <text
                x={RIGHT}
                y={height - 6}
                textAnchor="end"
                className="fill-slate-500 text-[11px] dark:fill-slate-400"
              >
                +1
              </text>
            </svg>
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The upright mark is where the coordinate landed after squashing, the
            ring is the level it was rounded to, and the ticks are the levels
            that coordinate has to choose between.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Digits" value={answer.digits.join(" ")} />
            <Stat label="Code number" value={String(answer.code_id)} />
            <Stat label="Codes in all" value={String(answer.n_codes)} />
            <Stat
              label="Rounding error"
              value={answer.distortion.toFixed(5)}
            />
          </div>

          <div className="mt-3 space-y-1 font-mono text-xs text-slate-600 dark:text-slate-400">
            <p>{answer.id_expression}</p>
            <p>{answer.product_expression}</p>
            <p>
              back out{" "}
              {answer.reconstruction
                .map((value) => value.toFixed(4))
                .join("  ")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
