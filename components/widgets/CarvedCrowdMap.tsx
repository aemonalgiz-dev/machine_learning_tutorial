"use client";

// The crowd under one trained network's decision region, and its folds.
//
// The shaded cells are the network's call at every point of a lattice over
// the plane, amber for a child and indigo for an adult, and the dots are the
// twenty-five people in the colours of what they really are, ringed in rose
// when the network called them wrongly. When folds are asked for, each
// first-layer rectifier's crease is drawn as the line where its score is
// zero, converted from the standardised units the network read into the
// raw centimetres and kilograms of the picture; a dead unit's crease is
// dashed. The API trained the network and answered the lattice; the browser
// only shades and draws.

import { Carving } from "@/lib/concepts/dense-layers";
import { ADULT, CHILD } from "./BootstrapMachine";

const MAP = { width: 300, height: 260 };
const PAD = 22;

export function CarvedCrowdMap({
  carving,
  folds = false,
  title,
}: {
  carving: Carving;
  folds?: boolean;
  title?: string;
}) {
  const regions = carving.regions;
  const cell = (MAP.width - 2 * PAD) / regions.cells;
  const mapX = (column: number) => PAD + column * cell;
  const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
  const plotX = (x: number) =>
    mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
  const plotY = (y: number) =>
    mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;

  // A fold is w_h * (h - mean_h) / dev_h + w_w * (w - mean_w) / dev_w + b = 0.
  // Solved for the weight at the two height edges of the picture, or for the
  // height at the two weight edges when the fold runs nearly vertical.
  const foldEnds = (fold: Carving["folds"][number]) => {
    const a = fold.weight_height / carving.deviation_height;
    const b = fold.weight_weight / carving.deviation_weight;
    const c =
      fold.bias -
      (fold.weight_height * carving.mean_height) / carving.deviation_height -
      (fold.weight_weight * carving.mean_weight) / carving.deviation_weight;
    if (Math.abs(b) >= Math.abs(a)) {
      const weightAt = (height: number) => -(a * height + c) / b;
      return [
        { x: regions.x_min, y: weightAt(regions.x_min) },
        { x: regions.x_max, y: weightAt(regions.x_max) },
      ];
    }
    const heightAt = (weight: number) => -(b * weight + c) / a;
    return [
      { x: heightAt(regions.y_min), y: regions.y_min },
      { x: heightAt(regions.y_max), y: regions.y_max },
    ];
  };

  return (
    <div>
      {title && (
        <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
      )}
      <svg
        viewBox={`0 0 ${MAP.width} ${MAP.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <clipPath id={`carved-clip-${carving.hidden_widths.join("-")}`}>
          <rect x={PAD} y={PAD} width={MAP.width - 2 * PAD} height={MAP.height - 2 * PAD} />
        </clipPath>
        {regions.labels.map((row, rowIndex) =>
          row.map((label, columnIndex) => (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={mapX(columnIndex)}
              y={mapY(rowIndex)}
              width={cell + 0.5}
              height={cell + 0.5}
              fill={label === 0 ? CHILD : ADULT}
              opacity={0.25}
            />
          )),
        )}
        {folds &&
          carving.folds.map((fold, index) => {
            const [from, to] = foldEnds(fold);
            return (
              <line
                key={index}
                x1={plotX(from.x)}
                y1={plotY(from.y)}
                x2={plotX(to.x)}
                y2={plotY(to.y)}
                clipPath={`url(#carved-clip-${carving.hidden_widths.join("-")})`}
                className="stroke-slate-700 dark:stroke-slate-200"
                strokeWidth={1.5}
                strokeDasharray={fold.dead ? "4 4" : undefined}
                opacity={fold.dead ? 0.5 : 0.9}
              />
            );
          })}
        {carving.people.map((person, index) => (
          <circle
            key={index}
            cx={plotX(person.height)}
            cy={plotY(person.weight)}
            r={3.5}
            fill={person.is_adult === 0 ? CHILD : ADULT}
            stroke={person.is_adult === person.called_adult ? "white" : "#e11d48"}
            strokeWidth={person.is_adult === person.called_adult ? 1 : 2}
          />
        ))}
        <text
          x={MAP.width / 2}
          y={MAP.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          height, cm
        </text>
        <text
          x={8}
          y={MAP.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 8 ${MAP.height / 2})`}
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          weight, kg
        </text>
      </svg>
    </div>
  );
}
