"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EXECUTION_LIMIT_MS, LOADING_LIMIT_MS, type PythonMessage, type PythonResult } from "./python";

interface PendingRun {
  timer: ReturnType<typeof setTimeout>;
  resolve: (result: PythonResult) => void;
}

const failure = (error: string): PythonResult => ({ stdout: "", stderr: "", error, elapsed: 0, tests: [] });

// Exactly one worker per open coding workspace, started on the first run.
// Termination works even for Python stuck in a loop or a long native operation.
export function usePython(active: boolean) {
  const worker = useRef<Worker | null>(null);
  const pending = useRef<PendingRun | null>(null);
  const sequence = useRef(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = useCallback((result: PythonResult) => {
    const running = pending.current;
    if (!running) return;
    clearTimeout(running.timer);
    pending.current = null;
    setBusy(false);
    setStatus("");
    running.resolve(result);
  }, []);

  const stop = useCallback((message = "Stopped. Your code is still here. You can edit it and run again.") => {
    worker.current?.terminate();
    worker.current = null;
    finish(failure(message));
  }, [finish]);

  useEffect(() => {
    if (!active) stop();
    return () => stop();
  }, [active, stop]);

  const run = useCallback((source: string, expected?: string): Promise<PythonResult> => {
    if (pending.current) return Promise.resolve(failure("A program is already running."));
    if (source.length > 100_000) return Promise.resolve(failure("Keep this example below 100,000 characters."));
    return new Promise((resolve) => {
      const id = ++sequence.current;
      try {
        worker.current ??= new Worker("/python/worker.mjs", { type: "module" });
        const currentWorker = worker.current;
        const timer = setTimeout(() => stop("Python could not finish loading. Check your connection, then try Run again."), LOADING_LIMIT_MS);
        pending.current = { timer, resolve };
        setBusy(true);
        setStatus("Preparing Python for your code...");
        currentWorker.onmessage = (event: MessageEvent<PythonMessage>) => {
          if (worker.current !== currentWorker || event.data.id !== id || !pending.current) return;
          const message = event.data;
          if (message.type === "status") setStatus(message.message);
          else if (message.type === "running") {
            clearTimeout(pending.current.timer);
            pending.current.timer = setTimeout(() => stop("Stopped after 60 seconds. Check for an endless loop or try a smaller example."), EXECUTION_LIMIT_MS);
            setStatus("Running your code...");
          } else if (message.type === "result") finish(message.result);
          else stop(message.message);
        };
        currentWorker.onerror = (event) => {
          event.preventDefault();
          if (worker.current === currentWorker) stop("The Python worker could not start or stopped unexpectedly. Try Run again to reload it.");
        };
        currentWorker.postMessage({ id, source, expected });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        worker.current?.terminate();
        worker.current = null;
        if (pending.current) finish(failure(message));
        else resolve(failure(message));
      }
    });
  }, [finish, stop]);

  return { run, stop, busy, status };
}
