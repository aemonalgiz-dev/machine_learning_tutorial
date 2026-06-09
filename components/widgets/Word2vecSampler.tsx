"use client";

// Which words get drawn as wrong answers, at a flattening power the reader
// turns.
//
// Every word of the corpus as a bar, its raw share of the draw behind and its
// flattened share in front, ordered as the corpus orders them, commonest
// first. At a power of one the two agree exactly; below it the common words
// give up share to the rare ones, and the readout says by how much. The API
// builds the draw; the browser draws it.

import { useEffect, useState } from "react";
import { ApiError, SamplerShares, fetchSamplerShares } from "@/lib/concepts/word2vec";
import { Legend, MONEY, Stat, VERB, Waiting, colourFor } from "./word2vecShared";

const VIEW = { width: 640, height: 220 };
const PAD = { left: 44, right: 14, top: 14, bottom: 46 };

export function Word2vecSampler() {
  const [exponent, setExponent] = useState(0.75);
  const [shares, setShares] = useState<SamplerShares | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setShares(await fetchSamplerShares(exponent));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [exponent]);

  if (!shares) return <Waiting message={message} />;

  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const top = Math.max(
    ...shares.rows.map((row) => Math.max(row.raw_share, row.flattened_share)),
  );
  const slot = innerWidth / shares.rows.length;
  const barY = (value: number) => PAD.top + (1 - value / top) * innerHeight;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-2">
          flattening power
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={exponent}
            onChange={(event) => setExponent(Number(event.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-10 text-right font-mono">{exponent.toFixed(2)}</span>
        </label>
        <button
          onClick={() => setExponent(0.75)}
          className="rounded border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          back to three quarters
        </button>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {shares.rows.map((row, index) => (
          <g key={row.word}>
            <rect
              x={PAD.left + index * slot + 1}
              y={barY(row.raw_share)}
              width={slot - 2}
              height={PAD.top + innerHeight - barY(row.raw_share)}
              fill="#94a3b8"
              opacity={0.45}
            />
            <rect
              x={PAD.left + index * slot + slot * 0.22}
              y={barY(row.flattened_share)}
              width={slot * 0.56}
              height={PAD.top + innerHeight - barY(row.flattened_share)}
              fill={colourFor(row.topic)}
            />
            <text
              x={PAD.left + index * slot + slot / 2}
              y={VIEW.height - PAD.bottom + 12}
              textAnchor="end"
              transform={`rotate(-60 ${PAD.left + index * slot + slot / 2} ${VIEW.height - PAD.bottom + 12})`}
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              {row.word}
            </text>
          </g>
        ))}
        <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {top.toFixed(3)}
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + innerHeight + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={`${shares.commonest.word}, seen ${shares.commonest.count} times`}
          value={`${shares.commonest.raw_share.toFixed(4)} → ${shares.commonest.flattened_share.toFixed(4)}`}
        />
        <Stat
          label={`${shares.rarest.word}, seen ${shares.rarest.count} times`}
          value={`${shares.rarest.raw_share.toFixed(4)} → ${shares.rarest.flattened_share.toFixed(4)}`}
        />
        <Stat label="odds between them, raw" value={shares.raw_odds.toFixed(4)} />
        <Stat label="odds between them, flattened" value={shares.flattened_odds.toFixed(4)} />
      </div>

      <div className="mt-3 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        <p className="text-slate-500 dark:text-slate-400">
          counts of {shares.toy_counts.join(", ")}, where the effect is large
          enough to read off
        </p>
        <p>raw: {shares.toy_raw.map((value) => value.toFixed(6)).join(", ")}</p>
        <p>flattened: {shares.toy_flattened.map((value) => value.toFixed(6)).join(", ")}</p>
      </div>

      <Legend>
        Grey behind is the share the word would get if wrong answers were drawn
        in proportion to how often it appears; the coloured bar in front is what
        it gets at the power set above, in{" "}
        <span style={{ color: VERB }}>indigo</span> for a verb form and{" "}
        <span style={{ color: MONEY }}>amber</span> for a word about money.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
