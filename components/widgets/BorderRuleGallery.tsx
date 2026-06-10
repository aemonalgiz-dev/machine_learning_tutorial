"use client";

// The four things that can be read where the weights hang off the picture, run
// over one picture with its one edge in a known place.
//
// The small picture is dark on the left and bright on the right, so the only
// sharp change in it sits between columns two and three. Anything else a rule
// reports is something the rule invented. The middle row of each answer is
// printed underneath, with the invented positions marked, and the API says
// which those are rather than the browser deciding. The flat average shows what
// each rule put outside the frame as a brightness; the sharpness map shows
// whether that invention reads as an edge.

import { useEffect, useState } from "react";
import {
  BorderReading,
  Borders,
  messageFor,
  readBorders,
} from "@/lib/concepts/filters-and-edges";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Failure,
  MapPanel,
  PANEL_CLASS,
  PixelMap,
  Stat,
  short,
} from "./filtersAndEdgesShared";

export function BorderRuleGallery() {
  const [borders, setBorders] = useState<Borders | null>(null);
  const [chosen, setChosen] = useState("extend");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBorders(await readBorders());
        setMessage(null);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  const reading: BorderReading | null =
    borders?.readings.find((one) => one.edge_rule === chosen) ??
    borders?.readings[0] ??
    null;

  return (
    <div className={PANEL_CLASS}>
      <div className="flex flex-wrap items-center gap-1 pb-3 text-xs text-slate-600 dark:text-slate-300">
        what is read outside the frame
        {(borders?.readings ?? []).map((one) => (
          <button
            key={one.edge_rule}
            onClick={() => setChosen(one.edge_rule)}
            className={
              one.edge_rule === chosen ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
            }
          >
            {one.label}
          </button>
        ))}
      </div>

      {borders && reading ? (
        <>
          <div className="flex flex-wrap justify-center gap-5">
            <MapPanel
              title="the picture"
              scale="brightness"
              low="0"
              high="1"
              note="one edge, between columns two and three"
              width="w-36"
            >
              <PixelMap
                rows={borders.picture}
                scale="brightness"
                largest={1}
                gridLines
              />
            </MapPanel>
            <MapPanel
              title="a flat average"
              scale="brightness"
              low="0"
              high="1"
              note="what the rule put outside, seen as a brightness"
              width="w-36"
            >
              <PixelMap
                rows={reading.averaged}
                scale="brightness"
                largest={1}
                gridLines
              />
            </MapPanel>
            <MapPanel
              title="how sharp the change is"
              scale="magnitude"
              low="0"
              high="4"
              note={
                reading.invented_at.length === 0
                  ? "no change reported anywhere but the real edge"
                  : `a change as sharp as the real edge is reported at ${reading.invented_at.length === 1 ? "column" : "columns"} ${reading.invented_at.join(" and ")}, and the picture holds none there`
              }
              width="w-36"
            >
              <PixelMap
                rows={reading.magnitude}
                scale="magnitude"
                largest={4}
                gridLines
                markers={reading.invented_at.map((column) => ({
                  row: 0,
                  column,
                  colour: "rgb(248, 113, 113)",
                }))}
              />
            </MapPanel>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="py-1 pr-3 font-medium">Middle row</th>
                  {reading.magnitude_middle_row.map((_, column) => (
                    <th key={column} className="py-1 pr-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-1 pr-3">average</td>
                  {reading.averaged_middle_row.map((value, column) => (
                    <td key={column} className="py-1 pr-3">
                      {short(value)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1 pr-3">sharpness</td>
                  {reading.magnitude_middle_row.map((value, column) => (
                    <td
                      key={column}
                      className={
                        "py-1 pr-3 " +
                        (reading.invented_at.includes(column)
                          ? "font-semibold text-red-600 dark:text-red-400"
                          : "")
                      }
                    >
                      {short(value)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="Answer size"
              value={`${reading.answer_height} by ${reading.answer_width}`}
            />
            <Stat
              label="Edges reported"
              value={String(2 + reading.invented_at.length)}
            />
            <Stat
              label="Edges the picture holds"
              value="1, spread over two columns"
            />
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
            {reading.note}
          </p>
        </>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}

      <Failure message={message} />
    </div>
  );
}
