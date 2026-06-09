"use client";

// What lies along the one direction every text of a collection is pulled towards.
//
// The direction is found from the collection's own positions and then every word
// is asked how far it leans along it, which is the probe that says what the
// direction turned out to contain rather than describing it in advance. The
// dashed line is the furthest a word carrying a subject reaches. The API finds
// the direction and measures every word against it; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  Direction,
  fetchDirection,
} from "@/lib/concepts/pooling-a-text";
import { Choice, Legend, Stat, Waiting, colourFor } from "./poolingATextShared";

const CORPORA: { label: string; value: CorpusName }[] = [
  { label: "twenty-four documents", value: "documents" },
  { label: "six two-word documents", value: "sketch" },
];

const WIDTH = 560;
const ROW = 15;
const PADDING = 74;

export function SharedDirectionProbe({
  corpus: fixed,
}: {
  corpus?: CorpusName;
}) {
  const [corpus, setCorpus] = useState<CorpusName>(fixed ?? "documents");
  const [direction, setDirection] = useState<Direction | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchDirection(corpus);
        if (!cancelled) {
          setDirection(next);
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
  }, [corpus]);

  if (!direction) return <Waiting message={message} />;

  const height = direction.words.length * ROW + 26;
  const across = (value: number) =>
    PADDING + Math.max(0, Math.min(1, value)) * (WIDTH - PADDING - 54);

  return (
    <div>
      {fixed === undefined && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Choice options={CORPORA} value={corpus} onChange={setCorpus} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="furthest word carrying no subject"
          value={direction.smallest_shared_cosine.toFixed(4)}
        />
        <Stat
          label="furthest word carrying one"
          value={direction.largest_content_cosine.toFixed(4)}
        />
        <Stat
          label="of an average that lies along it"
          value={direction.along_mean.toFixed(4)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Every word ranked by how far it leans along the shared direction"
      >
        <line
          x1={across(direction.largest_content_cosine)}
          y1={6}
          x2={across(direction.largest_content_cosine)}
          y2={height - 8}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {direction.words.map((word, position) => (
          <g key={word.word}>
            <text
              x={PADDING - 6}
              y={20 + position * ROW}
              fontSize={10}
              textAnchor="end"
              fill={colourFor(word.group)}
              fontFamily="ui-monospace, monospace"
            >
              {word.word}
            </text>
            <rect
              x={PADDING}
              y={13 + position * ROW}
              width={Math.max(0, across(word.cosine) - PADDING)}
              height={8}
              rx={2}
              fill={colourFor(word.group)}
              fillOpacity={0.75}
            />
            <text
              x={WIDTH - 6}
              y={20 + position * ROW}
              fontSize={9}
              textAnchor="end"
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {word.cosine.toFixed(4)}
            </text>
          </g>
        ))}
      </svg>

      <Legend>
        One bar per word, longest lean first, amber for a word of the first half,
        indigo for one of the second and grey for a word carrying no subject at
        all. The dashed line stands where the furthest word carrying a subject
        reaches, so a bar past it belongs to a word that leans along this
        direction further than anything about either subject does.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
