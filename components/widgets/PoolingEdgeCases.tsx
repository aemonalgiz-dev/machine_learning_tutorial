"use client";

// Every edge the last part of the page quotes, asked of the library live.
//
// The API attempts each one and reports what came back, so a row that says
// refused was refused a moment ago rather than in a sentence written once. The
// last block is the one case that is not a refusal and is not correct either:
// two layers reading and answering the same arrangement, built from different
// windows and strides, take each other's responses without complaint, hand down
// the same total, and put it in different places. The browser lays the rows out
// and colours the two grids.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { EdgeCases, Grid, readEdgeCases } from "@/lib/concepts/pooling";

export function PoolingEdgeCases() {
  const [probed, setProbed] = useState<EdgeCases | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProbed(await readEdgeCases());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const mistake = probed?.pairing_mistake ?? null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">What was asked</th>
              <th className="py-1 pr-3 font-medium">Refused</th>
              <th className="py-1 font-medium">What came back</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {!probed && (
              <tr>
                <td className="py-1 font-mono">…</td>
              </tr>
            )}
            {(probed?.cases ?? []).map((entry) => (
              <tr
                key={entry.name}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1.5 pr-3 align-top">
                  <span className="font-medium">{entry.name}</span>
                  <br />
                  <span className="text-slate-500 dark:text-slate-400">
                    {entry.attempt}
                  </span>
                </td>
                <td className="py-1.5 pr-3 align-top">
                  <span
                    className={
                      "rounded px-1.5 py-0.5 font-mono text-[11px] " +
                      (entry.raised
                        ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                        : "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100")
                    }
                  >
                    {entry.raised ? (entry.error ?? "refused") : "accepted"}
                  </span>
                </td>
                <td className="py-1.5 align-top font-mono text-[11px]">
                  {entry.detail ?? entry.outcome}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Refused"
          value={probed ? `${probed.n_refused} of ${probed.cases.length}` : "…"}
        />
        <Stat
          label="Accepted"
          value={probed ? `${probed.n_accepted} of ${probed.cases.length}` : "…"}
        />
        <Stat
          label="Refusals in the library’s own words"
          value={
            probed
              ? `${probed.cases.filter((entry) => entry.library_error).length} of ${probed.n_refused}`
              : "…"
          }
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          The one nothing refuses
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {mistake
            ? `Both layers read ${mistake.reads.join(" × ")} and answer ${mistake.answers.join(" × ")}. The response came from the window of ${mistake.producer_window} at a stride of ${mistake.producer_stride}, and the window of ${mistake.receiver_window} at a stride of ${mistake.receiver_stride} accepted it.`
            : "…"}
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-center gap-6">
          <Panel
            title="Arriving"
            caption={mistake ? `totalling ${mistake.producer_total}` : "…"}
            values={mistake?.arriving ?? null}
            accent="99, 102, 241"
          />
          <Panel
            title="Where the layer that pooled it sends them"
            caption={mistake ? `totalling ${mistake.producer_total}` : "…"}
            values={mistake?.producer_blame ?? null}
            accent="16, 185, 129"
          />
          <Panel
            title="Where the other layer sends them"
            caption={mistake ? `totalling ${mistake.receiver_total}` : "…"}
            values={mistake?.receiver_blame ?? null}
            accent="244, 63, 94"
          />
        </div>

        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          {mistake
            ? `The totals match to the last bit and ${mistake.n_cells_differing} of the sixteen cells receive something different.`
            : "…"}
        </p>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Panel({
  title,
  caption,
  values,
  accent,
}: {
  title: string;
  caption: string;
  values: Grid | null;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="max-w-[12rem] text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      {values ? (
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))`,
          }}
        >
          {values.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className="flex h-8 w-8 items-center justify-center rounded font-mono text-xs font-semibold text-slate-900 dark:text-slate-100"
                style={{
                  backgroundColor: `rgba(${accent}, ${value === 0 ? 0.06 : 0.25 + 0.15 * value})`,
                }}
              >
                {value === 0 ? "·" : value}
              </div>
            )),
          )}
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 font-mono text-slate-500 dark:bg-slate-800">
          …
        </div>
      )}
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {caption}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
