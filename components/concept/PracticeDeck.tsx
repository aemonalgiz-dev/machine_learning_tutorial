"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { challengeQuestion, type Exercise, NUMPY_SETUP_COMMANDS, SETUP_COMMANDS } from "@/lib/exercises";
import { draftKey, readDraft, type PracticeDraft } from "@/lib/practice-drafts";
import { useLearnerField, fingerprint, migrateLearnerRecord, useLearnerRecord, useLearnerStorageStatus } from "@/lib/learner-state";
import { getProgressAccount, useProgressAccount } from "@/lib/progress";
import { usePython } from "@/lib/use-python";
import type { PythonResult } from "@/lib/python";
import { ProgramOutput, PythonCode } from "./PythonCode";
import { BotieSays } from "@/components/site/Botie";
import { SqlData } from "./SqlData";

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => <p className="h-[clamp(20rem,52vh,32rem)] p-4 text-sm text-muted">Opening your editor...</p>,
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
  const account = useProgressAccount();
  const key = `practice:${lesson}:${fingerprint(exercises.map(problem => problem.language === 'sql' ? [problem.title, problem.starter, problem.output, problem.sql?.setup] : [problem.title, problem.starter, problem.output]))}`;
  const work = useLearnerRecord(key, () => ({ card: 0, attempts: exercises.map((problem): Attempt => ({
    code: problem.starter, solved: false, hintsShown: 0, solutionShown: false,
  })) }), raw => {
    const value = raw as { card: number; attempts: Attempt[] };
    return !!value && Number.isInteger(value.card) && value.card >= 0 && value.card < exercises.length &&
      Array.isArray(value.attempts) && value.attempts.length === exercises.length && value.attempts.every(entry =>
        entry && typeof entry.code === "string" && typeof entry.solved === "boolean" && Number.isInteger(entry.hintsShown));
  });
  const [card, setCard] = useLearnerField(work, "card");
  const [attempts, setAttempts] = useLearnerField(work, "attempts");
  const latest = useRef(attempts);
  useEffect(() => { latest.current = attempts; }, [attempts]);
  const { storageFailed } = useLearnerStorageStatus();
  useEffect(() => {
    if (getProgressAccount() !== account) return;
    try {
      if (exercises.some(problem => localStorage.getItem(draftKey(lesson, problem)))) migrateLearnerRecord(key, {
        card: 0, attempts: exercises.map(problem => ({ ...readDraft(draftKey(lesson, problem), problem), solutionShown: false })),
      }, account);
    } catch { /* Old drafts are optional. */ }
  }, [key, lesson, exercises, account]);
  const [expectedShown, setExpectedShown] = useState(false);
  const reported = useRef(false);
  const mounted = useRef(true);
  const { run, stop, busy, status } = usePython(true);
  const current = exercises[card];
  const isSql = current.language === "sql";
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
    setAttempts(previous => {
      const next = previous.map((entry, at) => at === index ? { ...entry, ...changes } : entry);
      latest.current = next;
      return next;
    });
  };

  const execute = async (check: boolean) => {
    if (busy) return;
    const index = card;
    const source = latest.current[index].code;
    update(index, { result: undefined });
    const execution = await run(source, check ? exercises[index].output : undefined, check ? exercises[index].tests : undefined, exercises[index].exports, exercises[index].sql);
    if (!mounted.current) return;
    const passed = !execution.error && execution.tests.length > 0 && execution.tests.every((test) => test.status === "passed");
    const comparison = { passed, message: passed ? "Every test passed. Your code produced the requested results." : "The test results below show what to work on next." };
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
  };
  const result = attempt.result;
  const stale = result && result.source !== attempt.code;
  const testCounts = { passed: 0, failed: 0, skipped: 0 };
  for (const test of result?.execution.tests ?? []) testCounts[test.status]++;

  return (
    <div className="@container min-w-0">
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

      <div className="grid items-start gap-6 @[60rem]:grid-cols-[minmax(24rem,2fr)_minmax(32rem,3fr)]">
        <div className="min-w-0" role="group" aria-label="Challenge instructions">
          <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">Your challenge · {card + 1} of {exercises.length}</p>
            <h3 className="text-xl font-semibold leading-snug text-foreground">{challengeQuestion(current)}</h3>
            <div className="mt-4 space-y-3 leading-7 text-foreground">
              {current.task.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <p className="mt-4 text-sm text-muted">{isSql ? "Write your SQL in the editor. Run it to see the result table, then run the tests to check your query. Each run starts from the tables below." : "Complete the code in the editor, then run it to see what your program does. When you are ready, run the tests to check its output against the challenge."}</p>
            {isSql && <SqlData tables={current.sql?.tables ?? []} label="Challenge tables" />}
          </div>

          <details className="mt-3 rounded-lg border border-line bg-surface px-4 py-3" open={expectedShown || undefined}
            onToggle={(event) => setExpectedShown(event.currentTarget.open)}>
            <summary className="cursor-pointer text-sm font-medium text-foreground">Expected results and what the tests check</summary>
            <p className="mt-3 text-sm leading-6 text-muted">{isSql ? "The tests compare the returned values in column and row order, then check the behaviour described below. Additional checks test whether the query still works when the data changes or whether the database enforces the requested rules. Different queries can pass." : <>The tests check that your program finishes and prints the requested results in order. Spacing can differ, and numbers are checked to the precision shown. {current.tests?.length ? "They also call your functions on further inputs. Each check below describes the behaviour it expects; different implementations can pass." : "These checks verify the printed results."}</>}</p>
            {current.tests?.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{current.tests.map(test=><li key={test.name}>{test.name}</li>)}</ul> : null}
            {isSql && current.sql?.expectedTable ? <SqlData tables={[current.sql.expectedTable]} label="Expected query result" /> : <ProgramOutput output={current.output} />}
            {current.browserNote && <p className="text-sm leading-6 text-muted">{current.browserNote}</p>}
          </details>

          {current.hints && current.hints.length > 0 && (
            <div className="mt-5 space-y-3">
              <div aria-live="polite" aria-relevant="additions text">
                {attempt.hintsShown > 0 && (
                  <BotieSays mood="thinking" className="flex-col !items-start sm:flex-row">
                    <ol className="space-y-4" aria-label="Hints from Botie">
                      {current.hints.slice(0, attempt.hintsShown).map((hint, index) => (
                        <li key={hint}>
                          <p className="mb-1 font-mono text-xs text-accent">Hint {index + 1}</p>
                          <p>{hint}</p>
                        </li>
                      ))}
                    </ol>
                  </BotieSays>
                )}
              </div>
              {attempt.hintsShown < current.hints.length && <Quiet onClick={() => update(card, { hintsShown: attempt.hintsShown + 1 })}>
                {attempt.hintsShown === 0 ? "Ask Botie for a hint" : "Ask Botie for another hint"}
              </Quiet>}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Quiet onClick={() => update(card, { solutionShown: !attempt.solutionShown })}>{attempt.solutionShown ? "Hide the worked solution" : "Show the worked solution"}</Quiet>
          </div>
          {attempt.solutionShown && <div className="mt-3">
            <p className="text-sm leading-6 text-muted">One way to solve it. Read through the steps, then try them in your own code and run the tests to check the result.</p>
            <PythonCode source={current.solution} label="Worked solution" language={current.language} />
            <Quiet disabled={busy} onClick={() => update(card, { code: current.solution, result: undefined })}>Replace editor with this solution</Quiet>
          </div>}
        </div>

        <div className="min-w-0" role="group" aria-label="Code and results">
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-raised px-4 py-2.5">
              <span className="font-mono text-xs text-foreground">{isSql ? "solution.sql" : "solution.py"}</span>
              <span className="font-mono text-xs text-muted">{isSql ? "SQLite · fresh database each run" : /(?:from|import)\s+oop_ml\b/.test(current.solution) ? "NumPy + oop_ml" : /(?:from|import)\s+numpy\b/.test(current.solution) ? "Python + NumPy" : "Python · standard library"}</span>
            </div>
            <PythonEditor key={current.title} language={current.language} label={`${isSql ? 'SQL' : 'Python'} solution for ${current.title}`} value={attempt.code}
              onChange={(code) => update(card, { code })} onRun={() => void execute(false)} onCheck={() => void execute(true)} />
            <div className="flex flex-wrap items-center gap-3 border-t border-line bg-raised p-3">
              <Solid disabled={busy || !attempt.code.trim()} onClick={() => void execute(false)}>Run code</Solid>
              <button type="button" disabled={busy || !attempt.code.trim()} onClick={() => void execute(true)}
                className="rounded-md border border-accent-fill px-3 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent-soft disabled:opacity-40">Run tests</button>
              {busy && <Quiet onClick={() => stop()}>Stop</Quiet>}
              <Quiet disabled={busy} onClick={() => update(card, { code: current.starter, result: undefined })}>Reset code</Quiet>
              <span className="ml-auto text-xs text-muted">{storageFailed ? "Browser storage is full. Keep this tab open until sync finishes." : account ? "Drafts save here and sync to your account" : "Saved in this browser"}</span>
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
                {isSql && result.execution.table ? <SqlData tables={[result.execution.table]} label="SQL result" /> : <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-foreground">{result.execution.stdout || (result.execution.error ? "" : "Your program finished without printing anything.")}</pre>}
                {result.execution.stderr && <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">{result.execution.stderr}</pre>}
                {result.execution.artifacts?.map(file=><button key={file.filename} className="mt-3 block min-h-11 text-sm text-accent underline" onClick={()=>{const url=URL.createObjectURL(new Blob([file.content],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=file.filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download {file.filename}</button>)}
                {result.execution.error ? <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-rose-700 dark:text-rose-300">{result.execution.error}</pre> : result.checked && (
                  <div className="mt-3 border-t border-line pt-3 text-sm">
                    <p className={"font-semibold " + (result.passed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>{result.passed ? "All tests passed" : "Some tests need another look"}</p>
                    <p className="mt-1 text-foreground">{result.message}</p>
                    {result.passed && current.check && <p className="mt-2 leading-6 text-muted">{current.check.because}</p>}
                  </div>
                )}
              </>
            ) : <p className="mt-3 text-sm text-muted">{isSql ? "Your result table and any SQL errors will appear here." : "Your printed results and any Python errors will appear here."}</p>}
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

        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Quiet disabled={card === 0} onClick={() => changeCard(card - 1)}>Previous challenge</Quiet>
        {card < exercises.length - 1 ? <Solid onClick={() => changeCard(card + 1)}>Next challenge →</Solid>
          : <p className="text-sm text-muted">{allFinished ? "The tests have passed for each exercise in this set." : "You can revisit any exercise using the numbers above."}</p>}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted">{isSql ? "SQL runs against SQLite in your browser. Each run rebuilds the lesson database, so experiments cannot change later attempts. Stop ends a running query." : "Python runs in your browser. Its first run downloads the libraries it needs. Each run starts with fresh variables; Stop ends a running program."}</p>
      <div className="mt-4">{isSql ? <details className="rounded-lg border border-line bg-surface px-4 py-3"><summary className="cursor-pointer text-sm font-semibold">Database setup and using your own editor</summary><p className="mt-3 text-sm leading-6 text-muted">Create a temporary SQLite database with this setup, then run your query. The browser uses SQLite 3.39. SQL written for PostgreSQL or another database may need changes.</p><PythonCode source={current.sql?.setup ?? ''} language="sql" /></details> : <PracticeSetup usesSdk={/(?:from|import)\s+oop_ml\b/.test(current.solution)} usesNumpy={/(?:from|import)\s+numpy\b/.test(current.solution)} />}</div>
    </div>
  );
}

export function PracticeSetup({ usesSdk, usesNumpy = true }: { usesSdk: boolean; usesNumpy?: boolean }) {
  return (
    <details className="rounded-lg border border-line bg-surface px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">Prefer your own editor?</summary>
      <div className="mt-3 space-y-3 border-t border-line pt-3 text-sm text-foreground">
        <p>{usesSdk || usesNumpy ? <>The same script runs on your machine. Install {usesSdk ? "oop_ml" : "NumPy"}, then save your code as a Python file and run it.</> : "This exercise uses Python's standard library. Save your code as solution.py and run it with Python."}</p>
        <PythonCode source={usesSdk ? SETUP_COMMANDS : usesNumpy ? NUMPY_SETUP_COMMANDS : "python solution.py"} label="Terminal" />
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
