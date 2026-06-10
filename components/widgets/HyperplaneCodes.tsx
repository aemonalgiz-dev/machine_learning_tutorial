"use client";

// Twelve random hyperplanes, and the code each one gives a picture.
//
// A hyperplane through the origin splits the sixteen-dimensional space in two,
// and a picture's bit for it says which side the picture's vector lies on.
// Two pictures at a small angle fall on the same side of most planes, two at a
// wide angle on the same side of fewer, and the expected share is one minus the
// angle over a half turn. The widget sets the worked query's code beside the
// codes of three pictures at three angles from it and counts the bits they
// share against that expectation. The API draws the planes and the codes; the
// browser only lays the bits out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  HashingResponse,
  fetchHashing,
} from "@/lib/concepts/searching-a-collection-of-pictures";
import { Loading, PictureTile, Stat, kindColour } from "./searchingPicturesShared";

function Bits({ code, against }: { code: string; against?: string }) {
  return (
    <div className="flex gap-0.5">
      {code.split("").map((bit, position) => {
        const agrees = against === undefined || against[position] === bit;
        return (
          <span
            key={position}
            className={`inline-flex h-5 w-5 items-center justify-center rounded-sm font-mono text-[11px] ${
              agrees
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-rose-100 text-rose-700 ring-1 ring-rose-400 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            {bit}
          </span>
        );
      })}
    </div>
  );
}

export function HyperplaneCodes() {
  const [report, setReport] = useState<HashingResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchHashing()
      .then((loaded) => {
        if (current) setReport(loaded);
      })
      .catch((error) => {
        if (current) setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, []);

  if (!report) return <Loading message={message} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <PictureTile grid={report.query_picture} cell={3} frame={kindColour(report.query_kind)} label={`the query, a ${report.query_kind}`} />
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">held-out picture {report.query}, a {report.query_kind}</p>
          <Bits code={report.query_code} />
        </div>
      </div>
      {report.others.map((other) => (
        <div key={other.position} className="flex flex-wrap items-center gap-3">
          <PictureTile grid={other.picture} cell={3} frame={kindColour(other.kind)} label={`a ${other.kind}`} />
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              a {other.kind}, {other.angle_degrees.toFixed(1)}&deg; from the query
            </p>
            <Bits code={other.code} against={report.query_code} />
          </div>
          <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {other.bits_agreeing} of {report.bits} agree, {other.expected_agreeing.toFixed(2)} expected
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="pairs checked" value={String(report.check_pairs)} />
        <Stat label="hyperplanes per pair" value={String(report.check_planes)} />
        <Stat label="mean gap from 1 − θ/π" value={report.mean_gap.toFixed(4)} />
        <Stat label="largest gap" value={report.largest_gap.toFixed(4)} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Red bits disagree with the query&rsquo;s. Below, the query is set against {report.check_pairs} pictures of the collection on {report.check_planes} fresh hyperplanes each, and the share of planes putting the pair on one side is compared with one minus the angle over a half turn; the spread a share of {report.check_planes} coin flips can have is at most {report.standard_error.toFixed(4)}.
      </p>
    </div>
  );
}
