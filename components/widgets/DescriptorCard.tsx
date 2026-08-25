"use client";

// One corner's patch taken all the way to a description, and compared.
//
// The three number grids are the twenty-five brightnesses as they were read,
// the same with the patch's own mean taken out, and that divided by its own
// length. Every number is small enough to check by hand, and the two steps are
// the whole of what the description holds still under. The bars underneath are
// distances to seven other descriptions, on a scale that runs from zero for an
// identical description to two for its exact opposite. The API cuts the patch,
// normalises it and measures every distance.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  DescriptorReport,
  fetchDescriptor,
} from "@/lib/concepts/keypoints-and-descriptors";
import {
  AGREES,
  CORNER,
  Caption,
  NumberGrid,
  PixelGrid,
  Stat,
  WINDOW,
  greyShade,
} from "./keypointDrawing";

const SCALE_TOP = 2;

function shortened(distance: number): string {
  if (distance === 0) return "0";
  if (distance < 1e-6) return distance.toExponential(1).replace("e-", " × 10⁻");
  return distance.toFixed(6);
}

export function DescriptorCard({
  show = "patch",
}: {
  show?: "patch" | "distances";
}) {
  const [report, setReport] = useState<DescriptorReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchDescriptor());
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

  if (show === "distances") {
    return (
      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="space-y-2">
          {report.comparisons.map((comparison) => (
            <div key={comparison.name} className="flex items-center gap-3">
              <span className="w-56 shrink-0 text-xs text-slate-600 dark:text-slate-400">
                {comparison.name}
              </span>
              <span className="flex h-4 flex-1 items-center rounded-sm bg-slate-100 dark:bg-slate-800">
                <span
                  className="h-4 rounded-sm"
                  style={{
                    width: `${Math.max(0.6, (100 * comparison.distance) / SCALE_TOP)}%`,
                    backgroundColor:
                      comparison.distance < 1e-6 ? AGREES : CORNER,
                  }}
                />
              </span>
              <span className="w-24 shrink-0 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                {shortened(comparison.distance)}
              </span>
            </div>
          ))}
        </div>
        <Caption>
          the bar runs from nothing at a distance of zero to the full width at
          two, which is as far apart as two descriptions can be
        </Caption>
      </div>
    );
  }

  const half = Math.floor(report.side / 2);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
        <div>
          <PixelGrid
            rows={report.picture}
            shade={greyShade(0, 1)}
            cell={7}
            boxes={[
              {
                row: report.row - half,
                column: report.column - half,
                height: report.side,
                width: report.side,
                colour: WINDOW,
              },
            ]}
          />
          <Caption>
            the patch, at row {report.row} and column {report.column}
          </Caption>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              as read
            </p>
            <NumberGrid rows={report.raw} places={2} />
            <Caption>mean {report.patch_mean}</Caption>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              with the mean taken out
            </p>
            <NumberGrid rows={report.centred} places={2} />
            <Caption>length {report.centred_length}</Caption>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              divided by that length
            </p>
            <NumberGrid rows={report.unit} places={3} />
            <Caption>this is the description</Caption>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="numbers in the description" value={`${report.side * report.side}`} />
        <Stat label="mean of the patch" value={report.patch_mean.toFixed(2)} />
        <Stat label="length after centring" value={report.centred_length.toFixed(2)} />
        <Stat
          label="moved by a shift of the picture"
          value={report.shifted_positions_agree ? "not at all" : "yes"}
        />
      </div>
    </div>
  );
}
