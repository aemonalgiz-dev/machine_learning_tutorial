"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { challengeQuestion, type Exercise, NUMPY_SETUP_COMMANDS, SETUP_COMMANDS } from "@/lib/exercises";
import { draftKey, readDraft, writeDraft, type PracticeDraft } from "@/lib/practice-drafts";
import { usePython } from "@/lib/use-python";
import type { PythonResult } from "@/lib/python";
import { ProgramOutput, PythonCode } from "./PythonCode";

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p className="min-h-64 p-4 text-sm text-muted">Opening your editor...</p>,
});

interface Attempt extends PracticeDraft {
  solutionShown: boolean;
  result?: { execution: PythonResult; source: string; checked: boolean; passed: boolean; message: string };
}
interface PracticeProps {
  exercises: Exercise[];
  lesson: string;
  active: boolean;
  onFinished?: () => void;
}

// Hidden sections do not mount editors or load Python. Drafts survive navigation.
export function PracticeDeck(props: PracticeProps) {
  if (!props.active || !props.exercises.length) return null;
  return <Workspace key={props.lesson} {...props} />;
}

function Workspace({ exercises, lesson, onFinished }: PracticeProps) {
  const [card, setCard] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>(() => exercises.map((problem) => ({
    ...readDraft(draftKey(lesson, problem), problem), solutionShown: false,
  })));
  const latest = useRef(attempts);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [expectedShown, setExpectedShown] = useState(false);
  const reported = useRef(false);
  const mounted = useRef(true);
  const { run, stop, busy, status } = usePython(true);
  const current = exercises[card];
  const attempt = attempts[card];
  const completed = attempts.filter((entry) => entry.solved).length;
  const allFinished = completed === exercises.length;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (!allFinished || reported.current) return;
    reported.current = true;
    onFinished?.();
  }, [allFinished, onFinished]);

  const update = (index: number, changes: Partial<Attempt>) => {
    const next = latest.current.map((entry, at) => at === index ? { ...entry, ...changes } : entry);
    latest.current = next;
    setAttempts(next);
    const entry = next[index];
    setSaved(writeDraft(draftKey(lesson, exercises[index]), { code: entry.code, solved: entry.solved, hintsShown: entry.hintsShown }));
  };

  const execute = async (check: boolean) => {
    if (busy) return;
    const index = card;
    const source = latest.current[index].code;
    update(index, { result: undefined });
    const execution = await run(source, check ? exercises[index].output : undefined);
    if (!mounted.current) return;
    const passed = !execution.error && execution.tests.length > 0 && execution.tests.every((test) => test.status === "passed");
    const comparison = { passed, message: passed ? "Every test passed. Your program produced the requested results." : "The test results below show what to work on next." };
    if (check && !execution.error && !comparison.passed) setExpectedShown(true);
    update(index, {
      result: { execution, source, checked: check, ...comparison },
      solved: latest.current[index].solved || (check && comparison.passed),
    });
  };

  const changeCard = (index: number) => {
    if (busy) stop();
    setCard(index);
    setExpectedShown(false);
    setSaved(null);
  };
  const result = attempt.result;
  const stale = result && result.source !== attempt.code;
  const testCounts = { passed: 0, failed: 0, skipped: 0 };
  for (const test of result?.execution.tests ?? []) testCounts[test.status]++;

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">Tests passed for {completed} of {exercises.length} exercises</p>
        <ol className="flex gap-2" aria-label="Coding challenges">
          {exercises.map((problem, index) => (
            <li key={problem.title}>
              <button type="button" onClick={() => changeCard(index)}
                aria-label={`Challenge ${index + 1}: ${problem.title}${attempts[index].solved ? ", tests passed" : ""}`}
                aria-current={index === card ? "step" : undefined}
                className={"flex h-8 w-8 items-center justify-center rounded-md border font-mono text-xs transition " +
                  (index === card ? "border-accent-fill bg-accent-soft text-accent" : "border-line bg-surface text-muted hover:text-foreground")}
              >{attempts[index].solved ? "✓" : index + 1}</button>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-t-xl border border-line bg-surface p-5 sm:p-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">Your challenge · {card + 1} of {exercises.length}</p>
        <h3 className="text-xl font-semibold leading-snug text-foreground">{challengeQuestion(current)}</h3>
        <div className="mt-4 space-y-3 leading-7 text-foreground">
          {current.task.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <p className="mt-4 text-sm text-muted">Complete the code below, then run it to see what your program does. When you are ready, check its output against the challenge.</p>
      </div>

      <div className="overflow-hidden rounded-b-xl border-x border-b border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-line bg-raised px-4 py-2.5">
          <span className="font-mono text-xs text-foreground">solution.py</span>
          <span className="font-mono text-xs text-muted">{/(?:from|import)\s+oop_ml\b/.test(attempt.code) ? "NumPy + oop_ml" : "Python + NumPy"}</span>
        </div>
        <PythonEditor key={current.title} label={`Python solution for ${current.title}`} value={attempt.code}
          onChange={(code) => update(card, { code })} onRun={() => void execute(false)} onCheck={() => void execute(true)} />
        <div className="flex flex-wrap items-center gap-3 border-t border-line bg-raised p-3">
          <Solid disabled={busy || !attempt.code.trim()} onClick={() => void execute(false)}>Run code</Solid>
          <button type="button" disabled={busy || !attempt.code.trim()} onClick={() => void execute(true)}
            className="rounded-md border border-accent-fill px-3 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent-soft disabled:opacity-40">Run tests</button>
          {busy && <Quiet onClick={() => stop()}>Stop</Quiet>}
          <Quiet disabled={busy} onClick={() => update(card, { code: current.starter, result: undefined })}>Reset code</Quiet>
          <span className="ml-auto text-xs text-muted">{saved === true ? "Saved in this browser" : saved === false ? "Draft could not be saved in this browser" : "Drafts stay in this browser"}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-surface p-4" aria-live="polite" aria-busy={busy}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">Your output</h4>
          {result && !result.execution.error && <span className="font-mono text-xs text-muted">{result.execution.elapsed} ms</span>}
        </div>
        {busy ? <p className="mt-3 text-sm text-muted">{status}</p> : result ? (
          <>
            {stale && <p className="mt-3 text-sm text-muted">You have edited the code since this run. Run it again to see the new result.</p>}
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-foreground">{result.execution.stdout || (result.execution.error ? "" : "Your program finished without printing anything.")}</pre>
            {result.execution.stderr && <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">{result.execution.stderr}</pre>}
            {result.execution.error ? <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-rose-700 dark:text-rose-300">{result.execution.error}</pre> : result.checked && (
              <div className="mt-3 border-t border-line pt-3 text-sm">
                <p className={"font-semibold " + (result.passed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>{result.passed ? "All tests passed" : "Some tests need another look"}</p>
                <p className="mt-1 text-foreground">{result.message}</p>
                {result.passed && current.check && <p className="mt-2 leading-6 text-muted">{current.check.because}</p>}
              </div>
            )}
          </>
        ) : <p className="mt-3 text-sm text-muted">Your printed results and any Python errors will appear here.</p>}
      </div>

      {result?.checked && result.execution.tests.length > 0 && (
        <div className="mt-4 rounded-lg border border-line bg-surface p-4" aria-label="Test results" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground">Test results · {result.execution.tests.length} total</h4>
            <p aria-label="Test counts" className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums">
              <span className="text-emerald-700 dark:text-emerald-300">{testCounts.passed} passed</span>
              <span className="text-rose-700 dark:text-rose-300">{testCounts.failed} failed</span>
              {testCounts.skipped > 0 && <span className="text-muted">{testCounts.skipped} skipped</span>}
            </p>
          </div>
          {stale && <p className="mt-2 text-xs text-muted">These tests describe the code from your last run.</p>}
          <ol className="mt-3 max-h-96 divide-y divide-line overflow-auto">
            {result.execution.tests.map((test, index) => <li key={index} className="py-2 text-sm">
              <details open={test.status === "failed" || undefined}>
                <summary className="cursor-pointer text-foreground"><span className={test.status === "passed" ? "text-emerald-700 dark:text-emerald-300" : test.status === "failed" ? "text-rose-700 dark:text-rose-300" : "text-muted"}>{test.status === "passed" ? "✓ Passed" : test.status === "failed" ? "× Failed" : "Skipped"}</span><span className="ml-3">{test.name}</span></summary>
                {test.detail && <p className="mt-2 leading-6 text-muted">{test.detail}</p>}
                {test.expected !== undefined && <div className="mt-2 space-y-2 font-mono text-xs text-foreground"><p className="text-muted">Expected</p><pre className="overflow-auto whitespace-pre-wrap">{test.expected}</pre><p className="text-muted">Received</p><pre className="overflow-auto whitespace-pre-wrap">{test.actual || "(no output)"}</pre></div>}
              </details>
            </li>)}
          </ol>
        </div>
      )}

      <details className="mt-3 rounded-lg border border-line bg-surface px-4 py-3" open={expectedShown || undefined}
        onToggle={(event) => setExpectedShown(event.currentTarget.open)}>
        <summary className="cursor-pointer text-sm font-medium text-foreground">Expected results and what the tests check</summary>
        <p className="mt-3 text-sm leading-6 text-muted">The tests run in Python after your program. They check that it finishes, prints every requested line, and produces the values below in order with these labels. Spacing can differ, and numbers are checked to the precision shown. These tests verify your results, not how you wrote the program.</p>
        <ProgramOutput output={current.output} />
        {current.browserNote && <p className="text-sm leading-6 text-muted">{current.browserNote}</p>}
      </details>

      {current.hints && current.hints.length > 0 && (
        <div className="mt-5 space-y-3">
          {current.hints.slice(0, attempt.hintsShown).map((hint, index) => (
            <p key={hint} className="rounded-md border-l-2 border-accent-fill bg-accent-soft px-4 py-3 text-sm leading-6 text-foreground">
              <span className="mr-2 font-mono text-xs text-accent">Hint {index + 1}</span>{hint}
            </p>
          ))}
          {attempt.hintsShown < current.hints.length && <Quiet onClick={() => update(card, { hintsShown: attempt.hintsShown + 1 })}>
            {attempt.hintsShown === 0 ? "I could use a hint" : "Show the next hint"}
          </Quiet>}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Quiet onClick={() => update(card, { solutionShown: !attempt.solutionShown })}>{attempt.solutionShown ? "Hide the worked solution" : "Show the worked solution"}</Quiet>
      </div>
      {attempt.solutionShown && <div className="mt-3">
        <p className="text-sm leading-6 text-muted">One way to solve it. Read through the steps, then try them in your own code and run the tests to check the result.</p>
        <PythonCode source={current.solution} label="Worked solution" />
        <Quiet disabled={busy} onClick={() => update(card, { code: current.solution, result: undefined })}>Replace editor with this solution</Quiet>
      </div>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Quiet disabled={card === 0} onClick={() => changeCard(card - 1)}>Previous challenge</Quiet>
        {card < exercises.length - 1 ? <Solid onClick={() => changeCard(card + 1)}>Next challenge →</Solid>
          : <p className="text-sm text-muted">{allFinished ? "The tests have passed for each exercise in this set." : "You can revisit any exercise using the numbers above."}</p>}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted">Python runs in your browser. Its first run downloads the libraries it needs. Each run starts with fresh variables; Stop ends a running program.</p>
      <div className="mt-4"><PracticeSetup usesSdk={/(?:from|import)\s+oop_ml\b/.test(current.solution)} /></div>
    </div>
  );
}

export function PracticeSetup({ usesSdk }: { usesSdk: boolean }) {
  return (
    <details className="rounded-lg border border-line bg-surface px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">Prefer your own editor?</summary>
      <div className="mt-3 space-y-3 border-t border-line pt-3 text-sm text-foreground">
        <p>The same script runs on your machine. Install {usesSdk ? "oop_ml" : "NumPy"}, then save your code as a Python file and run it.</p>
        <PythonCode source={usesSdk ? SETUP_COMMANDS : NUMPY_SETUP_COMMANDS} label="Terminal" />
        <p className="text-muted">Use Python 3.11 or later.{usesSdk && " The optional PyTorch and scikit-learn backends are not needed for this challenge."}</p>
      </div>
    </details>
  );
}

function Solid({ onClick, disabled = false, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="rounded-md bg-accent-fill px-3 py-1.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100">{children}</button>;
}
function Quiet({ onClick, disabled = false, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="text-sm font-medium text-accent underline underline-offset-4 hover:brightness-110 disabled:opacity-40">{children}</button>;
}
