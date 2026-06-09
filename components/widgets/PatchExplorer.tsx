"use client";

// One text cut into blocks two ways at once, with every cut visible.
//
// The API counts a byte model over one of two corpora, scores each byte of the
// text under it, and cuts the text both at every fixed number of bytes and
// wherever the model was unsure, returning both sets of blocks and how each
// set's cuts fell against the words. The browser draws the blocks and the
// readouts and decides nothing.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  PatchOptions,
  PatchView,
  PatchedTextView,
  Rule,
  patchText,
} from "@/lib/concepts/patching-without-a-vocabulary";
import { PATCHING_TEXTS, drawnAs } from "./patchingFixtures";

const BLOCK_COLOURS = [
  "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/25 dark:text-indigo-100",
  "bg-sky-100 text-sky-900 dark:bg-sky-500/25 dark:text-sky-100",
];

const ADD_ONE = 1.0;
const SMALL_SMOOTHING = 0.001;

const THRESHOLDS = [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8];

export function PatchExplorer() {
  const [choice, setChoice] = useState(0);
  const [text, setText] = useState(PATCHING_TEXTS[0].text);
  const [options, setOptions] = useState<PatchOptions>(
    PATCHING_TEXTS[0].options,
  );
  const [view, setView] = useState<PatchedTextView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await patchText(text, options);
        if (current) {
          setView(answer);
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
  }, [text, options]);

  function choose(position: number) {
    setChoice(position);
    setText(PATCHING_TEXTS[position].text);
    setOptions(PATCHING_TEXTS[position].options);
  }

  function change(update: Partial<PatchOptions>) {
    setOptions((current) => ({ ...current, ...update }));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          A text to cut
        </p>
        <div className="flex flex-wrap gap-2">
          {PATCHING_TEXTS.map((entry, position) => (
            <button
              key={entry.label}
              type="button"
              onClick={() => choose(position)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                choice === position && text === entry.text
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={text}
          maxLength={200}
          onChange={(event) => setText(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          aria-label="Text to cut into blocks"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider
          label="bytes to a block"
          value={options.patchSize ?? 4}
          min={1}
          max={16}
          onChange={(value) => change({ patchSize: value })}
        />
        <Slider
          label="bytes of context"
          value={options.order ?? 4}
          min={1}
          max={6}
          onChange={(value) => change({ order: value })}
        />
        <div>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            threshold, in bits
          </p>
          <select
            value={options.threshold ?? 1}
            onChange={(event) =>
              change({ threshold: Number(event.target.value) })
            }
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            aria-label="Threshold in bits"
          >
            {THRESHOLDS.map((value) => (
              <option key={value} value={value}>
                {value.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Choice
          label="how much every unseen byte is credited with"
          options={[
            { key: SMALL_SMOOTHING, label: "a thousandth" },
            { key: ADD_ONE, label: "one apiece" },
          ]}
          value={options.smoothing ?? SMALL_SMOOTHING}
          onChange={(value) => change({ smoothing: value })}
        />
        <Choice
          label="when a new block begins"
          options={[
            { key: "global_threshold", label: "above the threshold" },
            { key: "relative_increase", label: "risen by the threshold" },
          ]}
          value={options.rule ?? "global_threshold"}
          onChange={(value) => change({ rule: value as Rule })}
        />
      </div>

      {view ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The model behind the second row read {view.source_label} and holds{" "}
            {view.n_contexts.toLocaleString()} distinct stretches of{" "}
            {view.order} {view.order === 1 ? "byte" : "bytes"}.
          </p>
          <Blocks
            title={`Blocks of ${view.patch_size} bytes`}
            view={view.fixed}
          />
          <Blocks
            title="Blocks cut where the next byte was hard to guess"
            view={view.entropy}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="bytes in the text" value={`${view.n_bytes}`} />
            <Stat
              label="blocks at a fixed size"
              value={`${view.fixed.n_patches}`}
            />
            <Stat
              label="blocks by uncertainty"
              value={`${view.entropy.n_patches}`}
            />
            <Stat
              label="highest uncertainty"
              value={`${view.highest_entropy.toFixed(2)} bits`}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      )}
      {view && message && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Blocks({ title, view }: { title: string; view: PatchView }) {
  const cuts = view.at_a_word_start + view.inside_a_word + view.elsewhere;
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}
        </p>
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {view.n_patches} {view.n_patches === 1 ? "block" : "blocks"},{" "}
          {view.at_a_word_start} of {cuts}{" "}
          {cuts === 1 ? "cut" : "cuts"} at a word start
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {view.pieces.map((piece, position) => (
          <span
            key={`${piece.start}-${piece.end}`}
            className={`rounded px-1.5 py-1 font-mono text-xs ${
              BLOCK_COLOURS[position % BLOCK_COLOURS.length]
            }`}
            title={`bytes ${piece.start} to ${piece.end - 1}`}
          >
            {drawnAs(piece.displays)}
          </span>
        ))}
      </div>
      {view.n_broken_characters > 0 && (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          {view.n_broken_characters}{" "}
          {view.n_broken_characters === 1 ? "position" : "positions"} where a
          block stops part way through a character, so neither side of the cut
          spells anything on its own.
        </p>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
        {label}: <span className="font-mono">{value}</span>
      </p>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-indigo-600"
        aria-label={label}
      />
    </div>
  );
}

function Choice<Key extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: Key; label: string }[];
  value: Key;
  onChange: (value: Key) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              value === option.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
