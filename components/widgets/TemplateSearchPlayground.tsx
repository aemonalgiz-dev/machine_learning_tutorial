"use client";

// The whole search, on one scene, under whichever rule the reader picks.
//
// Left is the scene with the winning position boxed and the three places the
// motif actually sits ringed faintly, so a wrong answer is visible as a box in
// the wrong place rather than as a pair of numbers. Right is the score surface,
// which is one number per position drawn as a picture of its own, so the shape
// of a rule's opinion is visible: a real match is a bright point on dark ground,
// and a rule that has been fooled by the lighting is a smooth wash with its peak
// wherever the picture happened to be brightest.
//
// Switching the lamp is the control. The three scenes are the same drawing under
// three lightings, so a change in the answer is a change the light made and
// nothing else. The API searches and scores; the browser draws.

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
  PicturePlot,
  Stat,
  Swatch,
} from "./templateMatchingPictures";

const SCENES: { name: SceneName; label: string }[] = [
  { name: "workbench", label: "The workbench" },
  { name: "unlit", label: "Ramp taken away" },
  { name: "relit", label: "Brighter lamp" },
];

export function TemplateSearchPlayground({
  initialScene = "workbench",
  initialRule = 2,
  showSurface = true,
  showScenes = true,
}: {
  initialScene?: SceneName;
  initialRule?: number;
  showSurface?: boolean;
  showScenes?: boolean;
}) {
  const [scene, setScene] = useState<SceneName>(initialScene);
  const [rule, setRule] = useState(initialRule);
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

  const result = body.results[rule];
  const [templateHeight, templateWidth] = [
    body.template.height,
    body.template.width,
  ];
  const foundAMotif = body.motif_positions.some(
    ([row, column]) => row === result.best.row && column === result.best.column,
  );

  const marks: Mark[] = body.motif_positions.map(([row, column]) => ({
    row,
    column,
    height: templateHeight,
    width: templateWidth,
    colour: "sky" as const,
    dashed: true,
    label: "a copy",
  }));
  marks.push({
    row: result.best.row,
    column: result.best.column,
    height: templateHeight,
    width: templateWidth,
    colour: foundAMotif ? "emerald" : "rose",
    label: "reported",
  });

  const surfaceMarks: Mark[] = [
    {
      row: result.best.row,
      column: result.best.column,
      height: 1,
      width: 1,
      colour: foundAMotif ? "emerald" : "rose",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        {showScenes && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Lighting</span>
            {SCENES.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setScene(option.name)}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  scene === option.name
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400">Scored by</span>
          {body.results.map((option, index) => (
            <button
              key={option.rule}
              type="button"
              onClick={() => setRule(index)}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                rule === index
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {option.rule}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-6">
        <div>
          <PicturePlot grid={body.scene} marks={marks} cell={8} title={body.scene_title} />
          <GreyScaleKey grid={body.scene} />
        </div>
        {showSurface && (
          <div>
            <PicturePlot
              grid={result.surface}
              marks={surfaceMarks}
              cell={8}
              title="What every position scored"
            />
            <GreyScaleKey
              grid={result.surface}
              darkLabel="the lowest score,"
              brightLabel="the highest,"
              digits={4}
            />
          </div>
        )}
        <div className="w-40 shrink-0">
          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            What is being looked for
          </p>
          <PicturePlot grid={body.template} cell={14} />
          <div className="mt-3 space-y-2 text-xs">
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Swatch colour="sky" /> where a copy really is
            </p>
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Swatch colour={foundAMotif ? "emerald" : "rose"} /> where the
              search says it is
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Best position"
          value={`row ${result.best.row}, column ${result.best.column}`}
          tone={foundAMotif ? "good" : "bad"}
        />
        <Stat label="Its score" value={result.best.score.toFixed(4)} />
        <Stat
          label="An exact copy scores"
          value={result.perfect_score.toFixed(4)}
        />
        <Stat
          label="Which way it runs"
          value={
            result.higher_is_better ? "higher is better" : "lower is better"
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {body.motif_positions.map(([row, column], index) => (
          <Stat
            key={`${row}-${column}`}
            label={`Copy at ${row}, ${column}`}
            value={result.at_the_motifs[index].score.toFixed(4)}
          />
        ))}
        {result.believability && (
          <Stat
            label="Stands clear by"
            value={`${result.believability.ratio.toFixed(4)}${
              result.believability.believable ? "" : ", not enough"
            }`}
            tone={result.believability.believable ? "good" : "bad"}
          />
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
        {body.n_positions.toLocaleString()} positions tried,{" "}
        {body.n_pixels_read.toLocaleString()} pixels read.
      </p>
    </div>
  );
}
