"use client";

// A quiz section, worked one card at a time.
//
// The questions are a section of the lesson rather than a footnote to one, so
// they sit in the section list beside the parts they draw on and a reader can
// come back to them. Inside the section only one question is on screen, because
// a page of questions invites skimming for the ones that look easy.
//
// Mark a single answer immediately, then let the reader decide when to leave
// Botie's explanation. Multiple selections are marked after submission.
//
// A wrong answer also offers the parts of the lesson the question came from,
// because the reason under the answer is a summary and the part is the
// argument.

import { useEffect, useRef } from "react";
import { useLearnerField, fingerprint, useLearnerRecord } from "@/lib/learner-state";
import { QuizQuestion, answersOf, arranged, isCorrect } from "@/lib/quizzes";
import { BotieSays } from "@/components/site/Botie";
import { PythonCode } from "./PythonCode";
import { Equation } from "./Equation";

interface Attempt {
  // Indices as written, not as shown.
  picked: number[];
  answered: boolean;
}

export interface RevisitLink {
  title: string;
  go: () => void;
}

export function QuizDeck({
  questions,
  revisit = [],
  onFinished,
  lesson,
  section,
}: {
  questions: QuizQuestion[];
  revisit?: RevisitLink[];
  onFinished?: () => void;
  lesson: string;
  section: string;
}) {
  const saved = useLearnerRecord(`quiz:${lesson}:${section}:${fingerprint(questions)}`, () => ({
    card: 0, attempts: questions.map((): Attempt => ({ picked: [], answered: false })),
  }), value => {
    const record = value as { card: number; attempts: Attempt[] };
    return !!record && Number.isInteger(record.card) && record.card >= 0 && record.card <= questions.length &&
      Array.isArray(record.attempts) && record.attempts.length === questions.length && record.attempts.every((attempt, i) =>
        attempt && typeof attempt.answered === "boolean" && Array.isArray(attempt.picked) && attempt.picked.every(index => Number.isInteger(index) && index >= 0 && index < (questions[i].kind === "trueFalse" ? 2 : (questions[i] as { options: string[] }).options.length)));
  });
  const [card, setCard] = useLearnerField(saved, "card");
  const [attempts, setAttempts] = useLearnerField(saved, "attempts");
  const reported = useRef(false);

  const finished = card >= questions.length;
  const question = finished ? null : questions[card];
  const attempt = finished ? null : attempts[card];
  const several = question?.kind === "several";

  // Reported once, after the render that first reaches the end. Finishing
  // means answering every card, whatever the score, because the reasons are
  // the teaching and a reader who has read every one has done the section. An
  // effect rather than a line in the render, because the listener writes to a
  // record other components are showing, and a render must not update them.
  useEffect(() => {
    if (!finished || reported.current) return;
    reported.current = true;
    onFinished?.();
  }, [finished, onFinished]);

  if (questions.length === 0) return null;

  const scored = attempts.filter(
    (entry, index) => entry.answered && isCorrect(questions[index], entry.picked),
  ).length;

  const restart = () => {
    setAttempts(questions.map(() => ({ picked: [], answered: false })));
    setCard(0);
  };

  if (finished) {
    return (
      <Shell step={`${questions.length} of ${questions.length}`}>
        <div role="status" aria-label="Botie's quiz summary">
          <BotieSays mood={scored === questions.length ? "happy" : "curious"} className="flex-col !items-start sm:flex-row">
            <p className="text-lg font-semibold text-foreground">
              You answered {scored} of {questions.length} correctly.
            </p>
            <p className="mt-2 text-sm text-muted">
              {scored === questions.length
                ? "Those answers are all correct. You can move on, or revisit any explanation."
                : "Let’s go back through the answers you missed and work out why."}
            </p>
          </BotieSays>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Quiet onClick={() => setCard(questions.length - 1)}>Back to the last question</Quiet>
          <Quiet onClick={restart}>Start these again</Quiet>
        </div>
      </Shell>
    );
  }

  const current = question as QuizQuestion;
  const given = attempt as Attempt;
  const shown = arranged(current);
  const right = isCorrect(current, given.picked);
  const answers = answersOf(current);

  const update = (next: Partial<Attempt>) =>
    setAttempts((entries) =>
      entries.map((entry, index) => (index === card ? { ...entry, ...next } : entry)),
    );

  const toggle = (written: number) => {
    if (given.answered) return;
    if (several) {
      update({
        picked: given.picked.includes(written)
          ? given.picked.filter((value) => value !== written)
          : [...given.picked, written],
      });
      return;
    }
    // One answer, so choosing it is the whole act. Mark it now.
    update({ picked: [written], answered: true });
  };

  return (
    <Shell step={`${card + 1} of ${questions.length}`}>
      <p className="text-base font-medium text-foreground">{current.prompt}</p>
      {current.given && <div className="mt-4 min-w-0 text-sm text-muted" role="group" aria-label="Data for this question">
        <p>{current.given.description}</p>
        {current.given.code && <PythonCode source={current.given.code} label="Given" copyable={false} />}
        {current.given.data && <Equation>{current.given.data}</Equation>}
      </div>}
      {several && !given.answered && (
        <p className="mt-1 text-xs text-muted">
          More than one of these may hold. Submit when you have them all.
        </p>
      )}

      <div className="mt-4 space-y-2" role={several ? "group" : "radiogroup"}>
        {shown.options.map((option, place) => {
          const written = shown.order[place];
          const chosen = given.picked.includes(written);
          const isAnAnswer = answers.includes(written);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(written)}
              disabled={given.answered}
              aria-pressed={chosen}
              className={
                "flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition " +
                (given.answered
                  ? isAnAnswer
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100"
                    : chosen
                      ? "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100"
                      : "border-line text-muted"
                  : chosen
                    ? "border-accent-fill bg-accent-soft text-foreground"
                    : "border-line bg-surface text-foreground hover:bg-raised")
              }
            >
              <span className="mt-0.5 shrink-0 font-mono text-xs text-muted" aria-hidden="true">
                {String.fromCharCode(65 + place)}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {given.answered && (
        <div className="mt-4 text-sm" role="status" aria-label="Botie's feedback">
          <BotieSays mood={right ? "happy" : "curious"} className="flex-col !items-start sm:flex-row">
            <p
              className={
                "font-semibold " +
                (right ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")
              }
            >
              {right ? "That is right." : "Not quite. Let’s look at why."}
            </p>
            <p className="mt-1 text-foreground">{current.because}</p>
            {!right && revisit.length > 0 && (
              <p className="mt-2 text-muted">
                Let’s revisit:{" "}
                {revisit.map((link, index) => (
                  <span key={link.title}>
                    {index > 0 && ", "}
                    <button
                      type="button"
                      onClick={link.go}
                      className="font-medium text-accent underline underline-offset-4 hover:brightness-110"
                    >
                      {link.title}
                    </button>
                  </span>
                ))}
              </p>
            )}
          </BotieSays>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {card > 0 && <Quiet onClick={() => setCard(card - 1)}>Back a question</Quiet>}

        {several && !given.answered && (
          <Solid onClick={() => update({ answered: true })} disabled={given.picked.length === 0}>
            Submit this answer
          </Solid>
        )}

        {given.answered && (
          <>
            <Solid onClick={() => setCard(card + 1)}>
              {card === questions.length - 1 ? "See how you did" : "Next question"}
            </Solid>
            <Quiet onClick={() => update({ picked: [], answered: false })}>
              Try this one again
            </Quiet>
          </>
        )}
      </div>
    </Shell>
  );
}

function Shell({ step, children }: { step: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Question {step}</p>
      {children}
    </div>
  );
}

function Solid({
  onClick,
  disabled = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
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
