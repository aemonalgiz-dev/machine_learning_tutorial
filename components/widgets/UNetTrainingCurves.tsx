"use client";

// Both arrangements trained from the same starting weights, epoch by epoch:
// the mean loss per pixel over each pass, and the mean overlap on the 240
// held-out pictures after it.
//
// The two share their way down, drawn from the same seed, so the only
// difference between the lines is whether the encoder's maps are joined on the
// way back up. The API trains both and records every epoch; the browser draws
// the lines.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { EpochReading, fetchUReport, SEEDS, UReport } from "@/lib/concepts/u-net";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
} from "@/components/widgets/filtersAndEdgesShared";
import { Loading } from "@/components/widgets/convolutionalNetworksShared";
import { fixed, WITH_SKIP_COLOUR, WITHOUT_SKIP_COLOUR } from "@/components/widgets/uNetShared";

const WIDTH = 300;
const HEIGHT = 150;
const LEFT = 32;
const BOTTOM = 20;

function Chart({
  title,
  series,
  read,
  top,
  ticks,
}: {
  title: string;
  series: { colour: string; history: EpochReading[] }[];
  read: (entry: EpochReading) => number;
  top: number;
  ticks: number[];
}) {
  const epochs = series[0].history.length;
  const x = (epoch: number) => LEFT + ((epoch - 1) / (epochs - 1)) * (WIDTH - LEFT - 6);
  const y = (value: number) => 6 + (1 - Math.min(value, top) / top) * (HEIGHT - BOTTOM - 6);
  return (
    <div className="min-w-[14rem] flex-1">
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">{title}</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={title}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={WIDTH - 6} y1={y(tick)} y2={y(tick)} stroke="rgb(148, 163, 184)" strokeOpacity={0.3} strokeWidth={0.6} />
            <text x={LEFT - 4} y={y(tick) + 3} textAnchor="end" className="fill-slate-500 text-[8px] dark:fill-slate-400">
              {tick}
            </text>
          </g>
        ))}
        {[1, 5, 10, 15, 20].filter((epoch) => epoch <= epochs).map((epoch) => (
          <text key={epoch} x={x(epoch)} y={HEIGHT - 6} textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-slate-400">
            {epoch}
          </text>
        ))}
        {series.map(({ colour, history }) => (
          <polyline
            key={colour}
            fill="none"
            stroke={colour}
            strokeWidth={1.6}
            points={history.map((entry) => `${x(entry.epoch)},${y(read(entry))}`).join(" ")}
          />
        ))}
      </svg>
    </div>
  );
}

export function UNetTrainingCurves() {
  const [seed, setSeed] = useState(0);
  const [pair, setPair] = useState<[UReport, UReport] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    Promise.all([fetchUReport(true, seed), fetchUReport(false, seed)])
      .then((answer) => {
        if (current) {
          setPair(answer);
          setMessage(null);
        }
      })
      .catch((error) => {
        if (current)
          setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, [seed]);

  if (!pair || pair[0].seed !== seed) return <Loading message={message} />;
  const [withSkip, without] = pair;
  const series = [
    { colour: WITH_SKIP_COLOUR, history: withSkip.history },
    { colour: WITHOUT_SKIP_COLOUR, history: without.history },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-600 dark:text-slate-400">weight seed:</span>
        {SEEDS.map((value) => (
          <button
            key={value}
            className={value === seed ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            onClick={() => setSeed(value)}
          >
            {value}
          </button>
        ))}
        <span className="ml-3 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-block h-0.5 w-4" style={{ backgroundColor: WITH_SKIP_COLOUR }} /> with the skip connections
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-block h-0.5 w-4" style={{ backgroundColor: WITHOUT_SKIP_COLOUR }} /> without them
        </span>
      </div>
      <div className="flex flex-wrap gap-4">
        <Chart
          title="mean overlap on the held-out pictures, after each epoch"
          series={series}
          read={(entry) => entry.held_out_overlap}
          top={1}
          ticks={[0, 0.25, 0.5, 0.75, 1]}
        />
        <Chart
          title="mean loss per pixel over each epoch"
          series={series}
          read={(entry) => entry.loss_per_pixel}
          top={0.4}
          ticks={[0, 0.1, 0.2, 0.3, 0.4]}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="overlap after epoch 20, with" value={fixed(withSkip.held_out.mean_overlap)} />
        <Stat label="overlap after epoch 20, without" value={fixed(without.held_out.mean_overlap)} />
        <Stat label="best overlap without, any epoch" value={fixed(Math.max(...without.history.map((entry) => entry.held_out_overlap)))} />
        <Stat label="training took, with and without" value={`${withSkip.seconds.toFixed(1)} s, ${without.seconds.toFixed(1)} s`} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Twenty passes over the 240 training pictures in shuffled batches of 16, at a step size of {withSkip.step_size}. The training times are for whichever machine answered and move from run to run.
      </p>
    </div>
  );
}
