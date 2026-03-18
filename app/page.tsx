import Link from "next/link";

interface Concept {
  title: string;
  blurb: string;
  // A slug means the concept has a live page and the card links to it. Without
  // one the card is a placeholder, shown but not yet clickable.
  slug?: string;
}

interface Bucket {
  heading: string;
  blurb: string;
  concepts: Concept[];
}

// The site as a small curriculum. Fundamental Mathematics comes first and stays
// deliberately short: only the parts of each subject the later concepts lean on,
// not a course in their own right.
const CURRICULUM: Bucket[] = [
  {
    heading: "Fundamental Mathematics",
    blurb:
      "While the mathematics for the field of machine learning is vast, there are only a handful of concepts required to understand the fundamentals. These concepts are provided in the sections below. They're far from complete courses on the topics, just what we need to understand the rest of the material.",
    concepts: [
      {
        title: "Calculus Primer",
        blurb:
          "Derivatives, and why setting one to zero is how a fit finds the bottom of its error.",
      },
      {
        title: "Linear Algebra Primer",
        blurb:
          "Vectors and matrices, the language every model past a single line is written in.",
      },
      {
        title: "Statistics & Probability Primer",
        blurb:
          "Mean, variance, and what it takes to say one quantity explains another.",
      },
    ],
  },
  {
    heading: "Regression",
    blurb: "Predicting a number from other numbers.",
    concepts: [
      {
        title: "Simple Linear Regression",
        slug: "simple-linear-regression",
        blurb:
          "Fit a single straight line to a cloud of points, and see what best fit really means.",
      },
      {
        title: "Multiple & Polynomial Regression",
        blurb: "More than one feature at a time, and curves as well as straight lines.",
      },
      {
        title: "Ridge & Lasso",
        blurb:
          "Why deliberately fitting a little worse can predict a good deal better.",
      },
    ],
  },
  {
    heading: "Classification",
    blurb: "Predicting which group something belongs to.",
    concepts: [
      {
        title: "Logistic Regression",
        blurb:
          "Bending a line into a probability, and drawing a boundary between two classes.",
      },
      {
        title: "k-Nearest Neighbours",
        blurb:
          "No training at all: a point is whatever its closest neighbours are.",
      },
      {
        title: "Decision Trees",
        blurb: "A sequence of yes-or-no questions, each one learned from the data.",
      },
    ],
  },
  {
    heading: "Ensembles",
    blurb: "Many models together, outvoting any one of them.",
    concepts: [
      {
        title: "Bagging, Forests & Boosting",
        blurb: "Why a crowd of weak models can beat a single strong one.",
      },
    ],
  },
  {
    heading: "Unsupervised Learning",
    blurb: "Finding structure in data that carries no labels.",
    concepts: [
      {
        title: "k-Means Clustering",
        blurb: "Sorting points into groups that no one labelled in advance.",
      },
      {
        title: "Principal Component Analysis",
        blurb: "The few directions the data actually varies along.",
      },
    ],
  },
  {
    heading: "Kernels",
    blurb: "Working in a huge space without ever building it.",
    concepts: [
      {
        title: "The Kernel Trick",
        blurb:
          "Curved boundaries, computed as if the data had never left a straight line.",
      },
    ],
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <section className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Machine learning, one concept at a time
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Every idea here starts with the problem that made someone invent it.
          Then it is explained twice, once in plain language and once for a
          technical reader, and it comes with something you can experiment with.
          The numbers behind each example are computed live by a machine learning
          library written from scratch, so what you are looking at is the real
          method running, not a simplified stand-in for it.
        </p>
      </section>

      <div className="space-y-14">
        {CURRICULUM.map((bucket) => (
          <section key={bucket.heading}>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {bucket.heading}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              {bucket.blurb}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {bucket.concepts.map((concept) => (
                <ConceptCard key={concept.title} concept={concept} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function ConceptCard({ concept }: { concept: Concept }) {
  if (concept.slug) {
    return (
      <Link
        href={`/concepts/${concept.slug}`}
        className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
          {concept.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {concept.blurb}
        </p>
        <span className="mt-4 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Open →
        </span>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">
          {concept.title}
        </h3>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Soon
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
        {concept.blurb}
      </p>
    </div>
  );
}
