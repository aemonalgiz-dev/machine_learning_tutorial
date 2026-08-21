"use client";

// A step's setting and the model's setting, searched together through the chain.
//
// Degree belongs to the expansion step and penalty to the ridge model behind
// it, and neither can be varied by a search over the other alone. Wrapped in
// one chain both are settings of one model, and every cell here is one whole
// chain, expand to that degree, standardize, ridge at that penalty,
// cross-validated on the same seeded folds. Cells are shaded by their mean
// held-out R squared and the winner is ringed. The readouts count the
// candidates, which is the product of the two ranges, and the fits, which is
// that times the folds. The API runs the search; the browser draws the
// lattice.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { ChainSearch, searchChain } from "@/lib/concepts/pipelines";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  CrowdName,
  IDEAL_CASE,
  PAGE_FOLDS,
  PAGE_SEED,
  SEARCH_DEGREES,
  SEARCH_PENALTIES,
  TWELVE_PEOPLE,
  formatScore,
  randomCrowd,
} from "./pipelinesFixtures";

const CELL = 96;
const HEAD = 44;
const SIDE = 84;

function shade(score: number, low: number, high: number): number {
  if (high - low < 1e-12) return 0.6;
  return 0.12 + (0.78 * (Math.max(score, low) - low)) / (high - low);
}

export function ChainLattice() {
  const [crowdName, setCrowdName] = useState<CrowdName>("twelve");
  const [crowd, setCrowd] = useState<Point[]>(TWELVE_PEOPLE);
  const [answer, setAnswer] = useState<{ crowd: Point[]; search: ChainSearch } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const search = await searchChain(
          crowd,
          SEARCH_DEGREES,
          SEARCH_PENALTIES,
          PAGE_FOLDS,
          PAGE_SEED,
        );
        if (cancelled) return;
        setAnswer({ crowd, search });
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [crowd]);

  const search = answer && answer.crowd === crowd ? answer.search : null;
  const scores = search ? search.cells.map((cell) => cell.score) : [];
  const low = scores.length ? Math.max(Math.min(...scores), -1) : 0;
  const high = scores.length ? Math.max(...scores) : 1;

  const choose = (name: CrowdName) => {
    setCrowdName(name);
    if (name === "twelve") setCrowd(TWELVE_PEOPLE);
    else if (name === "ideal") setCrowd(IDEAL_CASE);
    else setCrowd(randomCrowd());
  };

  const width = SIDE + SEARCH_PENALTIES.length * CELL;
  const height = HEAD + SEARCH_DEGREES.length * CELL;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => choose("twelve")} className={crowdName === "twelve" ? ACTIVE_CLASS : BUTTON_CLASS}>
          The twelve people
        </button>
        <button onClick={() => choose("ideal")} className={crowdName === "ideal" ? ACTIVE_CLASS : BUTTON_CLASS}>
          An Ideal Case
        </button>
        <button onClick={() => choose("random")} className={crowdName === "random" ? ACTIVE_CLASS : BUTTON_CLASS}>
          A random crowd
        </button>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {SEARCH_PENALTIES.map((penalty, column) => (
          <text
            key={`penalty${penalty}`}
            x={SIDE + column * CELL + CELL / 2}
            y={HEAD - 14}
            textAnchor="middle"
            className="fill-slate-600 text-xs font-medium dark:fill-slate-300"
          >
            penalty {penalty}
          </text>
        ))}
        {SEARCH_DEGREES.map((degree, row) => (
          <text
            key={`degree${degree}`}
            x={SIDE - 10}
            y={HEAD + row * CELL + CELL / 2 + 4}
            textAnchor="end"
            className="fill-slate-600 text-xs font-medium dark:fill-slate-300"
          >
            degree {degree}
          </text>
        ))}
        {SEARCH_DEGREES.map((degree, row) =>
          SEARCH_PENALTIES.map((penalty, column) => {
            const cell = search?.cells.find((candidate) => candidate.degree === degree && candidate.penalty === penalty) ?? null;
            const x = SIDE + column * CELL;
            const y = HEAD + row * CELL;
            const winner = search !== null && cell !== null && degree === search.best_degree && penalty === search.best_penalty;
            return (
              <g key={`cell${degree}${penalty}`}>
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={CELL - 6}
                  height={CELL - 6}
                  rx={8}
                  fill="#6366f1"
                  opacity={cell ? shade(cell.score, low, high) : 0.08}
                  stroke={winner ? "#10b981" : "none"}
                  strokeWidth={winner ? 4 : 0}
                />
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 5}
                  textAnchor="middle"
                  className="fill-slate-900 font-mono text-sm font-semibold dark:fill-slate-100"
                >
                  {cell ? formatScore(cell.score) : "…"}
                </text>
              </g>
            );
          }),
        )}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Winning degree" value={search ? String(search.best_degree) : "…"} />
        <Stat label="Winning penalty" value={search ? String(search.best_penalty) : "…"} />
        <Stat label="Its mean held-out R²" value={search ? search.best_score.toFixed(4) : "…"} />
        <Stat label="Score spread" value={search ? search.score_spread.toFixed(4) : "…"} />
        <Stat label="Candidates, fits" value={search ? `${search.n_candidates}, ${search.n_fits}` : "…"} />
      </div>

      {search && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          The ridge model alone exposes {search.model_hyperparameters.join(" and ")};
          the chain exposes {search.chain_hyperparameters.join(" and ")}. Asking the
          model for a degree is refused, <span className="font-mono">{search.degree_on_model.error}</span>,
          {" "}{search.degree_on_model.detail}. A misspelt chain field is refused the
          same way, {search.misspelt_field.detail}.
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
