"use client";

// The published character classes against the ones that can be written here.
//
// The API rebuilds the published pattern by writing its two classes out of
// Unicode's own general categories, runs both readings over seven texts, counts
// how many codepoints the two classes place differently, and sweeps every one
// of those codepoints through four arrangements to find where the difference
// shows and where it does not. It also splits one file name with and without
// the repair the third branch needed. The browser draws the seven texts, the
// counts, the sweep and the file name.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  DialectView,
  fetchDialect,
} from "@/lib/concepts/the-pattern-language-models-use";
import { ChipRow, Stat } from "@/components/widgets/PieceChip";

export function DialectPanel() {
  const [view, setView] = useState<DialectView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchDialect());
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

  return (
    <div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <ClassRow
          title="as published"
          letters={view.published_letters}
          numbers={view.published_numbers}
        />
        <ClassRow
          title="as it can be written here"
          letters={view.letters_here}
          numbers={view.numbers_here}
        />
      </div>

      <div className="mt-3 space-y-1.5">
        {view.probes.map((probe) => (
          <div
            key={probe.text}
            className={`rounded-lg border px-3 py-2 ${
              probe.agree
                ? "border-slate-200 dark:border-slate-800"
                : "border-amber-300 bg-amber-50/40 dark:border-amber-700 dark:bg-amber-950/20"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {probe.text}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {probe.agree ? "the same pieces" : "different pieces"}
              </span>
            </div>
            <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  as published, {probe.as_published.length} pieces
                </div>
                <ChipRow
                  pieces={probe.as_published}
                  tone={(piece) => (piece.startsWith(" ") ? "spaced" : "plain")}
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  here, {probe.here.length} pieces
                </div>
                <ChipRow
                  pieces={probe.here}
                  tone={(piece) => (piece.startsWith(" ") ? "spaced" : "plain")}
                />
              </div>
            </div>
            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              {probe.look_at}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="characters of a number kind"
          value={`${view.counts.n_number_codepoints}`}
        />
        <Stat
          label="of those read as a digit here"
          value={`${view.counts.n_read_as_digits_here}`}
        />
        <Stat
          label="of those read as a letter here"
          value={`${view.counts.n_read_as_letters_here}`}
        />
        <Stat
          label="letters the two readings disagree about"
          value={`${view.counts.n_letter_codepoints - view.counts.n_letters_agreeing}`}
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          each of the {view.counts.n_read_as_letters_here} disputed characters
          put in four arrangements, and how many of them split differently in
          each
        </div>
        <div className="mt-2 space-y-1">
          {view.adjacency.map((row) => (
            <div key={row.context}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  {row.context}
                  <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {row.shape}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {row.n_differing} of {row.n_characters}
                </span>
              </div>
              <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-1.5 rounded bg-amber-400 dark:bg-amber-500"
                  style={{
                    width: `${(row.n_differing / row.n_characters) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Standing between two spaces, every one of them is cut the same way by
          both readings. Beside a letter or a digit, every one of them is cut
          differently.
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          one file name, read with the third branch written out in full and with
          the obvious shorter form
        </div>
        <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
          {view.underscore.text}
        </div>
        <div className="mt-2 space-y-1">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              written out in full, and the pieces join back to the name
            </div>
            <ChipRow pieces={view.underscore.with_the_repair} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              the shorter form, and {view.underscore.n_characters_lost} character
              of the name is in no piece at all
            </div>
            <ChipRow pieces={view.underscore.without_the_repair} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassRow({
  title,
  letters,
  numbers,
}: {
  title: string;
  letters: string;
  numbers: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="mt-1 space-y-0.5 font-mono text-xs text-slate-800 dark:text-slate-200">
        <div>a letter is {letters}</div>
        <div>a number is {numbers}</div>
      </div>
    </div>
  );
}
