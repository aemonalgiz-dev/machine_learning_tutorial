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
          "A derivative measures how one quantity moves when you nudge another. We need it for a single fact: at the bottom of a smooth curve the derivative is zero, and that is how a model finds the settings that make its error smallest.",
      },
      {
        title: "Linear Algebra Primer",
        blurb:
          "Once a model has more than one input, its numbers are bundled into vectors and its operations into matrices. It is mostly a compact notation, but it is the notation every model past a single line is written in, so it is worth reading first.",
      },
      {
        title: "Statistics & Probability Primer",
        blurb:
          "Machine learning assumes the data is noisy and that there is something steadier underneath it we are trying to estimate. Mean and variance describe one such quantity, and from there we build up to what it takes to say one quantity explains another.",
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
          "Fit a single straight line through a cloud of points. It is the oldest method here and the one the rest build on, so it is where the idea of a best fit is defined and where the site starts.",
      },
      {
        title: "Multiple & Polynomial Regression",
        blurb:
          "More than one input at a time, and curved shapes as well as straight ones. The line becomes a plane or a curve, but the way it is fitted does not really change.",
      },
      {
        title: "Ridge & Lasso",
        blurb:
          "Left to itself, a flexible model will fit the noise in its training data along with the signal. Ridge and lasso hold it back on purpose, accepting a slightly worse fit now in exchange for better predictions later.",
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
          "The same machinery as fitting a line, bent so the output is a probability between zero and one. That probability turns into a yes-or-no decision, and the boundary between the two is what the model learns.",
      },
      {
        title: "k-Nearest Neighbours",
        blurb:
          "There is no training step at all. To label a new point you find the handful of known points nearest to it and let them vote, so the model is really just the examples it has kept.",
      },
      {
        title: "Decision Trees",
        blurb:
          "A sequence of yes-or-no questions, each one chosen from the data to split the classes as cleanly as it can. What comes out reads like a flowchart you could follow by hand.",
      },
    ],
  },
  {
    heading: "Ensembles",
    blurb: "Many models together, outvoting any one of them.",
    concepts: [
      {
        title: "Bagging, Forests & Boosting",
        blurb:
          "A single model is easy to fool. These grow many, each trained on a slightly different view of the data, and combine them, so the individual mistakes tend to cancel out.",
      },
    ],
  },
  {
    heading: "Unsupervised Learning",
    blurb: "Finding structure in data that carries no labels.",
    concepts: [
      {
        title: "k-Means Clustering",
        blurb:
          "No labels and no right answers given. The method sorts points into a set number of groups, each point going with the nearest group centre, then moves the centres and repeats until the grouping stops changing.",
      },
      {
        title: "Principal Component Analysis",
        blurb:
          "Data with many features usually varies along only a few real directions. This finds those directions, so the same data can be kept in far fewer numbers with little lost.",
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
          "Some data cannot be split by a straight boundary in the space you are handed. The trick computes as though you had lifted it into a much larger space where a straight boundary works, without ever building that space.",
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
            <div className="mt-5 space-y-4">
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
        className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {concept.title}
          </h3>
          <span className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Open →
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {concept.blurb}
        </p>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">
          {concept.title}
        </h3>
        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Soon
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
        {concept.blurb}
      </p>
    </div>
  );
}
