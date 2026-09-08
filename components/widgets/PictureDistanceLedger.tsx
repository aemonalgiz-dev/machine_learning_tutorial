"use client";

// One distance between two pictures, done by hand.
//
// The worked query and the picture the exact search put nearest it, their
// sixteen numbers side by side, each gap and its square, and the sum. The
// coordinates arrive rounded to three places so that a reader can redo the
// sum with a pencil, and the ledger shows both the root of that rounded sum
// and the exact distance the search used, so the rounding is visible rather
// than hidden. The API computes; the browser only lays it out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  OverviewResponse,
  fetchOverview,
} from "@/lib/concepts/searching-a-collection-of-pictures";
import { Loading, Stat } from "./searchingPicturesShared";

export function PictureDistanceLedger() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchOverview()
      .then((loaded) => {
        if (current) setOverview(loaded);
      })
      .catch((error) => {
        if (current) setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, []);

  if (!overview) return <Loading message={message} />;
  const worked = overview.worked;
  const sign = (value: number) => (value < 0 ? `−${Math.abs(value).toFixed(3)}` : value.toFixed(3));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["number", "query", "nearest picture", "gap", "gap squared"].map((heading) => (
                <th key={heading} className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {worked.coordinates.map((pair, position) => (
              <tr key={position} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1 pr-4 font-mono text-slate-500 dark:text-slate-400">{position + 1}</td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{sign(pair.query)}</td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{sign(pair.neighbour)}</td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{sign(pair.gap)}</td>
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{pair.squared_gap.toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="sum of the squared gaps" value={worked.sum_of_squares_from_rounded.toFixed(6)} />
        <Stat label="its square root" value={worked.distance_from_rounded.toFixed(4)} />
        <Stat label="exact, unrounded" value={worked.distance.toFixed(4)} />
        <Stat label="second nearest, farthest" value={`${worked.second_distance.toFixed(4)}, ${worked.farthest_distance.toFixed(4)}`} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Held-out picture {worked.query}, a {worked.query_kind}, against collection picture {worked.neighbour}, a {worked.neighbour_kind}. The coordinates are rounded to three places, which moves the distance in its fourth.
      </p>
    </div>
  );
}
