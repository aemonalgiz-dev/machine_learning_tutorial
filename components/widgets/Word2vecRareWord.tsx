"use client";

// A word seen twice and a word seen forty-two times, across four starts.
//
// Both are compared against the same third word, and the four answers are
// plotted on one scale. The frequent word's four answers sit almost on top of
// each other; the rare word's are spread across a band an order wider, and the
// three words it lands nearest change from start to start. The API runs the
// four fits; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, RareWord, fetchRareWord } from "@/lib/concepts/word2vec";
import { Legend, MONEY, Stat, VERB, Waiting } from "./word2vecShared";

const VIEW = { width: 620, height: 130 };
const PAD = { left: 84, right: 20, top: 24, bottom: 34 };

export function Word2vecRareWord() {
  const [rare, setRare] = useState<RareWord | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRare(await fetchRareWord());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!rare) return <Waiting message={message} />;

  const all = [...rare.rare_similarities, ...rare.common_similarities];
  const low = Math.min(...all) - 0.02;
  const high = Math.max(...all) + 0.01;
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const plotX = (value: number) => PAD.left + ((value - low) / (high - low)) * innerWidth;

  const rows = [
    { label: rare.rare_word, count: rare.rare_count, values: rare.rare_similarities, colour: MONEY },
    { label: rare.common_word, count: rare.common_count, values: rare.common_similarities, colour: VERB },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rows.map((row, index) => {
          const y = PAD.top + index * 40;
          return (
            <g key={row.label}>
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-600 font-mono text-[11px] dark:fill-slate-300"
              >
                {row.label}
              </text>
              <text
                x={PAD.left - 8}
                y={y + 16}
                textAnchor="end"
                className="fill-slate-400 text-[9px] dark:fill-slate-500"
              >
                seen {row.count}
              </text>
              <line
                x1={plotX(Math.min(...row.values))}
                x2={plotX(Math.max(...row.values))}
                y1={y}
                y2={y}
                stroke={row.colour}
                strokeWidth={3}
                opacity={0.4}
              />
              {row.values.map((value, position) => (
                <circle key={position} cx={plotX(value)} cy={y} r={5} fill={row.colour} />
              ))}
            </g>
          );
        })}
        {[low + 0.02, (low + high) / 2, high - 0.01].map((tick) => (
          <text
            key={tick}
            x={plotX(tick)}
            y={VIEW.height - 12}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {tick.toFixed(2)}
          </text>
        ))}
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 1}
          textAnchor="middle"
          className="fill-slate-500 text-[9px] dark:fill-slate-400"
        >
          how alike the word and {rare.against} came out, under each of four starts
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label={`spread, ${rare.rare_word}`} value={rare.rare_spread.toFixed(4)} />
        <Stat label={`spread, ${rare.common_word}`} value={rare.common_spread.toFixed(4)} />
        <Stat
          label="how many times wider"
          value={(rare.rare_spread / rare.common_spread).toFixed(1)}
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">start</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                nearest to {rare.rare_word}
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                nearest to {rare.common_word}
              </th>
            </tr>
          </thead>
          <tbody>
            {rare.seeds.map((seed, index) => (
              <tr
                key={seed}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {index + 1}
                </td>
                <td className="py-1.5 pr-4 font-mono" style={{ color: MONEY }}>
                  {rare.rare_neighbour_lists[index].join(", ")}
                </td>
                <td className="py-1.5 font-mono" style={{ color: VERB }}>
                  {rare.common_neighbour_lists[index].join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        The rare word was put into two sentences of the same corpus and appears
        nowhere else, so everything about its position comes from those two
        windows and from wherever it happened to start. Nothing in the answer
        says so; it is a vector of the same width, reported with the same
        confidence as any other.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
