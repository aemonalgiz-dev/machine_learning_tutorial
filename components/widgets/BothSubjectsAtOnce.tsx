"use client";

// A text about both subjects, measured against a text about each.
//
// Two words of one half and two of the other, and one position to hold them, so
// under every rule the text has to land somewhere that is not either subject.
// The two bars per row say how near it came to each, and the list underneath is
// the documents it turned out nearest to. The API pools all three texts and
// ranks; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Edges, fetchEdges } from "@/lib/concepts/pooling-a-text";
import {
  COOKING,
  Legend,
  SAILING,
  Stat,
  Waiting,
  colourFor,
  signed,
} from "./poolingATextShared";

export function BothSubjectsAtOnce() {
  const [edges, setEdges] = useState<Edges | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchEdges();
        if (!cancelled) {
          setEdges(next);
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
  }, []);

  if (!edges) return <Waiting message={message} />;

  const width = (value: number) =>
    `${Math.max(0, Math.min(1, (value + 1) / 2)) * 100}%`;

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat label="the text about both" value={edges.mixed_text} />
        <Stat label="a text about the second half" value={edges.pure_sailing} />
        <Stat label="a text about the first half" value={edges.pure_cooking} />
      </div>

      <div className="mt-3 space-y-2">
        {edges.mixed.map((row) => (
          <div key={row.method}>
            <div className="mb-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {row.method_label}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                <span
                  className="block h-2.5 rounded"
                  style={{
                    width: width(row.to_sailing),
                    backgroundColor: SAILING,
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {signed(row.to_sailing)}
              </span>
              <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                <span
                  className="block h-2.5 rounded"
                  style={{
                    width: width(row.to_cooking),
                    backgroundColor: COOKING,
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {signed(row.to_cooking)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          the documents it comes out nearest, under the last rule
        </div>
        {edges.mixed_nearest.map((document, position) => (
          <div
            key={document}
            className="font-mono text-[11px]"
            style={{ color: colourFor(edges.mixed_nearest_groups[position]) }}
          >
            {document}
          </div>
        ))}
      </div>

      <Legend>
        Each bar runs from a similarity of &minus;1 at the far left to +1 at the
        far right, indigo against the text about the second half and amber
        against the text about the first. Under the plain average the text about
        both is nearer to each of them than they are to each other, which is one
        way of failing; under the last rule it has been pushed onto one side, and
        all four of the documents it comes out nearest belong to that half.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
