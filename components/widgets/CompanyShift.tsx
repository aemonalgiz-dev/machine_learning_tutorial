"use client";

// One text scored twice, against a whole collection and against half of it.
//
// The words are the same, the positions are the same and the rule is the same;
// only the company the text is scored in changes, and with it the direction that
// gets taken out of every vector. The bars show how far each of the text's own
// words leans along each of the two directions, which is where the disagreement
// comes from. The API fits both collections and compares; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Company, fetchCompany } from "@/lib/concepts/pooling-a-text";
import { Legend, SAILING, SHARED, Stat, Waiting, colourFor, signed } from "./poolingATextShared";

export function CompanyShift() {
  const [company, setCompany] = useState<Company | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchCompany();
        if (!cancelled) {
          setCompany(next);
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

  if (!company) return <Waiting message={message} />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the text" value={company.text} />
        <Stat label="documents in the whole" value={String(company.n_whole)} />
        <Stat label="documents in the half" value={String(company.n_half)} />
        <Stat
          label="the two readings, compared"
          value={signed(company.similarity_between_readings)}
        />
      </div>

      <div className="mt-3 space-y-1">
        {company.words.map((word) => (
          <div key={word.word} className="flex items-center gap-2 text-xs">
            <span
              className="w-16 shrink-0 truncate font-mono text-[11px]"
              style={{ color: colourFor(word.group) }}
            >
              {word.word}
            </span>
            <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-2.5 rounded"
                style={{
                  width: `${Math.max(0, Math.min(1, word.in_the_whole)) * 100}%`,
                  backgroundColor: SAILING,
                }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {word.in_the_whole.toFixed(4)}
            </span>
            <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-2.5 rounded"
                style={{
                  width: `${Math.max(0, Math.min(1, word.in_the_half)) * 100}%`,
                  backgroundColor: SHARED,
                }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {word.in_the_half.toFixed(4)}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        One row per word of the text. The indigo bar is how far that word leans
        along the direction taken out when the whole collection is the company,
        and the grey bar is the same word against the direction taken out when
        only the second half is. In the whole collection the three words carrying
        no subject lead; in the half, sail leads instead, because a word every
        document of that half uses is now doing what those three did. The two
        directions themselves agree to{" "}
        {company.component_similarity.toFixed(4)}.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
