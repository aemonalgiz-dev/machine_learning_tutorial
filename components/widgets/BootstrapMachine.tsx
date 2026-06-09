"use client";

// The bootstrap drawing machine, replaying one member's actual draws.
//
// Twenty-five cards, one per person in the tangled crowd. The API's
// committee drew its resamples from a seeded generator, and this replays
// member zero's twenty-five draws one at a time: a card is drawn, its count
// goes up, and it is put back, so the next draw can pick it again. When the
// draws are done, some cards were drawn twice or three times and about a
// third were never drawn at all. The toggle shows what drawing without
// replacement would have done instead, which is to reproduce the crowd
// exactly. Every draw shown is the library's own.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, LabelledPoint, fetchBaggingAnatomy } from "@/lib/api";

export const TANGLED_CROWD: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
  { x: 145, y: 45, label: 0 },
  { x: 145, y: 55, label: 1 },
  { x: 151, y: 45, label: 1 },
  { x: 151, y: 55, label: 0 },
  { x: 157, y: 45, label: 0 },
  { x: 157, y: 55, label: 1 },
  { x: 148, y: 50, label: 1 },
  { x: 154, y: 50, label: 0 },
  { x: 160, y: 50, label: 1 },
  { x: 147, y: 58, label: 0 },
  { x: 153, y: 58, label: 1 },
  { x: 150, y: 42, label: 1 },
  { x: 156, y: 42, label: 0 },
  { x: 143, y: 50, label: 0 },
];

export const CHILD = "#f59e0b";
export const ADULT = "#6366f1";

export function BootstrapMachine() {
  const [anatomy, setAnatomy] = useState<BaggingAnatomy | null>(null);
  const [member, setMember] = useState(0);
  const [drawn, setDrawn] = useState(0);
  const [withReplacement, setWithReplacement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnatomy(await fetchBaggingAnatomy(TANGLED_CROWD, 25));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!anatomy) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const draws = anatomy.members[member].draws;
  const counts = new Array(anatomy.n_rows).fill(0);
  if (withReplacement) {
    for (let index = 0; index < drawn; index++) counts[draws[index]]++;
  } else {
    // Without replacement every card is drawn exactly once, in the same
    // order the first appearance of each card would come up.
    const seen: number[] = [];
    for (const card of draws) if (!seen.includes(card)) seen.push(card);
    for (let card = 0; card < anatomy.n_rows; card++) if (!seen.includes(card)) seen.push(card);
    for (let index = 0; index < drawn; index++) counts[seen[index]]++;
  }
  const distinct = counts.filter((count) => count > 0).length;
  const omitted = anatomy.n_rows - distinct;
  const lastCard = drawn > 0 ? (withReplacement ? draws[drawn - 1] : null) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          member
          <select value={member} onChange={(event) => { setMember(Number(event.target.value)); setDrawn(0); }} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
            {anatomy.members.map((each) => (
              <option key={each.position} value={each.position}>tree {each.position + 1}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={withReplacement} onChange={(event) => { setWithReplacement(event.target.checked); setDrawn(0); }} className="accent-indigo-600" />
          put each card back after drawing it
        </label>
        <span className="ml-auto flex gap-1">
          <button onClick={() => setDrawn((current) => Math.min(anatomy.n_rows, current + 1))} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">draw one</button>
          <button onClick={() => setDrawn(anatomy.n_rows)} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">draw all {anatomy.n_rows}</button>
          <button onClick={() => setDrawn(0)} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">reset</button>
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-9 md:grid-cols-13">
        {TANGLED_CROWD.map((person, index) => (
          <div
            key={index}
            className={`rounded-md border px-1 py-1 text-center text-[10px] transition ${counts[index] === 0 ? "border-dashed border-slate-300 text-slate-400 dark:border-slate-700" : "border-slate-400 text-slate-800 dark:border-slate-500 dark:text-slate-100"} ${lastCard === index ? "ring-2 ring-emerald-500" : ""}`}
            style={{ backgroundColor: counts[index] > 0 ? `${person.label === 0 ? CHILD : ADULT}${counts[index] >= 3 ? "66" : counts[index] === 2 ? "44" : "22"}` : "transparent" }}
          >
            <div className="font-mono">{person.x}/{person.y}</div>
            <div className="font-mono font-semibold">{counts[index] === 0 ? "·" : `×${counts[index]}`}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="draws made" value={`${drawn} of ${anatomy.n_rows}`} />
        <Stat label="distinct people drawn" value={String(distinct)} />
        <Stat label="never drawn" value={String(omitted)} />
        <Stat label="drawn more than once" value={String(counts.filter((count) => count > 1).length)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {withReplacement
          ? `Each draw picks one of the ${anatomy.n_rows} cards and puts it back. After all ${anatomy.n_rows} draws this member trained on ${anatomy.members[member].distinct_rows} distinct people and never saw ${anatomy.members[member].omitted_rows}.`
          : `Without replacement a drawn card stays out, so ${anatomy.n_rows} draws reproduce the crowd exactly, no duplicates and nobody omitted.`}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
