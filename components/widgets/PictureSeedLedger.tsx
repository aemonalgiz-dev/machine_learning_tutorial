"use client";

// Every measurement the page repeats over three weight seeds, as tables.
//
// A network's answers move with its starting weights, so each claim on the
// page is read over the reference network, seed 0, and the same design
// retrained from seeds 1 and 2. The API trains and measures; the browser only
// lays out the numbers. One widget with several views, because the views
// share three requests and each page section wants a different slice of
// them: pixels against the vector, trained against untrained, one layer
// against another, where the rings land, which kinds get mixed up, and
// whether a coordinate means the same thing under two seeds.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SeedAnswer,
  fetchSeeds,
} from "@/lib/concepts/a-vector-for-a-picture";
import {
  KIND_COLOUR,
  KindLabel,
  Pending,
  ShareCell,
  TRAINED_KINDS,
} from "@/components/widgets/pictureVectorShared";

export type LedgerView =
  | "pixels"
  | "control"
  | "layers"
  | "rings"
  | "confusion"
  | "coordinates";

const HEAD =
  "py-2 pr-4 text-left font-semibold text-slate-600 dark:text-slate-400";
const CELL = "py-1.5 pr-4 text-slate-700 dark:text-slate-300";
const NUMBER = "py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200";

function share(seed: SeedAnswer, name: string) {
  const found = seed.representations.find((row) => row.name === name);
  if (!found) throw new Error(`missing ${name}`);
  return found;
}

export function PictureSeedLedger({ view }: { view: LedgerView }) {
  const [seeds, setSeeds] = useState<SeedAnswer[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchSeeds();
        if (current) setSeeds(loaded);
      } catch (error) {
        if (!current) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      current = false;
    };
  }, []);

  if (!seeds) {
    return (
      <Pending
        message={
          message ?? "Training the same network from three starting points…"
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      {view === "pixels" && <SharesTable seeds={seeds} rows={PIXEL_ROWS} />}
      {view === "control" && <ControlView seeds={seeds} />}
      {view === "layers" && <LayersView seeds={seeds} />}
      {view === "rings" && <RingsView seeds={seeds} />}
      {view === "confusion" && <ConfusionView seed={seeds[0]} />}
      {view === "coordinates" && <CoordinatesView seeds={seeds} />}
    </div>
  );
}

interface ShareRow {
  name: string;
  label: string;
  colour: string;
}

const PIXEL_ROWS: ShareRow[] = [
  { name: "pixels, by distance", label: "pixels, straight-line distance", colour: "#94a3b8" },
  { name: "pixels, by angle", label: "pixels, angle", colour: "#94a3b8" },
  {
    name: "pixels less their own mean, by angle",
    label: "pixels less their own mean, angle",
    colour: "#94a3b8",
  },
  { name: "hidden 16, trained", label: "the vector of 16, angle", colour: "#6366f1" },
];

function SeedHeadings({ seeds, first }: { seeds: SeedAnswer[]; first: string }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-800">
        <th className={HEAD}>{first}</th>
        {seeds.map((seed) => (
          <th key={seed.weight_seed} className={HEAD}>
            seed {seed.weight_seed}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function SharesTable({
  seeds,
  rows,
  caption,
}: {
  seeds: SeedAnswer[];
  rows: ShareRow[];
  caption?: string;
}) {
  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <SeedHeadings seeds={seeds} first="share whose nearest picture is its own kind" />
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>{row.label}</td>
              {seeds.map((seed) => (
                <td key={seed.weight_seed} className="py-1.5 pr-4">
                  <ShareCell
                    value={share(seed, row.name).nearest_own_kind}
                    colour={row.colour}
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className={`${CELL} text-xs text-slate-500 dark:text-slate-400`}>
              the network naming held-out pictures
            </td>
            {seeds.map((seed) => (
              <td key={seed.weight_seed} className={`${NUMBER} text-xs`}>
                {seed.held_out_accuracy.toFixed(4)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {caption && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{caption}</p>
      )}
    </div>
  );
}

function ControlView({ seeds }: { seeds: SeedAnswer[] }) {
  const rows: ShareRow[] = [
    { name: "pixels, by distance", label: "pixels, straight-line distance", colour: "#94a3b8" },
    { name: "flattened 128, untrained", label: "flattened 128, untrained", colour: "#f59e0b" },
    { name: "hidden 16, untrained", label: "vector of 16, untrained", colour: "#f59e0b" },
    { name: "flattened 128, trained", label: "flattened 128, trained", colour: "#6366f1" },
    { name: "hidden 16, trained", label: "vector of 16, trained", colour: "#6366f1" },
  ];
  return (
    <div className="space-y-5">
      <SharesTable seeds={seeds} rows={rows} />
      <table className="w-full border-collapse text-sm">
        <SeedHeadings seeds={seeds} first="mean cosine, same kind against two kinds" />
        <tbody>
          {(["hidden 16, untrained", "hidden 16, trained"] as const).map((name) => (
            <tr
              key={name}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>
                {name === "hidden 16, trained" ? "vector of 16, trained" : "vector of 16, untrained"}
              </td>
              {seeds.map((seed) => {
                const found = share(seed, name);
                return (
                  <td key={seed.weight_seed} className={NUMBER}>
                    {found.within.toFixed(4)} against {found.across.toFixed(4)}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className={`${CELL} text-xs text-slate-500 dark:text-slate-400`}>
              the untrained network naming held-out pictures
            </td>
            {seeds.map((seed) => (
              <td key={seed.weight_seed} className={`${NUMBER} text-xs`}>
                {seed.untrained_accuracy.toFixed(4)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function LayersView({ seeds }: { seeds: SeedAnswer[] }) {
  const layers = [
    { name: "flattened 128, trained", label: "flattened, 128 numbers" },
    { name: "hidden 16, trained", label: "hidden layer, 16 numbers" },
    { name: "scores 4, trained", label: "scores, 4 numbers" },
  ];
  return (
    <div className="space-y-5">
      <SharesTable
        seeds={seeds}
        rows={layers.map((layer) => ({ ...layer, colour: "#6366f1" }))}
      />
      <table className="w-full border-collapse text-sm">
        <SeedHeadings seeds={seeds} first="mean cosine, same kind against two kinds" />
        <tbody>
          {layers.map((layer) => (
            <tr
              key={layer.name}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>{layer.label}</td>
              {seeds.map((seed) => {
                const found = share(seed, layer.name);
                return (
                  <td key={seed.weight_seed} className={NUMBER}>
                    {found.within.toFixed(4)} against {found.across.toFixed(4)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RING_ROWS = [
  "pixels, by distance",
  "pixels less their own mean, by angle",
  "flattened 128, trained",
  "hidden 16, trained",
  "scores 4, trained",
  "hidden 16, untrained",
];

function RingsView({ seeds }: { seeds: SeedAnswer[] }) {
  return (
    <div className="space-y-5">
      <table className="w-full border-collapse text-sm">
        <SeedHeadings seeds={seeds} first="rings whose nearest picture is another ring, of 60" />
        <tbody>
          {RING_ROWS.map((name) => (
            <tr
              key={name}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>{name}</td>
              {seeds.map((seed) => (
                <td key={seed.weight_seed} className="py-1.5 pr-4">
                  <ShareCell
                    value={seed.rings.gathered[name] / 60}
                    colour={name.startsWith("pixels") ? "#94a3b8" : KIND_COLOUR.ring}
                  />
                  <span className="ml-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {seed.rings.gathered[name]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full border-collapse text-sm">
        <SeedHeadings seeds={seeds} first="what the network names the 60 rings" />
        <tbody>
          {TRAINED_KINDS.map((kind, index) => (
            <tr
              key={kind}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>
                <KindLabel kind={kind} />
              </td>
              {seeds.map((seed) => (
                <td key={seed.weight_seed} className={NUMBER}>
                  {seed.rings.called[index]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full border-collapse text-sm">
        <SeedHeadings seeds={seeds} first="mean cosine from a ring to" />
        <tbody>
          <tr className="border-b border-slate-100 dark:border-slate-800/60">
            <td className={CELL}>
              <KindLabel kind="ring" />
            </td>
            {seeds.map((seed) => (
              <td key={seed.weight_seed} className={NUMBER}>
                {seed.rings.ring_to_ring.toFixed(4)}
              </td>
            ))}
          </tr>
          {TRAINED_KINDS.map((kind, index) => (
            <tr
              key={kind}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>
                <KindLabel kind={kind} />
              </td>
              {seeds.map((seed) => (
                <td key={seed.weight_seed} className={NUMBER}>
                  {seed.rings.ring_to_kind[index].toFixed(4)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfusionTable({ title, table }: { title: string; table: number[][] }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        {title}
      </p>
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-slate-500 dark:text-slate-400">
              picture, then its nearest
            </th>
            {TRAINED_KINDS.map((kind) => (
              <th
                key={kind}
                className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-slate-400"
              >
                {kind}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, rowIndex) => (
            <tr key={TRAINED_KINDS[rowIndex]}>
              <th className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-slate-400">
                {TRAINED_KINDS[rowIndex]}
              </th>
              {row.map((count, columnIndex) => (
                <td
                  key={TRAINED_KINDS[columnIndex]}
                  className={`px-2 py-1 font-mono ${
                    rowIndex === columnIndex
                      ? "text-slate-800 dark:text-slate-200"
                      : count > 0
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                        : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {count}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfusionView({ seed }: { seed: SeedAnswer }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ConfusionTable title="nearest by pixels" table={seed.pixel_confusion} />
      <ConfusionTable
        title={`nearest by the vector, seed ${seed.weight_seed}`}
        table={seed.vector_confusion}
      />
    </div>
  );
}

function CoordinatesView({ seeds }: { seeds: SeedAnswer[] }) {
  const others = seeds.filter((seed) => seed.against_reference);
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-800">
          <th className={HEAD}>seed 0 against</th>
          <th className={HEAD}>same picture, cosine</th>
          <th className={HEAD}>matching coordinates, correlation</th>
          <th className={HEAD}>same nearest picture</th>
          <th className={HEAD}>same kind of nearest picture</th>
        </tr>
      </thead>
      <tbody>
        {others.map((seed) => {
          const against = seed.against_reference!;
          return (
            <tr
              key={seed.weight_seed}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className={CELL}>seed {seed.weight_seed}</td>
              <td className={NUMBER}>{against.same_picture_cosine.toFixed(4)}</td>
              <td className={NUMBER}>
                {against.matching_coordinate_correlation.toFixed(4)}
              </td>
              <td className={NUMBER}>{against.same_nearest_picture.toFixed(4)}</td>
              <td className={NUMBER}>{against.same_nearest_kind.toFixed(4)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
