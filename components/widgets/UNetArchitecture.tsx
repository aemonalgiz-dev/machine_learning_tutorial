"use client";

// The small U drawn as the blocks it passes a picture through, down the left
// to the middle and back up the right, with the two skip connections carried
// across when they are joined.
//
// Each block is as tall as its maps are wide and as wide as it has channels,
// so the shrinking and the growing are visible as shapes. Where a skip is
// joined, the block the decoder convolution reads is drawn in two colours,
// the repeated maps from below and the encoder's maps copied across. Every
// extent and parameter count comes from the API's report on the trained
// network; the browser only lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchUReport, LayerReading, UReport } from "@/lib/concepts/u-net";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
} from "@/components/widgets/filtersAndEdgesShared";
import { Loading, thousands } from "@/components/widgets/convolutionalNetworksShared";
import { WITH_SKIP_COLOUR, WITHOUT_SKIP_COLOUR } from "@/components/widgets/uNetShared";

const LEVEL_TOP = [14, 150, 226];
const CELL = 5.5;
const CHANNEL = 3.4;

interface Block {
  x: number;
  channels: number;
  side: number;
  copied: number;
  caption: string;
}

function levelOf(side: number, full: number): number {
  return side === full ? 0 : side === full / 2 ? 1 : 2;
}

function blocksOf(layers: LayerReading[]): Block[] {
  const full = layers[0].reads[1];
  const at = (index: number) => layers[index].answers;
  const reads = (index: number) => layers[index].reads;
  const upSecond = at(5)[0];
  const upFirst = at(7)[0];
  return [
    { x: 8, channels: reads(0)[0], side: full, copied: 0, caption: "picture" },
    { x: 40, channels: at(0)[0], side: at(0)[1], copied: 0, caption: "convolve" },
    { x: 90, channels: at(1)[0], side: at(1)[1], copied: 0, caption: "pool" },
    { x: 130, channels: at(2)[0], side: at(2)[1], copied: 0, caption: "convolve" },
    { x: 190, channels: at(3)[0], side: at(3)[1], copied: 0, caption: "pool" },
    { x: 240, channels: at(4)[0], side: at(4)[1], copied: 0, caption: "the middle" },
    { x: 300, channels: reads(6)[0], side: reads(6)[1], copied: reads(6)[0] - upSecond, caption: "repeat, join" },
    { x: 372, channels: at(6)[0], side: at(6)[1], copied: 0, caption: "convolve" },
    { x: 428, channels: reads(8)[0], side: reads(8)[1], copied: reads(8)[0] - upFirst, caption: "repeat, join" },
    { x: 490, channels: at(8)[0], side: at(8)[1], copied: 0, caption: "convolve" },
    { x: 530, channels: at(9)[0], side: at(9)[1], copied: 0, caption: "one by one" },
  ];
}

function BlockShape({ block, full }: { block: Block; full: number }) {
  const level = levelOf(block.side, full);
  const top = LEVEL_TOP[level];
  const height = block.side * CELL;
  const own = block.channels - block.copied;
  return (
    <g>
      <rect
        x={block.x}
        y={top}
        width={own * CHANNEL}
        height={height}
        fill={WITH_SKIP_COLOUR}
        fillOpacity={0.25}
        stroke={WITH_SKIP_COLOUR}
        strokeWidth={0.8}
      />
      {block.copied > 0 && (
        <rect
          x={block.x + own * CHANNEL}
          y={top}
          width={block.copied * CHANNEL}
          height={height}
          fill={WITHOUT_SKIP_COLOUR}
          fillOpacity={0.35}
          stroke={WITHOUT_SKIP_COLOUR}
          strokeWidth={0.8}
        />
      )}
      <text
        x={block.x + (block.channels * CHANNEL) / 2}
        y={top + height + 9}
        textAnchor="middle"
        className="fill-slate-600 text-[7px] dark:fill-slate-300"
      >
        {block.channels} × {block.side} × {block.side}
      </text>
      <text
        x={block.x + (block.channels * CHANNEL) / 2}
        y={top + height + 17}
        textAnchor="middle"
        className="fill-slate-500 text-[6.5px] dark:fill-slate-400"
      >
        {block.caption}
      </text>
    </g>
  );
}

export function UNetArchitecture() {
  const [skip, setSkip] = useState(true);
  const [reports, setReports] = useState<Record<string, UReport>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchUReport(true, 0), fetchUReport(false, 0)])
      .then(([withSkip, without]) => setReports({ true: withSkip, false: without }))
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, []);

  const report = reports[String(skip)];
  if (!report) return <Loading message={message} />;

  const blocks = blocksOf(report.layers);
  const full = report.layers[0].reads[1];
  const centre = (block: Block) => block.x + (block.channels * CHANNEL) / 2;
  const middleOf = (block: Block) =>
    LEVEL_TOP[levelOf(block.side, full)] + (block.side * CELL) / 2;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button className={skip ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setSkip(true)}>
          with the skip connections
        </button>
        <button className={!skip ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setSkip(false)}>
          without them
        </button>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 570 300" className="h-auto w-full min-w-[32rem]" role="img" aria-label="the blocks of the small U">
          {blocks.slice(1).map((block, index) => {
            const before = blocks[index];
            return (
              <line
                key={`step-${index}`}
                x1={before.x + before.channels * CHANNEL}
                y1={middleOf(before)}
                x2={block.x}
                y2={middleOf(block)}
                stroke="rgb(148, 163, 184)"
                strokeWidth={0.8}
              />
            );
          })}
          {skip && (
            <>
              <path
                d={`M ${centre(blocks[1])} ${LEVEL_TOP[0] - 2} L ${centre(blocks[1])} 6 L ${blocks[8].x + blocks[8].channels * CHANNEL - 6} 6 L ${blocks[8].x + blocks[8].channels * CHANNEL - 6} ${LEVEL_TOP[0] - 2}`}
                fill="none"
                stroke={WITHOUT_SKIP_COLOUR}
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <path
                d={`M ${centre(blocks[3])} ${LEVEL_TOP[1] - 2} L ${centre(blocks[3])} ${LEVEL_TOP[1] - 12} L ${blocks[6].x + blocks[6].channels * CHANNEL - 6} ${LEVEL_TOP[1] - 12} L ${blocks[6].x + blocks[6].channels * CHANNEL - 6} ${LEVEL_TOP[1] - 2}`}
                fill="none"
                stroke={WITHOUT_SKIP_COLOUR}
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <text x={(centre(blocks[3]) + blocks[6].x) / 2} y={LEVEL_TOP[1] - 15} textAnchor="middle" className="fill-amber-600 text-[7px] dark:fill-amber-400">
                copied across at half size
              </text>
            </>
          )}
          {blocks.map((block, index) => (
            <BlockShape key={index} block={block} full={full} />
          ))}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {Object.entries(report.parameters_by_part).map(([part, count]) => (
          <Stat key={part} label={part} value={thousands(count)} />
        ))}
        <Stat label="all parameters" value={thousands(report.n_parameters)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each block is drawn as tall as its maps are wide and as wide as it has channels. The amber part of a joined block is the encoder&rsquo;s maps copied across; the indigo part beside it is what came up from the middle.{" "}
        {skip ? "The upper dashed line carries the full-size maps across the top of the U." : "Without the joins, the way up reads only what came through the middle."}
      </p>
    </div>
  );
}
