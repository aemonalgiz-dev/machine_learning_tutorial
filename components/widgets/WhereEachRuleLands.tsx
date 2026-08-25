"use client";

// One scene, one template, three rules, three boxes.
//
// This is the picture the whole page is built around, so it draws the three
// answers on top of each other rather than one at a time: the same pixels
// produced three different winners, and only one of them is a place the cross
// actually is. Reading it as three separate drawings would let a reader suspect
// the scenes had differed.
//
// The three copies of the motif are ringed faintly underneath, so a box that
// misses them all is visible as a miss. The API searches and scores; the
// browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SceneName,
  SearchResponse,
  searchScene,
} from "@/lib/concepts/template-matching";
import {
  GreyScaleKey,
  Mark,
  MarkColour,
  PicturePlot,
  Swatch,
} from "./templateMatchingPictures";

const RULE_COLOURS: MarkColour[] = ["amber", "rose", "emerald"];

export function WhereEachRuleLands({
  scene = "workbench",
}: {
  scene?: SceneName;
}) {
  const [body, setBody] = useState<SearchResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBody(await searchScene(scene));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [scene]);

  if (!body) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const [templateHeight, templateWidth] = [
    body.template.height,
    body.template.width,
  ];

  const marks: Mark[] = body.motif_positions.map(([row, column]) => ({
    row,
    column,
    height: templateHeight,
    width: templateWidth,
    colour: "sky" as const,
    dashed: true,
  }));
  body.results.forEach((result, index) => {
    marks.push({
      row: result.best.row,
      column: result.best.column,
      height: templateHeight,
      width: templateWidth,
      colour: RULE_COLOURS[index],
      label: result.rule,
    });
  });

  return (
    <div>
      <div className="flex flex-wrap items-start gap-6">
        <div>
          <PicturePlot grid={body.scene} marks={marks} cell={9} title={body.scene_title} />
          <GreyScaleKey grid={body.scene} />
        </div>
        <div className="min-w-[15rem] flex-1">
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Swatch colour="sky" /> the three places the cross really is
          </p>
          <ul className="mt-3 space-y-3">
            {body.results.map((result, index) => {
              const landedOnACopy = body.motif_positions.some(
                ([row, column]) =>
                  row === result.best.row && column === result.best.column,
              );
              return (
                <li key={result.rule} className="text-sm">
                  <p className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <Swatch colour={RULE_COLOURS[index]} />
                    {result.rule}
                  </p>
                  <p className="ml-5 font-mono text-xs text-slate-600 dark:text-slate-400">
                    row {result.best.row}, column {result.best.column}, scoring{" "}
                    {result.best.score.toFixed(4)}
                  </p>
                  <p
                    className={`ml-5 text-xs ${
                      landedOnACopy
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {landedOnACopy
                      ? "which is one of the three copies"
                      : "which holds no cross at all"}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
