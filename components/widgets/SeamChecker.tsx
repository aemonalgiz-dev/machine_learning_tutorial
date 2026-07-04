"use client";

// One seam, and the integer comparison that settles it.
//
// The reader picks or types what the lower layer answers with and what the
// upper layer reads, and the widget lines the two arrangements up extent by
// extent, marks each pair equal or not, and prints both counts. The verdict
// and the refusal are the library's, asked of the same predicate a chain uses
// at every seam, so a pair whose counts agree and whose extents do not comes
// back false here exactly as it would inside a network. The browser draws the
// two rows of extents and colours them; it decides nothing.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  JoinCheck,
  checkJoin,
  formatExtents,
} from "@/lib/concepts/shapes-and-flattening";
import { SEAMS } from "./shapesAndFlatteningFixtures";

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200";

const TEXT_INPUT_CLASS =
  "w-32 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

// A typed side, read as whole numbers. Anything that is not a whole number of
// at least one is dropped, so the request the API sees is always one it can
// answer, and the reader is stopped by the control rather than by a refusal.
function readExtents(typed: string): number[] {
  return typed
    .split(/[\s,x×]+/)
    .map((piece) => Number(piece))
    .filter((value) => Number.isFinite(value) && value >= 1)
    .map((value) => Math.round(value))
    .slice(0, 3);
}

export function SeamChecker() {
  const [beneathText, setBeneathText] = useState("8, 26, 26");
  const [aboveText, setAboveText] = useState("5408");
  const [answer, setAnswer] = useState<JoinCheck | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const beneath = readExtents(beneathText);
  const above = readExtents(aboveText);
  const key = JSON.stringify([beneath, above]);

  useEffect(() => {
    if (beneath.length === 0 || above.length === 0) return;
    const timer = setTimeout(async () => {
      try {
        setAnswer(await checkJoin(beneath, above));
        setMessage(null);
      } catch (error) {
        setAnswer(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
    // The request is a pure function of the two sides, so their text is the
    // one dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const longest = Math.max(beneath.length, above.length);
  const agrees = (position: number) => beneath[position] === above[position];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 pb-3">
        {SEAMS.map((seam) => {
          const chosen =
            JSON.stringify(seam.beneath) === JSON.stringify(beneath) &&
            JSON.stringify(seam.above) === JSON.stringify(above);
          return (
            <button
              key={seam.label}
              onClick={() => {
                setBeneathText(seam.beneath.join(", "));
                setAboveText(seam.above.join(", "));
              }}
              className={chosen ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            >
              {seam.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-3 pb-4 text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2">
            the lower layer answers
            <input
              value={beneathText}
              onChange={(event) => setBeneathText(event.target.value)}
              className={TEXT_INPUT_CLASS}
              aria-label="what the lower layer answers with"
            />
          </label>
          <label className="flex items-center gap-2">
            the upper layer reads
            <input
              value={aboveText}
              onChange={(event) => setAboveText(event.target.value)}
              className={TEXT_INPUT_CLASS}
              aria-label="what the upper layer reads"
            />
          </label>
        </div>

        <div className="space-y-1">
          <ExtentRow
            label="answers"
            extents={beneath}
            longest={longest}
            agrees={agrees}
          />
          <ExtentRow
            label="reads"
            extents={above}
            longest={longest}
            agrees={agrees}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Extents below" value={formatExtents(beneath.length ? beneath : null)} />
          <Stat label="Extents above" value={formatExtents(above.length ? above : null)} />
          <Stat
            label="Numbers below"
            value={answer ? String(answer.n_beneath) : "…"}
          />
          <Stat
            label="Numbers above"
            value={answer ? String(answer.n_above) : "…"}
          />
        </div>

        {answer && (
          <div
            className={
              "mt-3 rounded-md border px-3 py-2 text-sm " +
              (answer.holds
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200")
            }
          >
            {answer.holds ? (
              <>The seam holds, so a chain containing it can be built.</>
            ) : (
              <>
                The seam is refused
                {answer.counts_agree
                  ? ", and both sides hold the same count of numbers. "
                  : ". "}
                The refusal reads{" "}
                <span className="font-mono">{answer.refusal}</span>
              </>
            )}
          </div>
        )}

        {message && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            {message}
          </p>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Watch the two counts and the verdict separately. They agree with each
        other far less often than they look as though they should.
      </p>
    </div>
  );
}

function ExtentRow({
  label,
  extents,
  longest,
  agrees,
}: {
  label: string;
  extents: number[];
  longest: number;
  agrees: (position: number) => boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {Array.from({ length: longest }, (_, position) => {
        const extent = extents[position];
        const matched = agrees(position);
        return (
          <span
            key={position}
            className={
              "w-16 rounded border px-2 py-1 text-center font-mono text-sm " +
              (extent === undefined
                ? "border-dashed border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-600"
                : matched
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200")
            }
          >
            {extent ?? "·"}
          </span>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
