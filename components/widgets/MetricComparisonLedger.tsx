"use client";

// The same question asked of four spaces: for each kind, how often does a
// picture's nearest other picture turn out to be its own kind?
//
// The four spaces are the pixels themselves, the reference classifier's layer
// of sixteen (which was trained on all four kinds, the held-back one
// included), a classifier's layer trained on the same three kinds the tower
// saw, and the tower trained on pairs of those three. Every count and ratio is
// the API's; the browser only arranges them and tints the cells for kinds a
// space was never shown.

import { useEffect, useState } from "react";
import {
  Comparison,
  ComparisonName,
  KindFigure,
  fetchComparison,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  Buttons,
  Pending,
  SPACE_COLOUR,
  SPACE_ORDER,
  SPACE_SHORT,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

type Reading = "nearest" | "ten" | "ratio";
type View = "all" | "seen";

const STUDIES: { value: ComparisonName; label: string }[] = [
  { value: "main", label: "bar held back, seed 0" },
  { value: "seed-1", label: "seed 1" },
  { value: "seed-2", label: "seed 2" },
  { value: "without-cross", label: "cross held back" },
  { value: "without-disc", label: "disc held back" },
  { value: "without-square", label: "square held back" },
];

function cell(figure: KindFigure, reading: Reading): { text: string; share: number } {
  if (reading === "nearest") {
    return {
      text: `${figure.nearest_count} of ${figure.n_counted}`,
      share: figure.n_counted > 0 ? figure.nearest_count / figure.n_counted : 0,
    };
  }
  if (reading === "ten") {
    return {
      text: figure.ten_nearest_same_kind.toFixed(4),
      share: figure.ten_nearest_same_kind,
    };
  }
  const ratio = figure.within_over_across;
  return {
    text: ratio === null ? "none" : ratio.toFixed(4),
    share: ratio === null ? 0 : Math.max(0, 1 - ratio),
  };
}

export function MetricComparisonLedger({
  initialStudy = "main",
  view = "all",
  initialReading = "nearest",
}: {
  initialStudy?: ComparisonName;
  view?: View;
  initialReading?: Reading;
}) {
  const [study, setStudy] = useState<ComparisonName>(initialStudy);
  const [reading, setReading] = useState<Reading>(initialReading);
  const [answers, setAnswers] = useState<Partial<Record<ComparisonName, Comparison>>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchComparison(study)
      .then((loaded) => {
        if (current) {
          setAnswers((previous) => ({ ...previous, [study]: loaded }));
          setMessage(null);
        }
      })
      .catch((error) => {
        if (current) setMessage(messageOf(error));
      });
    return () => {
      current = false;
    };
  }, [study]);

  const answer = answers[study];
  const studies = view === "seen" ? STUDIES.slice(0, 3) : STUDIES;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Buttons options={studies} value={study} onChange={setStudy} />
        {view === "all" && (
          <Buttons
            label="reading:"
            options={[
              { value: "nearest" as Reading, label: "nearest picture" },
              { value: "ten" as Reading, label: "ten nearest" },
              { value: "ratio" as Reading, label: "inside over outside" },
            ]}
            value={reading}
            onChange={setReading}
          />
        )}
      </div>
      {!answer ? (
        <Pending
          message={
            message ??
            "… training two networks for this study, a few seconds the first time"
          }
        />
      ) : view === "seen" ? (
        <SeenTable answer={answer} />
      ) : (
        <AllTable answer={answer} reading={reading} />
      )}
    </div>
  );
}

function AllTable({ answer, reading }: { answer: Comparison; reading: Reading }) {
  const kinds = answer.spaces[0].kinds.map((kind) => kind.kind);
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3 font-semibold">space</th>
              {kinds.map((kind) => (
                <th key={kind} className="py-2 pr-3 font-semibold">
                  {kind}
                  {kind === answer.held_back ? ", held back" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPACE_ORDER.map((name) => {
              const space = answer.spaces.find((candidate) => candidate.space === name);
              if (!space) return null;
              return (
                <tr key={name} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-2 pr-3 text-xs text-slate-700 dark:text-slate-300">
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: SPACE_COLOUR[name] }}
                    />
                    {SPACE_SHORT[name]}
                    <span className="block text-[10px] text-slate-400">{space.width} numbers</span>
                  </td>
                  {space.kinds.map((figure) => {
                    const { text, share } = cell(figure, reading);
                    const unseen = name !== "pixels" && !figure.in_training;
                    return (
                      <td key={figure.kind} className="py-2 pr-3">
                        <div
                          className={`relative min-w-[4.5rem] rounded-sm ${
                            unseen ? "bg-amber-50 dark:bg-amber-950/30" : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          <div
                            className="absolute inset-y-0 left-0 rounded-sm opacity-30"
                            style={{
                              width: `${Math.max(0, Math.min(1, share)) * 100}%`,
                              backgroundColor: SPACE_COLOUR[name],
                            }}
                          />
                          <span className="relative px-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {text}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Searched among all {answer.n_evaluation_pictures} evaluation pictures,
        60 of each kind. Cells tinted amber are kinds that space&rsquo;s network
        never saw. {reading === "ratio"
          ? "The mean distance inside a kind over the mean distance from it to every other picture, so lower is tighter."
          : reading === "ten"
            ? "The mean share of each picture’s ten nearest that are its own kind."
            : "How many pictures of the kind have a nearest picture of their own kind."}{" "}
        The three-kind classifier names {(answer.classifier_accuracy * 100).toFixed(1)}%
        of held-out pictures of its own kinds correctly, and the pair loss fell
        from {answer.pair_loss_first_epoch.toFixed(4)} in the first epoch to{" "}
        {answer.pair_loss_last_epoch.toFixed(4)} in the last.
      </p>
    </>
  );
}

function SeenTable({ answer }: { answer: Comparison }) {
  const kinds = answer.training_kinds;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3 font-semibold">space</th>
              {kinds.map((kind) => (
                <th key={kind} className="py-2 pr-3 font-semibold">
                  {kind}
                </th>
              ))}
              <th className="py-2 font-semibold">together</th>
            </tr>
          </thead>
          <tbody>
            {SPACE_ORDER.map((name) => {
              const space = answer.seen_kinds_only.find((candidate) => candidate.space === name);
              if (!space) return null;
              const total = space.kinds.reduce((sum, kind) => sum + kind.nearest_count, 0);
              const pictures = space.kinds.reduce((sum, kind) => sum + kind.n_pictures, 0);
              return (
                <tr key={name} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-2 pr-3 text-xs text-slate-700 dark:text-slate-300">
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: SPACE_COLOUR[name] }}
                    />
                    {SPACE_SHORT[name]}
                  </td>
                  {space.kinds.map((kind) => (
                    <td key={kind.kind} className="py-2 pr-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                      {kind.nearest_count} of {kind.n_pictures}
                    </td>
                  ))}
                  <td className="py-2 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {total} of {pictures}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Searched only among the 180 held-out pictures of the three kinds the
        tower and the three-kind classifier were trained on, so a picture of a
        kind they never saw cannot be anyone&rsquo;s nearest.
      </p>
    </>
  );
}
