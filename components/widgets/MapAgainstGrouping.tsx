"use client";

// A chain with its reach switched off, beside the grouping method itself.
//
// Switch the reach off and only the winner ever moves, so the rule becomes an
// average of the people that cell has won, assembled one person at a time. The
// grouping method computes the same average in one jump, by assigning everyone
// and moving each centre onto its group's mean. The left panel is the first,
// the right is the second, and the squares and the crosses are what each of
// them settled on. The numbers underneath say whether the two put the same
// people together, which is the only comparison worth making, since nothing
// ever told either of them which group deserved which number. Slide the count
// of cells up and watch the agreement stop holding, because it was never a
// promise. The API runs both fits and compares the groupings; the browser
// draws them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  AgainstGrouping,
  compareWithGrouping,
} from "@/lib/concepts/self-organising-map";
import {
  CROWD,
  EPOCHS,
  SLIDER_LABEL_CLASS,
  STAT_CLASS,
  cellColour,
} from "./selfOrganisingMapFixtures";

const PANEL = { width: 310, height: 240 };
const PAD = 20;

export function MapAgainstGrouping({
  points = CROWD,
  initialCells = 3,
}: {
  points?: Point[];
  initialCells?: number;
}) {
  const [cells, setCells] = useState(initialCells);
  const [answer, setAnswer] = useState<AgainstGrouping | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await compareWithGrouping(points, cells, EPOCHS));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [points, cells]);

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const domain = {
    xMin: Math.min(...xs) - 10,
    xMax: Math.max(...xs) + 10,
    yMin: Math.min(...ys) - 10,
    yMax: Math.max(...ys) + 10,
  };
  const plot = (point: { x: number; y: number }) => ({
    px:
      PAD +
      ((point.x - domain.xMin) / (domain.xMax - domain.xMin)) *
        (PANEL.width - 2 * PAD),
    py:
      PAD +
      (1 - (point.y - domain.yMin) / (domain.yMax - domain.yMin)) *
        (PANEL.height - 2 * PAD),
  });

  return (
    <div>
      <label className={SLIDER_LABEL_CLASS + " pb-2"}>
        Cells, and groups
        <input
          type="range"
          min={2}
          max={6}
          step={1}
          value={cells}
          onChange={(event) => setCells(Number(event.target.value))}
          className="w-32 accent-indigo-600"
        />
        <span className="w-4 font-mono text-sm">{cells}</span>
      </label>

      {!answer ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
              <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                a chain with no reach
              </p>
              <svg
                viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
                className="w-full select-none rounded bg-slate-50 dark:bg-slate-950"
              >
                {points.map((person, index) => {
                  const at = plot(person);
                  return (
                    <circle
                      key={index}
                      cx={at.px}
                      cy={at.py}
                      r={5}
                      fill={cellColour(0, answer.map_labels[index], cells, 1)}
                      className="stroke-white dark:stroke-slate-900"
                      strokeWidth={1.5}
                    />
                  );
                })}
                {answer.map_units.map((cell, index) => {
                  const at = plot(cell);
                  return (
                    <rect
                      key={index}
                      x={at.px - 6}
                      y={at.py - 6}
                      width={12}
                      height={12}
                      fill={cellColour(0, index, cells, 1)}
                      stroke="currentColor"
                      className="text-slate-800 dark:text-slate-100"
                      strokeWidth={2}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
              <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                the grouping method
              </p>
              <svg
                viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
                className="w-full select-none rounded bg-slate-50 dark:bg-slate-950"
              >
                {points.map((person, index) => {
                  const at = plot(person);
                  return (
                    <circle
                      key={index}
                      cx={at.px}
                      cy={at.py}
                      r={5}
                      fill={cellColour(
                        0,
                        answer.kmeans_labels[index],
                        cells,
                        1,
                      )}
                      className="stroke-white dark:stroke-slate-900"
                      strokeWidth={1.5}
                    />
                  );
                })}
                {answer.kmeans_centres.map((centre, index) => {
                  const at = plot(centre);
                  return (
                    <g key={index}>
                      <line
                        x1={at.px - 7}
                        y1={at.py - 7}
                        x2={at.px + 7}
                        y2={at.py + 7}
                        stroke="currentColor"
                        className="text-slate-800 dark:text-slate-100"
                        strokeWidth={3}
                      />
                      <line
                        x1={at.px - 7}
                        y1={at.py + 7}
                        x2={at.px + 7}
                        y2={at.py - 7}
                        stroke="currentColor"
                        className="text-slate-800 dark:text-slate-100"
                        strokeWidth={3}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            The two panels colour the same people by their own labels, so a
            colour on the left need not be the colour on the right; what matters
            is whether the same people share one.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="same people together"
              value={answer.same_partition ? "yes" : "no"}
            />
            <Stat
              label="furthest prototype apart"
              value={answer.largest_prototype_gap.toFixed(4)}
            />
            <Stat
              label="the map describes"
              value={answer.map_quantisation_error.toFixed(4)}
            />
            <Stat
              label="the grouping describes"
              value={answer.kmeans_quantisation_error.toFixed(4)}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            {`Labels from the chain: ${answer.map_labels.join(" ")}. From the grouping method: ${answer.kmeans_labels.join(" ")}.`}
          </p>
        </>
      )}
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={STAT_CLASS}>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
