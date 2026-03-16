// The reusable shell every concept page is poured into.
//
// The teaching structure, made concrete: a concept opens with the *problem that
// forced someone to invent it* (not a timeline), then explains itself twice --
// once for a layperson, once for a technical reader -- with both explanations
// narrating one shared interactive playground rather than two separate ones. The
// playground sits between the two tracks so it belongs to both: the layperson
// reads what to watch, the technical reader reads why it moves, and they poke
// the same live example.

import { ReactNode } from "react";

interface ConceptPageProps {
  title: string;
  tagline: string;
  history: ReactNode;
  playground: ReactNode;
  layperson: ReactNode;
  technical: ReactNode;
  prerequisites?: ReactNode;
}

export function ConceptPage({
  title,
  tagline,
  history,
  playground,
  layperson,
  technical,
  prerequisites,
}: ConceptPageProps) {
  return (
    <article className="mx-auto max-w-5xl px-6 py-12">
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

      <Section title="Where This Came From">{history}</Section>

      <section className="my-12">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {playground}
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <Section title="How to Conceptualize">{layperson}</Section>
        <Section title="The Mechanism">{technical}</Section>
      </div>
    </article>
  );
}

function Section({
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
