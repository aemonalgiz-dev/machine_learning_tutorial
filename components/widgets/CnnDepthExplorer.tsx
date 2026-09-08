"use client";

// One held-out picture of each kind carried through the whole network, every
// map at every depth, and what any single unit in those maps can see.
//
// Pick a kind and the picture is drawn with the four first-layer maps under
// it, the four pooled maps, the eight second-layer maps and the eight pooled
// again, then the sixteen numbers of the vector and the four probabilities.
// Click any cell of any map and the API works out, from the windows and
// strides below that unit, which pixels it reads, then checks that by
// brightening every pixel of the picture in turn and recording how far the
// unit moved. The outline is the geometry; the glowing map is the poking. The
// API computes and the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Depth,
  fetchNetworkMaps,
  fetchReach,
  KIND_WORDS,
  MapsResponse,
  ReachResponse,
} from "@/lib/concepts/convolutional-networks";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
} from "@/components/widgets/filtersAndEdgesShared";
import {
  CellMap,
  Framed,
  Loading,
  ProbabilityBars,
} from "@/components/widgets/convolutionalNetworksShared";

interface Chosen {
  depth: Depth;
  row: number;
  column: number;
}

export function CnnDepthExplorer() {
  const [maps, setMaps] = useState<MapsResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [kindIndex, setKindIndex] = useState(0);
  const [chosen, setChosen] = useState<Chosen>({
    depth: "second_pooling",
    row: 1,
    column: 1,
  });
  const [reach, setReach] = useState<ReachResponse | null>(null);
  const [reachMessage, setReachMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNetworkMaps()
      .then(setMaps)
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, []);

  const kind = maps?.kind_names[kindIndex];

  useEffect(() => {
    if (!kind) return;
    let current = true;
    fetchReach(kind, chosen.depth, chosen.row, chosen.column)
      .then((answer) => {
        if (current) {
          setReach(answer);
          setReachMessage(null);
        }
      })
      .catch((error) => {
        if (current)
          setReachMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, [kind, chosen]);

  if (!maps) return <Loading message={message} />;

  const picture = maps.pictures[kindIndex];
  const windowOnPicture =
    reach && reach.kind === picture.kind
      ? { top: reach.top, left: reach.left, bottom: reach.bottom, right: reach.right }
      : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-600 dark:text-slate-400">picture:</span>
        {maps.pictures.map((entry, index) => (
          <button
            key={entry.kind}
            className={index === kindIndex ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
            onClick={() => setKindIndex(index)}
          >
            {KIND_WORDS[entry.kind]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <Framed title="the picture, with the chosen unit’s window" width="w-40">
          <CellMap
            rows={picture.picture}
            scale="brightness"
            largest={1}
            window={windowOnPicture}
            label="the held-out picture"
          />
        </Framed>
        <Framed
          title="how far the unit moved when each pixel was brightened"
          width="w-40"
          note={reach ? `a poke of ${reach.poke} on one pixel at a time` : undefined}
        >
          {reach ? (
            <CellMap
              rows={reach.influence}
              scale="magnitude"
              largest={reach.largest_influence || 1}
              window={windowOnPicture}
              windowColour="rgb(129, 140, 248)"
              label="influence of each pixel on the chosen unit"
            />
          ) : (
            <div className="aspect-square w-full bg-slate-900" />
          )}
        </Framed>
        <div className="min-w-[12rem] flex-1 space-y-2">
          <ProbabilityBars
            names={maps.kind_names.map((name) => KIND_WORDS[name])}
            values={picture.probabilities}
            truth={KIND_WORDS[picture.kind]}
          />
          {reach && (
            <div className="grid grid-cols-2 gap-1.5">
              <Stat label="chosen unit" value={`${reach.label}, row ${reach.row}, column ${reach.column}`} />
              <Stat label="window by the geometry" value={`${reach.field} by ${reach.field} pixels`} />
              <Stat label="pixels in it inside the picture" value={String(reach.n_in_window)} />
              <Stat label="pixels that moved the unit" value={`${reach.n_moved}, ${reach.n_moved_outside} outside the window`} />
            </div>
          )}
          {reachMessage && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{reachMessage}</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {picture.depths.map((depth) => (
          <div key={depth.depth}>
            <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              {depth.label}, {depth.maps.length} maps of {depth.side} by {depth.side}
            </p>
            <div className="flex flex-wrap gap-2">
              {depth.maps.map((grid, channel) => (
                <div
                  key={channel}
                  className="w-16 overflow-hidden rounded-sm ring-1 ring-slate-300 dark:ring-slate-700"
                >
                  <CellMap
                    rows={grid}
                    scale="magnitude"
                    largest={depth.largest || 1}
                    selected={
                      chosen.depth === depth.depth
                        ? { row: chosen.row, column: chosen.column }
                        : null
                    }
                    onPick={(row, column) => setChosen({ depth: depth.depth, row, column })}
                    label={`map ${channel + 1} ${depth.label}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            the sixteen numbers of the dense layer, each between −1 and 1
          </p>
          <svg viewBox="0 0 160 40" className="h-10 w-full max-w-md">
            <line x1={0} y1={20} x2={160} y2={20} stroke="rgb(148, 163, 184)" strokeWidth={0.5} />
            {picture.vector.map((value, index) => (
              <rect
                key={index}
                x={index * 10 + 1.5}
                y={value >= 0 ? 20 - 19 * value : 20}
                width={7}
                height={Math.abs(19 * value)}
                fill={value >= 0 ? "#6366f1" : "#f59e0b"}
              />
            ))}
          </svg>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Every map is drawn black at zero and bright at the largest value at that depth for this picture. Click a cell in any map to choose that unit.
      </p>
    </div>
  );
}
