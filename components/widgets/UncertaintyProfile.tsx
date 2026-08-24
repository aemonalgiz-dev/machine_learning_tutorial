"use client";

// The uncertainty about every byte of a text, and the line the cuts are made at.
//
// The API scores each byte under the byte model the page uses throughout and
// says which positions began a block; the browser draws one bar per byte, the
// threshold as a horizontal line, and a tick under every position that is the
// first letter of a word, so the pattern the method depends on is either there
// to be seen or is not.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  PatchedTextView,
  fetchPatchedText,
} from "@/lib/concepts/patching-without-a-vocabulary";
import {
  REPORT_SETTINGS,
  RUNNING_SENTENCE,
  SEEN_SENTENCE,
} from "./patchingFixtures";

const CHOICES = [
  { label: "A sentence it read", text: SEEN_SENTENCE },
  { label: "A sentence it did not", text: RUNNING_SENTENCE },
];

const WIDTH = 720;
const TOP = 18;
const PLOT_HEIGHT = 150;
const LEFT = 34;
const RIGHT = WIDTH - 8;
const LABEL_ROW = TOP + PLOT_HEIGHT + 14;
const HEIGHT = LABEL_ROW + 26;
const MAX_BITS = 8;

export function UncertaintyProfile() {
  const [choice, setChoice] = useState(0);
  const [views, setViews] = useState<Record<string, PatchedTextView>>({});
  const [message, setMessage] = useState<string | null>(null);
  const wanted = CHOICES[choice].text;
  const view = views[wanted];

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await fetchPatchedText(wanted, REPORT_SETTINGS);
        if (current) {
          setViews((existing) => ({ ...existing, [wanted]: answer }));
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
  }, [wanted]);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const count = view.positions.length;
  const step = (RIGHT - LEFT) / count;
  const barWidth = Math.max(step - 1.5, 1.5);
  const thresholdY = TOP + PLOT_HEIGHT * (1 - view.threshold / MAX_BITS);
  const atTheTop = view.positions.filter(
    (row) => row.entropy >= MAX_BITS - 1e-9,
  ).length;
  const missed = view.positions.filter(
    (row) => row.at_a_word_start && !row.begins_a_patch,
  ).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {CHOICES.map((entry, position) => (
          <button
            key={entry.label}
            type="button"
            onClick={() => setChoice(position)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              choice === position
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Uncertainty in bits about each byte of the text"
        >
          {[0, 2, 4, 6, 8].map((bits) => {
            const y = TOP + PLOT_HEIGHT * (1 - bits / MAX_BITS);
            return (
              <g key={bits}>
                <line
                  x1={LEFT}
                  y1={y}
                  x2={RIGHT}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <text
                  x={LEFT - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {bits}
                </text>
              </g>
            );
          })}

          {view.positions.map((row) => {
            const x = LEFT + row.position * step;
            const height = PLOT_HEIGHT * (row.entropy / MAX_BITS);
            return (
              <rect
                key={row.position}
                x={x}
                y={TOP + PLOT_HEIGHT - height}
                width={barWidth}
                height={Math.max(height, 0.8)}
                rx={1}
                className={
                  row.begins_a_patch
                    ? "fill-indigo-500"
                    : "fill-slate-300 dark:fill-slate-600"
                }
              />
            );
          })}

          <line
            x1={LEFT}
            y1={thresholdY}
            x2={RIGHT}
            y2={thresholdY}
            className="stroke-rose-500"
            strokeDasharray="4 3"
          />
          <text
            x={RIGHT}
            y={thresholdY - 4}
            textAnchor="end"
            className="fill-rose-500"
            fontSize="9"
          >
            cuts happen above here
          </text>

          {view.positions.map((row) => (
            <text
              key={row.position}
              x={LEFT + row.position * step + barWidth / 2}
              y={LABEL_ROW}
              textAnchor="middle"
              className={
                row.begins_a_patch
                  ? "fill-indigo-600 dark:fill-indigo-300"
                  : "fill-slate-500 dark:fill-slate-400"
              }
              fontSize={count > 40 ? 8 : 10}
              fontFamily="monospace"
            >
              {row.display}
            </text>
          ))}

          {view.positions
            .filter((row) => row.at_a_word_start)
            .map((row) => (
              <rect
                key={row.position}
                x={LEFT + row.position * step}
                y={LABEL_ROW + 6}
                width={barWidth}
                height={3}
                rx={1}
                className="fill-emerald-500"
              />
            ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-indigo-500" />
          begins a block
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-slate-300 dark:bg-slate-600" />
          continues one
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-emerald-500" />
          first letter of a word
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {view.n_bytes} bytes, {view.entropy.n_patches} blocks. {atTheTop} of the
        bars stand at the very top of the scale, which is the height a byte
        reaches when the model has never seen the stretch in front of it, and{" "}
        {missed} of the green ticks have a grey bar over them, meaning a word
        began there and no block did.
      </p>
    </div>
  );
}
