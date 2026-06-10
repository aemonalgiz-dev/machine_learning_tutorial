"use client";

// How much of the raw answer the suppression throws away, and what the order
// of the border rule costs.
//
// The first view is the same picture asked for keypoints at five suppression
// radii, on the square whose four corners are known and on the shared scene.
// The second view draws one square three times: every corner it found, the
// answer when the border drops what is reported, and the answer when the
// border drops the candidates instead. The third drawing has the right number
// of rings, plausible strengths and every ring a pixel off. The API computes
// both orders; the browser draws the rings.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Suppression,
  fetchSuppression,
} from "@/lib/concepts/keypoints-and-descriptors";
import {
  AGREES,
  CORNER,
  Caption,
  MARK,
  PixelGrid,
  greyShade,
  scoreShade,
} from "./keypointDrawing";

function Sweep({
  title,
  candidates,
  steps,
}: {
  title: string;
  candidates: number;
  steps: { separation: number; n_keypoints: number }[];
}) {
  const widest = Math.max(candidates, 1);
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-slate-500 dark:text-slate-400">
            above the line
          </span>
          <span className="flex h-3.5 flex-1 items-center">
            <span
              className="h-3 rounded-sm"
              style={{ width: "100%", backgroundColor: MARK }}
            />
          </span>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
            {candidates}
          </span>
        </div>
        {steps.map((step) => (
          <div key={step.separation} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-slate-500 dark:text-slate-400">
              at least {step.separation} apart
            </span>
            <span className="flex h-3.5 flex-1 items-center">
              <span
                className="h-3 rounded-sm"
                style={{
                  width: `${Math.max(1, (100 * step.n_keypoints) / widest)}%`,
                  backgroundColor: CORNER,
                }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
              {step.n_keypoints}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SuppressionLadder({
  show = "separation",
}: {
  show?: "separation" | "border";
}) {
  const [report, setReport] = useState<Suppression | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchSuppression());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  if (show === "separation") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Sweep
          title="one bright square, four corners"
          candidates={report.square_candidates}
          steps={report.square_sweep}
        />
        <Sweep
          title="the workbench scene"
          candidates={report.scene_candidates}
          steps={report.scene_sweep}
        />
      </div>
    );
  }

  const panels = [
    {
      title: "no border at all",
      marks: report.without_border,
      colour: AGREES,
      note: "all four corners, each at 4.0",
    },
    {
      title: `a border of ${report.border}, dropping what is reported`,
      marks: report.in_order,
      colour: AGREES,
      note: "the one corner far enough inside, still at 4.0",
    },
    {
      title: `a border of ${report.border}, dropping the candidates first`,
      marks: report.out_of_order,
      colour: MARK,
      note: `four answers again, three of them a pixel off at ${report.shoulder_score.toFixed(4)}`,
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {panels.map((panel) => (
          <div key={panel.title}>
            <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {panel.title}
            </p>
            <PixelGrid
              rows={report.scores}
              shade={scoreShade(report.score_high)}
              cell={9}
              marks={panel.marks.map((point) => ({
                row: point.row,
                column: point.column,
                colour: panel.colour,
              }))}
              boxes={[
                {
                  row: report.border - 0.5,
                  column: report.border - 0.5,
                  height: report.height - 2 * report.border + 1,
                  width: report.width - 2 * report.border + 1,
                  colour: "#94a3b8",
                  dashed: true,
                },
              ]}
            />
            <Caption>{panel.note}</Caption>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-2 max-w-[220px]">
        <PixelGrid rows={report.picture} shade={greyShade(0, 1)} cell={9} />
        <Caption>
          the picture the three drawings score: a square whose top-left corner
          sits two pixels from the frame, so a border of {report.border} leaves
          three of its four corners out
        </Caption>
      </div>
    </div>
  );
}
