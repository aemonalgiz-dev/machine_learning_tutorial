"use client";

// The whole search on a picture small enough to check with a pencil.
//
// Six pixels by six, holding a single edge, with a three by three piece of
// itself carried across it. Sixteen positions, and because every row of the
// picture is the same, four distinct answers. Clicking a cell of the score table
// moves the box on the picture and shows the patch that sat there beside the
// template it was compared against, so a reader can do the multiplication for
// themselves and check the number the table gives.
//
// The reason it earns a widget rather than a paragraph is the middle column of
// the table: three positions score exactly alike under one rule and separate
// cleanly under the other two, and seeing the three equal numbers next to three
// visibly different patches is the argument. The API scores; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { HandSizedResponse, fetchHandSized } from "@/lib/concepts/template-matching";
import { GreyScaleKey, Mark, PicturePlot, Stat } from "./templateMatchingPictures";

export function HandSizedSearch({ initialColumn = 2 }: { initialColumn?: number }) {
  const [body, setBody] = useState<HandSizedResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState({ row: 0, column: initialColumn });

  useEffect(() => {
    (async () => {
      try {
        setBody(await fetchHandSized());
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

  const templateSide = body.template.height;
  const cell = body.cells.find(
    (candidate) =>
      candidate.row === chosen.row && candidate.column === chosen.column,
  );
  const positionsAcross = Math.max(...body.cells.map((one) => one.column)) + 1;
  const positionsDown = Math.max(...body.cells.map((one) => one.row)) + 1;

  const patchRows = body.picture.rows
    .slice(chosen.row, chosen.row + templateSide)
    .map((row) => row.slice(chosen.column, chosen.column + templateSide));
  const patch = {
    rows: patchRows,
    height: templateSide,
    width: templateSide,
    darkest: body.picture.darkest,
    brightest: body.picture.brightest,
  };

  const marks: Mark[] = [
    {
      row: chosen.row,
      column: chosen.column,
      height: templateSide,
      width: templateSide,
      colour: "indigo",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start gap-6">
        <div>
          <PicturePlot
            grid={body.picture}
            marks={marks}
            cell={26}
            title="The picture, six pixels by six"
            onPixel={(row, column) =>
              setChosen({
                row: Math.min(row, positionsDown - 1),
                column: Math.min(column, positionsAcross - 1),
              })
            }
          />
          <GreyScaleKey grid={body.picture} digits={1} />
        </div>
        <div>
          <PicturePlot grid={body.template} cell={26} title="Carried across it" />
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            cut from row {body.template_from.row}, column{" "}
            {body.template_from.column}
          </p>
        </div>
        <div>
          <PicturePlot grid={patch} cell={26} title="What lies under it now" />
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            at row {chosen.row}, column {chosen.column}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                Column
              </th>
              {body.rules.map((rule) => (
                <th
                  key={rule}
                  className="py-2 pr-6 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {rule}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.cells
              .filter((one) => one.row === 0)
              .map((one) => (
                <tr
                  key={one.column}
                  onClick={() => setChosen({ row: 0, column: one.column })}
                  className={`cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800/60 ${
                    chosen.column === one.column
                      ? "bg-indigo-50 dark:bg-indigo-950/30"
                      : ""
                  }`}
                >
                  <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                    {one.column}
                  </td>
                  {one.scores.map((score, index) => (
                    <td
                      key={body.rules[index]}
                      className={`py-2 pr-6 font-mono last:pr-0 ${
                        score === body.perfect_scores[index]
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {score}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Every row of the picture is the same six pixels, so the four rows above
          are the whole search. A score in green is the best that rule can give.
        </p>
      </div>

      {cell && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {body.rules.map((rule, index) => (
            <Stat
              key={rule}
              label={rule}
              value={String(cell.scores[index])}
              tone={
                cell.scores[index] === body.perfect_scores[index]
                  ? "good"
                  : "plain"
              }
            />
          ))}
          <Stat
            label="Positions tried"
            value={`${body.n_positions}, reading ${body.n_pixels_read} pixels`}
          />
        </div>
      )}
    </div>
  );
}
