"use client";

// A set of problems, worked one card at a time.
//
// The reader does the work somewhere else, in an editor and a terminal of
// their own, and comes back to the card with a number or with a script that
// runs. The card therefore has three things to offer: the task and a place to
// start, hints that give away one step each rather than the whole answer, and
// the finished script with what it printed, for when the reader has an answer
// to compare or has run out of road.
//
// A problem that names a number can be checked here, which is the one piece of
// marking the page can do without seeing any code. Getting that number right,
// or opening the solution, finishes the problem; a set is finished when every
// problem in it is.

import { useEffect, useRef, useState } from "react";
import { Exercise, SETUP_COMMANDS, withinTolerance } from "@/lib/exercises";
import { ProgramOutput, PythonCode } from "./PythonCode";

interface Attempt {
  hintsShown: number;
  solutionShown: boolean;
  entered: string;
  checked: boolean;
  // A problem with no number to check is finished on the reader's say-so.
  worked: boolean;
}

export function PracticeDeck({
  exercises,
  onFinished,
}: {
  exercises: Exercise[];
  onFinished?: () => void;
}) {
  const [card, setCard] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>(() =>
    exercises.map(() => ({
      hintsShown: 0,
      solutionShown: false,
      entered: "",
      checked: false,
      worked: false,
    })),
  );
  const reported = useRef(false);

  const finished = (entry: Attempt, problem: Exercise) =>
    entry.solutionShown ||
    entry.worked ||
    (problem.check !== undefined &&
      entry.checked &&
      withinTolerance(problem.check, Number(entry.entered)));

  const allFinished = attempts.every((entry, index) => finished(entry, exercises[index]));

  // Reported once, after the render that first sees every problem finished. An
  // effect rather than a line in the render, because the listener writes to a
  // record other components are showing, and a render must not update them.
  useEffect(() => {
    if (!allFinished || reported.current) return;
    reported.current = true;
    onFinished?.();
  }, [allFinished, onFinished]);

  if (exercises.length === 0) return null;

  const current = exercises[card];
  const attempt = attempts[card];

  const update = (next: Partial<Attempt>) =>
    setAttempts((entries) =>
      entries.map((entry, index) => (index === card ? { ...entry, ...next } : entry)),
    );

  const checkResult =
    current.check && attempt.checked
      ? withinTolerance(current.check, Number(attempt.entered))
      : null;

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          Problem {card + 1} of {exercises.length}
        </p>
        <ol className="flex items-center gap-1.5" aria-label="Problems in this set">
          {exercises.map((problem, index) => (
            <li key={problem.title}>
              <button
                type="button"
                onClick={() => setCard(index)}
                aria-label={`Problem ${index + 1}, ${problem.title}${finished(attempts[index], problem) ? ", finished" : ""}`}
                aria-current={index === card ? "step" : undefined}
                className={
                  "h-2.5 w-2.5 rounded-full transition " +
                  (finished(attempts[index], problem)
                    ? "bg-accent-fill"
                    : index === card
                      ? "bg-foreground"
                      : "bg-line hover:bg-muted")
                }
              />
            </li>
          ))}
        </ol>
      </div>

      <h3 className="text-lg font-semibold text-foreground">{current.title}</h3>
      <div className="mt-2 space-y-3 text-foreground">
        {current.task.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <PythonCode source={current.starter} label="Start from this" />

      {current.hints && current.hints.length > 0 && (
        <div className="mt-4 space-y-2">
          {current.hints.slice(0, attempt.hintsShown).map((hint, index) => (
            <p
              key={hint}
              className="rounded-md border-l-2 border-accent-fill bg-accent-soft px-4 py-2 text-sm text-foreground"
            >
              <span className="mr-2 font-mono text-xs text-accent">Hint {index + 1}</span>
              {hint}
            </p>
          ))}
          {attempt.hintsShown < current.hints.length && !attempt.solutionShown && (
            <Quiet onClick={() => update({ hintsShown: attempt.hintsShown + 1 })}>
              {attempt.hintsShown === 0
                ? "Show a hint"
                : `Show the next hint (${current.hints.length - attempt.hintsShown} left)`}
            </Quiet>
          )}
        </div>
      )}

      {current.check && (
        <form
          className="mt-5 rounded-lg border border-line bg-raised p-4"
          onSubmit={(event) => {
            event.preventDefault();
            update({ checked: true });
          }}
        >
          <label className="block text-sm font-medium text-foreground">
            {current.check.prompt}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={attempt.entered}
                onChange={(event) => update({ entered: event.target.value, checked: false })}
                placeholder="your number"
                className="w-40 rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted"
              />
              <Solid type="submit" disabled={attempt.entered.trim() === ""}>
                Check
              </Solid>
            </div>
          </label>
          {checkResult !== null && (
            <div className="mt-3 text-sm" aria-live="polite">
              <p
                className={
                  "font-semibold " +
                  (checkResult
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-700 dark:text-rose-300")
                }
              >
                {checkResult
                  ? "That is the number."
                  : Number.isFinite(Number(attempt.entered))
                    ? "Not the number the library reports."
                    : "That is not a number."}
              </p>
              {checkResult && <p className="mt-1 text-foreground">{current.check.because}</p>}
            </div>
          )}
        </form>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!current.check && !attempt.worked && !attempt.solutionShown && (
          <Solid onClick={() => update({ worked: true })}>Mark as worked</Solid>
        )}
        {!attempt.solutionShown ? (
          <Quiet onClick={() => update({ solutionShown: true })}>Show the solution</Quiet>
        ) : (
          <Quiet onClick={() => update({ solutionShown: false })}>Hide the solution</Quiet>
        )}
        {card > 0 && <Quiet onClick={() => setCard(card - 1)}>Back a problem</Quiet>}
        {card < exercises.length - 1 && (
          <Solid onClick={() => setCard(card + 1)}>Next problem</Solid>
        )}
      </div>

      {attempt.solutionShown && (
        <div className="mt-4">
          <PythonCode source={current.solution} label="One solution" />
          <ProgramOutput output={current.output} />
          {current.check && !checkResult && (
            <p className="text-sm text-muted">{current.check.because}</p>
          )}
        </div>
      )}

      {allFinished && (
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          Every problem in this set is finished. The next lesson is the one to move on to.
        </p>
      )}
    </div>
  );
}

// The install, once, folded away because a reader who has done it once does
// not need to see it on every lesson.
export function PracticeSetup() {
  return (
    <details className="group mb-5 rounded-lg border border-line bg-surface px-4 py-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">&rsaquo;</span>
        Running these on your own machine
      </summary>
      <div className="mt-3 space-y-3 border-t border-line pt-3 text-sm text-foreground">
        <p>
          The problems run against the same library the examples on this site are
          computed by. Install it once, from its repository, into an environment of
          your own, and every script below runs from any folder.
        </p>
        <PythonCode source={SETUP_COMMANDS} label="Terminal" />
        <p className="text-muted">
          Python 3.11 or later. Nothing else is needed for the problems on this site.
        </p>
      </div>
    </details>
  );
}

function Solid({
  onClick,
  type = "button",
  disabled = false,
  children,
}: {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-accent-fill px-3 py-1.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
    >
      {children}
    </button>
  );
}

function Quiet({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-accent underline underline-offset-4 hover:brightness-110"
    >
      {children}
    </button>
  );
}
