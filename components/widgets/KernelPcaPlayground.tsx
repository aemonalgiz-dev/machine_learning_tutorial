"use client";

// A cloud of people, and the plane a kernel rearranges them into.
//
// The left panel is the cloud as measured, height across and weight up, and
// its people can be dragged. The right panel is the same people placed by
// their first two kernel components, the directions of most spread in a
// space the kernel only implies, and under the radial kernel the typical
// twelve of the ring land to one side of the twenty-four around them along
// the first of those directions. The buttons choose the cloud and the
// kernel, the slider sets the kernel's reach, and the toggle swaps the right
// panel for ordinary PCA's rotation of the same cloud, which keeps the ring
// nested whatever the kernel. The measured four are the PCA page's, whose
// every figure the page checks by hand. Every coordinate, eigenvalue,
// variance, share and coefficient is the library's through the API; the
// browser scales them to pixels and nothing more.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  KernelName,
  KernelPcaAnalysis,
  PlaneCoordinates,
  Point,
  analyzeThroughKernel,
} from "@/lib/concepts/kernel-pca";
import {
  ARC,
  ARC_GAMMA,
  GAMMA_STOPS,
  IDEAL_CASE,
  IDEAL_INNER_COUNT,
  INNER,
  INNER_COUNT,
  MEASURED_FOUR,
  OUTER,
  RING,
  RING_GAMMA,
  gammaIndex,
  heightShade,
  randomRing,
} from "./kernelPcaFixtures";

const PANEL = { width: 320, height: 320 };
const PAD = { left: 40, right: 14, top: 14, bottom: 36 };
const PLOT = {
  width: PANEL.width - PAD.left - PAD.right,
  height: PANEL.height - PAD.top - PAD.bottom,
};

// A little air around the furthest placed person, so nothing sits on the frame.
const REACH_MARGIN = 1.15;

type Cloud = "ring" | "arc" | "four" | "ideal" | "random";

// The measured plane keeps one scale on both axes, so a ring stays round, and
// the window is fixed per cloud so dragging a person never rescales the rest.
interface SquareWindow {
  centreX: number;
  centreY: number;
  half: number;
}

const WINDOWS: Record<Cloud, SquareWindow> = {
  ring: { centreX: 160, centreY: 60, half: 40 },
  arc: { centreX: 160, centreY: 56.5, half: 45 },
  four: { centreX: 170, centreY: 68, half: 15 },
  ideal: { centreX: 160, centreY: 60, half: 40 },
  random: { centreX: 160, centreY: 60, half: 40 },
};

const KERNELS: { key: KernelName; label: string }[] = [
  { key: "linear", label: "Linear" },
  { key: "polynomial", label: "Squared" },
  { key: "rbf", label: "Radial" },
];

function toPixel(x: number, y: number, frame: SquareWindow) {
  const px = PAD.left + ((x - frame.centreX) / (2 * frame.half) + 0.5) * PLOT.width;
  const py = PAD.top + (0.5 - (y - frame.centreY) / (2 * frame.half)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number, frame: SquareWindow): Point {
  const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
  const x = frame.centreX + ((px - PAD.left) / PLOT.width - 0.5) * 2 * frame.half;
  const y = frame.centreY + (0.5 - (py - PAD.top) / PLOT.height) * 2 * frame.half;
  return {
    x: Number(clamp(x, frame.centreX - frame.half, frame.centreX + frame.half).toFixed(1)),
    y: Number(clamp(y, frame.centreY - frame.half, frame.centreY + frame.half).toFixed(1)),
  };
}

// The component plane is centred at zero by construction, and its two axes
// carry different spreads, so each is scaled on its own.
function placedPixel(entry: PlaneCoordinates, placed: PlaneCoordinates[]) {
  const firstReach = Math.max(...placed.map((each) => Math.abs(each.first)), 1e-9) * REACH_MARGIN;
  const secondReach = Math.max(...placed.map((each) => Math.abs(each.second)), 1e-9) * REACH_MARGIN;
  const px = PAD.left + (entry.first / (2 * firstReach) + 0.5) * PLOT.width;
  const py = PAD.top + (0.5 - entry.second / (2 * secondReach)) * PLOT.height;
  return { px, py };
}

// Rounds for display and drops the sign a rounded-away negative would keep.
function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function KernelPcaPlayground() {
  const [cloud, setCloud] = useState<Cloud>("ring");
  const [points, setPoints] = useState<Point[]>(RING);
  const [innerCount, setInnerCount] = useState<number | null>(INNER_COUNT);
  const [kernel, setKernel] = useState<KernelName>("rbf");
  const [gammaStop, setGammaStop] = useState(gammaIndex(RING_GAMMA));
  const [showOrdinary, setShowOrdinary] = useState(false);
  const [answer, setAnswer] = useState<KernelPcaAnalysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const leftSvgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);
  const gamma = GAMMA_STOPS[gammaStop];

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await analyzeThroughKernel(points, kernel, gamma));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, kernel, gamma]);

  const frame = WINDOWS[cloud];

  const eventToData = useCallback(
    (clientX: number, clientY: number) => {
      const svg = leftSvgRef.current!;
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * PANEL.width;
      const py = ((clientY - rect.top) / rect.height) * PANEL.height;
      return toData(px, py, frame);
    },
    [frame],
  );

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    leftSvgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToData(event.clientX, event.clientY);
    const index = dragging.current;
    setPoints((current) => current.map((point, each) => (each === index ? moved : point)));
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const load = (next: Cloud) => {
    setCloud(next);
    if (next === "ring") {
      setPoints(RING);
      setInnerCount(INNER_COUNT);
      setKernel("rbf");
      setGammaStop(gammaIndex(RING_GAMMA));
    } else if (next === "arc") {
      setPoints(ARC);
      setInnerCount(null);
      setKernel("rbf");
      setGammaStop(gammaIndex(ARC_GAMMA));
    } else if (next === "four") {
      setPoints(MEASURED_FOUR);
      setInnerCount(null);
      setKernel("linear");
    } else if (next === "ideal") {
      setPoints(IDEAL_CASE);
      setInnerCount(IDEAL_INNER_COUNT);
      setKernel("rbf");
      setGammaStop(gammaIndex(RING_GAMMA));
    } else {
      const drawn = randomRing();
      setPoints(drawn.points);
      setInnerCount(drawn.innerCount);
      setKernel("rbf");
      setGammaStop(gammaIndex(RING_GAMMA));
    }
  };

  const fillFor = (index: number) => {
    if (innerCount !== null) return index < innerCount ? INNER : OUTER;
    if (cloud === "arc") return heightShade(points[index].x);
    return "#475569";
  };

  const rowLabel = (index: number) => (cloud === "four" ? String(index + 1) : null);

  const placed = answer ? (showOrdinary ? answer.ordinary.coordinates : answer.coordinates) : null;
  const first = answer?.components[0];
  const second = answer?.components[1];
  const divisor = answer ? answer.n_rows - 1 : null;

  const clouds: { key: Cloud; label: string }[] = [
    { key: "ring", label: "The ring" },
    { key: "arc", label: "The arc" },
    { key: "four", label: "The measured four" },
    { key: "ideal", label: "An Ideal Case" },
    { key: "random", label: "Random people" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {clouds.map((choice) => (
          <button key={choice.key} onClick={() => load(choice.key)} className={cloudButtonClass(cloud === choice.key)}>
            {choice.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {KERNELS.map((choice) => (
            <button
              key={choice.key}
              onClick={() => setKernel(choice.key)}
              className={
                "rounded px-2.5 py-1 text-sm font-medium transition " +
                (kernel === choice.key ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700")
              }
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          gamma
          <input
            type="range"
            min={0}
            max={GAMMA_STOPS.length - 1}
            step={1}
            value={gammaStop}
            disabled={kernel === "linear"}
            onChange={(event) => setGammaStop(Number(event.target.value))}
            className="w-40 accent-indigo-600 disabled:opacity-40"
          />
          <span className="w-16 font-mono text-sm">{gamma}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">reach {(1 / Math.sqrt(gamma)).toFixed(1)}</span>
        </label>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={showOrdinary} onChange={(event) => setShowOrdinary(event.target.checked)} className="accent-indigo-600" />
          Ordinary PCA on the right
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <svg
          ref={leftSvgRef}
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <Frame />
          {points.map((point, index) => {
            const { px, py } = toPixel(point.x, point.y, frame);
            return (
              <g key={index}>
                <circle cx={px} cy={py} r={5} fill={fillFor(index)} className="cursor-grab stroke-white dark:stroke-slate-900" strokeWidth={1.5} onPointerDown={onPointPointerDown(index)} />
                {rowLabel(index) && (
                  <text x={px + 8} y={py - 6} className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">
                    {rowLabel(index)}
                  </text>
                )}
              </g>
            );
          })}
          <AxisLabels horizontal="height, cm" vertical="weight, kg" />
        </svg>

        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <Frame />
          {placed && (
            <>
              <line x1={PAD.left} y1={PAD.top + PLOT.height / 2} x2={PAD.left + PLOT.width} y2={PAD.top + PLOT.height / 2} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={1} />
              <line x1={PAD.left + PLOT.width / 2} y1={PAD.top} x2={PAD.left + PLOT.width / 2} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={1} />
              {placed.map((entry, index) => {
                const { px, py } = placedPixel(entry, placed);
                return (
                  <g key={index}>
                    <circle cx={px} cy={py} r={5} fill={fillFor(index)} className="stroke-white dark:stroke-slate-900" strokeWidth={1.5} />
                    {rowLabel(index) && (
                      <text x={px + 8} y={py - 6} className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">
                        {rowLabel(index)}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}
          <AxisLabels horizontal={showOrdinary ? "component 1" : "kernel component 1"} vertical={showOrdinary ? "component 2" : "kernel component 2"} />
        </svg>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Left, the people as measured, every one draggable. Right, the same people placed by their first two directions. Indigo is the inner group and amber the outer; the arc is shaded by height; the numbers are the measured four. A sign on either axis is the solver&rsquo;s choice, not the data&rsquo;s.
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 font-normal">Direction</th>
              <th className="py-1 text-right font-normal">Raw eigenvalue</th>
              <th className="py-1 text-right font-normal">Over n &minus; 1{divisor !== null ? ` = ${divisor}` : ""}</th>
              <th className="py-1 text-right font-normal">Variance</th>
              <th className="py-1 text-right font-normal">Share</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-900 dark:text-slate-100">
            {[first, second].map((component, index) => (
              <tr key={index}>
                <td className="py-1 font-sans text-slate-700 dark:text-slate-300">{index === 0 ? "First" : "Second"}</td>
                <td className="py-1 text-right">{component ? tidy(component.raw_eigenvalue, 4) : "…"}</td>
                <td className="py-1 text-right">{component && divisor !== null ? tidy(component.raw_eigenvalue / divisor, 4) : "…"}</td>
                <td className="py-1 text-right">{component ? tidy(component.variance, 4) : "…"}</td>
                <td className="py-1 text-right">{component ? tidy(component.share, 3) : "…"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="People, n" value={answer ? String(answer.n_rows) : "…"} />
        <Stat label="Total variance" value={answer ? tidy(answer.total_variance, 4) : "…"} />
        <Stat label="Person 1's coefficient, first direction" value={first ? tidy(first.row_coefficients[0], 4) : "…"} />
        <Stat label="Person 1 along the first" value={answer ? tidy(answer.coordinates[0].first, 4) : "…"} />
      </div>

      {answer && answer.n_rows <= 8 && (
        <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Centred kernel row of person 1, one value per person</div>
          <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{answer.first_row_kernel_values.map((value) => tidy(value, 4)).join("   ")}</div>
        </div>
      )}

      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function cloudButtonClass(active: boolean): string {
  return (
    "rounded-md border px-3 py-1.5 text-sm font-medium transition " +
    (active
      ? "border-indigo-600 bg-indigo-600 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")
  );
}

function Frame() {
  return <rect x={PAD.left} y={PAD.top} width={PLOT.width} height={PLOT.height} fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth={1} />;
}

function AxisLabels({ horizontal, vertical }: { horizontal: string; vertical: string }) {
  return (
    <>
      <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 8} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
        {horizontal}
      </text>
      <text x={14} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`} className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
        {vertical}
      </text>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
