"use client";

// One word's position, built one occurrence at a time.
//
// Step through the corpus and watch a running total change: the sentence the
// word was found in, the neighbour whose direction is being added, that
// direction as a row of squares, and the total afterwards as a row of bars.
// Reaching the last step reaches the position the fit reports, which is the
// claim the widget exists to let a reader check. The API walks the corpus; the
// browser draws the running total.

import { useEffect, useState } from "react";
import {
  Accumulation,
  ApiError,
  CorpusName,
  WeightingName,
  fetchAccumulation,
} from "@/lib/concepts/random-indexing";
import {
  DirectionRow,
  Legend,
  NEGATIVE,
  POSITIVE,
  SHARED,
  Stat,
  Waiting,
  colourFor,
} from "./randomIndexingShared";

const WIDTH = 560;
const HEIGHT = 130;
const PADDING = 26;

export function PositionBuildUp({
  corpus = "three-sentences",
  word = "cat",
  dimension = 8,
  window = 2,
  weighting = "uniform",
}: {
  corpus?: CorpusName;
  word?: string;
  dimension?: number;
  window?: number;
  weighting?: WeightingName;
}) {
  const [step, setStep] = useState(0);
  const [built, setBuilt] = useState<Accumulation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchAccumulation({
          corpus,
          word,
          dimension,
          window,
          weighting,
        });
        if (!cancelled) {
          setBuilt(next);
          setStep(next.steps.length);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [corpus, word, dimension, window, weighting]);

  if (!built) return <Waiting message={message} />;

  const here = step === 0 ? null : built.steps[step - 1];
  const running = here ? here.running : built.final.map(() => 0);
  const tallest = Math.max(
    1,
    ...built.steps.flatMap((one) => one.running.map(Math.abs)),
  );
  const slot = (WIDTH - 2 * PADDING) / running.length;
  const middle = HEIGHT / 2;
  const reach = (middle - 16) / tallest;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          <span className="text-xs">neighbours added so far</span>
          <input
            type="range"
            min={0}
            max={built.steps.length}
            step={1}
            value={step}
            onChange={(event) => setStep(Number(event.target.value))}
            className="w-44 accent-sky-500"
          />
          <span className="font-mono text-xs">
            {step} of {built.steps.length}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the word" value={built.word} />
        <Stat label="times it appears" value={String(built.n_occurrences)} />
        <Stat
          label="neighbours in all"
          value={String(built.steps.length)}
        />
        <Stat
          label="how far a neighbour may be"
          value={String(built.window)}
        />
      </div>

      <div className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
        {built.sentences.map((sentence, position) => (
          <p
            key={sentence + position}
            className={
              "font-mono text-xs " +
              (here && here.sentence === position
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-600")
            }
          >
            {sentence.split(" ").map((one, place) => (
              <span
                key={`${one}-${place}`}
                className={
                  here &&
                  here.sentence === position &&
                  one === here.neighbour &&
                  Math.abs(place - here.position) === here.distance
                    ? "rounded bg-sky-200 px-1 dark:bg-sky-900/60"
                    : here &&
                        here.sentence === position &&
                        place === here.position
                      ? "rounded bg-amber-200 px-1 dark:bg-amber-900/50"
                      : "px-1"
                }
              >
                {one}
              </span>
            ))}
          </p>
        ))}
      </div>

      {here && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span>
            adding the direction of{" "}
            <span
              className="font-mono font-semibold"
              style={{ color: colourFor(here.neighbour_group) }}
            >
              {here.neighbour}
            </span>
            , {here.distance} away, counted {here.weight.toFixed(4)}
          </span>
          <DirectionRow entries={here.added.map((one) => Math.sign(one))} />
        </div>
      )}

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label={`The running total for ${built.word} after ${step} neighbours`}
      >
        <line
          x1={PADDING}
          y1={middle}
          x2={WIDTH - PADDING}
          y2={middle}
          stroke="#cbd5e1"
        />
        {running.map((value, position) => (
          <rect
            key={position}
            x={PADDING + slot * position + slot * 0.18}
            y={value >= 0 ? middle - value * reach : middle}
            width={slot * 0.64}
            height={Math.max(1, Math.abs(value) * reach)}
            rx={1.5}
            fill={value >= 0 ? POSITIVE : NEGATIVE}
            fillOpacity={value === 0 ? 0.15 : 0.8}
          />
        ))}
        {running.map((value, position) => (
          <text
            key={`value-${position}`}
            x={PADDING + slot * (position + 0.5)}
            y={value >= 0 ? middle - value * reach - 3 : middle + value * -reach + 9}
            fontSize={8}
            textAnchor="middle"
            fill={SHARED}
          >
            {Number.isInteger(value) ? value : value.toFixed(2)}
          </text>
        ))}
      </svg>

      <Legend>
        At zero neighbours the position is the origin, which is exactly what a
        word with no company would keep. Every step adds one whole direction, so
        the total only ever moves in the {built.n_nonzero} places that direction
        is anything but zero, and after the last step it is the position the fit
        reports for {built.word}.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
