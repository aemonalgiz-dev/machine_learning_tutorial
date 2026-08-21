// The content treatments a page uses instead of labelling its readers.
//
// A page could sort its material by audience, "for beginners" here and "for the
// mathematically inclined" there, and that would tell some readers they are not
// welcome in half of it. These do the same job without saying so. Each block is
// a kind of content rather than a kind of person, so a reader takes what they
// want from a page and skips what they do not, and nothing on the page has an
// opinion about which of those they are.
//
// Worked example      enough arithmetic to reproduce the idea
// Why this works      the derivation, folded away until it is wanted
// Keep in mind        a qualification the idea would be misleading without
// In a model          the translation from the small example to the real thing

import { ReactNode } from "react";

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}

// One numbered step inside a longer section.
//
// The concept pages fold each section away behind a heading, which suits a page
// covering one idea and fights a page covering fifteen. Where a subject needs
// the longer treatment, the folded headings become the parts of the argument and
// these are the steps inside one of them, so the order stays visible without the
// reader opening fifteen drawers to find it.
export function SubSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <div className="space-y-4 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

// Arithmetic small enough to check by hand. Set apart so a reader who wants the
// numbers can find them and a reader who does not can step over them.
export function WorkedExample({
  title = "Worked example",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-5 rounded-lg border border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40">
      <Label>{title}</Label>
      <div className="space-y-3 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

// The derivation, closed by default. Nobody needs it to follow the page, and
// leaving it open would make the page look like it demanded more than it does.
export function WhyThisWorks({
  title = "Why this works",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <details className="group my-5 rounded-lg border border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700 marker:content-none hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">
          &rsaquo;
        </span>
        {title}
      </summary>
      <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 text-slate-700 dark:border-slate-800 dark:text-slate-300">
        {children}
      </div>
    </details>
  );
}

// The caveat that stops the idea being read as more than it is. Marked, because
// a qualification buried in a paragraph reads as a footnote and gets skipped.
export function KeepInMind({
  title = "Keep in mind",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-5 rounded-lg border-l-4 border-amber-400 bg-amber-50/60 px-5 py-4 dark:border-amber-500/70 dark:bg-amber-950/20">
      <Label>{title}</Label>
      <div className="space-y-3 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

// What the small example becomes at the scale a real model works at. Kept
// separate so the example stays small and the leap is visible as a leap.
export function InAModel({
  title = "In a model",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-5 rounded-lg border-l-4 border-sky-400 bg-sky-50/60 px-5 py-4 dark:border-sky-500/70 dark:bg-sky-950/20">
      <Label>{title}</Label>
      <div className="space-y-3 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

// A derivation as a sequence of expressions with a note on what each step did.
//
// The alternative is a paragraph per algebraic move, which buries the shape of
// the derivation in prose. Here the left column is the mathematics and the right
// column says why that line differs from the one above it, so a reader can
// follow the purpose without doing the algebra and check the algebra without
// re-reading the purpose.
export function DerivationTable({
  rows,
  expressionHeading = "Expression",
  reasonHeading = "What changed",
}: {
  rows: { expression: string; reason: string }[];
  expressionHeading?: string;
  reasonHeading?: string;
}) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
              {expressionHeading}
            </th>
            <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
              {reasonHeading}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.expression + row.reason}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className="whitespace-pre py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                {row.expression}
              </td>
              <td className="py-2 text-slate-600 dark:text-slate-400">
                {row.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// A small table of numbers, for a sweep whose point is the trend down a column.
export function NumberTable({
  headings,
  rows,
  caption,
}: {
  headings: string[];
  rows: string[][];
  caption?: string;
}) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            {headings.map((heading, column) => (
              <th
                key={`${column}-${heading}`}
                className="py-2 pr-6 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, position) => (
            <tr
              key={`${position}-${row.join("|")}`}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              {row.map((cell, column) => (
                <td
                  key={`${column}-${cell}`}
                  className="py-2 pr-6 font-mono text-slate-800 last:pr-0 dark:text-slate-200"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {caption}
        </p>
      )}
    </div>
  );
}
