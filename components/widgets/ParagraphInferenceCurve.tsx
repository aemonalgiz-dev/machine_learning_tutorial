"use client";

// One held-out cooking text, given more and more passes.
//
// Two curves per architecture, how near the answer is to the cooking documents
// and how near it is to the sailing ones, against the number of passes on a
// logarithmic axis. The dashed line is the twenty passes the published work
// gives a new text. Under distributed memory the two curves have not yet
// crossed there. The API runs every descent; the browser draws the curves.

import { useEffect, useState } from "react";
import {
  ApiError,
  ArchitectureName,
  Curve,
  fetchInferenceCurve,
} from "@/lib/concepts/paragraph-vectors";
import {
  COOKING,
  Choice,
  Legend,
  SAILING,
  Stat,
  Waiting,
} from "./paragraphVectorsShared";

const VIEW = { width: 640, height: 260 };
const PAD = { left: 48, right: 20, top: 20, bottom: 46 };

export function ParagraphInferenceCurve() {
  const [curve, setCurve] = useState<Curve | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [architecture, setArchitecture] =
    useState<ArchitectureName>("distributed-memory");

  useEffect(() => {
    (async () => {
      try {
        setCurve(await fetchInferenceCurve());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!curve) return <Waiting message={message} />;

  const series =
    curve.series.find((entry) => entry.architecture === architecture) ??
    curve.series[0];
  const points = series.points;
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;

  const logs = points.map((point) => Math.log(point.passes));
  const lowest = Math.min(...logs);
  const highest = Math.max(...logs);
  const plotX = (passes: number) =>
    PAD.left + ((Math.log(passes) - lowest) / (highest - lowest)) * innerWidth;

  const top = 1;
  const bottom = Math.min(-0.4, Math.min(...points.map((point) => point.sailing)) - 0.1);
  const plotY = (value: number) =>
    PAD.top + (1 - (value - bottom) / (top - bottom)) * innerHeight;

  const cookingPath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${plotX(point.passes)},${plotY(point.cooking)}`,
    )
    .join(" ");
  const sailingPath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${plotX(point.passes)},${plotY(point.sailing)}`,
    )
    .join(" ");

  const published = points.find((point) => point.passes === curve.published_passes);
  const arrival = points.find((point) => point.leans_towards === "cooking");

  return (
    <div>
      <div className="mb-3">
        <Choice
          options={[
            { label: "distributed memory", value: "distributed-memory" as const },
            { label: "bag of words", value: "bag-of-words" as const },
          ]}
          value={architecture}
          onChange={setArchitecture}
        />
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          x2={PAD.left + innerWidth}
          y1={plotY(0)}
          y2={plotY(0)}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-300 dark:text-slate-700"
        />
        <line
          x1={plotX(curve.published_passes)}
          x2={plotX(curve.published_passes)}
          y1={PAD.top}
          y2={VIEW.height - PAD.bottom}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="4 3"
          className="text-slate-400 dark:text-slate-500"
        />
        <text
          x={plotX(curve.published_passes)}
          y={PAD.top - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          the published twenty
        </text>
        <path d={cookingPath} fill="none" stroke={COOKING} strokeWidth={2} />
        <path d={sailingPath} fill="none" stroke={SAILING} strokeWidth={2} />
        {points.map((point) => (
          <g key={point.passes}>
            <circle
              cx={plotX(point.passes)}
              cy={plotY(point.cooking)}
              r={3.5}
              fill={COOKING}
            />
            <circle
              cx={plotX(point.passes)}
              cy={plotY(point.sailing)}
              r={3.5}
              fill={SAILING}
            />
            <text
              x={plotX(point.passes)}
              y={VIEW.height - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {point.passes}
            </text>
          </g>
        ))}
        {[1, 0.5, 0, -0.5].map((tick) =>
          tick >= bottom ? (
            <text
              key={tick}
              x={PAD.left - 6}
              y={plotY(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          ) : null,
        )}
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          passes over the held-out text
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="at twenty, cooking"
          value={published ? published.cooking.toFixed(4) : "…"}
        />
        <Stat
          label="at twenty, sailing"
          value={published ? published.sailing.toFixed(4) : "…"}
        />
        <Stat
          label="first count that leans right"
          value={arrival ? String(arrival.passes) : "none"}
        />
        <Stat
          label="at four hundred, cooking"
          value={points[points.length - 1].cooking.toFixed(4)}
        />
      </div>

      <Legend>
        <span style={{ color: COOKING }}>Indigo</span> is how near the answer is
        to the fifteen cooking documents and{" "}
        <span style={{ color: SAILING }}>blue</span> to the fifteen sailing ones,
        and the text really is about cooking. Under distributed memory the two
        cross somewhere between twenty passes and fifty, so the dashed line falls
        on the wrong side of it. Under the bag of words indigo is above blue from
        the first pass, and past twenty it is the blue line that keeps improving
        while the indigo one gives ground.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
