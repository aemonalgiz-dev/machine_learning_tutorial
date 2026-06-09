"use client";

// Every word and every document of one corpus, drawn on the two directions the
// decomposition thinks carry most of the table.
//
// The two axes are always the first and second directions, so widening the fit
// leaves the picture where it is and changes the readouts under it, which is
// itself worth seeing. Type a text into the box and it is placed in the same
// picture without anything being refitted. The API decomposes and folds in; the
// browser draws.

import { FormEvent, useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  LatentFit,
  WeightingName,
  fitLatentSpace,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Choice,
  Legend,
  SHARED,
  Stat,
  Waiting,
  colourFor,
} from "./latentSemanticShared";

const CORPORA: { label: string; value: CorpusName }[] = [
  { label: "four documents", value: "four" },
  { label: "twenty-four documents", value: "twenty-four" },
];

const WEIGHTINGS: { label: string; value: WeightingName }[] = [
  { label: "plain counts", value: "counts" },
  { label: "weighted counts", value: "weighted" },
];

const DEFAULT_WORD: Record<CorpusName, string> = {
  four: "cat",
  "twenty-four": "flour",
};

const WIDTH = 560;
const HEIGHT = 340;
const PADDING = 34;

export function LatentSpaceExplorer() {
  const [corpus, setCorpus] = useState<CorpusName>("twenty-four");
  const [weighting, setWeighting] = useState<WeightingName>("weighted");
  const [dimension, setDimension] = useState(2);
  const [draft, setDraft] = useState("");
  const [placedText, setPlacedText] = useState("");
  const [fit, setFit] = useState<LatentFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const largest = corpus === "four" ? 4 : 12;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fitLatentSpace({
          corpus,
          weighting,
          dimension: Math.min(dimension, largest),
          word: DEFAULT_WORD[corpus],
          document: 0,
          nResults: 6,
          newText: placedText,
        });
        if (!cancelled) {
          setFit(next);
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
  }, [corpus, weighting, dimension, placedText, largest]);

  function place(event: FormEvent) {
    event.preventDefault();
    setPlacedText(draft);
  }

  if (!fit) return <Waiting message={message} />;

  const points = [
    ...fit.word_points.map((point) => point.coordinates),
    ...fit.document_points.map((point) => point.coordinates),
    ...(fit.placed ? [fit.placed] : []),
  ];
  const horizontal = points.map((coordinates) => coordinates[0] ?? 0);
  const vertical = points.map((coordinates) => coordinates[1] ?? 0);
  const leftmost = Math.min(0, ...horizontal);
  const rightmost = Math.max(...horizontal, 0.001);
  const lowest = Math.min(...vertical, -0.001);
  const highest = Math.max(...vertical, 0.001);

  const spanAcross = rightmost - leftmost || 1;
  const spanUp = highest - lowest || 1;
  const across = (value: number) =>
    PADDING + ((value - leftmost) / spanAcross) * (WIDTH - 2 * PADDING);
  const up = (value: number) =>
    HEIGHT - PADDING - ((value - lowest) / spanUp) * (HEIGHT - 2 * PADDING);

  const first = fit.components[0];
  const second = fit.components[1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={CORPORA} value={corpus} onChange={setCorpus} />
        <Choice options={WEIGHTINGS} value={weighting} onChange={setWeighting} />
        <label className="flex items-center gap-2">
          <span className="text-xs">directions kept</span>
          <input
            type="range"
            min={2}
            max={largest}
            step={1}
            value={Math.min(dimension, largest)}
            onChange={(event) => setDimension(Number(event.target.value))}
            className="w-28 accent-indigo-500"
          />
          <span className="font-mono text-xs">{fit.dimension}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="of the table kept"
          value={`${(fit.kept_share * 100).toFixed(1)}%`}
        />
        <Stat
          label="numbers in the table"
          value={String(fit.numbers_in_the_table)}
        />
        <Stat label="numbers kept" value={String(fit.numbers_kept)} />
        <Stat
          label="the two halves on direction 1"
          value={
            first ? `${first.group_difference.toExponential(1)} apart` : "…"
          }
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Words and documents drawn on the first two directions"
      >
        <line
          x1={PADDING}
          y1={up(0)}
          x2={WIDTH - PADDING}
          y2={up(0)}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={across(0)}
          y1={PADDING}
          x2={across(0)}
          y2={HEIGHT - PADDING}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {fit.document_points.map((point) => (
          <circle
            key={`document-${point.position}`}
            cx={across(point.coordinates[0] ?? 0)}
            cy={up(point.coordinates[1] ?? 0)}
            r={7}
            fill={colourFor(point.group)}
            fillOpacity={0.18}
            stroke={colourFor(point.group)}
            strokeWidth={1.2}
          />
        ))}
        {fit.word_points.map((point) => (
          <g key={`word-${point.word}`}>
            <circle
              cx={across(point.coordinates[0] ?? 0)}
              cy={up(point.coordinates[1] ?? 0)}
              r={2.6}
              fill={colourFor(point.group)}
            />
            <text
              x={across(point.coordinates[0] ?? 0) + 5}
              y={up(point.coordinates[1] ?? 0) + 3}
              fontSize={9}
              fill={colourFor(point.group)}
              fontFamily="ui-monospace, monospace"
            >
              {point.word}
            </text>
          </g>
        ))}
        {fit.placed && fit.placed.length > 1 && (
          <g>
            <circle
              cx={across(fit.placed[0])}
              cy={up(fit.placed[1])}
              r={6}
              fill="none"
              stroke="#0f172a"
              strokeWidth={2}
            />
            <text
              x={across(fit.placed[0]) + 9}
              y={up(fit.placed[1]) + 3}
              fontSize={10}
              fontWeight={600}
              fill="#0f172a"
              fontFamily="ui-monospace, monospace"
            >
              your text
            </text>
          </g>
        )}
        <text
          x={WIDTH - PADDING}
          y={HEIGHT - 10}
          fontSize={10}
          textAnchor="end"
          fill={SHARED}
        >
          direction 1
          {first ? `, ${(first.share * 100).toFixed(1)}% of the table` : ""}
        </text>
        <text x={8} y={PADDING - 12} fontSize={10} fill={SHARED}>
          direction 2
          {second ? `, ${(second.share * 100).toFixed(1)}% of the table` : ""}
        </text>
      </svg>

      <form onSubmit={place} className="mt-3 flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={200}
          placeholder="place a text of your own, in the words this corpus uses"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          place it
        </button>
      </form>

      {fit.placed && (
        <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-400">
          {fit.placed.every((value) => value === 0)
            ? "none of those words is in this corpus, so the text has no position at all"
            : `placed at (${fit.placed
                .slice(0, 2)
                .map((value) => value.toFixed(4))
                .join(", ")})${
                fit.placed_group ? `, among the ${fit.placed_group} documents` : ""
              }`}
        </p>
      )}

      <Legend>
        Filled dots are words and hollow rings are whole documents, in one
        picture because they came out of one decomposition. Colour is which half
        of the corpus a word or document belongs to, and grey is a word both
        halves use. Notice that every point sits to the right of the upright
        line, whatever the corpus and whatever the weighting.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
