"use client";

// What a convolution costs, beside the two layers that would answer the same.
//
// Four sliders describe a picture and a kernel bank, the side of the picture,
// how many channels it has, how many filters sweep it and how wide each one
// is. The three bars are parameter counts. The convolution's, a layer that
// kept the window but shared nothing, and the dense layer of equal width.
// They are drawn on a log scale because at the library's own 28 by 28
// example the first is eighty and the last is over four million. Every count
// comes from the API, which builds the layer and reads its shape. The browser
// sets the sliders and scales the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ParameterCount, countParameters } from "@/lib/concepts/convolution";

const MIN_SIDE = 4;
const MAX_SIDE = 32;
const MAX_CHANNELS = 3;
const MAX_FILTERS = 16;
const MAX_KERNEL = 7;

// The library's own example, one 28 by 28 picture through eight filters of
// three by three, which is the 53,066 the page quotes.
const DEFAULT_SIDE = 28;
const DEFAULT_CHANNELS = 1;
const DEFAULT_FILTERS = 8;
const DEFAULT_KERNEL = 3;

const FULL_BAR = 100;

function barShare(count: number, largest: number): number {
  if (largest <= 1) return FULL_BAR;
  return (FULL_BAR * Math.log10(count)) / Math.log10(largest);
}

export function ConvolutionParameterCount() {
  const [side, setSide] = useState(DEFAULT_SIDE);
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [kernelSize, setKernelSize] = useState(DEFAULT_KERNEL);
  const [count, setCount] = useState<ParameterCount | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setCount(
          await countParameters({
            channels,
            side,
            n_filters: filters,
            kernel_size: kernelSize,
            stride: 1,
            padding: 0,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [side, channels, filters, kernelSize]);

  const largest = count
    ? Math.max(count.convolution, count.unshared, count.dense)
    : 1;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Slider
          label="picture side"
          value={side}
          min={MIN_SIDE}
          max={MAX_SIDE}
          onChange={setSide}
        />
        <Slider
          label="channels"
          value={channels}
          min={1}
          max={MAX_CHANNELS}
          onChange={setChannels}
        />
        <Slider
          label="filters"
          value={filters}
          min={1}
          max={MAX_FILTERS}
          onChange={setFilters}
        />
        <Slider
          label="kernel side"
          value={kernelSize}
          min={1}
          max={MAX_KERNEL}
          onChange={setKernelSize}
        />
      </div>

      <div className="mt-4 space-y-2">
        <Bar
          label="convolution"
          count={count?.convolution ?? null}
          share={count ? barShare(count.convolution, largest) : 0}
          fill="bg-indigo-600"
        />
        <Bar
          label="window, nothing shared"
          count={count?.unshared ?? null}
          share={count ? barShare(count.unshared, largest) : 0}
          fill="bg-emerald-500"
        />
        <Bar
          label="dense layer, equal width"
          count={count?.dense ?? null}
          share={count ? barShare(count.dense, largest) : 0}
          fill="bg-amber-500"
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {count
          ? `Reads (${count.reads.join(", ")}), answers (${count.answers.join(", ")}). The dense layer holds ${count.ratio.toLocaleString("en-US", { maximumFractionDigits: 1 })} times what the convolution does. The bars are on a log scale.`
          : "…"}
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="w-24">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="flex-1 accent-indigo-600"
      />
      <span className="w-6 text-right font-mono text-sm">{value}</span>
    </label>
  );
}

function Bar({
  label,
  count,
  share,
  fill,
}: {
  label: string;
  count: number | null;
  share: number;
  fill: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
      <span className="w-44 shrink-0">{label}</span>
      <div className="h-4 flex-1 rounded-sm bg-slate-200 dark:bg-slate-800">
        <div
          className={"h-4 rounded-sm " + fill}
          style={{ width: `${Math.max(2, share).toFixed(1)}%` }}
        />
      </div>
      <span className="w-24 text-right font-mono">
        {count === null ? "…" : count.toLocaleString("en-US")}
      </span>
    </div>
  );
}
