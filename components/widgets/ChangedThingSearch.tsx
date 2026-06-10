"use client";

// The same shape, altered, searched for with the unaltered template.
//
// The dashed box is where the thing genuinely is and the solid box is where the
// search reported it. On the unaltered control the two boxes sit on top of each
// other; on every other case they come apart, and the readout underneath says
// how far and how confidently. The point the widget exists to make is that the
// solid box never wanders vaguely near the right answer, it lands somewhere else
// entirely, and the score there is high enough to be reported without hesitation.
//
// The last case is the one worth staying on. A doubled L contains an exact
// unscaled copy of itself at the join of its arms, so there the solid box is a
// flawless match sitting in a place the object does not begin. The API searches
// and scores; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ChangedThing,
  ChangedThingResponse,
  fetchChangedThing,
} from "@/lib/concepts/template-matching";
import { GreyScaleKey, Mark, PicturePlot, Stat, Swatch } from "./templateMatchingPictures";

export function ChangedThingSearch({
  includeCorner = true,
}: {
  includeCorner?: boolean;
}) {
  const [body, setBody] = useState<ChangedThingResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setBody(await fetchChangedThing());
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!body) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const cases: { label: string; thing: ChangedThing }[] = body.cases.map(
    (thing) => ({ label: thing.change, thing }),
  );
  if (includeCorner) {
    cases.push({ label: "A doubled L", thing: body.doubled_corner });
  }
  const current = cases[Math.min(chosen, cases.length - 1)].thing;
  const isCorner = includeCorner && chosen === cases.length - 1;

  const side = current.template.height;
  const marks: Mark[] = [
    {
      row: current.drawn_at[0],
      column: current.drawn_at[1],
      height: side,
      width: side,
      colour: "sky",
      dashed: true,
    },
    {
      row: current.best.row,
      column: current.best.column,
      height: side,
      width: side,
      colour: current.pixels_away === 0 ? "emerald" : "rose",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {cases.map((option, index) => (
          <button
            key={option.label + index}
            type="button"
            onClick={() => setChosen(index)}
            className={`rounded-md border px-2.5 py-1 text-xs ${
              chosen === index
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-6">
        <div>
          <PicturePlot grid={current.scene} marks={marks} cell={16} title="The picture searched" />
          <GreyScaleKey grid={current.scene} digits={1} />
        </div>
        <div>
          <PicturePlot grid={current.template} cell={22} title="Looked for" />
        </div>
        <div className="min-w-[13rem] flex-1 space-y-2 text-xs">
          <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Swatch colour="sky" /> where the thing begins
          </p>
          <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Swatch colour={current.pixels_away === 0 ? "emerald" : "rose"} />{" "}
            where the search reported it
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Score where it is"
          value={current.at_the_truth.score.toFixed(4)}
          tone={current.at_the_truth.score > 0.9 ? "good" : "bad"}
        />
        <Stat
          label="Score where it says"
          value={current.best.score.toFixed(4)}
        />
        <Stat
          label="Pixels out"
          value={current.pixels_away.toFixed(4)}
          tone={current.pixels_away === 0 ? "good" : "bad"}
        />
        {isCorner ? (
          <Stat
            label="Stands clear by"
            value={`${body.doubled_corner_ratio.toFixed(4)}${
              body.doubled_corner_believable ? ", believed" : ", not enough"
            }`}
            tone={body.doubled_corner_believable ? "bad" : "plain"}
          />
        ) : (
          <Stat
            label="Reported at"
            value={`row ${current.best.row}, column ${current.best.column}`}
          />
        )}
      </div>
    </div>
  );
}
