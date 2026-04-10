// The reusable shell every concept page is poured into.
//
// A concept opens with the problem that forced it, then a shared interactive
// playground, then its explanations stacked full-width rather than in columns.
// The explanations are collapsible: the first is open by default, and the rest
// are folded away for the reader who wants them. A page passes as many sections
// as its subject needs rather than filling three fixed slots. Native <details>
// does the folding, so the page stays a server component.

import { ReactNode } from "react";

export interface ConceptSection {
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface ConceptPageProps {
  title: string;
  tagline: string;
  history: ReactNode;
  playground: ReactNode;
  sections: ConceptSection[];
  prerequisites?: ReactNode;
}

export function ConceptPage({
  title,
  tagline,
  history,
  playground,
  sections,
  prerequisites,
}: ConceptPageProps) {
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

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Where This Came From
        </h2>
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          {history}
        </div>
      </section>

      <section className="my-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {playground}
        </div>
      </section>

      <div className="border-t border-slate-200 dark:border-slate-800">
        {sections.map((section) => (
          <CollapsibleSection
            key={section.title}
            title={section.title}
            defaultOpen={section.defaultOpen}
          >
            {section.content}
          </CollapsibleSection>
        ))}
      </div>
    </article>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-slate-200 dark:border-slate-800"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-2xl font-semibold text-slate-900 [&::-webkit-details-marker]:hidden dark:text-slate-100">
        {title}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="ml-4 h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div className="space-y-4 pb-6 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </details>
  );
}
