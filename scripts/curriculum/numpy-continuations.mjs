import { worked, question } from "./numpy-authoring.mjs";

export function deepenNumpyLessons(lessons) {
  const broadcasting = lessons.find(lesson => lesson.id === "numpy-broadcasting");
  broadcasting.parts[2].examples.push(worked("A square table can accept the wrong interpretation",
    "Both the day count and greenhouse count are two here. Subtracting a flat outside array therefore succeeds, but applies the two references to columns. Adding the one-column axis instead attaches them to days.",
    `readings = np.array([[12,18],[14,22]])
outside = np.array([6,10])
print((readings - outside).tolist())
print((readings - outside[:, None]).tolist())`,
    "[[6, 8], [8, 12]]\n[[6, 12], [4, 12]]",
    "Both outputs have the same shape. Only the second uses each day's outside reading across that day's whole row. Understanding the input meaning is still necessary after a program stops reporting shape errors."));

  const sampling = lessons.find(lesson => lesson.id === "reproducible-sampling");
  sampling.parts[1].examples.push(worked("Choose readings with or without replacement",
    "default_rng is NumPy's convenient way to create a generator. It currently uses PCG64 by default; explicitly naming the bit generator, as earlier, also records that choice. choice draws from the values we supply. With replace=False, no input position can be chosen twice in one draw.\n\nA size tuple asks for a table of draws. Here replacement is allowed for the second request, so a draw can include the same observation more than once.",
    `readings = np.array([10.,20.,30.,40.])
rng = np.random.default_rng(42)
without_replacement = rng.choice(readings, size=3, replace=False)
print(without_replacement.size)
print(np.unique(without_replacement).size)
rng = np.random.default_rng(42)
resamples = rng.choice(readings, size=(2,3), replace=True)
print(resamples.tolist())
print(np.round(resamples.mean(axis=1),4).tolist())`,
    "3\n3\n[[10.0, 40.0, 30.0], [20.0, 20.0, 40.0]]\n[26.6667, 26.6667]",
    "The first input has distinct values, so its three unique selected values also demonstrate three distinct positions. In a dataset with equal-valued observations, different positions could still hold equal values. The two resamples happen to share a mean here, although their selected observations differ."));
  sampling.parts[2].examples.push(worked("Shuffle related arrays with one shared permutation",
    "A permutation rearranges every position without replacement. Generate it once, then apply it to both features and labels. Calling a shuffle separately for each collection can destroy their correspondence.",
    `names = np.array(["north","middle","south","annex"])
readings = np.array([10,20,30,40])
rng = np.random.default_rng(42)
order = rng.permutation(readings.size)
print(order.tolist())
print(names[order].tolist())
print(readings[order].tolist())`,
    "[3, 2, 1, 0]\n['annex', 'south', 'middle', 'north']\n[40, 30, 20, 10]",
    "The same order moves names and temperatures together. A saved permutation can define a repeatable split, but random splitting is not appropriate when time or related groups require a different evaluation design."));
  sampling.parts[3].examples = [worked("Generate a small simulated sensor report",
    "A distribution describes the rule for drawing values. normal draws from a normal distribution with a supplied centre, loc, and standard deviation, scale. The size determines the output shape. The standard deviation is not a hard bound on possible deviations.\n\nThese are simulated values under a chosen assumption, not recorded thermometer measurements. Uniform draws over an interval would express a different assumption; a seed only fixes the sequence within the chosen rule.",
    `rng = np.random.default_rng(42)
simulated = rng.normal(loc=20, scale=2, size=(2,3))
print(simulated.shape)
print(np.round(simulated,1).tolist())`,
    "(2, 3)\n[[20.6, 17.9, 21.5], [21.9, 16.1, 17.4]]",
    "The layout represents two mornings and three greenhouses. It does not claim to reproduce real temperature patterns. Changing the distribution, its parameters, the request order, or the environment can change a simulated experiment.")];
  sampling.quiz.push(
    question("How should we preserve the name-to-reading relationship when shuffling?", 'names = np.array(["north","middle","south","annex"])\nreadings = np.array([10,20,30,40])\nrng = np.random.default_rng(42)', ["Shuffle each array independently", "Apply one permutation of positions to both arrays", "Sort the names and keep the readings unchanged"], 1, "One permutation moves each name together with its corresponding observation."),
    question("What does scale specify in this simulation?", "rng = np.random.default_rng(42)\nsimulated = rng.normal(loc=20, scale=2, size=(2,3))", ["A strict maximum deviation of two", "The number of greenhouse columns", "The distribution's standard deviation"], 2, "Normal draws can fall more than one standard deviation from their centre. Scale is not a clipping boundary.")
  );
}

export const numpyApplications = {
  "numpy-arrays": [["Direct statistics calculations", "/primers/statistics"]],
  "numpy-axes": [["Pooling measurements", "/concepts/pooling"]],
  "numpy-creation": [["Initialising and training a network", "/concepts/training-a-network"]],
  "numpy-indexing": [["Selecting held-out observations", "/concepts/held-out-evaluation"], ["Looking up embedding rows", "/concepts/embedding-layers"]],
  "numpy-reshaping": [["Shapes and flattening", "/concepts/shapes-and-flattening"], ["Dense layers", "/concepts/dense-layers"]],
  "numpy-broadcasting": [["Centring measurements", "/concepts/centring-on-the-mean"], ["Attention", "/concepts/attention"]],
  "numpy-masks": [["Missing measurements", "/concepts/missing-measurements"]],
  "numpy-reductions": [["Standard scores", "/concepts/the-standard-score"], ["Nearest-neighbour comparisons", "/concepts/k-nearest-neighbours"]],
  "numpy-vectorisation": [["Loss functions", "/concepts/loss-functions"], ["Gradient calculations", "/concepts/gradient-descent-regression"]],
  "numpy-linear-algebra": [["Multiple feature predictions", "/concepts/multiple-polynomial-regression"], ["Principal component analysis", "/concepts/pca"]],
  "numpy-numerical-checks": [["Preparing incomplete reports", "/concepts/missing-measurements"], ["Evaluating held-out predictions", "/concepts/held-out-evaluation"]],
  "reproducible-sampling": [["Bootstrap uncertainty", "/concepts/bootstrap-uncertainty"], ["Bagging", "/concepts/bagging"]],
  "numpy-functions": [["Pipelines", "/concepts/pipelines"], ["Keeping evaluation data separate", "/concepts/data-leakage"]],
  "numpy-saving-data": [["Repeating a fitted pipeline", "/concepts/pipelines"]],
};
