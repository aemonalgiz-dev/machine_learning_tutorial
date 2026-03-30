// A longer-form shell for the foundation-maths primers.
//
// The concept pages fit one idea into a compact history / plain / technical
// layout around a single widget. A primer covers more ground -- what a thing is,
// how it behaves, where it breaks, why the models need it -- and cramming that
// into two columns leaves no room to read. So a primer is just a title and a
// stack of full-width sections, each holding one idea, with the widget dropped
// into whichever section introduces it.

import { ReactNode } from "react";

export function PrimerPage({
  title,
  tagline,
  prerequisites,
  children,
}: {
  title: string;
  tagline: string;
  prerequisites?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          {tagline}
        </p>
      </header>

      {prerequisites && (
        <aside className="mb-10 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Before this:{" "}
          </span>
          {prerequisites}
        </aside>
      )}

      <div className="space-y-12">{children}</div>
    </article>
  );
}

export function PrimerSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <div className="space-y-4 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

// The widget in its own framed box, the same treatment the concept pages give
// their playground.
export function PrimerPlayground({ children }: { children: ReactNode }) {
  return (
    <div className="my-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  );
}

// Equations get their own line, set like a code block, never inside a sentence.
export function Equation({ children }: { children: string }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {children}
    </pre>
  );
}
