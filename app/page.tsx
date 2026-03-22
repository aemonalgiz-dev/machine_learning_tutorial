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
          "The derivative of a function is its slope at each point, and that slope is zero at the function's lowest point. A model uses this to fit itself, adjusting its numbers until the derivative of its error reaches zero.",
      },
      {
        title: "Linear Algebra Primer",
        blurb:
          "A vector is a list of numbers and a matrix is a grid of them, with a few rules for combining the two. Every model with more than one input is written in this notation.",
      },
      {
        title: "Statistics & Probability Primer",
        blurb:
          "The mean is a typical value, the variance is how far the data spreads around it, and correlation is whether two quantities rise and fall together. These are what you measure to say how strongly one thing predicts another.",
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
          "Fit a straight line to model the relationship between two sets of data, such as height and weight. Once it is fit, the line turns any height into a predicted weight.",
      },
      {
        title: "Multiple & Polynomial Regression",
        blurb:
          "Model a relationship that depends on several inputs at once, or one that curves, by fitting a plane or a curve instead of a straight line. The underlying mechanics of how we build the regression remain almost identical.",
      },
      {
        title: "Ridge & Lasso",
        blurb:
          "A flexible model left alone will fit the noise in its training data as well as the signal. Ridge and lasso pull its numbers back toward zero, trading a slightly worse fit now for better predictions later.",
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
          "Fit a curve that turns the inputs into a probability between zero and one, then read anything above one half as one class and anything below it as the other. The line where the probability is one half is the boundary between them.",
      },
      {
        title: "k-Nearest Neighbours",
        blurb:
          "There is no training step. To label a new point, find the few known points closest to it and take their majority, so the model is just the examples it has stored.",
      },
      {
        title: "Decision Trees",
        blurb:
          "Split the data with a yes-or-no question, then split each part again, picking each question to separate the classes as cleanly as it can. The result is a flowchart you can read from the top.",
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
          "Train many models, each on a slightly different slice of the data, and combine their answers. Their individual mistakes tend to disagree, so they cancel out.",
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
          "Sort the data into a set number of groups by putting each point with the nearest group centre, then recomputing each centre from its points, and repeating until nothing moves.",
      },
      {
        title: "Principal Component Analysis",
        blurb:
          "Find the few directions the data varies along the most, and describe each point by where it sits along them. Many correlated numbers become a few independent ones.",
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
          "Replace the dot product between two points with a function that scores their similarity in a much larger space. It lets a straight-line method draw curved boundaries without ever building that space.",
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
