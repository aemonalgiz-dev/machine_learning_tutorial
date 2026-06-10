"use client";

// What the network answers when it is shown a ring, a kind it was never
// trained on and has no score for.
//
// Four rings with the four probabilities the network gives each, then the
// count over every ring drawn of which kind it was called, and how sure the
// network was, beside the same figure for the held-out pictures of the kinds
// it does know. The API computes and the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchUnseen,
  KIND_WORDS,
  UnseenResponse,
} from "@/lib/concepts/convolutional-networks";
import { Stat } from "@/components/widgets/filtersAndEdgesShared";
import {
  CellMap,
  Loading,
  percent,
  ProbabilityBars,
  share,
} from "@/components/widgets/convolutionalNetworksShared";

export function CnnUnseenKind() {
  const [unseen, setUnseen] = useState<UnseenResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUnseen()
      .then(setUnseen)
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, []);

  if (!unseen) return <Loading message={message} />;

  const names = unseen.kind_names.map((name) => KIND_WORDS[name]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {unseen.examples.map((example, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
            <div className="w-20 shrink-0 overflow-hidden rounded-sm ring-1 ring-slate-300 dark:ring-slate-700">
              <CellMap rows={example.picture} scale="brightness" largest={1} label="a ring" />
            </div>
            <div className="flex-1">
              <ProbabilityBars names={names} values={example.probabilities} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label={`${unseen.n_rings} rings called`}
          value={unseen.ring_calls.map((count, index) => `${count} ${names[index]}`).filter((_, index) => unseen.ring_calls[index] > 0).join(", ")}
        />
        <Stat label="mean probability of the call, rings" value={share(unseen.ring_mean_confidence)} />
        <Stat label="mean probability of the call, held out" value={share(unseen.held_out_mean_confidence)} />
        <Stat label="rings called above 0.9" value={percent(unseen.ring_share_above_ninety)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The four probabilities always sum to one, so every ring is given to one of the four kinds the network knows. There is no fifth answer for it to give.
      </p>
    </div>
  );
}
