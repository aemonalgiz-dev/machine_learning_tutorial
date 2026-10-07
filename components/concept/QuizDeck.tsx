"use client";

// A quiz section, worked one card at a time.
//
// The questions are a section of the lesson rather than a footnote to one, so
// they sit in the section list beside the parts they draw on and a reader can
// come back to them. Inside the section only one question is on screen, because
// a page of questions invites skimming for the ones that look easy.
//
// A question with one answer marks itself the moment it is answered and then
// moves on by itself. There is nothing to confirm when choosing is the whole
// act, and a button there only asks the reader to say twice what they already
// said once. A question where several options may hold is different: the reader
// is still composing their answer while they click, so it waits to be
// submitted.
//
// Moving on by itself has one hazard, which is carrying the reader away from a
// reason they are halfway through reading. So the pause before the flip is
// scaled to how long the reason takes to read, a bar shows it running down, and
// the reader can move on early or go back afterwards. Pressing the question
// again stops it.
//
// A wrong answer also offers the parts of the lesson the question came from,
// because the reason under the answer is a summary and the part is the
// argument.

import { useEffect, useRef, useState } from "react";
import { QuizQuestion, answersOf, arranged, isCorrect } from "@/lib/quizzes";

interface Attempt {
  // Indices as written, not as shown.
  picked: number[];
  answered: boolean;
}

export interface RevisitLink {
  title: string;
  go: () => void;
}

// Roughly how long the reason takes to read, bounded so a one-line reason still
// lands and a long one does not strand the reader waiting.
//
// The first attempt allowed 180ms a word over a 2s base, which put almost every
// card at the twelve-second ceiling and felt like being held there. These
// figures are brisk on purpose: a reader who wants longer has the question in
// front of them and can come back to it, and one who has already understood
// should not be made to wait. Measured, a fifty-word reason now waits nine
// seconds rather than twelve.
function pauseFor(because: string): number {
  const words = because.trim().split(/\s+/).length;
  return Math.min(Math.max(1500 + words * 140, 3500), 9000);
}

export function QuizDeck({
  questions,
  revisit = [],
  onFinished,
}: {
  questions: QuizQuestion[];
  revisit?: RevisitLink[];
  onFinished?: () => void;
}) {
  const [card, setCard] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>(() =>
    questions.map(() => ({ picked: [], answered: false })),
  );
  const reported = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finished = card >= questions.length;
  const question = finished ? null : questions[card];
  const attempt = finished ? null : attempts[card];
  const several = question?.kind === "several";
  const waiting = Boolean(attempt?.answered) && !several && !finished;

  // The pending flip. It is tied to the card and to whether that card has been
  // answered, so pressing the question again clears it by changing the second.
  // Nothing is set here; the bar is a keyframe restarted by its key, which keeps
  // this effect to the one thing an effect is for.
  useEffect(() => {
    if (!waiting || question === null) return;
    timer.current = setTimeout(() => setCard((shown) => shown + 1), pauseFor(question.because));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [waiting, card, question]);

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
        <p className="text-lg font-semibold text-foreground">
          You answered {scored} of {questions.length}.
        </p>
        <p className="mt-2 text-sm text-muted">
          {scored === questions.length
            ? "Every one. The section behind these is the one to move on from."
            : "Going back through the ones you missed is worth more than the score."}
        </p>
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
        <div className="mt-4 text-sm">
          <p
            className={
              "font-semibold " +
              (right ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")
            }
          >
            {right ? "That is right." : "Not quite."}
          </p>
          <p className="mt-1 text-foreground">{current.because}</p>
          {!right && revisit.length > 0 && (
            <p className="mt-2 text-muted">
              Worth another look:{" "}
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
        </div>
      )}

      {waiting && (
        <div className="mt-4">
          <div className="h-0.5 w-full overflow-hidden rounded bg-raised" aria-hidden="true">
            <div
              key={card}
              className="quiz-sweep h-full bg-accent-fill"
              style={{ animationDuration: `${pauseFor(current.because)}ms` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {card === questions.length - 1
              ? "Showing how you did in a moment."
              : "Moving to the next question in a moment."}
          </p>
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
