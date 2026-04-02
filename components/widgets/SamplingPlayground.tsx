"use client";

// Draw people from a population you cannot see, and watch its shape emerge.
//
// Each press measures more people from an imagined population whose true mean
// height is 170 cm with a standard deviation of 7 cm. The bars pile the
// measurements into bins, the solid line marks the sample mean where it
// currently stands, the dashed line marks the true mean underneath, and the
// curve is the bell itself, scaled to the people drawn so far, so the bars
// can be watched filling it. The widget starts with a seeded sample of forty
// already measured, and starting over returns to that same forty. The draws,
// the binning and the curve all happen in the API, not the browser.

import { useEffect, useState } from "react";
import { ApiError, SampleDraw, drawSample } from "@/lib/api";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 16, right: 16, top: 16, bottom: 40 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const MAX_SAMPLES = 500;

// The widget loads with this many people already measured, from a fixed seed
// so every visitor starts at the same lumpy pile.
const INITIAL_DRAW = 40;
const INITIAL_SEED = 7;

function statusText(sample: SampleDraw | null): string {
  if (!sample || sample.count === 0) {
    return "Measuring the first people now.";
  }
  if (sample.count < 10) {
    return "A handful of people. The mean is still at the mercy of whoever happened to be drawn.";
  }
  if (sample.count < 100) {
    return "The pile is taking shape, and the sample mean has stopped swinging so widely.";
  }
  return "With this many people the bell is unmistakable, and the sample mean sits close by the true one.";
}

export function SamplingPlayground() {
  const [sample, setSample] = useState<SampleDraw | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const draw = async (count: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const seed = Math.floor(Math.random() * 1_000_000_000);
      setSample(await drawSample(sample?.values ?? [], count, seed));
      setMessage(null);
    } catch (error) {
      if (error instanceof ApiError) setMessage(error.message);
      else setMessage("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // An empty widget refills itself with the seeded starting sample, both on
  // first load and after a press of start over.
  useEffect(() => {
    if (sample !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const starting = await drawSample([], INITIAL_DRAW, INITIAL_SEED);
        if (!cancelled) setSample(starting);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sample]);

  const reset = () => {
    setSample(null);
    setMessage(null);
  };

  const atCapacity = (sample?.count ?? 0) >= MAX_SAMPLES;
  const tallest = sample
    ? Math.max(
        1,
        ...sample.bins.map((bin) => bin.count),
        ...sample.bell.map((point) => point.expected_count),
      )
    : 1;

  const binX = (value: number) => {
    if (!sample) return PAD.left;
    const first = sample.bins[0].start;
    const last = sample.bins[sample.bins.length - 1].end;
    return PAD.left + ((value - first) / (last - first)) * PLOT.width;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Button onClick={() => draw(1)} disabled={busy || atCapacity}>
          Draw 1
        </Button>
        <Button onClick={() => draw(10)} disabled={busy || atCapacity}>
          Draw 10
        </Button>
        <Button onClick={() => draw(100)} disabled={busy || atCapacity}>
          Draw 100
        </Button>
        <Button onClick={reset} disabled={busy}>
          Start over
        </Button>
        {atCapacity && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            This demo holds at most {MAX_SAMPLES} people. Start over to keep
            drawing.
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {sample &&
          sample.bins.map((bin, index) => {
            const left = binX(bin.start);
            const right = binX(bin.end);
            const height = (bin.count / tallest) * (PLOT.height - 10);
            return (
              <rect
                key={index}
                x={left + 1}
                y={PAD.top + PLOT.height - height}
                width={right - left - 2}
                height={height}
                className="fill-indigo-400/70 dark:fill-indigo-600/70"
              />
            );
          })}

        {/* the bell itself, scaled by the API to the current head count */}
        {sample && sample.count > 0 && (
          <polyline
            points={sample.bell
              .map((point) => {
                const bellX = binX(point.x);
                const bellY =
                  PAD.top +
                  PLOT.height -
                  (point.expected_count / tallest) * (PLOT.height - 10);
                return `${bellX},${bellY}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-rose-500"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}

        {/* the true mean underneath, and the sample mean so far */}
        {sample && sample.count > 0 && (
          <>
            <line
              x1={binX(sample.true_mean)}
              y1={PAD.top}
              x2={binX(sample.true_mean)}
              y2={PAD.top + PLOT.height}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <line
              x1={binX(sample.mean)}
              y1={PAD.top}
              x2={binX(sample.mean)}
              y2={PAD.top + PLOT.height}
              stroke="currentColor"
              className="text-amber-500"
              strokeWidth={2}
            />
          </>
        )}

        {/* axis labels along the bottom */}
        {sample &&
          sample.bins
            .filter((_, index) => index % 4 === 0)
            .map((bin) => (
              <text
                key={bin.start}
                x={binX(bin.start)}
                y={VIEW.height - 20}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {bin.start}
              </text>
            ))}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height (cm)
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The dashed line is the true mean and the solid line is the mean of
        the people drawn so far. The curve is the bell itself, sized to the
        current head count, waiting for the bars to fill it.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="People drawn" value={sample ? String(sample.count) : "0"} />
        <Stat
          label="Sample mean"
          value={sample && sample.count > 0 ? sample.mean.toFixed(2) : "…"}
        />
        <Stat
          label="Sample SD"
          value={
            sample && sample.count > 1
              ? sample.standard_deviation.toFixed(2)
              : "…"
          }
        />
        <Stat
          label="True mean and SD"
          value={sample ? `${sample.true_mean} and ${sample.true_standard_deviation}` : "170 and 7"}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(sample)}
      </p>
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
