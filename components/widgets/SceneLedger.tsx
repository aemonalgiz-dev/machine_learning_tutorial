"use client";

// What the shared scene does when the lamp is turned up and when the picture is
// turned, what the whole run of matches came to, and what describing all of it
// instead would have cost.
//
// Three views over one report. The lighting view is the claim that the places
// belong to the scene and the descriptions belong to the frame, in four
// numbers. The stray view is the six matches the ratio test kept and should
// not have, with their distances written out in full because the whole of what
// went wrong is that both of them are rounding. The cost view is the count of
// positions against the count of places. The API measures all of it.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SceneReport,
  fetchSceneReport,
} from "@/lib/concepts/keypoints-and-descriptors";
import { AGREES, Caption, MARK, Stat } from "./keypointDrawing";

function exponent(value: number): string {
  return value.toExponential(3).replace("e-", " × 10⁻");
}

export function SceneLedger({
  show = "lighting",
}: {
  show?: "lighting" | "strays" | "cost";
}) {
  const [report, setReport] = useState<SceneReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchSceneReport());
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

  if (show === "lighting") {
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="every score, times"
            value={report.score_ratio.toFixed(2)}
          />
          <Stat
            label="furthest a description moved"
            value={exponent(report.relit_descriptor_gap)}
          />
          <Stat
            label="places after a quarter turn"
            value={`${report.n_turned_keypoints} of ${report.n_keypoints}`}
          />
          <Stat
            label="all of them where the map says"
            value={report.turned_positions_agree ? "yes" : "no"}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="nearest description after the turn"
            value={report.turned_gap_low.toFixed(6)}
          />
          <Stat
            label="furthest description after the turn"
            value={report.turned_gap_high.toFixed(6)}
          />
          <Stat
            label="the lamp, times"
            value={report.lighting_scale.toFixed(1)}
          />
          <Stat
            label="strongest score, relit"
            value={report.relit_score_high.toFixed(4)}
          />
        </div>
        <Caption>
          the top row is the lamp turned up, the bottom row the picture turned a
          quarter circle. One of the two leaves the descriptions alone.
        </Caption>
      </div>
    );
  }

  if (show === "cost") {
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="positions a patch fits at"
            value={`${report.n_positions}`}
          />
          <Stat label="places kept" value={`${report.n_keypoints}`} />
          <Stat
            label="numbers, describing everything"
            value={report.dense_numbers.toLocaleString("en-GB")}
          />
          <Stat
            label="numbers, describing the places"
            value={report.sparse_numbers.toLocaleString("en-GB")}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="comparisons, everything"
            value={report.dense_pairs.toLocaleString("en-GB")}
          />
          <Stat
            label="comparisons, the places"
            value={report.sparse_pairs.toLocaleString("en-GB")}
          />
          <Stat
            label="seconds, everything"
            value={report.dense_seconds.toFixed(3)}
          />
          <Stat
            label="seconds, the places"
            value={report.sparse_seconds.toFixed(5)}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="descriptions that are distinct"
            value={`${report.distinct_descriptions}`}
          />
          <Stat
            label="positions sharing theirs"
            value={`${report.n_sharing_a_description}`}
          />
          <Stat
            label="largest group that agree exactly"
            value={`${report.largest_identical_group}`}
          />
          <Stat
            label="share that cannot be told apart"
            value={`${Math.round(
              (100 * report.n_sharing_a_description) / report.n_positions,
            )}%`}
          />
        </div>
        <Caption>
          the two timings were measured when this page loaded and will differ
          from machine to machine; the counts will not
        </Caption>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="places asked about" value={`${report.n_matches}`} />
        <Stat label="matches kept" value={`${report.n_kept}`} />
        <Stat
          label="refused, all on a repeated cross"
          value={`${report.n_refused_on_the_repeated_motif} of ${report.n_refused}`}
        />
        <Stat
          label="kept and in the right place"
          value={`${report.n_on_the_same_position}`}
        />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["from", "landed on", "winner", "runner-up", "ratio"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="py-1.5 pr-4 text-xs font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {report.strays.map((stray, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {stray.from_row}, {stray.from_column}
                </td>
                <td
                  className="py-1.5 pr-4 font-mono text-xs"
                  style={{ color: MARK }}
                >
                  {stray.to_row}, {stray.to_column}
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {exponent(stray.distance)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {exponent(stray.runner_up_distance)}
                </td>
                <td
                  className="py-1.5 pr-4 font-mono text-xs"
                  style={{ color: stray.ratio < 0.8 ? MARK : AGREES }}
                >
                  {stray.ratio.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption>
        six matches that passed the test and landed on a different cross from
        the one they came from. Both distances are at the level of rounding, so
        the ratio between them is a ratio of two rounding errors.
      </Caption>
    </div>
  );
}
