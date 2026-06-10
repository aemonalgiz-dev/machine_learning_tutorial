"use client";

// The tower trained at one of four margins, with the step size either held
// where it is or divided by the square of the margin, from one of three
// weight seeds.
//
// Left, the mean pair loss over each epoch. Right, the mean distance between
// every two of the 300 evaluation positions, measured before training and
// after chosen epochs, on a logarithmic scale because at some settings it
// falls to almost nothing. Each setting trains a network the first time it is
// asked, which takes a few seconds; the API caches it after that.

import { useEffect, useState } from "react";
import {
  MARGINS,
  MARGIN_SEEDS,
  MarginAnswer,
  RateRule,
  fetchMargin,
} from "@/lib/concepts/learning-the-metric-itself";
import {
  Buttons,
  EpochChart,
  Pending,
  Series,
  SeriesKey,
  Stat,
  messageOf,
} from "@/components/widgets/learningTheMetricShared";

export function MarginSweep({
  initialMargin = 2,
  initialRule = "fixed",
}: {
  initialMargin?: number;
  initialRule?: RateRule;
}) {
  const [margin, setMargin] = useState<number>(initialMargin);
  const [rule, setRule] = useState<RateRule>(initialRule);
  const [seed, setSeed] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, MarginAnswer>>({});
  const [message, setMessage] = useState<string | null>(null);
  const key = `${margin}|${rule}|${seed}`;

  useEffect(() => {
    let current = true;
    fetchMargin(margin, rule, seed)
      .then((loaded) => {
        if (current) {
          setAnswers((previous) => ({ ...previous, [`${margin}|${rule}|${seed}`]: loaded }));
          setMessage(null);
        }
      })
      .catch((error) => {
        if (current) setMessage(messageOf(error));
      });
    return () => {
      current = false;
    };
  }, [margin, rule, seed]);

  const answer = answers[key];

  const controls = (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <Buttons
        label="margin:"
        options={MARGINS.map((value) => ({ value: value as number, label: String(value) }))}
        value={margin}
        onChange={setMargin}
      />
      <Buttons
        label="step size:"
        options={[
          { value: "fixed" as RateRule, label: "the same at every margin" },
          { value: "scaled" as RateRule, label: "divided by the margin squared" },
        ]}
        value={rule}
        onChange={setRule}
      />
      <Buttons
        label="weight seed:"
        options={MARGIN_SEEDS.map((value) => ({ value: value as number, label: String(value) }))}
        value={seed}
        onChange={setSeed}
      />
    </div>
  );

  if (!answer) {
    return (
      <div>
        {controls}
        <Pending message={message ?? "… training this setting, a few seconds the first time"} />
      </div>
    );
  }

  const loss: Series[] = [
    {
      label: "mean pair loss",
      colour: "#f43f5e",
      epochs: answer.losses.map((_, index) => index + 1),
      values: answer.losses,
    },
  ];
  const spread: Series[] = [
    {
      label: "mean distance between positions",
      colour: "#6366f1",
      epochs: [0, ...answer.spread_epochs],
      values: [answer.start_spread, ...answer.spreads],
    },
  ];
  const kindCount = (kind: string) => {
    const figure = answer.kinds.find((candidate) => candidate.kind === kind);
    return figure ? `${figure.nearest_count} of ${figure.n_counted}` : "none";
  };
  const frozen = answer.spreads[answer.spreads.length - 1] < 1e-3;

  return (
    <div>
      {controls}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <EpochChart series={loss} title="mean pair loss" lastEpoch={40} logarithmic />
        </div>
        <div>
          <EpochChart series={spread} title="mean distance between positions" lastEpoch={40} logarithmic />
        </div>
      </div>
      <SeriesKey series={[...loss, ...spread]} />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="step size" value={String(answer.rate)} />
        <Stat
          label="final loss"
          value={answer.final_loss === null ? "none" : answer.final_loss.toFixed(4)}
        />
        <Stat label="mean distance, one kind" value={answer.mean_within.toFixed(4)} />
        <Stat label="mean distance, two kinds" value={answer.mean_across.toFixed(4)} />
        <Stat label="two-kind pairs past the margin" value={answer.beyond_margin.toFixed(4)} />
        <Stat label="crosses finding a cross" value={kindCount("cross")} />
        <Stat label="bars finding a bar" value={kindCount("bar")} />
        <Stat label="rings finding a ring" value={kindCount("ring")} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Trained on crosses, squares and discs for 40 epochs. The distances in
        the middle row are over held-out pictures of those three kinds; the
        counts are among all 300 evaluation pictures.
        {frozen
          ? " Every position has landed on one point, so every nearest picture is a tie and the counts are over whichever pictures were not tied."
          : ""}
      </p>
    </div>
  );
}
