import Link from "next/link";

interface Concept {
  title: string;
  blurb: string;
  // An href means the page exists and the card links to it. Without one the
  // card is a placeholder, shown but not yet clickable.
  href?: string;
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
        href: "/primers/calculus",
        blurb:
          "When we fit a model, we are really searching for the settings that make its error as small as possible. A derivative gives us the slope of a curve at any point, and since that slope is zero at the very bottom, we can use it to find where the error stops falling.",
      },
      {
        title: "Linear Algebra Primer",
        href: "/primers/linear-algebra",
        blurb:
          "Once a model takes more than one input, we bundle those inputs into a vector and its workings into a matrix. It is mostly a compact notation, though it is the notation almost everything past a single line is written in, so it is worth getting comfortable with early.",
      },
      {
        title: "Statistics & Probability Primer",
        href: "/primers/statistics",
        blurb:
          "Machine learning assumes there is a real pattern hidden under noisy data, and these are the tools we use to pin it down. The mean gives us a typical value, the variance tells us how far the data spreads around it, and correlation tells us whether two quantities move together, which is where the idea of one thing predicting another begins.",
      },
    ],
  },
  {
    heading: "Regression",
    blurb: "Predicting a number from other numbers.",
    concepts: [
      {
        title: "Simple Linear Regression",
        href: "/concepts/simple-linear-regression",
        blurb:
          "Fit a straight line to model the relationship between two sets of data, such as height and weight. Once it is fit, the line turns any height into a predicted weight.",
      },
      {
        title: "Multiple & Polynomial Regression",
        href: "/concepts/multiple-polynomial-regression",
        blurb:
          "Often a relationship depends on several inputs at once, or it bends rather than running straight, so we fit a plane or a curve in place of a line. The underlying mechanics of how we build the regression remain almost identical.",
      },
      {
        title: "Ridge & Lasso",
        href: "/concepts/ridge-lasso",
        blurb:
          "Data is noisy, which can lead to simple regressions fitting to clerical errors, outliers, or other data issues. Ridge and lasso prevent the “ideal” fit for our training data, trading a slightly worse fit now for better predictions later.",
      },
    ],
  },
  {
    heading: "Classification",
    blurb: "Predicting which group something belongs to.",
    concepts: [
      {
        title: "Logistic Regression",
        href: "/concepts/logistic-regression",
        blurb:
          "Sometimes we do not want a number, we want a yes or a no. Logistic regression fits a curve that turns the inputs into a probability between zero and one, and then anything above one half becomes a yes and anything below it a no, with the boundary sitting where the probability is exactly a half.",
      },
      {
        title: "k-Nearest Neighbours",
        href: "/concepts/k-nearest-neighbours",
        blurb:
          "This one does no training at all. To label a new point we look at the handful of known points nearest to it and let them vote, so the model is really just the examples we have kept.",
      },
      {
        title: "Decision Trees",
        href: "/concepts/decision-trees",
        blurb:
          "We split the data with a yes-or-no question, then split each part again, choosing every question to separate the classes as cleanly as we can. What we end up with reads like a flowchart we could follow by hand.",
      },
    ],
  },
  {
    heading: "Ensembles",
    blurb: "Many models combined, so no single model's mistakes decide the answer.",
    concepts: [
      {
        title: "Bagging",
        href: "/concepts/bagging",
        blurb:
          "A deep tree memorises whichever data it happens to see, though that instability can be spent rather than suffered. We grow many trees, each on its own resample of the data, and let them vote, so the accidents each tree memorised cancel in the crowd.",
      },
      {
        title: "Random Forests",
        href: "/concepts/random-forests",
        blurb:
          "A bagged committee still thinks alike, since every tree sees the same strong feature and opens with the same question. A forest offers each split a random subset of the features, manufacturing disagreement on purpose, which is what a vote needs to do its work.",
      },
      {
        title: "Gradient Boosting",
        href: "/concepts/gradient-boosting",
        blurb:
          "Rather than growing experts in parallel, we grow them in sequence. Each small tree is fitted to whatever the running total still gets wrong, and a learning rate keeps every correction modest, so the model assembles itself out of its own mistakes.",
      },
    ],
  },
  {
    heading: "Unsupervised Learning",
    blurb: "Finding structure in data that carries no labels.",
    concepts: [
      {
        title: "k-Means Clustering",
        href: "/concepts/k-means",
        blurb:
          "Here no one has labelled the data, so we look for the groups ourselves. We put each point with the nearest group centre, recompute each centre from the points it now holds, and repeat until nothing moves.",
      },
      {
        title: "Principal Component Analysis",
        href: "/concepts/pca",
        blurb:
          "Data with many features usually varies along only a few real directions. We find those directions and describe each point by where it falls along them, so many correlated numbers collapse into a few independent ones.",
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
          "Some data cannot be split by a straight boundary in the space we are handed. The trick is to swap the dot product between two points for a function that measures their similarity in a much larger space, which lets a straight-line method draw curved boundaries without our ever building that space.",
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
  if (concept.href) {
    return (
      <Link
        href={concept.href}
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
