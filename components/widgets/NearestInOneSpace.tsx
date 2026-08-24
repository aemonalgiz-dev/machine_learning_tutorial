"use client";

// The two questions one fit answers, side by side.
//
// On the left the words nearest a chosen word, on the right the documents
// nearest a chosen document, both read off the same decomposition and both
// changing as the number of kept directions changes. The API fits and ranks;
// the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  LatentFit,
  fitLatentSpace,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Choice,
  Legend,
  Stat,
  Waiting,
  colourFor,
} from "./latentSemanticShared";

const WORDS: { label: string; value: string }[] = [
  { label: "flour", value: "flour" },
  { label: "whisk", value: "whisk" },
  { label: "anchor", value: "anchor" },
  { label: "the", value: "the" },
];

function Bar({
  label,
  similarity,
  group,
  title,
}: {
  label: string;
  similarity: number;
  group: string;
  title?: string;
}) {
  return (
    <div className="flex items-center gap-2" title={title}>
      <span
        className="w-28 shrink-0 truncate font-mono text-[11px]"
        style={{ color: colourFor(group) }}
      >
        {label}
      </span>
      <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
        <span
          className="block h-2.5 rounded"
          style={{
            width: `${Math.max(0, Math.min(1, similarity)) * 100}%`,
            backgroundColor: colourFor(group),
          }}
        />
      </span>
      <span className="w-14 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {similarity.toFixed(4)}
      </span>
    </div>
  );
}

export function NearestInOneSpace() {
  const [word, setWord] = useState("flour");
  const [dimension, setDimension] = useState(6);
  const [fit, setFit] = useState<LatentFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fitLatentSpace({
          dimension,
          word,
          document: 0,
          nResults: 6,
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
  }, [word, dimension]);

  if (!fit) return <Waiting message={message} />;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={WORDS} value={word} onChange={setWord} />
        <label className="flex items-center gap-2">
          <span className="text-xs">directions kept</span>
          <input
            type="range"
            min={2}
            max={14}
            step={1}
            value={dimension}
            onChange={(event) => setDimension(Number(event.target.value))}
            className="w-32 accent-indigo-500"
          />
          <span className="font-mono text-xs">{fit.dimension}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="of the table kept"
          value={`${(fit.kept_share * 100).toFixed(1)}%`}
        />
        <Stat
          label="mean angle inside a half"
          value={(fit.within_similarity ?? 0).toFixed(4)}
        />
        <Stat
          label="mean angle across the halves"
          value={(fit.across_similarity ?? 0).toFixed(4)}
        />
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            words nearest {word}
          </p>
          <div className="space-y-1">
            {fit.nearest_words.map((row) => (
              <Bar
                key={row.word}
                label={row.word}
                similarity={row.similarity}
                group={row.group}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            documents nearest the first one
          </p>
          <div className="space-y-1">
            {fit.nearest_documents.map((row) => (
              <Bar
                key={row.position}
                label={row.text}
                similarity={row.similarity}
                group={row.group}
                title={row.text}
              />
            ))}
          </div>
        </div>
      </div>

      <Legend>
        The first document is <span className="font-mono">flour sugar and butter eggs oven</span>.
        Drag the number of kept directions down to two and every bar on both
        sides goes to its full length, which is not the fit agreeing with itself
        but the fit having nothing left to tell these things apart with.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
