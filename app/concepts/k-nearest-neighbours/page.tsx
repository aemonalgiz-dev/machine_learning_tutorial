import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/PrimerPage";
import { KnnPlayground } from "@/components/widgets/KnnPlayground";

export const metadata: Metadata = {
  title: "k-Nearest Neighbours · oop_ml",
  description:
    "If similar examples tend to have similar answers, nearby labelled examples may help us predict a new one. We still need to decide how to measure distance and how many neighbours to ask.",
};

export default function KNearestNeighboursPage() {
  return (
    <ConceptPage
      lessonId="k-nearest-neighbours"
      intuition={lessonIntuitions["k-nearest-neighbours"]}
      technicalStart="The Mechanism"
      openingTitle="Ask the Examples That Look Most Alike"
      playgroundIntro="Move the ringed query point, then change k. Watch which stored points are selected and how their votes produce the label."
      title="k-Nearest Neighbours"
      tagline={"If similar examples tend to have similar answers, nearby labelled examples may help us predict a new one. We still need to decide how to measure distance and how many neighbours to ask."}
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
              <p>
                The dots in the box above are people we have already measured
                and labelled, amber for children and indigo for adults, placed
                by height and weight. The ringed point is someone new, measured
                but not yet labelled, and the question is which group they
                belong to.
              </p>
              <p>
                The method answers the way a person would. Look at whoever the
                new arrival most resembles. The dashed lines reach out to the k
                stored people nearest the query, those neighbours each vote
                their own label, and the majority wins. Drag the ringed point
                around and watch the lines grab different neighbours and the
                answer follow.
              </p>
              <>
                <p>
                  This model stores the examples and their labels instead of solving for
                  regression coefficients. Fitting may also build an index that makes
                  neighbour searches faster. Most of the prediction work happens when a
                  new query arrives: find nearby examples, then combine their answers.
                  The choice of distance and the number of neighbours still need to be
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
              <p>
                The whole method is three steps, and the first is the linear
                algebra primer&rsquo;s distance. Each person is a vector of
                measurements, and the distance between two people is the
                length of their difference.
              </p>
              <Equation>{"distance = √((height₁ − height₂)² + (weight₁ − weight₂)²)"}</Equation>
              <p>
                Compute that distance from the query to every stored person,
                keep the k smallest, and let those k labels vote, majority
                rules. That is the entire mechanism, which is itself the
                lesson. Where regression compressed the data into a few fitted
                numbers and then discarded it, this method keeps every example
                and compresses nothing.
              </p>
              <p>
                The number k is the one dial, and it is kept odd here so a
                two-class vote cannot tie. What it trades is the subject of a
                later section, though the short version is that k sets how
                local the decision is, one neighbour listens to a single
                nearby voice, fifteen neighbours poll the whole
                neighbourhood.
              </p>
            </>
          ),
        },
        {
          title: "A Worked Example",
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
              <p>
                Slide k from 3 to 5 above and watch that flip happen. Not one
                point moved and not one label changed, yet the answer
                reversed, because k decides how wide a circle of opinion is
                consulted, and this query sits close to a few children inside
                a neighbourhood that leans adult.
              </p>
            </>
          ),
        },
        {
          title: "What k Trades",
          content: (
            <>
              <p>
                The shaded regions show the model&rsquo;s answer at every spot
                on the plane, and sliding k redraws them in a way worth
                staring at. At k of 1 the map is jagged. Every stored person
                commands their own island of territory, including any point
                that sits oddly among the other class, so one mislabelled or
                unusual person creates a local prediction region around that example. That is memorising,
                the same failure the polynomial page met at degree 9, wearing
                a different costume.
              </p>
              <>
<p>
                Raise k and the islands dissolve. Each decision now polls a wider circle, stray voices are outvoted by their surroundings, and the frontier between amber and indigo smooths out. Push k toward the size of the whole dataset, though, and the poll stops being local at all, every query consults nearly everyone, and the answer drifts toward whichever class simply has more members.
              </p>
              <p>
                Small k trusts each example too much, large k trusts the crowd too much, and the honest choice again needs data held out from the decision, the same open thread the penalty page left hanging.
              </p>
</>
            </>
          ),
        },
        {
          title: "Questions on the Mechanism and k",
          quiz: [
            trueFalse(
              "Where regression compresses the data into a few fitted numbers and then discards it, this method keeps every example and compresses nothing.",
              true,
              "Fitting stores the examples and their labels, and may build an index that makes neighbour searches faster, but it solves for nothing. Most of the work happens when a query arrives, since finding the nearby examples and combining their answers is what a prediction costs here.",
            ),
            choice(
              "At the borderline query of 150 centimetres and 45 kilograms the five nearest people sit at distances 5, 10, 13, 15 and 20. What happens as k goes from 3 to 5?",
              [
                "The answer flips to adult, because the two adults at 15 and 20 join a vote that was two children to one adult",
                "The answer stays child, because the nearest person is still a child",
                "The answer flips from adult to child",
                "The vote ties, which is why k is kept odd",
              ],
              0,
              "At k of 3 the voters are the child at distance 5, the adult at 10 and the child at 13, two to one for child. Widening to 5 admits the adults at 15 and 20, and the vote is three to two for adult. Not one point moved and not one label changed, since k decides how wide a circle of opinion is consulted, and this query sits close to a few children inside a neighbourhood that leans adult.",
            ),
            trueFalse(
              "At k of 1 a single mislabelled or unusual person creates a prediction region of their own around that example.",
              true,
              "At k of 1 the only voter is the nearest stored person, so every spot closer to one person than to anyone else takes that person’s label, and a mislabelled or unusual person gets an island like everybody else. That is what makes the map jagged, and it is memorising, the same failure the polynomial page met at degree 9 wearing a different costume.",
            ),
            several(
              "Which of these hold as k is pushed towards the size of the whole dataset?",
              [
                "The poll stops being local at all, since every query consults nearly everyone",
                "The answer drifts towards whichever class simply has more members",
                "The frontier between the two colours grows more jagged",
                "Stray voices are outvoted by their surroundings",
              ],
              [0, 1, 3],
              "Raising k dissolves the islands and smooths the frontier, which is the gain, and pushed far enough the same move empties the decision of locality. Small k trusts each example too much and large k trusts the crowd too much, so the honest choice needs data held out from the decision.",
            ),
            choice(
              "The borderline query sits at (150, 45) and an adult at (156, 53). What distance does the mechanism’s formula give between them?",
              ["10", "14", "100", "8"],
              0,
              "The differences are 6 in height and 8 in weight. Squared they are 36 and 64, which sum to 100, and the root of that is 10, the primer’s 3-4-5 triangle doubled. Adding the two differences without squaring gives 14, and stopping before the root gives 100, and neither is the length of the difference, which is what the formula measures.",
            ),
        ],
        },
        {
          title: "The Scaling Trap",
          content: (
            <>
              <p>
                One quiet assumption is doing load-bearing work in every
                distance above, and it is the method&rsquo;s best-known trap.
                The distance formula adds the two squared differences as
                though a centimetre of height and a kilogram of weight were
                the same size of thing. Here that happens to be roughly fair,
                since the heights span about 65 units and the weights about
                60, so both measurements get a real say.
              </p>
              <>
                <p>
                  Now imagine that height is recorded in millimetres. Height differences
                  become numerically larger, so they contribute much more to the squared
                  distance and can change which people count as nearest. This may help
                  or hurt predictions depending on the dataset. The unit conversion
                  alone gives us no reason to prefer the new weighting.
                </p>
                <p>
                  Here it does. Redo the worked example with every height
                  multiplied by ten. The weight differences are
                  what they were, the height differences are ten times
                  larger and their squares a hundred times larger, so weight
                  has almost no say left.
                </p>
                <Equation>{"child at (1470, 41)   difference (30, 4)     distance ≈  30.27\nchild at (1450, 57)   difference (50, 12)    distance ≈  51.42\nadult at (1560, 53)   difference (60, 8)     distance ≈  60.53\nadult at (1590, 57)   difference (90, 12)    distance ≈  90.80\nadult at (1620, 61)   difference (120, 16)   distance ≈ 121.06"}</Equation>
                <p>
                  The child at (145, 57) has overtaken the adult at (156, 53)
                  for second nearest. In centimetres the adult was closer,
                  since the child is twelve kilograms from the query in
                  weight and the adult only eight, and that outweighed the
                  child being one centimetre nearer in height. In
                  millimetres the height differences are fifty and sixty,
                  their squares dwarf anything the kilograms add, and the
                  child&rsquo;s one-centimetre edge decides it. The vote
                  happens to survive, two children to one adult at k of 3
                  and three adults to two children at k of 5, but the
                  ranking it rests on was reshuffled by a choice of unit
                  that said nothing about anybody.
                </p>
              </>
              <>
                <p>
                  Scaling by each feature’s training standard deviation puts differences
                  on a comparable numerical scale. This is a useful starting point, not
                  proof that the features deserve equal predictive importance. Choose
                  the scaling and distance with the task in mind, then evaluate them on
                  held-out data.
                </p>
                <p>
                  On these eleven people that spread is about 22.8 cm for
                  height and about 20.8 kg for weight, so dividing each
                  difference by its own spread hands the two measurements a
                  roughly equal say. The five neighbours then sit at these
                  distances, measured in spreads rather than in any unit.
                </p>
                <Equation>{"child at (147, 41)   ≈ 0.23\nadult at (156, 53)   ≈ 0.47\nchild at (145, 57)   ≈ 0.62\nadult at (159, 57)   ≈ 0.70\nadult at (162, 61)   ≈ 0.93"}</Equation>
                <p>
                  That is the centimetre order back again, and the same five
                  numbers come out whether the fit started from centimetres
                  or from millimetres, because a difference ten times larger
                  is divided by a spread ten times larger. The unit has been
                  cancelled, which is all that standardising promises.
                </p>
              </>
            </>
          ),
        },
        {
          title: "How to Derive",
          content: (
            <>
              <p>
                A method with no objective would seem to leave nothing to
                derive, though one piece of it can be earned rather than
                assumed, the vote itself. Why should the majority of the
                neighbours decide, rather than the single nearest one, or
                some fancier weighting?
              </p>
              <p>
                Treat the k neighbours as a small poll of the query&rsquo;s
                neighbourhood. If a fraction p̂ of them are adults, that
                fraction is our estimate of the chance that a person standing
                at the query&rsquo;s spot is an adult, the statistics
                primer&rsquo;s sampling idea pointed at a neighbourhood
                instead of a population. Now weigh the two possible answers
                against that estimate. Guess adult and the expected chance of
                being wrong is 1 − p̂. Guess child and it is p̂.
              </p>
              <Equation>{"guess adult   when  1 − p̂ < p̂,   that is, when  p̂ > ½"}</Equation>
              <>
                <p>
                  If both kinds of mistake have the same cost, choose the class with the
                  larger estimated local probability. With equally weighted neighbours,
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
                  An even number of neighbours can produce a tied two-class vote, which
                  needs a stated tie rule. An odd count avoids that particular tie. It
                  does not resolve equally distant candidates at the edge of the
                  neighbourhood, and multiclass votes can tie even with an odd count.
                </p>
              </>
            </>
          ),
        },
        {
          title: "Questions on Scaling and the Vote",
          quiz: [
            trueFalse(
              "Recording height in millimetres rather than centimetres makes the method’s predictions worse.",
              false,
              "Height differences become numerically larger, so they contribute much more to the squared distance and can change which people count as nearest. On the page’s own people the child at (145, 57) overtakes the adult at (156, 53) for second nearest, while the answers at k of 3 and k of 5 survive. Whether such a reshuffle helps or hurts depends on the dataset, and the unit conversion gives no reason to prefer the new weighting.",
            ),
            trueFalse(
              "Scaling each feature by its training standard deviation shows that the features deserve equal predictive importance.",
              false,
              "It puts the differences on a comparable numerical scale, which is a useful starting point and no more than that. On these eleven people it gives the same five distances whether height arrived in centimetres or millimetres, so what it does is cancel the unit, and cancelling a unit says nothing about which measurement matters more. The scaling and the distance are chosen with the task in mind and then evaluated on held-out data.",
            ),
            choice(
              "Where does the majority vote come from, rather than being assumed?",
              [
                "The k neighbours are a poll of the local neighbourhood, and with equal costs the class with the larger estimated local chance is the better guess",
                "The majority is whichever class minimises the total distance to the query",
                "A majority is the only rule that cannot produce a tie",
                "It follows from the distance being the length of a difference",
              ],
              0,
              "Guess adult and the expected chance of being wrong is one minus the local share of adults, guess child and it is that share, so with equally weighted neighbours the larger share wins. That is optimal for the local estimate just made, and it does not prove the estimate matches the true population probability.",
            ),
            several(
              "Which of these hold for keeping k odd?",
              [
                "It rules out a tied two-class vote",
                "It rules out a tie between two candidates equally distant at the edge of the neighbourhood",
                "It rules out a tied vote among three or more classes",
                "An even count would need a stated tie rule instead",
              ],
              [0, 3],
              "An odd count avoids that one particular tie and no others. Two equally distant candidates at the edge of the neighbourhood still have to be separated somehow, and a multiclass vote can tie however many neighbours are polled.",
            ),
            choice(
              "At the borderline query with k of 5, three of the five neighbours are adults. In the derivation’s terms, what is p̂ and what does it decide?",
              [
                "p̂ is 3/5, above one half, so the guess is adult",
                "p̂ is 2/5, below one half, so the guess is child",
                "p̂ is 3/5, but the guess is child because the nearest neighbour is a child",
                "p̂ cannot be estimated from a poll of only five",
              ],
              0,
              "p̂ is the share of the k neighbours who are adults, and three in five is 3/5. Guessing adult then risks being wrong with chance 1 − 3/5, which is 2/5, and guessing child risks 3/5, so adult is the smaller risk. At k of 3 the share is 1/3 and the same rule says child, which is the worked example’s flip seen as the estimate crossing one half. The nearest neighbour carries no extra weight in this vote, which is what equally weighted means.",
            ),
        ],
        },
        {
          title: "Practice. Polling the Eleven People With the Library",
          practice: [
            exercise(
              "Put the borderline query to its neighbours",
              ["Fit the library’s classifier on the eleven people of the widget’s borderline case, with the query at a height of 150 and a weight of 45, and let it find the neighbours the worked example found by hand. Do it once at k of 3 and once at k of 5.", "The worked example arrived at distances of 5, 10, 13, 15 and 20 and an answer that flips from child to adult between the two. The library takes the same route, so the distances should come out exactly, and the share of adults among the neighbours is the p̂ of the derivation, one third at k of 3 and three fifths at k of 5."],
              `from oop_ml import Feature, KNearestNeighboursClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)
query = [Feature("height", [150]), Feature("weight", [45])]

# For k of 3 and then k of 5, fit a classifier on the eleven people, print
# the answer for the query and the share of its neighbours who are adults,
# then print each neighbour's label and distance, nearest first.`,
              `from oop_ml import Feature, KNearestNeighboursClassifier

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
            print(f"  {voter} at distance {distance:.0f}")`,
              `k 3  answer child  adult share 0.3333
  child at distance 5
  adult at distance 10
  child at distance 13
k 5  answer adult  adult share 0.6000
  child at distance 5
  adult at distance 10
  child at distance 13
  adult at distance 15
  adult at distance 20`,
              { hints: ["Construction configures and fitting learns, so n_neighbours goes to the constructor and the people go to fit. The target is the label column, 0 for a child and 1 for an adult.", "predict answers one class per query row, 0.0 or 1.0, and predict_probabilities answers one row per query with one column per class, so the adult share of the single query is row 0, column 1.", "neighbour_search answers one entry per query. Iterate it, and each entry carries chosen_distances and chosen_targets, both nearest first."], check: numberCheck("What share of the five neighbours are adults at k of 5?", 0.6, 0.001, "Three of the five nearest people are adults, so the share is 3/5. That is the derivation’s p̂, above one half, which is why the vote goes to adult, where at k of 3 the share is 1/3 and the same rule says child.") },
            ),
            exercise(
              "Walk k all the way up to everyone",
              ["The lesson slides k from 3 to 5 and stops. Keep going, at every odd k from 1 up to 11, which is everybody, and print at each the number of adults among the voters, their share, how far away the farthest voter is, and the answer.", "What k Trades says that pushed toward the size of the whole dataset the answer drifts toward whichever class simply has more members. Six of the eleven people are adults, so at k of 11 the query’s own position has stopped mattering. Watch what happens in between, where the lesson does not look."],
              `from oop_ml import Feature, KNearestNeighboursClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)
query = [Feature("height", [150]), Feature("weight", [45])]

# For each odd k from 1 to 11, fit a classifier and print how many of the
# query's neighbours are adults, their share of k, the distance to the
# farthest neighbour consulted, and the answer.`,
              `from oop_ml import Feature, KNearestNeighboursClassifier

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
        print(f"k {k:2d}  adults {adults} of {k}  share {adults / k:.4f}  farthest voter {farthest:.2f}  answer {answer}")`,
              `k  1  adults 0 of 1  share 0.0000  farthest voter 5.00  answer child
k  3  adults 1 of 3  share 0.3333  farthest voter 13.00  answer child
k  5  adults 3 of 5  share 0.6000  farthest voter 20.00  answer adult
k  7  adults 3 of 7  share 0.4286  farthest voter 36.06  answer child
k  9  adults 4 of 9  share 0.4444  farthest voter 43.28  answer child
k 11  adults 6 of 11  share 0.5455  farthest voter 50.33  answer adult`,
              { hints: ["The same constructor and fit each time round, with only k changing. k of 11 is allowed, since eleven rows were supplied, and it polls everyone.", "neighbour_search gives each query its chosen_targets, which sum to the number of adults, and its chosen_distances, whose last entry is the farthest voter."], check: numberCheck("At k of 11, when every stored person votes, what share of the votes are for adult?", 0.5455, 0.0001, "Every one of the eleven people votes and six are adults, so the share is 6/11 whatever the query. Between the flip to adult at k of 5 and this, k of 7 and k of 9 go back to child, because the three far children are admitted before the three far adults, and the answer settles on adult only once the last two adults have arrived. That is the poll stopping being local at all.") },
            ),
            exercise(
              "Record the heights in millimetres, then standardise",
              ["The Scaling Trap multiplies every height by ten and watches the ranking change. Do that to the eleven people and the query, fit at k of 3, and print each neighbour with their original height and weight and their distance in the new units. Then standardise the millimetre features with the library, refit, and print the neighbours again.", "In millimetres the child at (145, 57) should overtake the adult at (156, 53) for second nearest. After standardising, the distances are in spreads rather than units, the centimetre order should be back, and the two spreads the standardiser learned are the ones the lesson quotes, in millimetres and kilograms."],
              `from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

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
# neighbours again with their standardised distances.`,
              `from oop_ml import Feature, KNearestNeighboursClassifier, Standardizer

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
        print(f"  {voter} at ({heights[index]}, {weights[index]})  distance {distance:.4f}")`,
              `in millimetres
  child at (147, 41)  distance 30.27
  child at (145, 57)  distance 51.42
  adult at (156, 53)  distance 60.53
height spread 228.43
weight spread 20.76
standardised
  child at (147, 41)  distance 0.2332
  adult at (156, 53)  distance 0.4663
  child at (145, 57)  distance 0.6180`,
              { hints: ["A Feature takes a name and a list, so the millimetre column is the heights each multiplied by ten under the same name, and the query’s height is 1500.", "Each entry of neighbour_search has chosen_indices, positions into the people in the order they were supplied, which is how to print the original height and weight beside each distance.", "Standardizer learns on fit_transform and is applied to the query with transform, so the people and the query pass through the same scaling. Its scalings can be iterated, and each one has a name and a standard_deviation."], check: numberCheck("In millimetres, how far is the second nearest person from the query?", 51.42, 0.01, "The child at (145, 57) is 50 millimetres and 12 kilograms from the query, and the root of 2500 plus 144 is about 51.42, where the adult at (156, 53) is 60 millimetres and 8 kilograms away, about 60.53. The weight differences are what they were, but the height differences are ten times larger and their squares a hundred times larger, so height now decides nearly everything, and the one-centimetre edge the child has in height beats the four-kilogram edge the adult has in weight.") },
            ),
            exercise(
              "Ask for more neighbours than there are people",
              ["The widget’s slider goes up to 15 and the borderline case has eleven people. Ask the library for fifteen neighbours on the eleven and see what it does.", "A vote cannot have more voters than people. Catch what the library raises, and print its name and its message."],
              `from oop_ml import Feature, KNearestNeighboursClassifier, MLLibError

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)

# Try to fit a classifier that consults fifteen neighbours. Catch the
# library's own error, and print the name of its class and its message.`,
              `from oop_ml import Feature, KNearestNeighboursClassifier, MLLibError

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]

people = [Feature("height", heights), Feature("weight", weights)]
labels = Feature("is_adult", is_adult)

try:
    KNearestNeighboursClassifier(n_neighbours=15).fit(people, labels)
except MLLibError as refusal:
    print(type(refusal).__name__)
    print(refusal)`,
              `TooFewValuesError
15 neighbours were asked for and only 11 rows were supplied`,
              { hints: ["Every refusal the library makes derives from one base class, so catching that one catches whichever specific refusal this turns out to be.", "The refusal happens at fit rather than at construction, because fitting is the first moment the model knows how many rows there are."] },
            ),
          ],
        },
      ]}
    />
  );
}
