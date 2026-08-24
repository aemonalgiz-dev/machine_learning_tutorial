"use client";

// One picture said in numbers, and everything that cost.
//
// The reader chooses a picture and how many entries the table has. The API cuts
// the picture into pairs of side-by-side pixels, chooses the table from those
// pairs, gives every pair the number of the entry nearest to it and measures
// what was lost; the browser draws three things from that. On the left the
// picture as it was and as it comes back from the numbers. On the right the
// pairs as points in the plane with the entries marked on top of them, which is
// the whole method in one picture. Underneath, the readouts a reader can watch
// move as the table grows.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  PictureName,
  QuantiseView,
  quantisePicture,
} from "@/lib/concepts/codebook-quantisation";
import {
  ENTRY_COLOUR,
  PICTURES,
  PIECE_COLOUR,
  TABLE_SIZES,
  greyOf,
} from "./codebookQuantisationFixtures";

const PLANE = { width: 300, height: 300 };
const PAD = { left: 34, right: 10, top: 10, bottom: 28 };

export function CodebookExplorer({
  initialPicture = "photograph",
  initialCodes = 8,
  tableFrom,
}: {
  initialPicture?: PictureName;
  initialCodes?: number;
  tableFrom?: PictureName;
}) {
  const [picture, setPicture] = useState<PictureName>(initialPicture);
  const [nCodes, setNCodes] = useState(initialCodes);
  const [view, setView] = useState<QuantiseView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await quantisePicture(picture, nCodes, tableFrom);
        if (!live) return;
        setView(answer);
        setMessage(null);
      } catch (error) {
        if (!live) return;
        setView(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      live = false;
    };
  }, [picture, nCodes, tableFrom]);

  const controls = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
        {PICTURES.map((choice) => (
          <button
            key={choice.name}
            onClick={() => setPicture(choice.name)}
            className={
              "rounded px-2 py-0.5 text-xs font-medium transition " +
              (picture === choice.name
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {choice.short}
          </button>
        ))}
      </span>
      <label className="flex flex-1 items-center gap-2">
        entries in the table
        <input
          type="range"
          min={0}
          max={TABLE_SIZES.length - 1}
          step={1}
          value={TABLE_SIZES.indexOf(nCodes)}
          onChange={(event) =>
            setNCodes(TABLE_SIZES[Number(event.target.value)])
          }
          className="flex-1 accent-indigo-600"
        />
        <span className="w-8 text-right font-mono">{nCodes}</span>
      </label>
    </div>
  );

  if (!view) {
    return (
      <div>
        {controls}
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message ?? "…"}
        </p>
      </div>
    );
  }

  const lefts = view.pieces.map((piece) => piece.left);
  const rights = view.pieces.map((piece) => piece.right);
  const low = Math.min(0, ...lefts, ...rights);
  const high = Math.max(1, ...lefts, ...rights);
  const planeX = (value: number) =>
    PAD.left +
    ((value - low) / (high - low)) * (PLANE.width - PAD.left - PAD.right);
  const planeY = (value: number) =>
    PAD.top +
    (1 - (value - low) / (high - low)) * (PLANE.height - PAD.top - PAD.bottom);

  return (
    <div>
      {controls}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <div className="grid grid-cols-2 gap-3">
            <PictureGrid title="as it was" pixels={view.pixels} />
            <PictureGrid
              title="from the numbers"
              pixels={view.reconstruction}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {view.picture_description}
          </p>
        </div>

        <svg
          viewBox={`0 0 ${PLANE.width} ${PLANE.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          <line
            x1={planeX(low)}
            y1={planeY(low)}
            x2={planeX(high)}
            y2={planeY(high)}
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          {view.pieces.map((piece, index) => (
            <line
              key={`gap-${index}`}
              x1={planeX(piece.left)}
              y1={planeY(piece.right)}
              x2={planeX(view.codes[piece.code_id][0])}
              y2={planeY(view.codes[piece.code_id][1])}
              stroke={PIECE_COLOUR}
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}
          {view.pieces.map((piece, index) => (
            <circle
              key={`piece-${index}`}
              cx={planeX(piece.left)}
              cy={planeY(piece.right)}
              r={2.4}
              fill={PIECE_COLOUR}
              opacity={0.75}
            />
          ))}
          {view.codes.map((code, index) => (
            <g key={`entry-${index}`}>
              <circle
                cx={planeX(code[0])}
                cy={planeY(code[1])}
                r={view.usage[index] === 0 ? 4 : 5}
                fill={view.usage[index] === 0 ? "white" : ENTRY_COLOUR}
                stroke={ENTRY_COLOUR}
                strokeWidth={2}
              />
              {view.n_codes <= 8 && (
                <text
                  x={planeX(code[0]) + 8}
                  y={planeY(code[1]) - 6}
                  className="text-[9px] font-semibold"
                  fill={ENTRY_COLOUR}
                >
                  {index}
                </text>
              )}
            </g>
          ))}
          <text
            x={PAD.left + (PLANE.width - PAD.left - PAD.right) / 2}
            y={PLANE.height - 6}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            brightness of the left pixel
          </text>
          <text
            x={11}
            y={PLANE.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 11 ${PLANE.height / 2})`}
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            brightness of the right pixel
          </text>
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="rounding error"
          value={view.distortion.toExponential(3)}
        />
        <Stat
          label="typical miss per pixel"
          value={view.root_mean_square_gap.toFixed(4)}
        />
        <Stat
          label="entries nothing uses"
          value={`${view.n_unused} of ${view.n_codes}`}
        />
        <Stat
          label="bits for the whole picture"
          value={view.total_id_bits.toFixed(0)}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {view.n_pieces} pieces, {view.n_distinct_pieces} of them different from
        each other. The table was chosen from {view.table_from_label}. A hollow
        entry is one no piece asked for.
      </p>
    </div>
  );
}

function PictureGrid({
  title,
  pixels,
}: {
  title: string;
  pixels: number[][];
}) {
  const side = pixels.length;
  return (
    <div>
      <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <svg
        viewBox={`0 0 ${side} ${side}`}
        className="w-full rounded border border-slate-200 dark:border-slate-800"
        shapeRendering="crispEdges"
      >
        {pixels.map((row, down) =>
          row.map((brightness, across) => (
            <rect
              key={`${down}-${across}`}
              x={across}
              y={down}
              width={1}
              height={1}
              fill={greyOf(brightness)}
            />
          )),
        )}
      </svg>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
