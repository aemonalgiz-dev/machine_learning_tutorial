import { pageMetadata } from "@/lib/seo";
import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/PrimerPage";
import { KnnPlayground } from "@/components/widgets/KnnPlayground";

export const metadata: Metadata = pageMetadata("/concepts/k-nearest-neighbours", {
  title: "k-Nearest Neighbors · Perceptron Lab",
  description:
    "Nearby labeled examples can provide evidence about an unfamiliar observation. The distance measure and number of neighbors determine which examples contribute and how local the resulting prediction is.",
});

export default function KNearestNeighboursPage() {
  return (
    <ConceptPage
      lessonId="k-nearest-neighbours"
      intuition={lessonIntuitions["k-nearest-neighbours"]}
      technicalStart="The Mechanism"
      openingTitle="Ask the Examples That Look Most Alike"
      playgroundTitle="Let nearby people vote on a new observation"
      playgroundIntro="Move the ringed query point, then change k. Watch which stored points are selected and how their votes produce the label."
      title="k-Nearest Neighbors"
      tagline={"Nearby labeled examples can provide evidence about an unfamiliar observation. The distance measure and number of neighbors determine which examples contribute and how local the resulting prediction is."}
      prerequisites={
        <>
          The distance between two points, the length of their difference, is
          the whole engine here, and it comes from the{" "}
          <Link
            href="/primers/linear-algebra"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            linear algebra primer
          </Link>
          . The scaling section leans on the{" "}
          <Link
            href="/primers/statistics"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            statistics primer
          </Link>
          &rsquo;s standard deviation.
        </>
      }

      playground={<KnnPlayground />}
      sections={[
        {
          title: "How to Conceptualize",
          defaultOpen: true,
          content: (<>
<>
              <p>Imagine a chart of people we have already measured and labeled, using height and weight as coordinates. The interactive example colors children amber and adults indigo. A ring marks someone new: we have their measurements but have not supplied their label.</p>
              <p>Can the nearby labeled examples give us a useful prediction? We must decide both what nearby means and how many neighbors should contribute before we can turn resemblance into a rule.</p>
              <p>

                We will use resemblance as our starting rule. The dashed lines connect the new person to the k nearest stored people. Each neighbor votes for its own label, and the majority decides the prediction. Move the ringed point and watch which neighbors it reaches. Where does the prediction change?
              </p>
              <>
                <p>

                  This model stores the examples and their labels instead of solving for
                  regression coefficients. Fitting may also build an index that makes
                  neighbor searches faster. Most of the prediction work happens when a
                  new query arrives: find nearby examples, then combine their answers.
                  The choice of distance and the number of neighbors still need to be
                  selected and evaluated.
                </p>
              </>
            </>
</>),
        },
        {
          title: "The Mechanism",
          content: (
            <>
              <p>We need a way to compare two people using their measurements. Write each person as a vector, with height and weight in a fixed order. Subtract the matching measurements to find their differences, then use the length of that difference vector as the distance.</p>
              <Equation>{"distance = √((height₁ − height₂)² + (weight₁ − weight₂)²)"}</Equation>
              <p>

                To make a prediction, calculate the distance to each stored person and keep the k smallest distances. Those neighbors supply the votes. We therefore need to keep the training examples available for later predictions. A fitted regression line can predict from its coefficients alone; this method still needs the observations.
              </p>
              <p>The number k tells us how many neighbors contribute. A small value makes the answer depend on a few nearby examples; a larger value includes people farther away. We keep k odd here to avoid a tied vote between the two classes. Other choices, including the distance rule, still affect the result.</p>
            </>
          ),
        },
        {
          title: "Which neighbors vote for this new person?" , id: "a-worked-example",
          content: (
            <>
              <p>
                Press the borderline case button, which places the query at a
                height of 150 cm and a weight of 45 kg, and work the distances
                by hand to the five people nearest it. Each difference below
                lands on a Pythagorean triple, four of them multiples of the
                linear algebra primer&rsquo;s 3-4-5 triangle and one the
                5-12-13, so every root comes out clean.
              </p>
              <Equation>{"child at (147, 41)   difference (3, 4)     distance  5\nadult at (156, 53)   difference (6, 8)     distance 10\nchild at (145, 57)   difference (5, 12)    distance 13\nadult at (159, 57)   difference (9, 12)    distance 15\nadult at (162, 61)   difference (12, 16)   distance 20"}</Equation>
              <p>
                Now read the votes at each k, checking against the widget as
                you go. At k of 1 only the child at distance 5 is consulted,
                and the answer is child. At k of 3 the voters are two children
                and one adult, two to one, child again. At k of 5 the two
                adults at distances 15 and 20 join, the vote is three adults
                to two children, and the answer flips to adult.
              </p>
              <p>Slide k from 3 to 5 and watch the prediction change. The measurements and labels stay the same. Including more neighbors changes the evidence: the closest group favors child, while the wider group favors adult.</p>
            </>
          ),
        },
        {
          title: "What k Trades",
          content: (
            <>
              <p>The shaded regions show which class the model predicts at each position. At k of 1, every position takes the label of its nearest stored person. One unusual or mislabeled observation can therefore create a small region with the opposite prediction to its surroundings. Like the polynomial fit at degree 9, the model can follow individual training observations too closely.</p>
              <>
<p>Increasing k lets several examples contribute to each prediction. A single unusual label may be outvoted, and the boundaries often become smoother. If k approaches the size of the dataset, nearly every prediction uses nearly everyone. The answer then depends mainly on which class is more common, with little attention to the query.</p>
              <p>The useful neighborhood size depends on the data. Too few neighbors can make predictions sensitive to individual observations; too many can hide meaningful local differences. Compare candidate values using observations that were held out from fitting.</p>
</>
            </>
          ),
        },
        {
          title: "Questions on the Mechanism and k",
          quiz: [
            trueFalse(
              "This nearest-neighbor implementation stores the labeled training examples and consults them at prediction time, rather than representing predictions only through a few regression coefficients.",
              true,
              "Fitting stores the feature rows and labels needed for later neighbor searches. At prediction time, the model calculates query-to-training distances and combines the selected labels. An implementation may also build a search index, but it still needs information representing the reference examples.",
            ),
            choice(
              "At the borderline query of 150 centimeters and 45 kilograms the five nearest people sit at distances 5, 10, 13, 15 and 20. What happens as k goes from 3 to 5?",
              [
                "The answer flips to adult, because the two adults at 15 and 20 join a vote that was two children to one adult",
                "The answer stays child, because the nearest person is still a child",
                "The answer flips from adult to child",
                "The vote ties, which is why k is kept odd",
              ],
              0,
              "The nearest three are two children and one adult. Adding the adults at distances 15 and 20 gives three adults among five neighbors, so the prediction changes to adult. The measurements and labels stay fixed; k changes which observations contribute to the vote.",
            ),
            trueFalse(
              "At k of 1 a single mislabeled or unusual person creates a prediction region of their own around that example.",
              true,
              "With one neighbor, each query takes the label of the closest stored observation. A mislabeled example can therefore determine predictions throughout the region where it is nearest. This sensitivity is a reason to evaluate larger neighborhoods or other protections against noise. It does not mean every one-neighbor model necessarily generalizes poorly.",
            ),
            several(
              "Which of these hold as k is pushed towards the size of the whole dataset?",
              [
                "The poll stops being local at all, since every query consults nearly everyone",
                "The answer drifts towards whichever class simply has more members",
                "The frontier between the two colors grows more jagged",
                "Stray voices are outvoted by their surroundings",
              ],
              [0, 1, 3],
              "With unweighted voting, increasing k generally reduces sensitivity to individual nearby labels while including more distant observations. At k equal to the training count, every query receives the overall majority class. Select k using held-out evidence so the neighborhood remains useful for the prediction problem.",
            ),
            choice(
              "The borderline query sits at (150, 45) and an adult at (156, 53). What distance does the mechanism’s formula give between them?",
              ["10", "14", "100", "8"],
              0,
              "Euclidean distance uses the height and weight differences as coordinate gaps:\n\n```math\ndistance = √((156 − 150)² + (53 − 45)²)\n         = √(36 + 64)\n         = 10\n```\n\nAdding the absolute gaps gives Manhattan distance instead. This raw numerical Euclidean calculation also assumes the recorded units provide the intended relative weighting.",
            ),
        ],
        },
        {
          title: "The Scaling Trap",
          content: (
            <>
              <p>The formula combines squared height differences with squared weight differences, even though their units differ. Here the heights span about 65 units and the weights about 60, so neither column dominates simply because its numerical range is much larger. Similar ranges still do not prove that the measurements deserve equal influence.</p>
              <>

                <p>Changing the units also changes the distances in this example. Multiply every height by ten, leaving the weights unchanged. Height differences become ten times larger and their squares become a hundred times larger. The distance now depends much more strongly on height.</p>
                <Equation>{"child at (1470, 41)   difference (30, 4)     distance ≈  30.27\nchild at (1450, 57)   difference (50, 12)    distance ≈  51.42\nadult at (1560, 53)   difference (60, 8)     distance ≈  60.53\nadult at (1590, 57)   difference (90, 12)    distance ≈  90.80\nadult at (1620, 61)   difference (120, 16)   distance ≈ 121.06"}</Equation>
                <p>The child at (145, 57) becomes the second-nearest person after converting height to millimeters. In centimeters, the adult at (156, 53) is closer because its smaller weight gap more than compensates for its slightly larger height gap.</p>
<p>After conversion, those height gaps are fifty and sixty millimeters while the weight gaps stay twelve and eight kilograms. The raw distance now gives height much more numerical weight. The class votes happen to stay unchanged at k=3 and k=5, but their neighbor rankings change. Unit conversion alone provides no evidence that this new weighting is better.</p>
              </>
              <>
                <p>
                  Scaling by each feature’s training standard deviation puts differences
                  on a comparable numerical scale. This is a useful starting point, not
                  proof that the features deserve equal predictive importance. Choose
                  the scaling and distance with the task in mind, then evaluate them on
                  held-out data.
                </p>
                <p>The training standard deviations are about 22.8 cm for height and 20.8 kg for weight. Dividing each coordinate difference by its corresponding standard deviation expresses both in standard-deviation units. It gives the columns comparable training variation, without requiring equal contributions to each pairwise distance. The five neighbors then have the following distances.</p>
                <Equation>{"child at (147, 41)   ≈ 0.23\nadult at (156, 53)   ≈ 0.47\nchild at (145, 57)   ≈ 0.62\nadult at (159, 57)   ≈ 0.70\nadult at (162, 61)   ≈ 0.93"}</Equation>
                <p>

                  That is the centimeter order back again, and the same five
                  numbers come out whether the fit started from centimeters
                  or from millimeters, because a difference ten times larger
                  is divided by a spread ten times larger. The unit has been
                  canceled, which is all that standardizing promises.
                </p>
              </>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>Why should the majority decide the answer? Storing the examples does not explain the vote by itself. We can justify that choice by treating nearby labels as an estimate of the class probabilities, then asking which prediction has the smaller expected error.</p>
              <p>

                Treat the k neighbors as a small poll of the query&rsquo;s
                neighborhood. If a fraction p̂ of them are adults, that
                fraction is our estimate of the chance that a person standing
                at the query&rsquo;s spot is an adult, the statistics
                primer&rsquo;s sampling idea pointed at a neighborhood
                instead of a population. Now weigh the two possible answers
                against that estimate. Guess adult and the expected chance of
                being wrong is 1 − p̂. Guess child and it is p̂.
              </p>
              <Equation>{"guess adult   when  1 − p̂ < p̂,   that is, when  p̂ > ½"}</Equation>
              <>
                <p>

                  If both kinds of mistake have the same cost, choose the class with the
                  larger estimated local probability. With equally weighted neighbors,
                  that gives a majority vote. This is optimal for the local estimate we
                  just made; it does not prove the estimate matches the true population
                  probability.
                </p>
                <p>
                  Read the worked example through this lens. At k of 3 one
                  voter in three is an adult, at k of 5 three in five are,
                  and the flip between them is the estimate crossing one
                  half.
                </p>
                <Equation>{"k = 3   p̂ = 1/3 < ½   guess child\nk = 5   p̂ = 3/5 > ½   guess adult"}</Equation>
                <p>

                  An even number of neighbors can produce a tied two-class vote, which
                  needs a stated tie rule. An odd count avoids that particular tie. It
                  does not resolve equally distant candidates at the edge of the
                  neighborhood, and multiclass votes can tie even with an odd count.
                </p>
              </>
            </>
          ),
        },
        {
          title: "Questions on Scaling and the Vote",
          quiz: [
            trueFalse(
              "Recording height in millimeters rather than centimeters makes the method’s predictions worse.",
              false,
              "Height differences become numerically larger, so they contribute much more to the squared distance and can change which people count as nearest. On the page’s own people the child at (145, 57) overtakes the adult at (156, 53) for second nearest, while the answers at k of 3 and k of 5 survive. Whether such a reshuffle helps or hurts depends on the dataset, and the unit conversion gives no reason to prefer the new weighting.",
            ),
            trueFalse(
              "Scaling each feature by its training standard deviation shows that the features deserve equal predictive importance.",
              false,
              "It puts the differences on a comparable numerical scale, which is a useful starting point and no more than that. On these eleven people it gives the same five distances whether height arrived in centimeters or millimeters, so what it does is cancel the unit, and canceling a unit says nothing about which measurement matters more. The scaling and the distance are chosen with the task in mind and then evaluated on held-out data.",
            ),
            choice(
              "Where does the majority vote come from, rather than being assumed?",
              [
                "The k neighbors are a poll of the local neighborhood, and with equal costs the class with the larger estimated local chance is the better guess",
                "The majority is whichever class minimizes the total distance to the query",
                "A majority is the only rule that cannot produce a tie",
                "It follows from the distance being the length of a difference",
              ],
              0,
              "Guess adult and the expected chance of being wrong is one minus the local share of adults, guess child and it is that share, so with equally weighted neighbors the larger share wins. That is optimal for the local estimate just made, and it does not prove the estimate matches the true population probability.",
            ),
            several(
              "Which of these hold for keeping k odd?",
              [
                "It rules out a tied two-class vote",
                "It rules out a tie between two candidates equally distant at the edge of the neighborhood",
                "It rules out a tied vote among three or more classes",
                "An even count would need a stated tie rule instead",
              ],
              [0, 3],
              "An odd count avoids that one particular tie and no others. Two equally distant candidates at the edge of the neighborhood still have to be separated somehow, and a multiclass vote can tie however many neighbors are polled.",
            ),
            choice(
              "At the borderline query with k of 5, three of the five neighbors are adults. In the derivation’s terms, what is p̂ and what does it decide?",
              [
                "p̂ is 3/5, above one half, so the guess is adult",
                "p̂ is 2/5, below one half, so the guess is child",
                "p̂ is 3/5, but the guess is child because the nearest neighbor is a child",
                "p̂ cannot be estimated from a poll of only five",
              ],
              0,
              "For this unweighted neighborhood, the estimated adult probability is the adult fraction. Under equal error costs, choose the class with the smaller estimated error risk:\n\n```math\np̂(adult) = 3 / 5\nrisk of predicting adult = 1 − 3/5 = 2/5\nrisk of predicting child = 3/5\n```\n\nAt k=3 the adult fraction is one third, so the same rule chooses child. Every selected neighbor has equal weight; the nearest does not receive an extra vote. These are risks under the local estimate, not a guarantee about the population.",
            ),
        ],
        },
        {
          title: "Practice. Polling the Eleven People With the Library",
          practice: [
            exercise("Put the borderline query to its neighbours",["Fit KNearestNeighboursClassifier to the eleven labeled height-weight pairs below. Predict the class of the query at 150 cm and 45 kg with three neighbors, then repeat with five. Child is class 0 and adult is class 1.", "Print the predicted class, the fraction of selected neighbors labeled adult, and each selected neighbor's label and distance. Compare which additional people change the vote when k increases."],`from oop_ml import Feature, KNearestNeighboursClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)
query = [Feature("height", [150]), Feature("weight", [45])]

# For k of 3 and then k of 5, fit a classifier on the eleven people, print
# the answer for the query and the share of its neighbours who are adults,
# then print each neighbour's label and distance, nearest first.`,`from oop_ml import Feature, KNearestNeighboursClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)
query = [Feature("height", [150]), Feature("weight", [45])]

for k in (3, 5):
    model = KNearestNeighboursClassifier(n_neighbours=k).fit(people, labels)
    answer = "adult" if float(model.predict(query)[0]) == 1 else "child"
    adult_share = float(model.predict_probabilities(query)[0, 1])
    print(f"k {k}  answer {answer}  adult share {adult_share:.4f}")
    for seen in model.neighbour_search(query):
        for distance, target in zip(seen.chosen_distances, seen.chosen_targets):
            voter = "adult" if target == 1 else "child"
            print(f"  {voter} at distance {distance:.0f}")`,`k 3  answer child  adult share 0.3333
  child at distance 5
  adult at distance 10
  child at distance 13
k 5  answer adult  adult share 0.6000
  child at distance 5
  adult at distance 10
  child at distance 13
  adult at distance 15
  adult at distance 20`,{...{ hints: ["Pass n_neighbours to the constructor and the feature and label columns to fit. This configures the neighborhood size and stores the reference people used for predictions.", "predict answers one class per query row, 0.0 or 1.0, and predict_probabilities answers one row per query with one column per class, so the adult share of the single query is row 0, column 1.", "neighbour_search answers one entry per query. Iterate it, and each entry carries chosen_distances and chosen_targets, both nearest first."], check: numberCheck("What share of the five neighbors are adults at k of 5?", 0.6, 0.001, "A majority of the five selected neighbors are adults, whereas the nearest three have a child majority. The class changes because the neighborhood changed, not because the training labels were refitted.") },question:"Which neighbors decide the borderline person's class at each neighbor count?"}),
            exercise("Walk k all the way up to everyone",["Repeat the same query for every odd k from 1 through 11. Print the number and share of adult neighbors, the farthest selected distance and the predicted class.", "At k=11, all stored people contribute equally, regardless of the query's position. Compare the intermediate results to see how including more distant people can reverse the majority more than once."],`from oop_ml import Feature, KNearestNeighboursClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)
query = [Feature("height", [150]), Feature("weight", [45])]

# For each odd k from 1 to 11, fit a classifier and print how many of the
# query's neighbours are adults, their share of k, the distance to the
# farthest neighbour consulted, and the answer.`,`from oop_ml import Feature, KNearestNeighboursClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)
query = [Feature("height", [150]), Feature("weight", [45])]

for k in (1, 3, 5, 7, 9, 11):
    model = KNearestNeighboursClassifier(n_neighbours=k).fit(people, labels)
    answer = "adult" if float(model.predict(query)[0]) == 1 else "child"
    for seen in model.neighbour_search(query):
        adults = int(seen.chosen_targets.sum())
        farthest = seen.chosen_distances[-1]
        print(f"k {k:2d}  adults {adults} of {k}  share {adults / k:.4f}  farthest voter {farthest:.2f}  answer {answer}")`,`k  1  adults 0 of 1  share 0.0000  farthest voter 5.00  answer child
k  3  adults 1 of 3  share 0.3333  farthest voter 13.00  answer child
k  5  adults 3 of 5  share 0.6000  farthest voter 20.00  answer adult
k  7  adults 3 of 7  share 0.4286  farthest voter 36.06  answer child
k  9  adults 4 of 9  share 0.4444  farthest voter 43.28  answer child
k 11  adults 6 of 11  share 0.5455  farthest voter 50.33  answer adult`,{...{ hints: ["The same constructor and fit each time round, with only k changing. k of 11 is allowed, since eleven rows were supplied, and it polls everyone.", "neighbour_search gives each query its chosen_targets, which sum to the number of adults, and its chosen_distances, whose last entry is the farthest voter."], check: numberCheck("At k of 11, when every stored person votes, what share of the votes are for adult?", 0.5455, 0.0001, "At the full training count every reference votes, so the local query position no longer affects this unweighted class share. Intermediate counts can reverse the majority as different groups enter the neighborhood.") },question:"How does the vote change as increasingly distant people join it?"}),
            exercise("Record the heights in millimetres, then standardise",["Convert the eleven training heights and the query height to millimeters, leaving weights in kilograms. Fit a three-neighbor classifier. Print the selected row indices with their original height and weight and their distances in the new coordinates. Then standardize both millimeter-based input columns, refit and print the selected neighbors again.", "Print both standard deviations learned from the training people. Apply the same fitted scaler to the query. Compare the raw millimeter ranking with the standardized ranking; standardizing removes the unit conversion but need not reproduce every raw-centimeter ranking in other datasets."],`from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]
labels = Feature("is_adult", is_adult)

heights_in_mm = Feature("height", [height * 10 for height in heights])
millimetres = [heights_in_mm, Feature("weight", weights)]
query = [Feature("height", [1500]), Feature("weight", [45])]

# Fit at k of 3 on the millimetre features and print each of the query's
# neighbours with their original height and weight and their distance.
# Then standardise the millimetre features, refit at k of 3, print the
# spread the standardiser learned for each feature, and print the
# neighbours again with their standardised distances.`,`from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]
labels = Feature("is_adult", is_adult)

heights_in_mm = Feature("height", [height * 10 for height in heights])
millimetres = [heights_in_mm, Feature("weight", weights)]
query = [Feature("height", [1500]), Feature("weight", [45])]

raw = KNearestNeighboursClassifier(n_neighbours=3).fit(millimetres, labels)
print("in millimetres")
for seen in raw.neighbour_search(query):
    for index, distance in zip(seen.chosen_indices, seen.chosen_distances):
        voter = "adult" if is_adult[index] else "child"
        print(f"  {voter} at ({heights[index]}, {weights[index]})  distance {distance:.2f}")

standardizer = Standardizer()
scaled = KNearestNeighboursClassifier(n_neighbours=3).fit(
    standardizer.fit_transform(millimetres), labels
)
for scaling in standardizer.scalings:
    print(f"{scaling.name} spread {scaling.standard_deviation:.2f}")
print("standardised")
for seen in scaled.neighbour_search(standardizer.transform(query)):
    for index, distance in zip(seen.chosen_indices, seen.chosen_distances):
        voter = "adult" if is_adult[index] else "child"
        print(f"  {voter} at ({heights[index]}, {weights[index]})  distance {distance:.4f}")`,`in millimetres
  child at (147, 41)  distance 30.27
  child at (145, 57)  distance 51.42
  adult at (156, 53)  distance 60.53
height spread 228.43
weight spread 20.76
standardised
  child at (147, 41)  distance 0.2332
  adult at (156, 53)  distance 0.4663
  child at (145, 57)  distance 0.6180`,{...{ hints: ["A Feature takes a name and a list, so the millimeter column is the heights each multiplied by ten under the same name, and the query’s height is 1500.", "Each entry of neighbour_search has chosen_indices, positions into the people in the order they were supplied, which is how to print the original height and weight beside each distance.", "Standardizer learns on fit_transform and is applied to the query with transform, so the people and the query pass through the same scaling. Its scalings can be iterated, and each one has a name and a standard_deviation."], check: numberCheck("In millimeters, how far is the second nearest person from the query?", 51.42, 0.01, "The millimeter conversion changes the relative height and weight contributions to raw distance. Standardization then uses training spreads to put both columns on a declared common numerical scale.") },question:"How do millimeters and standardization change the neighbor order?"}),
            exercise("Ask for more neighbours than there are people",["The widget’s slider goes up to 15 and the borderline case has eleven people. Ask the library for fifteen neighbors on the eleven and see what it does.", "A vote cannot have more voters than people. Catch what the library raises, and print its name and its message."],`from oop_ml import Feature, KNearestNeighboursClassifier, MLLibError

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)

# Try to fit a classifier that consults fifteen neighbours. Catch the
# library's own error, and print the name of its class and its message.`,`from oop_ml import Feature, KNearestNeighboursClassifier, MLLibError

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)

try:
    KNearestNeighboursClassifier(n_neighbours=15).fit(people, labels)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,`TooFewValuesError
15 neighbours were asked for and only 11 rows were supplied`,{...{ hints: ["The refusal happens at fit rather than at construction, because fitting is the first moment the model knows how many rows there are."] },question:"What happens when we ask for more neighbors than the training table contains?"}),
          ],
        },
      ]}
    />
  );
}
