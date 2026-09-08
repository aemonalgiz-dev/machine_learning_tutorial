"use client";

// The small pieces every widget on the searching page shares: a picture drawn
// one rectangle per pixel, the colour each kind is marked in, and a readout.
//
// The pictures are 16 pixels a side, so a tile is 256 rectangles and a strip
// of twenty is five thousand, which a browser draws without complaint. Each
// picture carries its own darkest and brightest value and is stretched between
// black and white on those, since the pictures are drawn at different
// brightnesses against different backgrounds and a shared scale would make
// half of them look empty. The greys are the picture's own content and stay
// the same in a dark theme; the frame around them is what follows the theme.

import { PictureGrid } from "@/lib/concepts/searching-a-collection-of-pictures";

export const KIND_COLOURS: Record<string, string> = {
  cross: "#6366f1",
  square: "#f59e0b",
  disc: "#10b981",
  bar: "#f43f5e",
};

export const KIND_ORDER = ["cross", "square", "disc", "bar"] as const;

export function kindColour(kind: string): string {
  return KIND_COLOURS[kind] ?? "#94a3b8";
}

function greyOf(value: number, grid: PictureGrid): string {
  const span = grid.brightest - grid.darkest;
  const share = span === 0 ? 0.5 : (value - grid.darkest) / span;
  const level = Math.round(Math.min(1, Math.max(0, share)) * 255);
  return `rgb(${level}, ${level}, ${level})`;
}

export function PictureTile({
  grid,
  cell = 3,
  frame,
  dashed = false,
  label,
}: {
  grid: PictureGrid;
  cell?: number;
  frame?: string;
  dashed?: boolean;
  label?: string;
}) {
  const side = grid.rows.length * cell;
  const inset = 3;
  return (
    <svg
      viewBox={`${-inset} ${-inset} ${side + 2 * inset} ${side + 2 * inset}`}
      width={side + 2 * inset}
      height={side + 2 * inset}
      role="img"
      aria-label={label ?? "a picture from the collection"}
      className="shrink-0"
    >
      {grid.rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <rect
            key={`${rowIndex}-${columnIndex}`}
            x={columnIndex * cell}
            y={rowIndex * cell}
            width={cell + 0.2}
            height={cell + 0.2}
            fill={greyOf(value, grid)}
          />
        )),
      )}
      {frame && (
        <rect
          x={-1.5}
          y={-1.5}
          width={side + 3}
          height={side + 3}
          fill="none"
          stroke={frame}
          strokeWidth={2.5}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      )}
    </svg>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function KindKey() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
      {KIND_ORDER.map((kind) => (
        <span key={kind} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: KIND_COLOURS[kind] }}
          />
          {kind === "square" ? "square outline" : kind === "disc" ? "filled disc" : kind === "bar" ? "diagonal bar" : kind}
        </span>
      ))}
    </div>
  );
}

export function Loading({ message }: { message: string | null }) {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
  );
}
