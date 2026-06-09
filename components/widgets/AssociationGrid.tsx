"use client";

// Every pair of words in one corpus, scored, with the arithmetic behind one cell.
//
// A green cell is a pair the corpus put together more often than chance alone
// would predict, a red cell one it put together less often, and a grey cell a
// pair that was never seen together at all, where the score does not exist
// rather than being low. Click a cell and the panel underneath shows the four
// numbers it was built from. The API counts, divides and takes the logarithm;
// the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  AssociationTable,
  CorpusChoice,
  ScoredPair,
  fetchTable,
} from "@/lib/concepts/pointwise-mutual-information";
import {
  ABSENT,
  Choice,
  Legend,
  Stat,
  Waiting,
  colourFor,
  shade,
} from "./mutualInformationShared";

const CORPORA: { label: string; value: CorpusChoice }[] = [
  { label: "three sentences", value: "three-sentences" },
  { label: "twenty-four documents", value: "twenty-four-documents" },
];

const WINDOWS: Record<CorpusChoice, number> = {
  "three-sentences": 1,
  "twenty-four-documents": 5,
};

const OPENING: Record<CorpusChoice, [string, string]> = {
  "three-sentences": ["the", "cat"],
  "twenty-four-documents": ["crew", "deck"],
};

export function AssociationGrid() {
  const [corpus, setCorpus] = useState<CorpusChoice>("three-sentences");
  const [table, setTable] = useState<AssociationTable | null>(null);
  const [chosen, setChosen] = useState<[string, string]>(
    OPENING["three-sentences"],
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchTable({
          corpus,
          window: WINDOWS[corpus],
          contextSmoothing: 1.0,
        });
        if (!cancelled) {
          setTable(next);
          setChosen(OPENING[corpus]);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [corpus]);

  if (!table) return <Waiting message={message} />;

  const extent = Math.max(
    ...table.pairs.map((pair) => Math.abs(pair.score ?? 0)),
    0.001,
  );
  const found: ScoredPair | undefined = table.pairs.find(
    (pair) => pair.word === chosen[0] && pair.context === chosen[1],
  );
  const row = table.words.indexOf(chosen[0]);
  const column = table.words.indexOf(chosen[1]);
  const count = row >= 0 && column >= 0 ? table.counts[row][column] : 0;
  const small = table.words.length <= 8;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={CORPORA} value={corpus} onChange={setCorpus} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pairs the vocabulary can form" value={String(table.n_cells)} />
        <Stat label="pairs actually seen together" value={String(table.n_observed)} />
        <Stat label="above chance" value={String(table.n_above_chance)} />
        <Stat label="below chance" value={String(table.n_below_chance)} />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="border-separate border-spacing-0 text-[10px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white pr-1 dark:bg-slate-900" />
              {table.words.map((word, index) => (
                <th
                  key={word}
                  className="px-0.5 pb-1 align-bottom font-mono font-normal"
                  style={{ color: colourFor(table.topics[index]) }}
                >
                  <span className="block [writing-mode:vertical-rl] [transform:rotate(180deg)]">
                    {word}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.words.map((word, rowIndex) => (
              <tr key={word}>
                <th
                  className="sticky left-0 z-10 bg-white pr-1 text-right font-mono font-normal dark:bg-slate-900"
                  style={{ color: colourFor(table.topics[rowIndex]) }}
                >
                  {word}
                </th>
                {table.words.map((other, columnIndex) => {
                  const score = table.scores[rowIndex][columnIndex];
                  const picked =
                    rowIndex === row && columnIndex === column;
                  return (
                    <td key={other} className="p-0">
                      <button
                        onClick={() => setChosen([word, other])}
                        title={`${word} beside ${other}`}
                        style={{
                          backgroundColor:
                            score === null ? ABSENT : shade(score, extent),
                          outline: picked ? "2px solid #6366f1" : undefined,
                        }}
                        className={
                          "block text-center font-mono text-[9px] text-slate-900 " +
                          (small ? "h-7 w-10" : "h-4 w-4")
                        }
                      >
                        {small && score !== null ? score.toFixed(2) : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800">
        <p className="font-mono text-slate-900 dark:text-slate-100">
          {chosen[0]} beside {chosen[1]}
        </p>
        {found ? (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="times seen together" value={found.count.toFixed(1)} />
            <Stat
              label="their share of every count"
              value={found.joint_rate.toFixed(6)}
            />
            <Stat
              label="what chance alone predicts"
              value={found.expected_rate.toFixed(6)}
            />
            <Stat
              label="the first word’s own share"
              value={found.word_rate.toFixed(6)}
            />
            <Stat
              label="the second word’s own share"
              value={found.context_rate.toFixed(6)}
            />
            <Stat
              label="the score"
              value={found.score === null ? "none" : found.score.toFixed(6)}
            />
          </div>
        ) : (
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            These two words were counted together {count.toFixed(1)} times, so
            their share of every count is zero and the logarithm of zero is not a
            number. There is no score here to read.
          </p>
        )}
      </div>

      <Legend>
        Green is above chance, red below, and the flat grey cells are the pairs
        that never occurred, where nothing was computed at all. A word is never
        its own neighbour in these counts, so the diagonal is grey throughout.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
