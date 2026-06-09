"use client";

// Every pair of fitted documents, as a thirty by thirty grid of cosines.
//
// The first fifteen documents are about cooking and the last fifteen about
// sailing, and nothing told the fit which was which, so the two bright blocks
// on the diagonal are the whole result. The API fits both architectures and
// computes every cosine; the browser colours the squares.

import { useEffect, useState } from "react";
import {
  ApiError,
  ArchitectureName,
  Fits,
  fetchFits,
} from "@/lib/concepts/paragraph-vectors";
import { Choice, Legend, SAILING, Stat, Waiting } from "./paragraphVectorsShared";

const CELL = 14;
const PAD = 26;

function shade(value: number): string {
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    return `rgba(99, 102, 241, ${(clamped * 0.9 + 0.05).toFixed(3)})`;
  }
  return `rgba(239, 68, 68, ${(-clamped * 0.9 + 0.05).toFixed(3)})`;
}

export function ParagraphDocumentMap() {
  const [fits, setFits] = useState<Fits | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [architecture, setArchitecture] =
    useState<ArchitectureName>("distributed-memory");

  useEffect(() => {
    (async () => {
      try {
        setFits(await fetchFits());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!fits) return <Waiting message={message} />;

  const report =
    fits.architectures.find((entry) => entry.architecture === architecture) ??
    fits.architectures[0];
  const size = report.similarities.length;
  const width = PAD + size * CELL + 4;

  return (
    <div>
      <div className="mb-3">
        <Choice
          options={[
            { label: "distributed memory", value: "distributed-memory" as const },
            { label: "bag of words", value: "bag-of-words" as const },
          ]}
          value={architecture}
          onChange={setArchitecture}
        />
      </div>

      <svg
        viewBox={`0 0 ${width} ${width}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {report.similarities.map((row, first) =>
          row.map((value, second) => (
            <rect
              key={`${first}-${second}`}
              x={PAD + second * CELL}
              y={PAD + first * CELL}
              width={CELL - 1}
              height={CELL - 1}
              fill={shade(value)}
            />
          )),
        )}
        <text
          x={PAD + 7.5 * CELL}
          y={PAD - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          cooking
        </text>
        <text
          x={PAD + 22.5 * CELL}
          y={PAD - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          sailing
        </text>
        <line
          x1={PAD + 15 * CELL - 0.5}
          x2={PAD + 15 * CELL - 0.5}
          y1={PAD}
          y2={PAD + size * CELL}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-400 dark:text-slate-600"
        />
        <line
          y1={PAD + 15 * CELL - 0.5}
          y2={PAD + 15 * CELL - 0.5}
          x1={PAD}
          x2={PAD + size * CELL}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-400 dark:text-slate-600"
        />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="two cooking" value={report.summary.cooking.toFixed(4)} />
        <Stat label="two sailing" value={report.summary.sailing.toFixed(4)} />
        <Stat label="one of each" value={report.summary.across.toFixed(4)} />
        <Stat
          label="worst inside, best across"
          value={`${report.summary.worst_within.toFixed(2)} / ${report.summary.best_across.toFixed(2)}`}
        />
      </div>

      <Legend>
        Darker is more alike, and the two blocks on the diagonal are the two
        subjects. Nothing was told which document belonged to which. The number
        to distrust is the last tile, where the least alike pair inside one
        subject is <span style={{ color: SAILING }}>below</span> the most alike
        pair across the two, so the blocks overlap even though their averages are
        far apart.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
