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

// The site as a curriculum in seven parts. A part holds topics and a topic
// holds pages; a part with a single topic named after itself is a flat list
// of pages and is drawn without the topic heading. Computer vision and
// natural language are parts rather than topics inside Neural Networks,
// because each is a subject with its own progression rather than a corner of
// one. Foundational Mathematics stays deliberately short: only the parts of
// each subject the later concepts lean on, not a course in their own right.
const CURRICULUM: Part[] = [
  {
    title: "Foundational Mathematics",
    intro:
      "While the mathematics for the field of machine learning is vast, there are only a handful of concepts required to understand the fundamentals. These primers are far from complete courses on their topics, just what we need to understand the rest of the material.",
    topics: [
      {
        heading: "Foundational Mathematics",
        blurb:
          "",
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
      "The models that were the field before networks took it over, and that still do most of its work. Predicting a number, predicting a category, letting a crowd of models vote, finding structure with no answers given, and the ideas about nearness and about state that every one of them borrows.",
    topics: [
      {
        heading: "Regression",
        blurb:
          "Predicting a number from other numbers.",
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
        blurb:
          "Predicting which of a fixed set of categories a row belongs to.",
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
        blurb:
          "Many weak models, combined into one that is better than any of them.",
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
        blurb:
          "Finding groups when nobody has said what the groups are.",
        concepts: [
          {
            title: "k-Means Clustering",
            href: "/concepts/k-means",
            blurb:
              "Here no one has labelled the data, so we look for the groups ourselves. We put each point with the nearest group centre, recompute each centre from the points it now holds, and repeat until nothing moves.",
          },
        ],
      },
      {
        heading: "Learnable Features",
        blurb:
          "Models that learn what to represent rather than being told, by a rule local enough that a single unit could follow it.",
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
          "What near means, and the trick that lets a model work in a space it never builds.",
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
              "PCA finds straight directions. Kernelised, it finds directions in the mapped space, so a group of people sitting inside a ring of others, which no straight axis separates, comes apart along the first kernel component.",
          },
        ],
      },
      {
        heading: "Markov Chains",
        blurb:
          "A process that remembers only where it is, which is the weakest assumption that still lets a sequence be modelled at all.",
        concepts: [
          {
            title: "Markov Chains",
            href: "/concepts/markov-chains",
            blurb:
              "A model whose next state depends on the current one and on nothing before it, which is a strong claim about the world and the reason the arithmetic stays small. Counting the transitions is the whole of the fit, and the assumption is exactly what it throws away.",
          },
        ],
      },
    ],
  },
  {
    title: "Data Preparation",
    intro:
      "Before a model sees a row, somebody decides what its columns mean. Putting columns on a common scale, and building new ones out of the ones there are, are both choices made ahead of any fitting, and both put a ceiling on what the fit can find.",
    topics: [
      {
        heading: "Normalisation",
        blurb:
          "Putting columns on a footing where a distance between rows means something, rather than reflecting whichever column was recorded in the larger unit.",
        concepts: [
          {
            title: "Feature Scaling",
            href: "/concepts/feature-scaling",
            blurb:
              "Height in centimetres and weight in kilograms sit on different scales for no reason a model should care about, so we subtract a centre from each column and divide by a spread to put them on the same footing. Five different scalings answer five different worries about what that centre and that spread should be.",
          },
          {
            title: "The Standard Score",
            href: "/concepts/the-standard-score",
            blurb:
              "Subtract a column’s mean and divide by its spread, so every column arrives measured in its own deviations and none can dominate a distance for reasons of unit alone.",
          },
          {
            title: "Centring on the Mean",
            href: "/concepts/centring-on-the-mean",
            blurb:
              "Subtract each column’s mean and divide by nothing, and every method that was measuring from a zero nobody in the data is near starts measuring from the average person instead.",
          },
        ],
      },
      {
        heading: "Feature Engineering",
        blurb:
          "Making the columns a model reads different from the columns that were recorded, either by combining them or by finding the few directions they really vary along.",
        concepts: [
          {
            title: "Principal Component Analysis",
            href: "/concepts/pca",
            blurb:
              "Data with many features usually varies along only a few real directions. We find those directions and describe each point by where it falls along them, so many correlated numbers collapse into a few independent ones.",
          },
          {
            title: "Polynomial Features",
            href: "/concepts/polynomial-features",
            blurb:
              "Building new columns out of the ones we have, powers and products and indicators, so that a straight-line model has something to bend along.",
          },
        ],
      },
    ],
  },
  {
    title: "Neural Networks",
    intro:
      "One unit is a weighted sum and a bend. Everything after that is about how the units are arranged, how the arrangement is corrected against its mistakes, and what has to be added to stop it memorising. The two domains at the end are the same machinery pointed at pictures and at text.",
    topics: [
      {
        heading: "Foundation",
        blurb:
          "The unit everything else is built out of.",
        concepts: [
          {
            title: "A Neuron",
            href: "/concepts/neurons-and-activations",
            blurb:
              "One neuron is a weighted sum and a bend. The weights are the whole of what it learns, and the bend is chosen from a short list whose members differ in what they do to a gradient.",
          },
        ],
      },
      {
        heading: "Layers",
        blurb:
          "A layer is a rule for turning one block of numbers into another. They differ in what they assume about the block they read.",
        concepts: [
          {
            title: "A Dense Layer and the Forward Pass",
            href: "/concepts/dense-layers",
            blurb:
              "Stack neurons side by side and the weighted sums become one matrix multiply. A layer knows the width it reads and the width it answers with, and a chain of layers is a chain of those agreements.",
          },
          {
            title: "Convolution",
            href: "/concepts/convolution",
            blurb:
              "A small kernel swept across a picture, one set of weights reused at every position. Locality, weight sharing, and a parameter count tens of thousands of times smaller than a dense layer of the same width.",
          },
          {
            title: "The Shape Guarantee",
            href: "/concepts/shapes-and-flattening",
            blurb:
              "A network that cannot work is refused before it reads a single row, in integer comparisons, and the refusal names both arrangements. Flatten is the bridge from a picture to a row, and forgetting it is the case the whole check exists to catch.",
          },
          {
            title: "Recurrent Layers",
            blurb:
              "A layer that reads a sequence one step at a time, carrying a running summary forward. What that buys, why the summary fades, and the two gated cells built to stop it fading.",
          },
          {
            title: "Radial Basis Networks",
            blurb:
              "A unit that holds a centre and a width and answers by how near a row is to that centre, rather than by a weighted sum and a bend. The bell curve replaces the hyperplane.",
          },
          {
            title: "Attention",
            blurb:
              "Every step reads every other step directly and takes a weighted average of what it finds, with the weights computed from the content rather than fixed by position. The route from the last step to the first is one multiplication rather than twenty.",
          },
        ],
      },
      {
        heading: "Training a Model",
        blurb:
          "What it means for an answer to be wrong, and how the blame for being wrong is shared out among the weights.",
        concepts: [
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
        heading: "Regularisation",
        blurb:
          "Two layers that exist to stop a network leaning too hard on any one thing, and that behave differently while learning.",
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
      {
        heading: "Embedding Spaces",
        blurb:
          "A network's real product is rarely its answer. It is the arrangement it puts things into on the way there, where being near means being alike. That idea belongs to no one domain, so it is stated here and then used on pictures and on text.",
        concepts: [
          {
            title: "Distance and Similarity",
            href: "/concepts/distance-and-similarity",
            blurb:
              "What it means for two positions to be near, which is the premise every embedding rests on. The angle between two directions against the straight-line gap, and why the two part company once lengths differ.",
          },
          {
            title: "The Embedding Layer",
            blurb:
              "A table with one row per item and a lookup instead of a multiply, which is the layer every learned position on this site is eventually stored in. It is the one layer that reads a whole number rather than a measurement, and that changes what has to be checked at its door.",
          },
        ],
      },
    ],
  },
  {
    title: "Computer Vision",
    intro:
      "A picture is a grid of numbers, and a model that reads one row at a time has already thrown away the fact that neighbouring pixels belong together. The first half here is what people built by hand once they knew that, and the second is what happened when the same sweeping operation was learned from examples instead.",
    topics: [
      {
        heading: "Classical Methods",
        blurb:
          "For decades vision ran on features somebody designed. What each one measures, why it was chosen, and what it holds on to when the lighting or the position changes.",
        concepts: [
          {
            title: "Template Matching",
            href: "/concepts/template-matching",
            blurb:
              "Slide a small picture across a larger one and score how well it fits at every position. The idea a convolution generalises, with the weights chosen by hand rather than learned, and it fails the moment the thing being looked for turns or changes size.",
          },
          {
            title: "Filters and Edges",
            href: "/concepts/filters-and-edges",
            blurb:
              "A small grid of weights swept over a picture, chosen so the answer is large wherever the brightness changes sharply. Edges are what most of classical vision was built on, because they survive a change in lighting where raw brightness does not.",
          },
          {
            title: "Histogram of Oriented Gradients",
            href: "/concepts/histogram-of-oriented-gradients",
            blurb:
              "Describe a patch by which directions its edges point in, counted over small cells, rather than by its pixels. A description built by hand to hold still under a shift in position or lighting, and the one that found pedestrians before anything was learned.",
          },
          {
            title: "Keypoints and Descriptors",
            href: "/concepts/keypoints-and-descriptors",
            blurb:
              "Rather than describing a whole picture, find the few places worth describing and record what surrounds each one. Two pictures of a scene then match through those places, which is what lets a match survive rotation and a change of scale.",
          },
          {
            title: "Haar Cascades",
            href: "/concepts/haar-cascades",
            blurb:
              "Thousands of crude rectangular tests, ordered so the cheap ones throw away most of the picture before an expensive one ever runs. The ordering is the idea, and it is what put face detection inside a camera two decades ago.",
          },
        ],
      },
      {
        heading: "Convolutional Networks",
        blurb:
          "The same sweeping operation with the weights learned rather than designed, and what has to be stacked around it before a picture can be read end to end.",
        concepts: [
          {
            title: "Pooling",
            href: "/concepts/pooling",
            blurb:
              "Shrink a picture by summarising each window, keeping the largest value or the average. The two differ by one function, and it decides which inputs get any correction at all.",
          },
          {
            title: "Convolutional Networks",
            href: "/concepts/convolutional-networks",
            blurb:
              "Convolution and pooling stacked so that early layers see small patterns and later ones see arrangements of those patterns, ending in an answer about the whole picture. What each part contributes, and why depth buys a wider view than any single layer has.",
          },
          {
            title: "U-Net",
            href: "/concepts/u-net",
            blurb:
              "An architecture that shrinks a picture down to work out what is in it and grows it back to say where, carrying the fine detail across on connections that skip the middle. A worked example of a network that answers for every pixel rather than for the picture.",
          },
        ],
      },
      {
        heading: "Embedding Pictures",
        blurb:
          "The same idea as the language section's vectors, pointed at pictures. A network trained to name what it sees arranges pictures on the way to naming them, and that arrangement turns out to be the more useful half.",
        concepts: [
          {
            title: "A Vector for a Picture",
            href: "/concepts/a-vector-for-a-picture",
            blurb:
              "Train a network to name what it sees, then throw away the naming and keep the layer before it. What is left is a position for the picture, and pictures of the same thing land near each other without anyone having asked for that.",
          },
          {
            title: "Learning the Metric Itself",
            href: "/concepts/learning-the-metric-itself",
            blurb:
              "Rather than hoping nearness falls out of a model trained for something else, train on the nearness directly by showing the model pairs that should be close and pairs that should not. What that needs is examples of sameness rather than labels.",
          },
          {
            title: "Searching a Collection of Pictures",
            href: "/concepts/searching-a-collection-of-pictures",
            blurb:
              "Once every picture is a position, finding the ones like this is a nearest-neighbour query, and doing it exactly means touching every picture there is. What the exact answer costs, and what is given up to avoid paying it.",
          },
        ],
      },
    ],
  },
  {
    title: "Natural Language Processing",
    intro:
      "Every model on this site reads numbers, and text is not numbers. Something has to decide where one piece of writing ends and the next begins, hand each piece a number, and then give that number a position so that nearness means something. Those decisions are made before any model sees a word, they are never neutral, and they put a ceiling on everything downstream.",
    topics: [
      {
        heading: "Tokens, and the Vocabulary",
        blurb:
          "What a token is, what a vocabulary promises, and what it does with a piece it has never seen.",
        concepts: [
          {
            title: "What a Token Is",
            href: "/concepts/what-a-token-is",
            blurb:
              "Text goes in and a list of whole numbers comes out. What sits between them is a vocabulary, and the two things it has to promise: that a piece always gets the same number, and that the numbers turn back into the text.",
          },
        ],
      },
      {
        heading: "Classical Token Construction",
        blurb:
          "Rules written by people, for a script that puts spaces between its words. Each one repairs something the rule before it got wrong.",
        concepts: [
          {
            title: "N-Grams",
            href: "/concepts/n-grams",
            blurb:
              "Cut a text into every run of a fixed number of pieces and count them. The oldest way of giving a model something wider than one word to read, and the counts grow faster than any corpus can fill.",
          },
          {
            title: "Splitting on Spaces",
            href: "/concepts/splitting-on-spaces",
            blurb:
              "The simplest rule there is, and the one every other rule on these pages exists to repair. What it gets right, and the six kinds of writing it mangles.",
          },
          {
            title: "Unicode Word Boundaries",
            href: "/concepts/unicode-word-boundaries",
            blurb:
              "A standard that says where a word breaks, written by a committee that had to consider every writing system at once. What it buys over a space, and what it still leaves undecided.",
          },
          {
            title: "Penn Treebank Rules",
            href: "/concepts/penn-treebank-rules",
            blurb:
              "The rule list a generation of English language research was annotated with. It splits contractions, separates punctuation, and rewrites quotation marks into something that no longer matches the source.",
          },
          {
            title: "Moses Rules",
            href: "/concepts/moses-rules",
            blurb:
              "A rule list built for translation rather than for parsing, which changes what it protects. Abbreviations it must not split, and the general shape of a rule with a list of exceptions bolted to it.",
          },
          {
            title: "The Pattern Language Models Use",
            href: "/concepts/the-pattern-language-models-use",
            blurb:
              "One regular expression, used before almost every modern language model, that keeps the space attached to the word after it. Why that detail matters, and where a faithful translation of it is impossible.",
          },
        ],
      },
      {
        heading: "Scripts Without Spaces",
        blurb:
          "Chinese and Japanese put nothing between their words, so the split has to be inferred rather than read.",
        concepts: [
          {
            title: "Maximum Matching",
            href: "/concepts/maximum-matching",
            blurb:
              "Take the longest thing in the dictionary that fits, cut there, and repeat. The oldest answer, still used, and wrong in a way that a single example makes obvious.",
          },
          {
            title: "The Word Lattice",
            href: "/concepts/the-word-lattice",
            blurb:
              "Rather than committing at each step, lay out every reading the dictionary permits and take the best whole path. What a path costs, and why adding one word changes the cut of text that does not contain it.",
          },
          {
            title: "Segmenting With a Hidden Model",
            href: "/concepts/segmenting-with-a-hidden-model",
            blurb:
              "Tag every character with where it sits in a word, beginning, middle, end or alone, and the boundaries fall out of the tags. Learned from examples rather than given a dictionary.",
          },
          {
            title: "Learning Boundaries From Examples",
            href: "/concepts/learning-boundaries-from-examples",
            blurb:
              "Ask one yes-or-no question at every gap, and answer it from the characters either side. No dictionary, no sequence model, and a decision that can be read.",
          },
        ],
      },
      {
        heading: "Modern Methods",
        blurb:
          "Rather than deciding what a piece is, learn it from what a corpus contains. This is what almost every current language model actually uses.",
        concepts: [
          {
            title: "Byte Pair Encoding",
            href: "/concepts/byte-pair-encoding",
            blurb:
              "Start from single characters and repeatedly join the commonest adjacent pair. The merges in the order they were learned are the model, and three variants change one thing each: the alphabet, whether a piece may cross a space, and whether a cut has to respect a word's joints.",
          },
          {
            title: "WordPiece",
            href: "/concepts/wordpiece",
            blurb:
              "The same merging, scored differently. A pair is judged by how much more often it occurs than its two halves would predict, which prefers a pair of rare symbols over a pair of common ones and changes the vocabulary from the very first merge.",
          },
          {
            title: "The Unigram Language Model",
            href: "/concepts/the-unigram-language-model",
            blurb:
              "Start from a large vocabulary and remove what is least missed, which is the opposite direction from merging. Every piece carries a probability, so a word has many possible cuts and one of them is most likely.",
          },
          {
            title: "SentencePiece",
            href: "/concepts/sentencepiece",
            blurb:
              "Treat the space as an ordinary character and learn the pieces from raw text with no splitting at all. What that buys is a scheme that needs to know nothing about the language, and a round trip that is exact.",
          },
          {
            title: "Greedy Coverage",
            href: "/concepts/greedy-coverage",
            blurb:
              "Choose the pieces that cover the most text rather than the ones that merge most often, which is a different objective and produces a different vocabulary. The unit the covering is counted in decides the first pick.",
          },
          {
            title: "Moving a Vocabulary",
            href: "/concepts/moving-a-vocabulary",
            blurb:
              "A vocabulary learned once and carried to a model that was trained with a different one. What survives the move, and why a piece from the middle of a word arrives as a whole word.",
          },
        ],
      },
      {
        heading: "Pieces a Language Is Built From",
        blurb:
          "A learned vocabulary cuts wherever the counts say, which lands mid-morpheme as often as not. These cut where a language is actually jointed.",
        concepts: [
          {
            title: "Morfessor",
            href: "/concepts/morfessor",
            blurb:
              "Search for the set of pieces that describes the corpus in the fewest bits, counting both the list of pieces and the text spelled with them. A principle rather than a heuristic, and a greedy search that visibly stalls.",
          },
          {
            title: "Finite-State Morphology",
            href: "/concepts/finite-state-morphology",
            blurb:
              "Write the language's stems and endings down as a machine that reads a word and says how it was assembled. What a written grammar buys over a learned one, and what it costs to produce.",
          },
        ],
      },
      {
        heading: "No Learned Vocabulary at All",
        blurb:
          "A learned vocabulary can be wrong, can go stale, and cannot represent what it never saw. Three ways of doing without one, and the length each pays.",
        concepts: [
          {
            title: "Bytes and Characters",
            href: "/concepts/bytes-and-characters",
            blurb:
              "Read the units the text is already made of and never meet an unknown piece again. What that costs is length, and the cost is not shared evenly between languages.",
          },
          {
            title: "Hashing Characters",
            href: "/concepts/hashing-characters",
            blurb:
              "Give up on storing a table at all and hash every character into a fixed number of buckets, so the width is chosen rather than discovered. What a collision costs, and why the usual defence against one can buy nothing.",
          },
          {
            title: "Patching Without a Vocabulary",
            href: "/concepts/patching-without-a-vocabulary",
            blurb:
              "Group bytes back into larger pieces by cutting where the text becomes hard to predict, so the boundaries come from a model rather than from a list. What that needs before it means anything.",
          },
        ],
      },
      {
        heading: "The Same Question, Asked of Numbers",
        blurb:
          "A picture and a sound are already numbers, and turning them into tokens asks what a vocabulary asks.",
        concepts: [
          {
            title: "Codebook Quantisation",
            href: "/concepts/codebook-quantisation",
            blurb:
              "Keep a table of representative vectors and answer with whichever is nearest. You have met this idea before under another name, and the rounding cost is a number rather than an argument.",
          },
          {
            title: "Finite Scalar Quantisation",
            href: "/concepts/finite-scalar-quantisation",
            blurb:
              "Squash each coordinate and round it to one of a few levels, so the set of codes is a product rather than a learned list. Nothing to fit, and a rounding rule that is easy to get wrong at even level counts.",
          },
        ],
      },
      {
        heading: "Embedding Words",
        blurb:
          "A token number says which piece it is and nothing about what it means. These give every piece a position instead, worked out from how it is used, so that nearness becomes a fact about meaning.",
        concepts: [
          {
            title: "A Vector for a Word",
            href: "/concepts/a-vector-for-a-word",
            blurb:
              "Replace a word's number with a handful of coordinates, and questions that could not be asked of a number become arithmetic. Which words are nearest this one, how alike are two, and the analogy that made the idea famous.",
          },
          {
            title: "Word2vec",
            href: "/concepts/word2vec",
            blurb:
              "Train a model to predict a word from its neighbours, or its neighbours from the word, then throw the model away and keep the weights it needed. Two architectures, and two ways of making the arithmetic affordable.",
          },
          {
            title: "FastText",
            href: "/concepts/fasttext",
            blurb:
              "The same training, with each word also standing for the pieces of its spelling. What that buys is an answer for a word the corpus never contained, and it reduces to the plain method exactly when no piece is short enough to exist.",
          },
          {
            title: "GloVe",
            href: "/concepts/glove",
            blurb:
              "Go back to counting, but fit the counts rather than sweeping the corpus. One objective over a table built once, and a published step rule that does not do what its name says on a small corpus.",
          },
          {
            title: "Latent Semantic Analysis",
            href: "/concepts/latent-semantic-analysis",
            blurb:
              "Build a table of which word appears in which document, weight it so a common word cannot dominate, and squeeze it down. The oldest method here, and the first component cannot separate anything.",
          },
          {
            title: "Pointwise Mutual Information",
            href: "/concepts/pointwise-mutual-information",
            blurb:
              "Score a pair of words by how much more often they occur together than chance would explain. The score for a pair that never met is undefined rather than very negative, which is why the negative half is usually thrown away.",
          },
          {
            title: "Random Indexing",
            href: "/concepts/random-indexing",
            blurb:
              "Never build the table at all. Give every context a random direction, add up the directions a word is seen in, and rely on random directions in many dimensions being very nearly perpendicular.",
          },
          {
            title: "Paragraph Vectors",
            href: "/concepts/paragraph-vectors",
            blurb:
              "Give a whole text a coordinate of its own and learn it alongside the words. A held-out text then has to be inferred by an optimisation rather than computed, and the published number of passes is far too few.",
          },
          {
            title: "Pooling a Text",
            href: "/concepts/pooling-a-text",
            blurb:
              "Three ways of turning a text into one position by combining the positions of its words. All three are blind to order by construction, which is the sharpest thing that can be said about what pooling discards.",
          },
        ],
      },
    ],
  },
  {
    title: "Judging a Model",
    intro:
      "A number a model reports about itself is usually flattering. These are the ways of getting an honest one, and the ways each of them can still mislead.",
    topics: [
      {
        heading: "Judging a Model",
        blurb:
          "",
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
                      <div className={`space-y-4 ${flat ? "" : "mt-5"}`}>
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
