"use client";

// The final-period rule, probed on eight texts and then counted over six sentences.
//
// The API splits each probe by the treebank rules, reports its pieces, lists the
// pieces that still carry a full stop attached to a word, and says whether a
// stop came back as a piece of its own. It then splits the six sentences one at
// a time and again as one joined text, so the two counts can be compared. The
// browser draws the eight probes as rows and the two counts as a small table
// underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullStopsView, fetchFullStops } from "@/lib/concepts/penn-treebank-rules";

export function FullStopPanel() {
  const [view, setView] = useState<FullStopsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchFullStops());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const counts = view.sentences;

  return (
    <div>
      <div className="space-y-3">
        {view.probes.map((probe) => (
          <div
            key={probe.text}
            className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
          >
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {probe.label}
            </div>
            <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
              {probe.text}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {probe.pieces.map((piece) => (
                <span
                  key={`${piece.start}-${piece.end}`}
                  className={`rounded px-1.5 py-0.5 font-mono text-xs ${
                    piece.text === "."
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : probe.attached_stops.includes(piece.text)
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {piece.text}
                </span>
              ))}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {probe.look_at}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                the same six sentences
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                one at a time
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                joined into one text
              </th>
            </tr>
          </thead>
          <tbody>
            <Row
              label="pieces in all"
              here={`${counts.separately}`}
              there={`${counts.together}`}
            />
            <Row
              label="full stops returned on their own"
              here={`${counts.stop_pieces_separately}`}
              there={`${counts.stop_pieces_together}`}
            />
            <Row
              label="pieces still carrying a stop"
              here={`${counts.attached_stops_separately.length}`}
              there={`${counts.attached_stops_together.length}`}
            />
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50/60 px-3 py-2 dark:border-amber-700 dark:bg-amber-950/20">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          the pieces that came back with a stop attached, from the joined text
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {counts.attached_stops_together.map((piece) => (
            <span
              key={piece}
              className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {piece}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A green piece is a full stop the rules returned on its own, an amber one
        is a word that kept a stop. Only the first of the joined text&rsquo;s
        amber pieces is an abbreviation; the other five are sentences whose own
        stop was read as though it were one.
      </p>
    </div>
  );
}

function Row({
  label,
  here,
  there,
}: {
  label: string;
  here: string;
  there: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">{label}</td>
      <td className="py-2 pr-6 font-mono text-slate-900 dark:text-slate-100">
        {here}
      </td>
      <td className="py-2 font-mono text-slate-900 dark:text-slate-100">
        {there}
      </td>
    </tr>
  );
}
