"use client";

// The tree over a vocabulary, and what a path costs against a sweep.
//
// The six-word corpus drawn as a tree, so the two commonest words sit two
// steps from the root and the rest three; then a table putting the rows a
// sweep touches beside the rows a path touches, at five vocabulary sizes, so
// the saving can be read as it grows. The API builds every tree and averages
// every path length; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, TreeReport, fetchTreeReport } from "@/lib/concepts/word2vec";
import { FALLING, Legend, MONEY, Stat, VERB, Waiting } from "./word2vecShared";

const VIEW = { width: 560, height: 240 };

export function Word2vecTree() {
  const [report, setReport] = useState<TreeReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchTreeReport());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) return <Waiting message={message} />;

  const moneyWords = new Set(["bond", "market", "price"]);
  const deepest = Math.max(...report.small_paths.map((path) => path.depth));
  const levelY = (level: number) => 28 + (level / deepest) * (VIEW.height - 78);

  // Every path shares its prefix with every other path through the same
  // nodes, so laying the leaves out evenly and putting each internal node at
  // the mean of the leaves beneath it draws the tree without a layout pass.
  const leafX = new Map<string, number>();
  const ordered = [...report.small_paths].sort((first, second) => {
    const bits = (path: typeof first) => path.bits.join("");
    return bits(first) < bits(second) ? -1 : 1;
  });
  ordered.forEach((path, index) => {
    leafX.set(path.word, 60 + (index / (ordered.length - 1)) * (VIEW.width - 120));
  });

  // Every node is the mean of the leaves beneath it, which lays the tree out
  // without a layout pass, since a node's key is the prefix of bits reaching it.
  const beneath = new Map<string, number[]>();
  for (const path of report.small_paths) {
    for (let depth = 0; depth <= path.depth; depth += 1) {
      const key = path.bits.slice(0, depth).join("");
      const collected = beneath.get(key) ?? [];
      collected.push(leafX.get(path.word) ?? 0);
      beneath.set(key, collected);
    }
  }
  const nodePositions = new Map<string, { x: number; y: number }>();
  for (const [key, positions] of beneath) {
    nodePositions.set(key, {
      x: positions.reduce((total, value) => total + value, 0) / positions.length,
      y: levelY(key.length),
    });
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {report.small_paths.map((path) =>
          path.bits.map((bit, depth) => {
            const from = nodePositions.get(path.bits.slice(0, depth).join(""));
            const to = nodePositions.get(path.bits.slice(0, depth + 1).join(""));
            if (!from || !to) return null;
            return (
              <line
                key={`${path.word}-${depth}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={bit === 0 ? VERB : MONEY}
                strokeWidth={1.6}
              />
            );
          }),
        )}
        {[...nodePositions.entries()]
          .filter(([key]) => (beneath.get(key) ?? []).length > 1)
          .map(([key, position]) => (
            <circle
              key={key || "root"}
              cx={position.x}
              cy={position.y}
              r={6}
              fill="white"
              stroke="#64748b"
              strokeWidth={1.5}
            />
          ))}
        {report.small_paths.map((path) => (
          <g key={path.word}>
            <circle
              cx={leafX.get(path.word)}
              cy={levelY(path.depth)}
              r={6}
              fill={moneyWords.has(path.word) ? MONEY : VERB}
            />
            <text
              x={leafX.get(path.word)}
              y={levelY(path.depth) + 20}
              textAnchor="middle"
              className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
            >
              {path.word}
            </text>
            <text
              x={leafX.get(path.word)}
              y={levelY(path.depth) + 32}
              textAnchor="middle"
              className="fill-slate-400 text-[9px] dark:fill-slate-500"
            >
              seen {path.count}, {path.depth} steps
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="branch points" value={String(report.small_internal_nodes)} />
        <Stat label="mean steps per word" value={report.small_expected_depth.toFixed(4)} />
        <Stat label="rows a full sweep touches" value={String(report.small_sweep_rows)} />
        <Stat
          label="shortest and longest path"
          value={`${Math.min(...report.small_paths.map((path) => path.depth))}, ${deepest}`}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">words</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">a full sweep</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">a path, flat counts</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">a path, realistic counts</th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">drawn wrong answers</th>
            </tr>
          </thead>
          <tbody>
            {report.sizes.map((row) => (
              <tr
                key={row.n_words}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.n_words.toLocaleString()}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.sweep_rows.toLocaleString()}
                </td>
                <td className="py-1.5 pr-4 font-mono" style={{ color: VERB }}>
                  {row.uniform_depth.toFixed(2)}
                </td>
                <td className="py-1.5 pr-4 font-mono" style={{ color: FALLING }}>
                  {row.skewed_depth.toFixed(2)}
                </td>
                <td className="py-1.5 font-mono" style={{ color: MONEY }}>
                  {row.negative_rows}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        The running corpus has {report.corpus_words} words, whose counts run
        from the commonest to the rarest without much of a gap, so its tree
        averages {report.corpus_expected_depth.toFixed(4)} steps a word against
        the {report.corpus_balanced_depth.toFixed(4)} an evenly split tree would
        cost. The realistic column has counts falling as one over the rank,
        which is where the arrangement starts to pay.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
