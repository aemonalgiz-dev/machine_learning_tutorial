"use client";

// The eigen answer and the local rule's answer, drawn over one cloud.
//
// The faint lines through the mean are the cloud's principal components as
// an eigensolver finds them, the PCA page's own picture. The bold lines are
// the directions a single unit obeying Oja's rule learned by reading the
// people one at a time, the first component's pair heavier and the second's
// thinner. Each is drawn both ways from the mean, because a direction and
// its negative are the same direction and the rule lands on either. The
// slider sets the epoch budget, and every move of it is a fresh fit from the
// same seed rather than a step of one fit, because the rate schedule is a
// fraction of the budget. The picture it makes is the bold line swinging
// into the faint one as the budget grows. Click to add people, drag them,
// double-click to remove. Every direction and every angle is the library's
// through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, HebbianLearning, Point, learnHebbianDirections } from "@/lib/api";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The four people whose deviation sums the PCA page works by hand, and whose
// first step of Oja's rule this page works by hand.
const WORKED_PEOPLE: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
];

// The classification pages' crowd with its labels stripped away.
const CROWD: Point[] = [
  { x: 147, y: 41 },
  { x: 156, y: 53 },
  { x: 145, y: 57 },
  { x: 159, y: 57 },
  { x: 162, y: 61 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 118, y: 24 },
  { x: 180, y: 80 },
  { x: 183, y: 83 },
  { x: 178, y: 78 },
];

// Fifteen people hugging one diagonal, the ideal case, nearly all of the
// spread carried by a single direction.
const IDEAL_CASE: Point[] = [
  { x: 152, y: 51 },
  { x: 155, y: 52 },
  { x: 158, y: 56.5 },
  { x: 161, y: 58.5 },
  { x: 164, y: 62 },
  { x: 167, y: 66 },
  { x: 170, y: 67 },
  { x: 173, y: 71.5 },
  { x: 176, y: 73.5 },
  { x: 179, y: 77 },
  { x: 182, y: 81 },
  { x: 185, y: 82 },
  { x: 188, y: 86.5 },
  { x: 191, y: 88.5 },
  { x: 194, y: 92 },
];

function randomPeople(): Point[] {
  const slope = 0.3 + Math.random() * 0.6;
  const intercept = -40 + (Math.random() - 0.5) * 12;
  return Array.from({ length: 15 }, (_, index) => {
    const x = 152 + index * 3;
    const noise = (Math.random() - 0.5) * 28;
    const y = Math.min(100, Math.max(40, slope * x + intercept + noise));
    return { x, y: Math.round(y * 10) / 10 };
  });
}

const MAX_POINTS = 100;

// The epoch budgets the slider steps through. Most of the swing happens in
// the first few dozen epochs, so the steps are dense there and sparse after.
const BUDGETS = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500];
const DEFAULT_BUDGET_INDEX = BUDGETS.indexOf(200);

// The least reach a pair of lines is drawn to, in data units, so a second
// direction carrying almost nothing still shows its angle.
const MIN_REACH = 8;
const HEAD_SIZE = 9;

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

interface Pixel {
  px: number;
  py: number;
}

function toPixel(point: Point): Pixel {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number): Point {
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high, Math.max(low, Math.round(value)));
  return {
    x: clamp(
      DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
      DOMAIN.xMin,
      DOMAIN.xMax,
    ),
    y: clamp(
      DOMAIN.yMin +
        (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin),
      DOMAIN.yMin,
      DOMAIN.yMax,
    ),
  };
}

// The triangle of an arrowhead whose tip sits at one end of a line and
// points away from the other. Drawing arithmetic only.
function arrowHead(tip: Pixel, tail: Pixel): string {
  const dx = tip.px - tail.px;
  const dy = tip.py - tail.py;
  const length = Math.hypot(dx, dy) || 1;
  const alongX = dx / length;
  const alongY = dy / length;
  const baseX = tip.px - alongX * HEAD_SIZE;
  const baseY = tip.py - alongY * HEAD_SIZE;
  const acrossX = -alongY * HEAD_SIZE * 0.5;
  const acrossY = alongX * HEAD_SIZE * 0.5;
  return `${tip.px},${tip.py} ${baseX + acrossX},${baseY + acrossY} ${baseX - acrossX},${baseY - acrossY}`;
}

interface DirectionLine {
  from: Pixel;
  to: Pixel;
}

// A line through the mean, the reach along the direction and back again.
function lineThrough(
  mean: Point,
  dx: number,
  dy: number,
  reach: number,
): DirectionLine {
  return {
    from: toPixel({ x: mean.x - reach * dx, y: mean.y - reach * dy }),
    to: toPixel({ x: mean.x + reach * dx, y: mean.y + reach * dy }),
  };
}

function DoubleArrow({
  line,
  colourClass,
  width,
  faint,
}: {
  line: DirectionLine;
  colourClass: string;
  width: number;
  faint: boolean;
}) {
  return (
    <g
      className={colourClass}
      opacity={faint ? 0.3 : 1}
      stroke="currentColor"
      fill="currentColor"
    >
      <line
        x1={line.from.px}
        y1={line.from.py}
        x2={line.to.px}
        y2={line.to.py}
        strokeWidth={width}
      />
      <polygon points={arrowHead(line.to, line.from)} strokeWidth={0} />
      <polygon points={arrowHead(line.from, line.to)} strokeWidth={0} />
    </g>
  );
}

export function HebbianPlayground() {
  const [points, setPoints] = useState<Point[]>(WORKED_PEOPLE);
  const [budgetIndex, setBudgetIndex] = useState(DEFAULT_BUDGET_INDEX);
  const [answer, setAnswer] = useState<HebbianLearning | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  const maxEpochs = BUDGETS[budgetIndex];

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await learnHebbianDirections(points, maxEpochs));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, maxEpochs]);

  const eventToData = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return toData(px, py);
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (points.length >= MAX_POINTS) return;
    const dropped = eventToData(event.clientX, event.clientY);
    setPoints((current) => [...current, dropped]);
    dragging.current = points.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToData(event.clientX, event.clientY);
    const index = dragging.current;
    setPoints((current) =>
      current.map((point, i) => (i === index ? moved : point)),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removePoint = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (points.length <= 2) return;
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  // Each pair is drawn to the reach of its eigen twin, scaled with the
  // standard deviation along it as the PCA page draws its own, so what
  // differs between the faint line and the bold one is only the angle.
  const pairFor = (componentIndex: number) => {
    if (!answer) return null;
    const twin = answer.eigen[componentIndex];
    const learned = answer.hebbian[componentIndex];
    if (!twin || !learned) return null;
    const reach = Math.max(MIN_REACH, 1.8 * Math.sqrt(twin.variance));
    return {
      eigen: lineThrough(answer.mean, twin.dx, twin.dy, reach),
      hebbian: lineThrough(answer.mean, learned.dx, learned.dy, reach),
    };
  };

  const firstPair = pairFor(0);
  const secondPair = pairFor(1);

  const sharesOf = (directions: { share: number }[]) =>
    directions.map((direction) => direction.share.toFixed(3)).join(" / ");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => setPoints(WORKED_PEOPLE)} className={BUTTON_CLASS}>
          The measured four
        </button>
        <button onClick={() => setPoints(IDEAL_CASE)} className={BUTTON_CLASS}>
          An Ideal Case
        </button>
        <button onClick={() => setPoints(randomPeople())} className={BUTTON_CLASS}>
          Random people
        </button>
        <button onClick={() => setPoints(CROWD)} className={BUTTON_CLASS}>
          The crowd, unlabelled
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Epochs
          <input
            type="range"
            min={0}
            max={BUDGETS.length - 1}
            step={1}
            value={budgetIndex}
            onChange={(event) => setBudgetIndex(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-8 font-mono text-sm">{maxEpochs}</span>
        </label>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* the eigensolver's directions, faint, through the mean */}
        {firstPair && (
          <DoubleArrow
            line={firstPair.eigen}
            colourClass="text-indigo-500"
            width={3}
            faint
          />
        )}
        {secondPair && (
          <DoubleArrow
            line={secondPair.eigen}
            colourClass="text-amber-500"
            width={2}
            faint
          />
        )}

        {/* the rule's directions, bold, through the same mean */}
        {firstPair && (
          <DoubleArrow
            line={firstPair.hebbian}
            colourClass="text-indigo-600 dark:text-indigo-400"
            width={4}
            faint={false}
          />
        )}
        {secondPair && (
          <DoubleArrow
            line={secondPair.hebbian}
            colourClass="text-amber-600 dark:text-amber-400"
            width={2.5}
            faint={false}
          />
        )}

        {/* the people */}
        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              className="cursor-grab fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
          );
        })}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height (cm)
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Weight (kg)
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Faint lines are the eigensolver&rsquo;s directions and bold lines the
        rule&rsquo;s, indigo for the first component and amber for the second,
        each drawn both ways because a direction and its negative are the same
        direction. Every position of the slider is a fresh fit, not a step of
        one.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Angle, first pair"
          value={answer ? `${answer.angles_degrees[0].toFixed(2)}°` : "…"}
        />
        <Stat
          label="Angle, second pair"
          value={answer ? `${answer.angles_degrees[1].toFixed(2)}°` : "…"}
        />
        <Stat
          label="Shares, learned"
          value={answer ? sharesOf(answer.hebbian) : "…"}
        />
        <Stat
          label="Shares, eigen"
          value={answer ? sharesOf(answer.eigen) : "…"}
        />
        <Stat
          label="Vector lengths"
          value={
            answer
              ? answer.hebbian
                  .map((direction) => direction.length.toFixed(4))
                  .join(" / ")
              : "…"
          }
        />
        <Stat
          label="Worst orthogonality"
          value={answer ? answer.worst_orthogonality.toPrecision(2) : "…"}
        />
        <Stat
          label="Epochs run"
          value={answer ? `${answer.epochs_run} of ${maxEpochs}` : "…"}
        />
        <Stat
          label="Starting rate"
          value={answer ? answer.starting_rate.toPrecision(3) : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
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
