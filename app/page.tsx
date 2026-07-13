import Link from "next/link";

interface Concept {
  title: string;
  blurb: string;
  // An href means the page exists and the card links to it. Without one the
  // card is a placeholder, shown but not yet clickable.
  href?: string;
}

interface Topic {
  heading: string;
  blurb: string;
  concepts: Concept[];
}

interface Part {
  title: string;
  intro: string;
  topics: Topic[];
}

// The site as a curriculum in five parts. A part holds topics and a topic
// holds pages; a part with a single topic named after itself is a flat list
// of pages and is drawn without the topic heading. Foundational Mathematics
// stays deliberately short: only the parts of each subject the later concepts
// lean on, not a course in their own right.
const CURRICULUM: Part[] = [
  {
    title: "Foundational Mathematics",
    intro:
      "While the mathematics for the field of machine learning is vast, there are only a handful of concepts required to understand the fundamentals. These primers are far from complete courses on their topics, just what we need to understand the rest of the material.",
    topics: [
      {
        heading: "Foundational Mathematics",
        blurb: "",
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
    ],
  },
  {
    title: "Classical Machine Learning",
    intro:
      "The models that were the field before networks took it over, and that still do most of its work. Predicting a number, predicting a category, letting a crowd of models vote, finding structure with no answers given, and two ideas about what near means that every one of them borrows.",
    topics: [
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
            title: "Fitting by Walking",
            href: "/concepts/gradient-descent-regression",
            blurb:
              "The line page solved for its answer in one step. This page reaches the same line by walking downhill on the loss, one small step per pass, and shows what the step size decides, including when the walk runs away.",
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
            title: "More Than Two Classes",
            href: "/concepts/multiclass-classification",
            blurb:
              "Logistic regression chooses between two. With three or more classes there are two honest ways to extend it, one that shares the probability out across every class and one that asks each class a yes-or-no question, and the two do not agree about whether the answers should add up.",
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
        heading: "Clustering",
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
        heading: "Learnable Features",
        blurb:
          "Everything above learns by descending a loss. These four learn by a local rule instead, each unit adjusting itself from what its neighbours are doing, with no loss written down at all.",
        concepts: [
          {
            title: "Hopfield Networks",
            href: "/concepts/hopfield-network",
            blurb:
              "Store a handful of patterns in a web of weights, then hand the net a damaged copy and watch it fall back into the original by lowering an energy.",
          },
          {
            title: "Restricted Boltzmann Machines",
            href: "/concepts/restricted-boltzmann-machine",
            blurb:
              "A Hopfield net stores its patterns exactly; this one learns what they have in common, so a probe that matches none of them still gets a plausible reconstruction, and the hidden layer is the first learned representation on this site.",
          },
          {
            title: "Self-Organising Maps",
            href: "/concepts/self-organising-map",
            blurb:
              "Drape a small grid of units over the data and let each presented person pull the nearest unit and its grid neighbours toward it, so that when it settles, neighbouring units hold neighbouring people, a map and not only a grouping.",
          },
          {
            title: "Hebbian Principal Components",
            href: "/concepts/hebbian-pca",
            blurb:
              "The PCA page found its directions by solving a matrix; a single unit obeying “fire together, wire together”, with one correction to stop its weights growing without bound, turns toward the very same direction one row at a time.",
          },
        ],
      },
      {
        heading: "Distance Metrics",
        blurb:
          "Every model here has an opinion about what near means. Six ways to measure a distance, and the trick that lets a model work in a space it never builds.",
        concepts: [
          {
            title: "What Near Means",
            href: "/concepts/distance-metrics",
            blurb:
              "Nearest neighbours, k-means and the self-organising map all lean on a distance, and there is more than one. Six of them, and the shape of one unit away under each is the whole difference.",
          },
          {
            title: "The Kernel Trick",
            href: "/concepts/kernel-trick",
            blurb:
              "Some data cannot be split by a straight boundary in the space we are handed. The trick is to swap the dot product between two points for a function that measures their similarity in a much larger space, which lets a straight-line method draw curved boundaries without our ever building that space.",
          },
          {
            title: "Kernel Ridge Regression",
            href: "/concepts/kernel-ridge",
            blurb:
              "Ridge regression rearranged so the rows appear only inside dot products, then those dot products swapped for a kernel, draws a curve through the data without one manufactured column.",
          },
          {
            title: "Kernel Principal Components",
            href: "/concepts/kernel-pca",
            blurb:
              "PCA finds straight directions. Kernelised, it finds directions in the mapped space, so two rings that no straight axis can separate come apart along the first kernel component.",
          },
        ],
      },
    ],
  },
  {
    title: "Data Preparation",
    intro:
      "The scale of a column is an accident of its units, and most models cannot tell an accident from a fact. These are the moves that put every feature on the same footing before a model sees it, and the ones that build new columns out of the ones we have.",
    topics: [
      {
        heading: "Data Preparation",
        blurb: "",
        concepts: [
          {
            title: "Feature Scaling",
            href: "/concepts/feature-scaling",
            blurb:
              "Height in centimetres and weight in kilograms sit on different scales for no reason a model should care about, so we subtract a centre from each column and divide by a spread to put them on the same footing. Five different scalings answer five different worries about what that centre and that spread should be.",
          },
          {
            title: "Feature Engineering",
            blurb:
              "Building new columns out of the ones we have, powers and products and indicators, so that a straight-line model has something to bend along. The polynomial page already does one kind of it, and this page will collect the rest.",
          },
        ],
      },
    ],
  },
  {
    title: "Neural Networks",
    intro:
      "A network is a chain of small layers, each one a few lines of arithmetic, and the whole of deep learning is those layers, a loss at the end, and a gradient walked backward through the chain.",
    topics: [
      {
        heading: "Fundamentals",
        blurb:
          "One neuron, then a row of them, then what they are trying to make small, then the walk backward that teaches them, then all of it run in a loop.",
        concepts: [
          {
            title: "A Neuron",
            href: "/concepts/neurons-and-activations",
            blurb:
              "One neuron is a weighted sum and a bend. The weights are the whole of what it learns, and the bend is chosen from a short list whose members differ in what they do to a gradient.",
          },
          {
            title: "A Dense Layer and the Forward Pass",
            href: "/concepts/dense-layers",
            blurb:
              "Stack neurons side by side and the weighted sums become one matrix multiply. A layer knows the width it reads and the width it answers with, and a chain of layers is a chain of those agreements.",
          },
          {
            title: "Loss Functions",
            href: "/concepts/loss-functions",
            blurb:
              "The loss is the number the whole network is trying to lower, and its shape decides what a wrong answer costs and how hard the correction pushes. Five of them, and three share one gradient.",
          },
          {
            title: "Backpropagation",
            href: "/concepts/backpropagation",
            blurb:
              "The loss's slope with respect to every weight in the chain, computed by walking the chain backward once, each layer handing down what the layer below needs and keeping its own correction.",
          },
          {
            title: "Training a Small Network",
            href: "/concepts/training-a-network",
            blurb:
              "Everything on the pages before this, run in a loop: forward, loss, backward, step, for a few hundred passes on a problem no straight line can solve, with the loss falling and the decision region bending.",
          },
        ],
      },
      {
        heading: "Computer Vision",
        blurb:
          "A picture is not a row of numbers, and the layers that read one know it. What that buys, and the check that refuses a network that would read a picture sideways.",
        concepts: [
          {
            title: "Convolution",
            href: "/concepts/convolution",
            blurb:
              "A small kernel swept across a picture, one set of weights reused at every position. Locality, weight sharing, and a parameter count tens of thousands of times smaller than a dense layer of the same width.",
          },
          {
            title: "Pooling",
            href: "/concepts/pooling",
            blurb:
              "Shrink a picture by summarising each window, keeping the largest value or the average. The two differ by one function, and it decides which inputs get any correction at all.",
          },
          {
            title: "The Shape Guarantee",
            href: "/concepts/shapes-and-flattening",
            blurb:
              "A network that cannot work is refused before it reads a single row, in integer comparisons, and the refusal names both arrangements. Flatten is the bridge from a picture to a row, and forgetting it is the case the whole check exists to catch.",
          },
        ],
      },
      {
        heading: "Regularisation",
        blurb:
          "Two layers that learn nothing about the data and change how everything else learns, one by silencing units at random and one by standardising what flows through.",
        concepts: [
          {
            title: "Dropout",
            href: "/concepts/dropout",
            blurb:
              "While learning, silence a random share of a layer's units on every pass so no unit can lean on another. While predicting, silence none, and the scaling that makes those two agree is the whole trick.",
          },
          {
            title: "Normalisation Layers",
            href: "/concepts/normalisation-layers",
            blurb:
              "The same standardising move as feature scaling, made inside a model on every pass rather than once before it. A layer subtracts a mean and divides by a deviation from the numbers flowing through it, and the whole difference between the three layers is which way the mean runs, down a column across the batch or along a single row.",
          },
        ],
      },
    ],
  },
  {
    title: "Judging a Model",
    intro:
      "The pages above keep ending on the same warning, and this part delivers on it. How to score a model honestly, and how to choose between models without fooling yourself.",
    topics: [
      {
        heading: "Judging a Model",
        blurb: "",
        concepts: [
          {
            title: "Held-Out Evaluation",
            href: "/concepts/held-out-evaluation",
            blurb:
              "A fit scored on its own training data cannot tell understanding from memorisation, the same way a student scored on the practice booklet cannot. So we hide some rows from the fit and let them judge it afterwards, and with cross-validation every row takes one turn as the judge. This is the score the whole site keeps deferring to, finally given its own machinery.",
          },
          {
            title: "Judging a Classifier",
            href: "/concepts/judging-a-classifier",
            blurb:
              "Accuracy is one number and it hides two different mistakes. The confusion matrix keeps them apart, precision and recall read it two ways, and the threshold a classifier commits at is a dial we can turn.",
          },
          {
            title: "Searching for a Setting",
            href: "/concepts/grid-search",
            blurb:
              "A model has dials no fit can set, and trying every setting and keeping the best is the obvious move. The number the winner reports is flattering, by an amount this page measures.",
          },
          {
            title: "Pipelines",
            href: "/concepts/pipelines",
            blurb:
              "Scale the columns, then fit the model, is two steps that must happen in that order on every fold, and a pipeline is the object that makes the order a fact rather than a habit. It also makes a preprocessing setting something a search can vary.",
          },
          {
            title: "Which Feature Mattered",
            href: "/concepts/feature-importance",
            blurb:
              "Two ways to ask a model which columns it leaned on, one reading the tree's own splits and one scrambling a column and watching the score fall, and on a model that works they disagree about a column of pure noise.",
          },
        ],
      },
    ],
  },
];

function anchorOf(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function standsAlone(part: Part, topic: Topic): boolean {
  return part.topics.length === 1 && topic.heading === part.title;
}

export default function Home() {
  const pageCount = CURRICULUM.reduce(
    (total, part) =>
      total +
      part.topics.reduce(
        (sum, topic) =>
          sum + topic.concepts.filter((concept) => concept.href).length,
        0,
      ),
    0,
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Machine learning, one concept at a time
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Every concept in machine learning was invented to solve a problem.
          I&rsquo;ve always believed understanding the initial problem a tool
          solved helps to instill comprehension, so every page here begins with
          that historical context. While there are technical sections provided,
          this site is meant to be generally accessible for anyone, and each
          page carries an interactive example where you can experiment with
          small values of your own. The computations behind these examples are
          performed live by a machine learning library written from scratch, so
          you&rsquo;re seeing how the methods really behave.
        </p>
      </section>

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start lg:gap-12">
        <nav
          aria-label="Contents"
          className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-6 lg:mb-0 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto dark:border-slate-800 dark:bg-slate-900/50"
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Contents
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {pageCount} pages
            </span>
          </div>
          <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-1">
            {CURRICULUM.map((part, index) => (
              <li key={part.title}>
                <a
                  href={`#${anchorOf(part.title)}`}
                  className="font-semibold text-slate-900 underline-offset-4 hover:text-indigo-600 hover:underline dark:text-slate-100 dark:hover:text-indigo-400"
                >
                  <span className="mr-2 font-mono text-slate-400 dark:text-slate-500">
                    {index + 1}
                  </span>
                  {part.title}
                </a>
                {!standsAlone(part, part.topics[0]) && (
                  <ol className="mt-1 space-y-0.5 pl-6 text-sm text-slate-600 dark:text-slate-400">
                    {part.topics.map((topic, topicIndex) => (
                      <li key={topic.heading}>
                        <a
                          href={`#${anchorOf(topic.heading)}`}
                          className="underline-offset-4 hover:text-indigo-600 hover:underline dark:hover:text-indigo-400"
                        >
                          <span className="mr-2 font-mono text-slate-400 dark:text-slate-500">
                            {index + 1}.{topicIndex + 1}
                          </span>
                          {topic.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-20">
          {CURRICULUM.map((part, index) => (
            <section
              key={part.title}
              id={anchorOf(part.title)}
              className="scroll-mt-8"
            >
              <div className="mb-8 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div className="font-mono text-sm text-slate-400 dark:text-slate-500">
                  Part {index + 1}
                </div>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {part.title}
                </h2>
                <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
                  {part.intro}
                </p>
              </div>
              <div className="space-y-12">
                {part.topics.map((topic, topicIndex) => {
                  const flat = standsAlone(part, topic);
                  return (
                    <section
                      key={topic.heading}
                      id={flat ? undefined : anchorOf(topic.heading)}
                      className="scroll-mt-8"
                    >
                      {!flat && (
                        <>
                          <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            <span className="mr-2 font-mono text-base text-slate-400 dark:text-slate-500">
                              {index + 1}.{topicIndex + 1}
                            </span>
                            {topic.heading}
                          </h3>
                          {topic.blurb && (
                            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                              {topic.blurb}
                            </p>
                          )}
                        </>
                      )}
                      <div
                        className={`grid gap-4 md:grid-cols-2 ${flat ? "" : "mt-5"}`}
                      >
                        {topic.concepts.map((concept) => (
                          <ConceptCard key={concept.title} concept={concept} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function ConceptCard({ concept }: { concept: Concept }) {
  if (concept.href) {
    return (
      <Link
        href={concept.href}
        className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {concept.title}
          </h4>
          <span className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Open →
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {concept.blurb}
        </p>
      </Link>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-base font-semibold text-slate-500 dark:text-slate-400">
          {concept.title}
        </h4>
        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Soon
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-500">
        {concept.blurb}
      </p>
    </div>
  );
}
