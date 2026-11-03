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
        Each row shows a word&apos;s projection onto the direction removed from
        the document vectors. Indigo uses the direction learned from the whole
        collection; gray uses the direction learned from its second half.
        The common words contribute most in the whole collection. In the second
        half, &ldquo;sail&rdquo; occurs in every document and contributes most
        instead. The choice of documents therefore changes which information
        this removal treats as common. The similarity between the two directions is{" "}
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
