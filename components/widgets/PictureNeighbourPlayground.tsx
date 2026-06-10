"use client";

// Stand at one picture and list the pictures nearest it, twice.
//
// The left list is nearness as the network's vector sees it, the angle
// between two pictures' sixteen numbers. The right list is nearness as the
// raw pixels see it, the straight-line distance between two pictures' 256
// brightness values. The API reads both off the shared picture network and
// the held-out half of the picture collection; the browser only draws the
// pictures and the lists. A row whose kind differs from the picture asked
// about is tinted, since that is the whole question.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  NeighboursAnswer,
  Neighbour,
  fetchNeighbours,
} from "@/lib/concepts/a-vector-for-a-picture";
import {
  KIND_COLOUR,
  KindLabel,
  Pending,
  PictureCells,
  Stat,
  Toggle,
} from "@/components/widgets/pictureVectorShared";

type Collection = "held_out" | "rings";
type Network = "trained" | "untrained";

const LAST = { held_out: 239, rings: 59 } as const;

export function PictureNeighbourPlayground() {
  const [collection, setCollection] = useState<Collection>("held_out");
  const [position, setPosition] = useState(2);
  const [network, setNetwork] = useState<Network>("trained");
  const [withRings, setWithRings] = useState(false);
  const [result, setResult] = useState<{
    key: string;
    answer: NeighboursAnswer | null;
    message: string | null;
  } | null>(null);

  const key = `${collection}-${position}-${network}-${withRings}`;

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await fetchNeighbours({
          collection,
          position,
          network,
          withRings,
          nResults: 5,
        });
        if (current) setResult({ key, answer, message: null });
      } catch (error) {
        if (!current) return;
        setResult({
          key,
          answer: null,
          message:
            error instanceof ApiError ? error.message : "Something went wrong.",
        });
      }
    })();
    return () => {
      current = false;
    };
  }, [collection, position, network, withRings, key]);

  const answer = result?.answer ?? null;
  const loading = !result || result.key !== key;

  const chooseCollection = (next: Collection) => {
    setCollection(next);
    setPosition((previous) => Math.min(previous, LAST[next]));
  };

  const nextOf = (list: number[]) => {
    if (list.length === 0) return;
    const after = list.find((at) => at > position);
    setCollection("held_out");
    setPosition(after ?? list[0]);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Toggle
          options={[
            { value: "held_out", label: "the four kinds" },
            { value: "rings", label: "rings, never named" },
          ]}
          value={collection}
          onChange={chooseCollection}
        />
        <Toggle
          options={[
            { value: "trained", label: "trained network" },
            { value: "untrained", label: "untrained network" },
          ]}
          value={network}
          onChange={setNetwork}
        />
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={withRings || collection === "rings"}
            disabled={collection === "rings"}
            onChange={(event) => setWithRings(event.target.checked)}
          />
          put the rings among the pictures searched
        </label>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPosition((previous) => Math.max(0, previous - 1))}
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          previous
        </button>
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {collection === "held_out" ? "held-out picture" : "ring"} {position} of{" "}
          {LAST[collection]}
        </span>
        <button
          type="button"
          onClick={() =>
            setPosition((previous) => Math.min(LAST[collection], previous + 1))
          }
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          next
        </button>
        <button
          type="button"
          disabled={!answer}
          onClick={() => answer && nextOf(answer.pixel_misses)}
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
        >
          a picture the pixels get wrong
        </button>
        <button
          type="button"
          disabled={!answer}
          onClick={() => answer && nextOf(answer.vector_misses)}
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
        >
          a picture the vector gets wrong
        </button>
      </div>

      {!answer ? (
        <Pending message={result?.message ?? null} />
      ) : (
        <div className={loading ? "opacity-60" : undefined}>
          <div className="flex flex-wrap items-start gap-5">
            <div>
              <PictureCells rows={answer.rows} cell={9} kind={answer.kind} />
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                <KindLabel kind={answer.kind} />
              </p>
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-3">
              <Stat
                label={`the ${network} network calls it`}
                value={answer.called}
              />
              <Stat
                label="with probability"
                value={Math.max(...answer.probabilities).toFixed(4)}
              />
              <Stat
                label="its vector's length"
                value={answer.length.toFixed(4)}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <NeighbourList
              title="nearest by vector, the angle between sixteen numbers"
              rows={answer.by_vector}
              reading={(row) => `cosine ${row.cosine.toFixed(4)}`}
              kind={answer.kind}
            />
            <NeighbourList
              title="nearest by pixels, the distance between 256 numbers"
              rows={answer.by_pixels}
              reading={(row) => `distance ${row.gap.toFixed(4)}`}
              kind={answer.kind}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Searched among {answer.pool_size} pictures. Over the 240 held-out
            pictures, {answer.pixel_misses.length} have a nearest picture of
            another kind by pixels and {answer.vector_misses.length} by the{" "}
            {network} network&rsquo;s vector.
          </p>
        </div>
      )}
    </div>
  );
}

function NeighbourList({
  title,
  rows,
  reading,
  kind,
}: {
  title: string;
  rows: Neighbour[];
  reading: (row: Neighbour) => string;
  kind: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
        {title}
      </p>
      <ol className="space-y-2">
        {rows.map((row) => {
          const other = row.kind !== kind;
          return (
            <li
              key={`${row.collection}-${row.position}`}
              className={`flex items-center gap-3 rounded-md px-2 py-1 ${
                other ? "bg-rose-50 dark:bg-rose-950/30" : ""
              }`}
            >
              <PictureCells rows={row.rows} cell={3} kind={row.kind} />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <span
                  className="font-medium"
                  style={{ color: other ? KIND_COLOUR[row.kind] : undefined }}
                >
                  {row.kind}
                </span>
                <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {reading(row)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
