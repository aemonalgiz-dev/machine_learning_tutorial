import Link from "next/link";

interface ConceptCard {
  slug: string;
  title: string;
  blurb: string;
  status: "ready" | "planned";
}

const CONCEPTS: ConceptCard[] = [
  {
    slug: "simple-linear-regression",
    title: "Simple linear regression",
    blurb:
      "Fit one straight line to a cloud of points, and watch what 'best fit' actually means.",
    status: "ready",
  },
];

const PLANNED = [
  "Multiple & polynomial regression",
  "Ridge & lasso (why we penalise)",
  "Logistic regression & the sigmoid",
  "k-nearest neighbours",
  "Decision trees",
  "Ensembles: bagging, forests, boosting",
  "k-means & PCA",
  "Kernels & the kernel trick",
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <section className="mb-14">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Machine learning, one concept at a time
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Every idea starts with the problem that forced someone to invent it,
          gets explained twice — once in plain terms, once for the technical
          reader — and comes with something you can poke. The numbers under the
          hood are computed by a from-scratch library, live, so what you see is
          the real thing rather than a cartoon of it.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Start here
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONCEPTS.map((concept) => (
            <Link
              key={concept.slug}
              href={`/concepts/${concept.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                {concept.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {concept.blurb}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Coming next
        </h2>
        <ul className="flex flex-wrap gap-2">
          {PLANNED.map((name) => (
            <li
              key={name}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
