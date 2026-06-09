"use client";

// What a piece loses on the way to being text and back again.
//
// Each row is one token of the new vocabulary, then the text it decodes to,
// then the pieces the old vocabulary reads that text as. The API computes all
// three; the browser lines them up so the loss is visible in one line. Four
// sets of tokens, because the same loss looks different when the two
// vocabularies share a convention, when one of them is too small to spell what
// comes out, and when the two mark opposite ends of a word.

import { useEffect, useState } from "react";
import {
  DomainsView,
  MappingRow,
  WorkedView,
  fetchDomains,
  fetchWorked,
  messageFor,
} from "@/lib/concepts/moving-a-vocabulary";
import { Pieces } from "./movingAVocabularyParts";

type Case = "four" | "narrow" | "convention" | "domains";

const CASE_LABELS: Record<Case, string> = {
  four: "Four words",
  narrow: "A source two merges short",
  convention: "The other marking convention",
  domains: "The two domains",
};

function pick(rows: MappingRow[], wanted: string[]): MappingRow[] {
  const found = wanted
    .map((token) => rows.find((row) => row.target_token === token))
    .filter((row): row is MappingRow => row !== undefined);
  return found.length > 0 ? found : rows.slice(0, 8);
}

export function MarkerLoss() {
  const [worked, setWorked] = useState<WorkedView | null>(null);
  const [domains, setDomains] = useState<DomainsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Case>("four");

  useEffect(() => {
    (async () => {
      try {
        const [oneCase, otherCase] = await Promise.all([
          fetchWorked(),
          fetchDomains(),
        ]);
        setWorked(oneCase);
        setDomains(otherCase);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!worked || !domains) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const sets: Record<Case, { rows: MappingRow[]; note: string }> = {
    four: {
      rows: pick(worked.smaller_to_larger, [
        "ew",
        "lo",
        "low</w>",
        "ewest</w>",
        "widest</w>",
      ]),
      note: `Only ew is read again as a whole word. lo is spelled the same in both vocabularies, so the copy rule takes it before decoding can, and the three that end words were ending words already.`,
    },
    narrow: {
      rows: pick(worked.narrow, ["lo", "ew", "low</w>", "newest</w>"]),
      note: `Drop the old vocabulary by one merge and lo is no longer in it. Its text is now read as a whole word ending in o, and no word of these four does, so half of it comes back as the stand-in.`,
    },
    convention: {
      rows: pick(worked.word_piece.rows, [
        "##est",
        "##ew",
        "##st",
        "##d",
        "##e",
        "low",
        "lower",
      ]),
      note: `Here the new vocabulary marks the pieces that continue a word rather than the ones that end it, so every continuation loses its mark on the way out. Five of the single letters come back as nothing but the stand-in, because no word of the four ends in that letter.`,
    },
    domains: {
      rows: [
        ...pick(domains.marker_rows, ["ea", "he", "br", "ast"]),
        ...pick(domains.stand_in_rows, ["k</w>", "ou", "flou"]),
      ],
      note: `The same two losses at the larger size. Twenty-five of the sixty-seven tokens read again come back claiming a word ended, and twelve of them reach the stand-in for at least part of their spelling.`,
    },
  };

  const shown = sets[chosen];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(CASE_LABELS) as Case[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setChosen(key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              chosen === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {CASE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[auto_auto_auto_auto_1fr] items-center gap-x-2 gap-y-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400">new token</span>
        <span />
        <span className="text-slate-500 dark:text-slate-400">as text</span>
        <span />
        <span className="text-slate-500 dark:text-slate-400">
          what the old vocabulary reads
        </span>
        {shown.rows.map((row) => (
          <Row key={`${chosen}-${row.target_id}`} row={row} />
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {shown.note}
      </p>
    </div>
  );
}

function Row({ row }: { row: MappingRow }) {
  return (
    <>
      <div>
        <Pieces
          pieces={[row.target_token]}
          tone={row.route === "copied" ? "highlight" : "plain"}
        />
      </div>
      <span className="text-slate-400 dark:text-slate-500">&rsaquo;</span>
      <span className="font-mono text-slate-600 dark:text-slate-400">
        {row.decoded}
      </span>
      <span className="text-slate-400 dark:text-slate-500">&rsaquo;</span>
      <div>
        {row.n_source_ids === 0 ? (
          <span className="text-slate-400">nothing</span>
        ) : (
          <Pieces
            pieces={row.source_tokens}
            tone={row.route === "copied" ? "highlight" : "learned"}
          />
        )}
      </div>
    </>
  );
}
