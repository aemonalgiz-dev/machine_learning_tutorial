"use client";

// What survives a move, as the new vocabulary is asked to be larger.
//
// The API fits the new domain nine times, moves the old vocabulary into each
// fit, and returns how many tokens were copied by spelling, how many had to be
// read again, and what the new corpus then costs in pieces. The browser draws
// the two bars. The left bar is the composition of the new vocabulary and the
// right one is the length it buys, so the plateau in the first and the fall in
// the second can be read against each other.

import { useEffect, useState } from "react";
import {
  DomainsView,
  fetchDomains,
  messageFor,
} from "@/lib/concepts/moving-a-vocabulary";
import { ROUTE_FILLS, Stat } from "./movingAVocabularyParts";

const WIDTH = 640;
const ROW_HEIGHT = 26;
const TOP = 34;
const LEFT_BAR = 52;
const LEFT_BAR_WIDTH = 300;
const RIGHT_BAR = 400;
const RIGHT_BAR_WIDTH = 200;

export function SurvivalSweep() {
  const [domains, setDomains] = useState<DomainsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setDomains(await fetchDomains());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!domains) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const sweep = domains.sweep;
  const widest = Math.max(...sweep.map((row) => row.learned));
  const longest = Math.max(...sweep.map((row) => row.new_corpus_pieces));
  const height = TOP + sweep.length * ROW_HEIGHT + 16;
  const last = sweep[sweep.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="new tokens" value={domains.summary.n_target_tokens} />
        <Stat label="copied exactly" value={domains.summary.n_copied} />
        <Stat label="read again" value={domains.summary.n_rebuilt} />
        <Stat
          label="rows averaged when read again"
          value={domains.summary.mean_pieces_when_rebuilt.toFixed(2)}
        />
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full"
          role="img"
          aria-label="What survives a move as the new vocabulary grows"
        >
          <text
            x={LEFT_BAR}
            y={16}
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            the new vocabulary, by how each token was seeded
          </text>
          <text
            x={RIGHT_BAR}
            y={16}
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            the new corpus, in pieces
          </text>
          {sweep.map((row, index) => {
            const y = TOP + index * ROW_HEIGHT;
            const scale = LEFT_BAR_WIDTH / widest;
            const copied = row.n_copied * scale;
            const rebuilt = row.n_rebuilt * scale;
            const other = (row.learned - row.n_copied - row.n_rebuilt) * scale;
            const length = (row.new_corpus_pieces / longest) * RIGHT_BAR_WIDTH;
            return (
              <g key={row.asked}>
                <text
                  x={0}
                  y={y + 13}
                  className="fill-slate-600 font-mono text-[11px] dark:fill-slate-300"
                >
                  {row.learned}
                </text>
                <rect
                  x={LEFT_BAR}
                  y={y}
                  width={copied}
                  height={16}
                  fill={ROUTE_FILLS.copied}
                  opacity={0.85}
                />
                <rect
                  x={LEFT_BAR + copied}
                  y={y}
                  width={rebuilt}
                  height={16}
                  fill={ROUTE_FILLS.rebuilt}
                  opacity={0.85}
                />
                <rect
                  x={LEFT_BAR + copied + rebuilt}
                  y={y}
                  width={other}
                  height={16}
                  fill={ROUTE_FILLS.stand_in}
                  opacity={0.85}
                />
                <text
                  x={LEFT_BAR + 6}
                  y={y + 12}
                  className="fill-white font-mono text-[10px]"
                >
                  {row.n_copied}
                </text>
                {rebuilt > 18 && (
                  <text
                    x={LEFT_BAR + copied + 6}
                    y={y + 12}
                    className="fill-white font-mono text-[10px]"
                  >
                    {row.n_rebuilt}
                  </text>
                )}
                <rect
                  x={RIGHT_BAR}
                  y={y}
                  width={length}
                  height={16}
                  className="fill-slate-400 dark:fill-slate-600"
                />
                <text
                  x={RIGHT_BAR + length + 5}
                  y={y + 12}
                  className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
                >
                  {row.new_corpus_pieces}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ROUTE_FILLS.copied }}
          />
          copied by spelling
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ROUTE_FILLS.rebuilt }}
          />
          decoded and read again
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ROUTE_FILLS.stand_in }}
          />
          the token for anything unspellable
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The green band stops growing at {last.n_copied} while the blue one keeps
        going, because a larger vocabulary buys pieces that are longer and more
        particular to the new corpus, and a longer piece is less likely to be a
        spelling the old vocabulary already held.
      </p>
    </div>
  );
}
