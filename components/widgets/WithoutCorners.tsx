"use client";

// The picture this method has nothing to say about, beside what does.
//
// Two photographs of a horizon, the second taken with the camera three rows
// lower. There is no corner anywhere in either, so the score is exactly zero at
// every pixel and nothing is kept; describing every position instead still
// finds the move, for every position whose window straddles the edge. The API
// scores both pictures and runs both routes.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  WithoutCorners as WithoutCornersReport,
  fetchWithoutCorners,
} from "@/lib/concepts/keypoints-and-descriptors";
import { Caption, PixelGrid, Stat, greyShade } from "./keypointDrawing";

export function WithoutCorners() {
  const [report, setReport] = useState<WithoutCornersReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchWithoutCorners());
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

  return (
    <div>
      <div className="mx-auto grid max-w-md gap-4 sm:grid-cols-2">
        <div>
          <PixelGrid rows={report.first_picture} shade={greyShade(0, 1)} cell={8} />
          <Caption>the first photograph</Caption>
        </div>
        <div>
          <PixelGrid rows={report.second_picture} shade={greyShade(0, 1)} cell={8} />
          <Caption>
            the second, taken {report.shift_rows} rows lower
          </Caption>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="strongest score anywhere" value={report.score_high.toFixed(1)} />
        <Stat label="places kept" value={`${report.n_keypoints}`} />
        <Stat
          label="positions a patch fits at"
          value={`${report.n_positions}`}
        />
        <Stat
          label="of those, flat and alike"
          value={`${report.n_flat_positions}`}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="positions straddling the edge"
          value={`${report.n_informative_positions}`}
        />
        <Stat
          label="of those, finding their partner"
          value={`${report.n_recovering_the_shift}`}
        />
        <Stat
          label="furthest a true partner sat"
          value={report.furthest_true_partner.toFixed(1)}
        />
        <Stat label="the move, in rows" value={`${report.shift_rows}`} />
      </div>
      <Caption>
        the top row is what this method answers on a horizon, and the bottom row
        what comparing every position answers on the same pair
      </Caption>
    </div>
  );
}
