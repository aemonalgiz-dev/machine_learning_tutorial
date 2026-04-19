"use client";

// Two dense layers that know nothing but their widths, and whether they join.
//
// The left box is the layer beneath and the right box the layer above, each
// stating the width it reads and the width it answers with, and the arrow
// between them is the seam the library checks when it builds a stack. Green
// means the stack exists, and the readout gives its shape end to end. Red
// means the library refused, and the sentence under the arrow is the
// library's own. No row is sent on either route. The verdict comes from the
// four widths and nothing else, which is the whole point of the box.

import { useEffect, useState } from "react";
import {
  ApiError,
  DenseShape,
  JoinVerdict,
  joinLayers,
} from "@/lib/concepts/dense-layers";

const MAX_WIDTH = 8;
const DEBOUNCE_MS = 150;

const VIEW = { width: 640, height: 180 };
const BOX = { width: 210, height: 92, top: 36 };
const LEFT_BOX_X = 40;
const RIGHT_BOX_X = VIEW.width - 40 - BOX.width;
const SEAM_Y = BOX.top + BOX.height / 2;
const VERDICT_Y = VIEW.height - 20;

interface JoinShapes {
  beneath: DenseShape;
  above: DenseShape;
}

// The worked example's two layers, which join, and the same pair with the
// layer above widened to read four, which the library refuses.
const HOLDING: JoinShapes = {
  beneath: { reads: 2, answers: 3 },
  above: { reads: 3, answers: 1 },
};

const BROKEN: JoinShapes = {
  beneath: { reads: 2, answers: 3 },
  above: { reads: 4, answers: 1 },
};

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const BOX_CLASS =
  "w-14 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-right font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function tupleText(extents: number[]): string {
  return `(${extents.join(", ")}${extents.length === 1 ? "," : ""})`;
}

function clampWidth(text: string): number {
  const value = Math.round(Number(text));
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_WIDTH, Math.max(1, value));
}

type Side = "beneath" | "above";
type Width = "reads" | "answers";

export function LayerJoinChecker() {
  const [shapes, setShapes] = useState<JoinShapes>(HOLDING);
  const [verdict, setVerdict] = useState<JoinVerdict | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setVerdict(await joinLayers(shapes.beneath, shapes.above));
        setRefusal(null);
        setMessage(null);
      } catch (error) {
        setVerdict(null);
        if (error instanceof ApiError && error.kind === "refused") {
          setRefusal(error.message);
          setMessage(null);
        } else if (error instanceof ApiError) {
          setRefusal(null);
          setMessage(error.message);
        } else {
          setRefusal(null);
          setMessage("Something went wrong.");
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [shapes]);

  const setWidth = (side: Side, width: Width, text: string) =>
    setShapes((current) => {
      const changed: DenseShape = {
        ...current[side],
        [width]: clampWidth(text),
      };
      return side === "beneath"
        ? { ...current, beneath: changed }
        : { ...current, above: changed };
    });

  const seamClass = verdict
    ? "stroke-emerald-500 fill-emerald-500"
    : refusal
      ? "stroke-rose-500 fill-rose-500"
      : "stroke-slate-400 fill-slate-400";

  const verdictClass = verdict
    ? "fill-emerald-700 dark:fill-emerald-400"
    : refusal
      ? "fill-rose-700 dark:fill-rose-400"
      : "fill-slate-500 dark:fill-slate-400";

  const verdictText = verdict
    ? `The stack exists. It reads ${tupleText(verdict.stack.reads)} and answers ${tupleText(verdict.stack.answers)}.`
    : refusal
      ? refusal
      : "…";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => setShapes(HOLDING)} className={BUTTON_CLASS}>
          A join that holds
        </button>
        <button onClick={() => setShapes(BROKEN)} className={BUTTON_CLASS}>
          A join that does not
        </button>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <LayerBox
          x={LEFT_BOX_X}
          title="layer 0, beneath"
          shape={shapes.beneath}
        />
        <LayerBox x={RIGHT_BOX_X} title="layer 1, above" shape={shapes.above} />

        <g className={seamClass}>
          <line
            x1={LEFT_BOX_X + BOX.width}
            y1={SEAM_Y}
            x2={RIGHT_BOX_X - 14}
            y2={SEAM_Y}
            strokeWidth={3}
          />
          <polygon
            points={`${RIGHT_BOX_X - 16},${SEAM_Y - 8} ${RIGHT_BOX_X - 2},${SEAM_Y} ${RIGHT_BOX_X - 16},${SEAM_Y + 8}`}
            strokeWidth={0}
          />
        </g>

        <text
          x={VIEW.width / 2}
          y={SEAM_Y - 12}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          {`answers ${tupleText([shapes.beneath.answers])} → reads ${tupleText([shapes.above.reads])}`}
        </text>

        <text
          x={VIEW.width / 2}
          y={VERDICT_Y}
          textAnchor="middle"
          className={`${verdictClass} font-mono text-[12px] font-medium`}
        >
          {verdictText}
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        No row was sent. The verdict came from the four widths alone, and a
        red sentence is the library&rsquo;s own refusal, word for word.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <WidthBoxes
          title="Layer 0"
          shape={shapes.beneath}
          onReads={(text) => setWidth("beneath", "reads", text)}
          onAnswers={(text) => setWidth("beneath", "answers", text)}
        />
        <WidthBoxes
          title="Layer 1"
          shape={shapes.above}
          onReads={(text) => setWidth("above", "reads", text)}
          onAnswers={(text) => setWidth("above", "answers", text)}
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

function LayerBox({
  x,
  title,
  shape,
}: {
  x: number;
  title: string;
  shape: DenseShape;
}) {
  return (
    <g>
      <rect
        x={x}
        y={BOX.top}
        width={BOX.width}
        height={BOX.height}
        rx={10}
        className="fill-white stroke-indigo-500 dark:fill-slate-900"
        strokeWidth={1.5}
      />
      <text
        x={x + BOX.width / 2}
        y={BOX.top - 10}
        textAnchor="middle"
        className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
      >
        {title}
      </text>
      <text
        x={x + BOX.width / 2}
        y={BOX.top + 36}
        textAnchor="middle"
        className="fill-slate-900 font-mono text-sm dark:fill-slate-100"
      >
        {`reads ${tupleText([shape.reads])}`}
      </text>
      <text
        x={x + BOX.width / 2}
        y={BOX.top + 64}
        textAnchor="middle"
        className="fill-slate-900 font-mono text-sm dark:fill-slate-100"
      >
        {`answers ${tupleText([shape.answers])}`}
      </text>
    </g>
  );
}

function WidthBoxes({
  title,
  shape,
  onReads,
  onAnswers,
}: {
  title: string;
  shape: DenseShape;
  onReads: (text: string) => void;
  onAnswers: (text: string) => void;
}) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="pb-1 text-xs text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          reads
          <input
            type="number"
            min={1}
            max={MAX_WIDTH}
            step={1}
            value={shape.reads}
            onChange={(event) => onReads(event.target.value)}
            className={BOX_CLASS}
          />
        </label>
        <label className="flex items-center gap-2">
          answers
          <input
            type="number"
            min={1}
            max={MAX_WIDTH}
            step={1}
            value={shape.answers}
            onChange={(event) => onAnswers(event.target.value)}
            className={BOX_CLASS}
          />
        </label>
      </div>
    </div>
  );
}
