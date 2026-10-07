import { lessonIntuitions } from "@/lib/intuition";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
import { choice, several, trueFalse } from "@/lib/quizzes";
import { exercise, numberCheck } from "@/lib/exercises";
import { Equation } from "@/components/concept/PrimerPage";
import {
  DerivationTable,
  InAModel,
  KeepInMind,
  NumberTable,
  SubSection,
  WhyThisWorks,
  WorkedExample,
} from "@/components/concept/Treatments";
import { BoundaryComparison } from "@/components/widgets/BoundaryComparison";
import { GiniCurve } from "@/components/widgets/GiniCurve";
import { RootGainChart } from "@/components/widgets/RootGainChart";
import { SplitInspector } from "@/components/widgets/SplitInspector";
import { TreeDepthSweep } from "@/components/widgets/TreeDepthSweep";
import { TreeGrowthPlayground } from "@/components/widgets/TreeGrowthPlayground";
import { TreePlayground } from "@/components/widgets/TreePlayground";
import { TreeStability } from "@/components/widgets/TreeStability";
import { TreeWalkPlayground } from "@/components/widgets/TreeWalkPlayground";
import { UnitConversion } from "@/components/widgets/UnitConversion";

export const metadata: Metadata = {
  title: "Decision Trees · oop_ml",
  description:
    "Build a prediction from a sequence of yes-or-no questions chosen from the data.",
};

const linkClass =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

// A crowd whose classes sit on the diagonals, so no single question tells
// them apart at all and a greedy search has nothing to choose.
const CROSSED_CROWD = [
  { x: 130, y: 30, label: 0 },
  { x: 135, y: 35, label: 0 },
  { x: 170, y: 70, label: 0 },
  { x: 175, y: 75, label: 0 },
  { x: 130, y: 70, label: 1 },
  { x: 135, y: 75, label: 1 },
  { x: 170, y: 30, label: 1 },
  { x: 175, y: 35, label: 1 },
];

export default function DecisionTreesPage() {
  return (
    <ConceptPage
      intuition={lessonIntuitions["decision-trees"]}
      technicalStart="Part 5. Scoring One Split"
      openingTitle="Which Question Should Come First?"
      playgroundIntro="Follow one point from the first question to its final leaf. Then compare how changing the tree's depth changes its prediction regions."
      title="Decision Trees"
      tagline="Build a prediction from a sequence of yes-or-no questions chosen from the data."
      prerequisites={
        <>
          Only the idea of classifying, predicting which of two groups someone
          belongs to, which{" "}
          <Link href="/concepts/logistic-regression" className={linkClass}>
            logistic regression
          </Link>{" "}
          established. No calculus appears anywhere on this page, which is
          itself worth noticing.
        </>
      }

      playground={<TreePlayground />}
      sections={[
        {
          title: "Part 1. A Model Built from Questions",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. A prediction made from questions">
                <p>
                  Press the ideal case button in the box above. Eleven people,
                  five children and six adults, and the whole model is one
                  question.
                </p>
                <Equation>{"Is height less than 151.5 cm?\n  yes → predict child\n  no  → predict adult"}</Equation>
                <p>
                  That is a decision tree with one question in it. The plane
                  is cut in two at 151.5 on the height axis, everyone to the
                  left is called a child and everyone to the right an adult,
                  and the printed tree under the plot is the same rule as text.
                  A tree predicts by routing an observation through a sequence
                  of questions, and here the sequence has length one.
                </p>
              </SubSection>

              <SubSection title="2. Roots, nodes, branches, leaves, and paths">
                <NumberTable
                  headings={["part", "what it is"]}
                  rows={[
                    ["root", "the first question, asked of everyone"],
                    ["internal node", "a later question, asked of whoever reached it"],
                    ["branch", "one possible answer, yes or no"],
                    ["leaf", "a final prediction, with no question left to ask"],
                    ["depth", "how many questions lie along a path from the root"],
                    ["path", "the sequence of questions one observation follows"],
                  ]}
                />
                <p>
                  A tree is a hierarchy with questions at the nodes and
                  predictions at the leaves. Load the muddled crowd above and
                  set the depth cap to two for a tree that has all of these,
                  a root, two internal questions beneath it, and four leaves.
                </p>
              </SubSection>

              <SubSection title="3. Walking one observation through the tree">
                <p>
                  A grown tree is a route map, and the way to feel that is to
                  send someone down it. The crowd below is sixteen people
                  chosen so that both questions matter, and the tree is kept
                  two questions deep so the whole map fits in one look.
                </p>
                <TreeWalkPlayground />
                <p>
                  A person&rsquo;s height reaches the root question. The
                  answer picks a branch. On one branch a second question checks
                  weight. The person reaches a leaf, and the leaf supplies the
                  prediction. Nothing else in the tree is consulted. Prediction
                  uses only the questions encountered along that
                  observation&rsquo;s own path.
                </p>
              </SubSection>

              <SubSection title="4. Different observations, different paths">
                <p>
                  Send the small child down and they are settled by the root
                  alone, since everyone under 153.5 cm here is a child, and
                  their weight is never read. Send the slender teenager down
                  and the root cannot settle them, so a second question about
                  weight is asked. Same tree, one question for one person and
                  two for another.
                </p>
                <p>
                  Path length varies across observations, and a shorter path is
                  not a better or more confident answer. It is a cheaper one.
                  The tree asked as much as it needed to reach a leaf and no
                  more, which is a quiet efficiency, and it says nothing about
                  which prediction is more likely to be right.
                </p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Questions as Geometric Splits",
          content: (
            <>
              <SubSection title="5. Thresholds as geometric cuts">
                <p>
                  Every question compares one measurement with one number.
                  &ldquo;Height less than 151.5&rdquo; is a vertical line on
                  the plane, with everyone sent left or right of it. &ldquo;Weight
                  less than 55&rdquo; is a horizontal line, with everyone sent
                  below or above. A threshold question divides the current
                  region along one feature axis, and it can only ever divide
                  it that way.
                </p>
              </SubSection>

              <SubSection title="6. Building rectangular regions">
                <p>
                  Start with one vertical cut. Add a horizontal cut to one side
                  only. That side is now two rectangles and the other side is
                  still one, and every further question splits one existing
                  rectangle into two. The tree below grows one split at a time,
                  with its rectangles growing alongside.
                </p>
                <TreeGrowthPlayground showControls={false} />
                <p>
                  Slide from zero to eight splits and watch each new question
                  carve one rectangle. Every leaf is one rectangle and every
                  rectangle is one leaf, and the path to a leaf is the list of
                  cuts that fenced its rectangle off. A standard axis-aligned
                  tree builds its decision map by repeatedly dividing existing
                  rectangles into rectangles, which is why the map can never
                  hold a slanted edge.
                </p>
              </SubSection>

              <SubSection title="7. Trees versus linear boundaries">
                <p>
                  Fit both models to one crowd and the difference is the shape
                  of the boundary. Logistic regression draws one straight line
                  at whatever angle the data asks for. The tree draws vertical
                  and horizontal cuts, and where the true boundary is slanted
                  it needs a staircase of them.
                </p>
                <BoundaryComparison />
                <p>
                  On the slanted crowd the line does in one cut what the tree
                  needs several rectangles to approximate. On the muddled
                  crowd, where the classes interleave in a way no line can
                  follow, the tree reaches an accuracy of 0.857 with nine
                  rectangles and the line manages 0.429. Neither is the better
                  model in general. They make different geometric assumptions,
                  and each is right where its assumption is.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What Makes a Useful Question?",
          content: (
            <>
              <SubSection title="8. Useful and useless questions">
                <p>
                  Before any formula, compare three questions on the clean
                  crowd by eye. The inspector below starts on a poor one.
                </p>
                <SplitInspector />
                <NumberTable
                  headings={["question", "left side", "right side", "what it did"]}
                  rows={[
                    ["height < 121", "2 children", "3 children, 6 adults", "peeled two children off and left the rest nearly as mixed as before"],
                    ["height < 146", "4 children", "1 child, 6 adults", "most of the way there, one child on the wrong side"],
                    ["height < 151.5", "5 children", "6 adults", "both sides pure"],
                  ]}
                />
                <p>
                  A useful question creates child groups whose mixtures are
                  cleaner than the parent&rsquo;s. Which of the three is best
                  needs no arithmetic. What needs arithmetic is ranking the
                  seventeen other candidates the search also tries, and that
                  is what the next Part builds.
                </p>
                <p>
                  Cleaner is the right test because of what a node is for. A
                  node that stops splitting becomes a leaf, and a leaf
                  predicts its majority for everyone who reaches it, so every
                  person in the minority of a mixed node is a mistake the tree
                  is committed to making. The third question above leaves no
                  minority on either side, and so gets all eleven people right
                  on its own. The first leaves three children among six adults
                  on its nine-person side, three mistakes waiting to happen,
                  and the second leaves one. A question is useful to the
                  extent that knowing its answer tells you something about the
                  label, and a smaller mixture on each side is what that
                  means.
                </p>
              </SubSection>

              <SubSection title="9. Pure and mixed nodes">
                <p>
                  A node is pure when every observation in it has the same
                  label. Five children and no adults is pure. Four children and
                  one adult is mildly mixed. Five and five is as mixed as two
                  classes can be. The split score has to measure the degree of
                  mixture, so that a question can be scored by how much
                  mixture it removes, and section 10 is that measure.
                </p>
                <p>
                  The measure has to be a number rather than a judgement, so
                  that nineteen candidates can be ranked rather than three
                  compared by eye, and two things are fixed about it before
                  any formula is chosen. It must be zero for a pure node,
                  since there is no mixture left to remove, and it must be
                  largest at an even split, since five and five is the most
                  mixed two classes can be. Any measure with those two
                  properties, rising as the mixture does, ranks the three
                  questions above the same way. Which one is used decides the
                  arithmetic in between, and the next Part picks the one with
                  the simplest story behind it.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Gini Impurity",
          content: (
            <>
              <SubSection title="10. Gini impurity">
                <p>
                  Write the share of children in a node as p and the share of
                  adults as 1 − p.
                </p>
                <Equation>{"G = 1 − p² − (1 − p)²"}</Equation>
                <WorkedExample>
                  <NumberTable
                    headings={["node", "p", "G"]}
                    rows={[
                      ["pure, all children", "1", "1 − 1 − 0 = 0"],
                      ["evenly mixed", "0.5", "1 − 0.25 − 0.25 = 0.5"],
                      ["three quarters children", "0.75", "1 − 0.5625 − 0.0625 = 0.375"],
                    ]}
                  />
                </WorkedExample>
                <GiniCurve />
                <p>
                  Zero for a pure node, one half at an even mixture, and
                  symmetric, so a node that is three quarters adults scores the
                  same 0.375 as one that is three quarters children.
                </p>
              </SubSection>

              <SubSection title="11. The probability meaning of Gini">
                <p>
                  The formula is a thought experiment written down. Treat the
                  node&rsquo;s class shares as a probability distribution, draw
                  one label from it, draw a second label from it independently,
                  and ask whether the two differ.
                </p>
                <Equation>{"P(the two agree) = Σₖ pₖ²\nG = P(the two differ) = 1 − Σₖ pₖ²"}</Equation>
                <p>
                  A pure node cannot produce a disagreeing pair. An even
                  mixture disagrees half the time. The simulator under the
                  curve draws pairs from the mixture and its disagreement rate
                  settles on the Gini value as the pairs accumulate.
                </p>
                <KeepInMind>
                  <p>
                    The draw is from the class distribution with replacement,
                    so the same person can be drawn twice. Picking two
                    different people out of the node without replacement is
                    a slightly different calculation, and for a node of five
                    children and six adults it gives 6/11 rather than 60/121.
                    Gini is the first of these, and the difference vanishes as
                    nodes get large.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Calculating root impurity">
                <p>Five children and six adults.</p>
                <Equation>{"p_child = 5/11        p_adult = 6/11\nG_root = 1 − (5/11)² − (6/11)² = 1 − 25/121 − 36/121 = 60/121 ≈ 0.496"}</Equation>
                <p>
                  Close to the two-class maximum of 0.5, so the root is highly
                  mixed, which is right. What the number does not yet say is
                  which question to ask. It describes the mixture before any
                  question, and a question is scored by how much of it is
                  removed.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Scoring One Split",
          content: (
            <>
              <SubSection title="13. Scoring one candidate split">
                <p>
                  Go back to the inspector in section 8 and pick the middling
                  question, height less than 146. The left side holds four
                  children and nothing else, so its Gini is zero. The right
                  side holds one child and six adults.
                </p>
                <Equation>{"G_right = 1 − (1/7)² − (6/7)² = 1 − 1/49 − 36/49 = 12/49 ≈ 0.245"}</Equation>
                <p>
                  A candidate split creates two new nodes, each with its own
                  mixture and its own impurity, and the inspector shows both
                  containers with their counts, shares and Gini for whichever
                  question is chosen.
                </p>
              </SubSection>

              <SubSection title="14. Why child impurities are weighted">
                <p>
                  Height less than 121 makes a tiny pure node of two and a
                  large mixed node of nine. A plain average of the two
                  impurities, 0 and 0.444, is 0.222, and it gives the two-person
                  node as much say as the nine-person one. So the children are
                  weighted by how many observations each holds.
                </p>
                <Equation>{"G_after = (n_left / n)·G_left + (n_right / n)·G_right"}</Equation>
                <WorkedExample title="height < 121">
                  <Equation>{"G_after = (2/11)·0 + (9/11)·0.444 = 0.364"}</Equation>
                  <p>
                    Higher than the plain average, because most people are in
                    the mixed node and a randomly chosen person is far more
                    likely to land there. The containers in the inspector are
                    drawn at the width of their share for this reason.
                  </p>
                </WorkedExample>
              </SubSection>

              <SubSection title="15. Impurity reduction">
                <Equation>{"gain = G_parent − (n_left / n)·G_left − (n_right / n)·G_right"}</Equation>
                <p>
                  Parent impurity is the mixture before the question. Weighted
                  child impurity is what remains after it. The gain is what
                  the question removed.
                </p>
                <NumberTable
                  headings={["question", "G_after", "gain"]}
                  rows={[
                    ["height < 121", "0.364", "0.496 − 0.364 = 0.132"],
                    ["height < 146", "0.156", "0.496 − 0.156 = 0.340"],
                    ["height < 151.5", "0", "0.496 − 0 = 0.496"],
                  ]}
                  caption="The perfectly separating split leaves both children pure, so its gain is the whole of the parent's impurity."
                />
                <p>
                  The tree prefers the question that removes the most weighted
                  impurity right now, and section 20 is about the word now.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Searching for the Best Question",
          content: (
            <>
              <SubSection title="16. Generating candidate thresholds">
                <p>
                  For a continuous feature, sort the observations by it, find
                  each pair of neighbouring distinct values, and put a
                  candidate threshold halfway between them. A threshold
                  anywhere else in the same gap divides the observations
                  identically, so it cannot score differently, and a threshold
                  beyond the ends divides nothing.
                </p>
                <WorkedExample>
                  <NumberTable
                    headings={["sorted heights", "candidates"]}
                    rows={[
                      ["145, 150, 153, 160", "147.5, 151.5, 156.5"],
                      ["the clean crowd's eleven heights", "119, 121, 133.5, 146, 151.5, 157.5, 160.5, 170, 179, 181.5"],
                    ]}
                  />
                </WorkedExample>
                <p>
                  Eleven distinct heights give ten candidates, and the slider
                  in the inspector snaps to exactly those. The weights give
                  nine more. Nineteen questions in all, which is the whole
                  search space for this crowd.
                </p>
              </SubSection>

              <SubSection title="17. Searching across features">
                <p>
                  Score every candidate on every feature and the search is a
                  leaderboard. The chart below is every question the root
                  weighed on the clean crowd, placed by its threshold and
                  raised by its gain.
                </p>
                <RootGainChart />
                <p>
                  The winner is the tallest mark, height below 151.5 at a gain
                  of 0.496. The selected question is the feature-and-threshold
                  pair with the largest immediate impurity reduction, and
                  nothing more subtle than that.
                </p>
              </SubSection>

              <SubSection title="18. Resolving equal split scores">
                <p>
                  Two candidates can earn exactly the same gain. On the clean
                  crowd, height below 146 and weight below 47 both score
                  0.340, because both peel off the same four children. A
                  complete implementation has to say what happens then, and
                  the usual answers are feature order, threshold order, the
                  order the search scanned in, or a seeded random choice.
                </p>
                <p>
                  The rule matters because different tie policies produce
                  different trees with identical immediate gain, and the
                  multiclass and ensemble pages both met cases where two
                  implementations broke a tie differently and grew apart from
                  there. Every tree on this page keeps the first candidate
                  scanned, with a small tolerance so that two gains reached by
                  different
                  arithmetic and differing in the last bits count as a tie.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 6",
          quiz: [
            trueFalse(
              "A person settled by the root alone has been given a more confident answer than one who needed a second question.",
              false,
              "Path length varies across observations and a shorter path is a cheaper answer rather than a better one. The small child is settled by the root, since everyone under 153.5 cm here is a child, and their weight is never read. The tree asked as much as it needed to reach a leaf and no more, which says nothing about which prediction is likelier to be right.",
            ),
            choice(
              "Five children and six adults give a root Gini of about 0.496. What does that number say?",
              [
                "The node is highly mixed, close to the two-class maximum of 0.5",
                "About half the people in the node will be misclassified",
                "The node holds about 0.496 of the information in the crowd",
                "Three quarters of the node share one label",
              ],
              0,
              "Gini is the chance that two labels drawn independently from the node’s shares differ, so it is zero for a pure node and one half at an even mixture. It describes the mixture before any question and says nothing yet about which question to ask. It is symmetric too, so a node three quarters adults scores the same 0.375 as one three quarters children.",
            ),
            choice(
              "Height below 121 splits the clean crowd into a pure node of two and a mixed node of nine, with impurities 0 and 0.444. Why does the split score 0.364 rather than the plain average of 0.222?",
              [
                "The two children are weighted by how many observations each holds",
                "A pure node contributes nothing to a split score",
                "The parent impurity has already been subtracted",
                "The two-person node is too small to count",
              ],
              0,
              "A plain average gives the two-person node as much say as the nine-person one. Weighting by share asks what the node of a randomly chosen person looks like, and most people land in the mixed node, which is why the weighted figure comes out higher than the average. The containers in the inspector are drawn at the width of their share for the same reason.",
            ),
            trueFalse(
              "Eleven distinct heights offer ten candidate thresholds, one at the midpoint of each gap between neighbouring values.",
              true,
              "A threshold anywhere else inside the same gap divides the observations identically and so cannot score differently, and one beyond the ends divides nothing, so the midpoints are the whole of what there is to try. The nine from the weights make nineteen questions in all, which is the whole search space for this crowd.",
            ),
            several(
              "Which of these hold of a tie between two candidate questions?",
              [
                "Height below 146 and weight below 47 both score 0.340 on the clean crowd, since both peel off the same four children",
                "Different tie policies produce different trees with identical immediate gain",
                "A tie cannot arise once the gains are computed in floating point",
                "The trees here keep the first candidate scanned, with a tolerance so that gains differing in the last bits count as tied",
              ],
              [0, 1, 3],
              "The usual answers are feature order, threshold order, the order the search scanned in, or a seeded random choice, and a complete implementation has to say which. The tolerance exists because two gains reached by different arithmetic can differ in the last bits, and the multiclass and ensemble pages both met cases where two implementations broke a tie differently and grew apart from there.",
            ),
        ],
        },
        {
          title: "Part 7. Growing the Tree Recursively",
          content: (
            <>
              <SubSection title="19. Recursive tree growth">
                <p>
                  After the root splits, send each observation to the left or
                  right child, treat each child as a smaller dataset, and run
                  the same candidate search inside it. Repeat until a stopping
                  rule applies. The growth widget in section 6 is this, split
                  by split, on the muddled crowd.
                </p>
                <WorkedExample title="The first three splits on the muddled crowd">
                  <NumberTable
                    headings={["split", "at depth", "people in the node", "question", "gain"]}
                    rows={[
                      ["1", "0", "25, 12 children and 13 adults", "height < 147.5", "0.188"],
                      ["2", "1", "9, 8 children and 1 adult", "weight < 52.5", "0.049"],
                      ["3", "1", "16, 4 children and 12 adults", "height < 158", "0.075"],
                    ]}
                    caption="Each split is chosen from its own node's people alone. The root's gain is modest, since this crowd was built so that no single question separates it."
                  />
                </WorkedExample>
                <p>
                  A decision tree is built by applying one local search, over
                  and over, to smaller and smaller subsets of the data. There
                  is no global step anywhere in it.
                </p>
              </SubSection>

              <SubSection title="20. Greedy construction">
                <p>
                  At each node the search takes the best immediate gain. It
                  does not construct every possible tree, weigh what a split
                  might make possible later, or guarantee the smallest or best
                  tree. Searching every complete tree is impractical, so the
                  construction makes locally strong choices, and locally strong
                  is not globally optimal.
                </p>
                <p>
                  The crowd below is the case that shows it. Four children on
                  one diagonal, four adults on the other, so the classes are
                  perfectly separable by two questions, height and then weight.
                  But the root cannot see that far.
                </p>
                <RootGainChart points={CROSSED_CROWD} />
                <p>
                  Every one of the six candidate questions leaves both sides
                  exactly as mixed as the parent, so every gain is zero, the
                  search admits nothing, and the tree stays one leaf calling
                  everyone the same class at an accuracy of 0.5. A search with
                  one step of lookahead would find the two-question tree that
                  gets all eight right. The greedy search cannot, because the
                  first question earns nothing on its own, and it is only
                  worth asking for what it makes the second question able to
                  do.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Making a Prediction at a Leaf",
          content: (
            <>
              <SubSection title="21. Predictions at pure and mixed leaves">
                <p>
                  A pure leaf is the easy case. Every training observation in
                  it is a child, it predicts child, and its observed shares are
                  one and zero. A tree may stop before a leaf is pure, though,
                  and then the leaf predicts its majority and can report its
                  observed shares.
                </p>
                <WorkedExample title="A leaf of six children and two adults">
                  <Equation>{"prediction = child\nP̂(child | leaf) = 6/8 = 0.75        P̂(adult | leaf) = 2/8 = 0.25"}</Equation>
                </WorkedExample>
                <p>
                  Click any leaf in the section 6 widget, in the tree or on the
                  map, and its card gives who reached it, the counts, the
                  majority and the shares. Set the depth cap to two there and
                  several leaves are mixed.
                </p>
                <KeepInMind>
                  <p>
                    Those shares are estimates from the training observations
                    that happened to reach the leaf. A leaf of four people
                    gives shares in steps of a quarter, and a leaf of one gives
                    certainty about a single person, which is not certainty
                    about anything. Small leaves produce unstable and
                    overconfident estimates, and when the probabilities matter
                    rather than the majority, smoothing or calibration on
                    held-out data is the usual repair.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Reading the ideal tree">
                <NumberTable
                  headings={["", "value"]}
                  rows={[
                    ["root question", "height < 151.5"],
                    ["root Gini", "60/121 ≈ 0.496"],
                    ["left leaf", "5 children, 0 adults, Gini 0, predicts child"],
                    ["right leaf", "0 children, 6 adults, Gini 0, predicts adult"],
                    ["gain", "0.496"],
                    ["training accuracy", "1.000"],
                    ["leaves", "2"],
                    ["depth", "1"],
                  ]}
                />
                <p>
                  When one split leaves both children pure, the tree stops,
                  because no question inside a pure node can remove any
                  mixture. Every number in the table is linked to the box at
                  the top of the page with the ideal case loaded.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 9. Stopping Tree Growth",
          content: (
            <>
              <SubSection title="23. Why tree growth must stop">
                <p>
                  With no restriction a tree keeps dividing until every leaf
                  is pure, or every observation is alone in its own rectangle,
                  or no eligible split is left. On the muddled crowd that takes
                  ten splits and eleven leaves, seven questions deep, to reach
                  a training accuracy of 1.000, with the last two splits each
                  fencing off a single person at depth six. The growth widget
                  below caps the depth at six, so it stops two splits short of
                  that, at nine leaves and 0.857 with its two deepest leaves
                  still mixed. Pure training leaves do not mean good
                  predictions for new observations, and a tree needs rules for
                  when more specialisation is no longer justified.
                </p>
              </SubSection>

              <SubSection title="24. Pre-pruning controls">
                <p>
                  Growth can be held back before it happens, and there are
                  several controls, each limiting it differently.
                </p>
                <NumberTable
                  headings={["control", "what it limits"]}
                  rows={[
                    ["maximum depth", "the longest path from the root"],
                    ["minimum samples to split", "a node with fewer observations becomes a leaf"],
                    ["minimum samples per leaf", "no split may leave a child smaller than this"],
                    ["minimum impurity decrease", "a split must earn at least this much gain"],
                    ["maximum leaves", "the total number of rectangles"],
                  ]}
                />
                <TreeGrowthPlayground />
                <p>
                  Change one control at a time and watch the tree, the map and
                  the leaf count. A minimum of four people per leaf stops the
                  single-person rectangles the unrestricted tree grew, and the
                  tree stops at three leaves and a training accuracy of 0.714
                  with the root question unmoved. Depth is
                  only one of these controls, and an extra level of depth can
                  at most double the number of leaves, which is not the same as
                  doubling the questions available, since most nodes stop
                  splitting before they reach the cap.
                </p>
              </SubSection>

              <SubSection title="25. Post-pruning">
                <p>
                  The alternative is to grow a large tree first and cut it
                  back. Measure whether each branch improves things enough to
                  be worth its complexity, and replace the ones that do not
                  with a leaf. Cost-complexity pruning writes that down as one
                  objective.
                </p>
                <Equation>{"adjusted objective = training leaf error + α × number of leaves"}</Equation>
                <p>
                  A larger α buys fewer leaves, and the sequence of trees as α
                  grows is a sequence of ever simpler candidates to judge on
                  held-out data. Pruning simplifies an already grown tree by
                  removing branches that do not earn their complexity, where
                  the controls above stop them being grown at all.
                </p>
                <InAModel>
                  <p>
                    Every tree on this page grows under the controls of section
                    24 and none of them prunes, so the pruning sequence is
                    described here rather than drawn. It sits on the roadmap beside the
                    ensembles, which are the other answer to the same problem.
                  </p>
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. When Trees Overfit",
          content: (
            <>
              <SubSection title="26. Training and validation performance by depth">
                <p>
                  Forty-four people whose classes overlap the way real
                  measurements do, thirteen of them held back by a seeded
                  shuffle, and a tree grown on the other thirty-one at every
                  depth cap from one to six.
                </p>
                <TreeDepthSweep />
                <NumberTable
                  headings={["depth cap", "leaves", "training accuracy", "held-out accuracy"]}
                  rows={[
                    ["1", "2", "0.935", "0.846"],
                    ["2", "4", "0.935", "0.846"],
                    ["3", "6", "1.000", "0.692"],
                    ["4 to 6", "6", "1.000", "0.692"],
                  ]}
                  caption="Training accuracy never falls as the cap rises. Held-out accuracy falls from 0.846 to 0.692 at the cap where the training score reaches 1.000."
                />
                <p>
                  A deeper tree describes the training data more closely while
                  becoming less reliable on people it never saw. The two extra
                  leaves that took training accuracy from 0.935 to perfect cost
                  two of the thirteen held-out people, because they fenced off
                  rectangles around individual training observations that the
                  held-out observations do not respect.
                </p>
              </SubSection>

              <SubSection title="27. Isolating individual observations">
                <p>
                  Go back to the growth widget in section 24 with the controls
                  at their defaults and step to the last two splits. The
                  seventh acts on six people at depth four, earns a gain of
                  0.044, and leaves one person alone in a rectangle, and the
                  eighth acts on five people at depth five, earns 0.013, and
                  leaves both of its sides still mixed. Five questions were
                  spent to fence off one observation, and the cap is the only
                  reason more were not.
                </p>
                <p>
                  Whether that was worth spending depends on what the
                  observation is, and the tree cannot know. It might be a
                  measurement error, a mislabelled person, a genuine rare
                  case, a sign that a feature is missing, or a sign that the
                  real pattern is complicated. A tree spends questions on an
                  observation either way. What the held-out score in section
                  26 measures is whether the fence around it turned out to be
                  a repeatable pattern.
                </p>
              </SubSection>

              <SubSection title="28. Bias, variance, and tree depth">
                <NumberTable
                  headings={["", "shallow tree", "deep tree"]}
                  rows={[
                    ["regions", "few and simple", "many and specific"],
                    ["can represent", "coarse structure only", "detailed interactions"],
                    ["misses", "real interactions, higher bias", "less on the training set, lower bias"],
                    ["changes with the sample", "usually little, lower variance", "usually a lot, higher variance"],
                  ]}
                />
                <p>
                  Depth trades structural simplicity for sensitivity to the
                  particular sample. Section 29 shows the sensitivity directly,
                  and it is what the forests page is built to average away.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 7 to 10",
          quiz: [
            trueFalse(
              "On the crossed crowd the search finds the two-question tree that gets all eight people right.",
              false,
              "Every one of the six candidate questions leaves both sides exactly as mixed as the parent, so every gain is zero, the search admits nothing, and the tree stays one leaf at an accuracy of 0.5. The classes really are separable by height and then weight, and one step of lookahead would find it. The first question earns nothing on its own and is worth asking only for what it lets the second do.",
            ),
            trueFalse(
              "A leaf reporting shares of 0.75 and 0.25 is reporting counts of the training observations that happened to reach it.",
              true,
              "That is all a leaf’s shares are. A leaf of four people gives them in steps of a quarter, and a leaf of one gives certainty about a single person, which is not certainty about anything. Small leaves produce unstable and overconfident estimates, and smoothing or calibration on held-out data is the usual repair when the probabilities matter rather than the majority.",
            ),
            choice(
              "How does cost-complexity pruning differ from the growth controls?",
              [
                "Pruning stops a branch before it grows and the controls cut it back afterwards",
                "The controls stop a branch being grown, and pruning grows a large tree then removes branches that do not earn their complexity",
                "Pruning is one of the growth controls under another name",
                "Pruning changes the split score rather than the tree",
              ],
              1,
              "The pruning objective adds the number of leaves, scaled by α, to the training leaf error, so a larger α buys fewer leaves and the sequence of trees as α grows is a sequence of ever simpler candidates to judge on held-out data. Every tree on this page grows under the controls and none of them prunes, which is why the sequence is described rather than drawn.",
            ),
            choice(
              "The two extra leaves that took training accuracy from 0.935 to perfect did what to the thirteen held-out people?",
              ["Nothing, since they only touched training rows", "Cost two of them", "Gained one of them", "Cost all thirteen"],
              1,
              "Those leaves fenced off rectangles around individual training observations that the held-out observations do not respect. At a cap of one or two the tree scores 0.935 on the thirty-one people it grew from and 0.846 on the thirteen it never saw, and at a cap of three, six leaves and a perfect training score, the held-out accuracy falls to 0.692. Whether a fence was worth building depends on what the observation inside it is, and the tree cannot know.",
            ),
            choice(
              "The growth widget sits at its defaults and the leaf minimum is raised to four people. What happens to the muddled crowd’s tree?",
              [
                "The single-person rectangles go, and the tree stops at three leaves with a training accuracy of 0.714",
                "The tree grows deeper, since each split now needs more people",
                "The root question moves, since fewer splits are allowed",
                "The grown tree is pruned back to four leaves",
              ],
              0,
              "A minimum of four people per leaf refuses any split that would leave fewer than four on either side, which is exactly what the single-person rectangles needed, so growth stops early and the root question is unmoved. The controls stop a branch being grown at all, where pruning would grow the large tree first and cut it back, and depth is only one of the controls.",
            ),
        ],
        },
        {
          title: "Part 11. Tree Instability",
          content: (
            <>
              <SubSection title="29. Tree instability">
                <p>
                  Change one label in the muddled crowd and grow the tree
                  again.
                </p>
                <TreeStability />
                <p>
                  A single relabelled person can move the root question, and
                  everything beneath the root is decided inside the halves it
                  made, so the branches reorganise and large regions of the
                  map change their prediction. The second mode grows a tree on
                  each of five random four-fifths of the crowd and overlays
                  their root cuts, which land in different places for a reason
                  that is mostly which people happened to be left out. A single
                  decision tree is unstable because an early split changes
                  every decision below it.
                </p>
              </SubSection>

              <SubSection title="30. Why forests average many trees">
                <p>
                  That instability is the motivation for the next page, and
                  the motivation is more precise than a crowd of memorisers
                  somehow generalising. Individual deep trees have high
                  variance. Train many of them on deliberately varied samples
                  and feature subsets, so their errors are not the same errors,
                  and average their predictions or take their vote. Averaging
                  reduces variance when the trees are diverse enough, and
                  random forests are engineered to make them diverse. How the
                  varying is done is{" "}
                  <Link href="/concepts/bagging" className={linkClass}>
                    bagging
                  </Link>{" "}
                  and{" "}
                  <Link href="/concepts/random-forests" className={linkClass}>
                    random forests
                  </Link>
                  , and belongs there.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 12. What Trees Handle Well",
          content: (
            <>
              <SubSection title="31. Why trees usually do not need scaling">
                <p>
                  Measure the heights in metres instead of centimetres and the
                  question becomes height less than 1.515. The same people are
                  on each side of it, because dividing every value by a hundred
                  keeps their order, and a threshold question reads nothing
                  but the order.
                </p>
                <UnitConversion />
                <p>
                  So an ordinary tree generally does not need standardisation,
                  and any monotonic transformation of a feature leaves the tree
                  it grows unchanged apart from the numbers printed at the
                  thresholds. Preprocessing can still be needed for other
                  reasons, missing values and encodings among them, and the
                  gradient-descent models on earlier pages needed scaling for
                  reasons that do not apply here at all.
                </p>
              </SubSection>

              <SubSection title="32. Conditional feature interactions">
                <p>
                  In the walking widget of section 3, weight is never consulted
                  for anyone under 153.5 cm and decides everything for anyone
                  over it. That is a conditional interaction, weight mattering
                  only within one height range, and a tree expresses it without
                  being told to, because a later question is only asked inside
                  the region an earlier answer selected. A linear model would
                  need the interaction built into its columns by hand.
                </p>
              </SubSection>

              <SubSection title="33. Categories and missing values">
                <p>
                  Everything on this page is a numeric threshold. Categorical
                  features and missing values are handled differently by
                  different implementations, and there is no single behaviour
                  to describe. Categories may be one-hot encoded, ordered, or
                  partitioned natively. Missing values may be imputed, sent a
                  learned default direction, routed by a surrogate question, or
                  given a branch of their own. How a tree handles them is a
                  decision an implementation has to make explicitly, and the
                  trees here take finite numeric columns only.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 13. Limitations of Tree Interpretability",
          content: (
            <>
              <SubSection title="34. The limits of interpretability">
                <p>
                  A one-question tree can be read in a glance. The nine-leaf
                  tree on the muddled crowd can be read with effort. A tree
                  with twenty levels and thousands of leaves is still
                  technically a list of rules, and nobody reads it in full.
                  Depth, leaf count, average path length and the number of
                  rules all grow, and past a point the structure is explicit
                  without being understandable. A tree is readable when it is
                  small, and being a tree does not keep it small.
                </p>
              </SubSection>

              <SubSection title="35. Prediction rules versus causal explanations">
                <p>
                  If the tree asks about weight after height, that means the
                  question improved prediction on the training data inside
                  that branch. It does not show that weight causes the
                  outcome, that 55 kilograms is a natural line in the world,
                  that changing someone&rsquo;s weight would change their
                  class, that the training data was unbiased, or that the rule
                  is fit for a decision with consequences. A path explains how
                  the model produced its prediction. It does not explain why
                  the real outcome happened.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 14. Deriving the Split Score",
          content: (
            <SubSection title="36. Deriving Gini gain">
              <p>
                Part 5 scored a split as the parent&rsquo;s impurity less the
                weighted impurity of its two children, and the weights were
                argued for rather than derived. The whole score comes from one
                thought experiment, draw two labels from a node and ask whether
                they differ, applied once to the parent and once to the node a
                random observation lands in after the question.
              </p>
              <WhyThisWorks title="From two draws to the gain">
                <DerivationTable
                  rows={[
                    { expression: "P(both draws are class k) = pₖ²", reason: "two independent draws from the node's class shares" },
                    { expression: "P(agree) = Σₖ pₖ²", reason: "summed over the classes" },
                    { expression: "G = 1 − Σₖ pₖ²", reason: "disagree is the complement" },
                    { expression: "G_root = 1 − (5/11)² − (6/11)² = 60/121", reason: "the worked crowd" },
                    { expression: "P(reach left child) = n_left / n", reason: "a random observation lands left with this probability" },
                    { expression: "G_after = (n_left/n)·G_left + (n_right/n)·G_right", reason: "the expected impurity of the node reached after the split" },
                    { expression: "gain = G_parent − G_after", reason: "expected mixture removed by asking" },
                  ]}
                />
              </WhyThisWorks>
              <WorkedExample title="The clean crowd, twice">
                <Equation>{"height < 151.5:  gain = 0.496 − (5/11)·0 − (6/11)·0 = 0.496\nheight < 146:    gain = 0.496 − (4/11)·0 − (7/11)·0.245 ≈ 0.496 − 0.156 = 0.340"}</Equation>
                <p>
                  The first is the winner of section 17&rsquo;s leaderboard and
                  the second is the middling question of section 13, and the
                  two numbers are the ones the leaderboard drew for them.
                </p>
              </WorkedExample>
              <p>
                Positive gain means the split reduces the expected impurity.
                Zero means it leaves it unchanged, which is section 20&rsquo;s
                crossed crowd at every candidate. Larger means a cleaner
                immediate division, and impurity gain is nothing more than the
                expected label mixture a question removes.
              </p>
            </SubSection>
          ),
        },
        {
          title: "Part 15. Extending the Mechanism",
          content: (
            <>
              <SubSection title="37. Multiclass trees">
                <>
                  <p>
                    For several classes, count each class in the node and turn its count
                    into a share. The Gini calculation includes every class.
                  </p>
                  <Equation>{"G = 1 − Σₖ pₖ²"}</Equation>
                  <p>
                    The rest of the procedure stays the same: compare candidate splits,
                    choose one, and predict the majority class at a leaf. A tie between
                    classes needs a stated policy, just as a tie between splits does.
                  </p>
                </>
              </SubSection>

              <SubSection title="38. Regression trees">
                <p>
                  A tree can predict a number instead of a class. At a
                  regression leaf the prediction is the mean target of the
                  training observations that reached it, and a split is scored
                  by how much it reduces the squared error, or equivalently the
                  variance, of the targets on the two sides.
                </p>
                <NumberTable
                  headings={["", "classification leaf", "regression leaf"]}
                  rows={[
                    ["what it holds", "class counts", "numeric targets"],
                    ["what it predicts", "the majority class", "the mean target"],
                    ["how a split is scored", "Gini impurity removed", "squared error removed"],
                  ]}
                />
                <p>
                  The structure is not tied to classification. The leaf
                  summary and the split score change with the task, and the
                  gradient boosting page fits trees of exactly this kind to
                  residuals.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 16. Implementation and Failure Contracts",
          content: (
            <SubSection title="39. Implementation and failure contracts">
              <p>
                A complete tree implementation has to define what it does with
                the cases the tidy description passes over.
              </p>
              <NumberTable
                headings={["case", "what has to be decided"]}
                rows={[
                  ["empty training data", "refuse, in words"],
                  ["missing or non-finite feature values", "refuse or route by rule"],
                  ["a node holding one class", "it is a leaf; no split can gain"],
                  ["a node with no valid split", "it is a leaf at its majority"],
                  ["several splits with equal gain", "the tie policy of section 18"],
                  ["a constant feature", "it offers no candidates"],
                  ["a leaf minimum larger than the data", "the root is the only leaf"],
                  ["a threshold met exactly", "less-than or less-than-or-equal, chosen once and kept"],
                  ["a category never seen in training", "an implementation choice, section 33"],
                  ["shares from a tiny leaf", "reported as estimates, section 21"],
                ]}
              />
              <p>
                The comparison convention is the one people forget. An
                observation exactly equal to a threshold has to go the same
                way every time, in growth and in prediction, and here
                strictly-less-than goes to the left and everything else to the
                right, through the one routing rule both the walk in section 3
                and the bulk prediction call. It also refuses the empty and
                non-finite cases by name rather than growing a tree on nothing.
              </p>
              <p>
                Each row is a place where two implementations that agree on
                the tidy description can grow different trees, or grow one
                silently on nothing, so the trees here decide every row once.
                An empty column, a non-finite value and a target holding one
                class are each refused by name before any growth, since a tree
                has nothing to separate in any of them. A constant feature
                offers no candidate thresholds, so the search never asks about
                it. On the clean crowd with every height held at one value the
                tree grows on weight alone, rooting at weight below 47 and
                reaching four leaves at a training accuracy of 0.909, and
                reports that height contributed nothing. A leaf minimum larger
                than the crowd leaves the root as the only leaf, predicting the
                majority, which on the eleven people is adult at an accuracy of
                0.545. And a person standing exactly on a threshold goes right,
                in growth and in prediction alike, because the question asks
                for strictly less.
              </p>
            </SubSection>
          ),
        },
        {
          title: "Questions on Parts 11 to 16",
          quiz: [
            trueFalse(
              "Measuring the heights in metres rather than centimetres changes which people a threshold question separates.",
              false,
              "Dividing every value by a hundred keeps the order, and a threshold question reads nothing but the order, so the question becomes height less than 1.515 and the same people stand on each side. Any monotonic transformation leaves the tree unchanged apart from the numbers printed at the thresholds. Preprocessing can still be needed for missing values and encodings, which is a separate matter.",
            ),
            choice(
              "Weight is never consulted for anyone under 153.5 cm and decides everything above it. What is that?",
              [
                "A conditional interaction, which the tree expresses without being told to",
                "A missing feature, since weight is unavailable below the threshold",
                "An unstable split, since the root could move",
                "A monotonic transformation of the weight column",
              ],
              0,
              "A later question is only asked inside the region an earlier answer selected, so the structure gives the interaction away for free. A linear model would need it built into its columns by hand.",
            ),
            several(
              "The tree asks about weight after height. What does that path establish?",
              [
                "The question improved prediction on the training data inside that branch",
                "Changing someone’s weight would change their class",
                "55 kilograms is a natural line in the world",
                "How the model produced its prediction",
              ],
              [0, 3],
              "A path explains how the model produced its prediction and does not explain why the real outcome happened. It shows nothing about causation, nothing about whether the training data was unbiased, and nothing about whether the rule is fit for a decision with consequences. A tree is readable when it is small, and being a tree does not keep it small.",
            ),
            choice(
              "What changes when a tree predicts a number instead of a class?",
              [
                "Nothing, since Gini applies to a numeric target as it stands",
                "The leaf predicts the mean target of the observations that reached it, and a split is scored by the reduction in squared error",
                "The cuts stop being axis-aligned, since a number is continuous",
                "The tree has to be pruned, since a numeric leaf is never pure",
              ],
              1,
              "Reducing the squared error is the same thing as reducing the variance of the targets on the two sides. The structure is not tied to classification, since only the leaf summary and the split score change with the task, and the gradient boosting page fits trees of exactly this kind to residuals.",
            ),
            choice(
              "Change one label in the muddled crowd and grow the tree again. What does the page say happens?",
              [
                "The root question can move, and everything beneath it is decided inside the halves it made, so the branches reorganise and large regions of the map change their prediction",
                "Only the leaf holding the relabelled person changes, since the other leaves never saw it",
                "Nothing changes until several labels move, since one person cannot shift a split’s gain",
                "The root is fixed by the crowd’s shape and cannot move, so only the lower splits change",
              ],
              0,
              "A single decision tree is unstable because an early split changes every decision below it, and the five trees grown on random four-fifths of the crowd put their root cuts in different places for a reason that is mostly which people happened to be left out. Individual deep trees have high variance, which is why the next pages train many of them on deliberately varied samples and feature subsets and average, since averaging reduces variance when the trees are diverse enough.",
            ),
        ],
        },
        {
          title: "Practice. Growing the Crowds With the Library",
          practice: [
            exercise(
              "Grow the one-question tree",
              ["Grow a tree on the eleven people of the ideal case, five children and six adults, with no restriction at all, and read the whole tree back as text. Then read the root question, its Gini and its gain off the root node, and the depth, leaf count and training accuracy off the model.", "Section 22 lists what should come back: height below 151.5, a root Gini of 0.496, a gain of 0.496, two pure leaves, a depth of one and a training accuracy of 1.000. The tree stops after one question because no question inside a pure node can remove any mixture."],
              `from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
# Print the tree as text, then the root's question, Gini and gain, and
# the depth, leaf count and training accuracy.`,
              `from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
print(tree.describe())

root = tree.root
print(f"root question {root.split.feature_name} < {root.split.threshold}")
print(f"root Gini {root.impurity:.3f}, gain {root.split.gain:.3f}")
print(f"depth {tree.depth}, leaves {tree.n_leaves}, training accuracy {tree.score([heights, weights], is_adult):.3f}")`,
              `height < 151.5 ?  [n=11, impurity=0.4959, gain=0.4959]
  predict 0  [n=5, impurity=0.0000]
  predict 1  [n=6, impurity=0.0000]
root question height < 151.5
root Gini 0.496, gain 0.496
depth 1, leaves 2, training accuracy 1.000`,
              { hints: ["The classes are a feature like the others, 0 for a child and 1 for an adult, and describe answers the grown tree as indented text, one question or one answer per line.", "root is the top node. A node that asks a question carries split, with feature_name, threshold and gain, and its own impurity, which is the Gini of the people who reached it.", "depth and n_leaves are properties of the fitted model, and score answers the share of people it labels correctly."], check: numberCheck("What gain does the root question earn, to three places?", 0.496, 0.0005, "The root holds five children and six adults, a Gini of 60/121, and height below 151.5 sends every child left and every adult right, so both children of the split are pure and the weighted impurity after it is zero. The gain is the whole of the parent impurity, which is the most any question on this crowd could remove and why the search stops there.") },
            ),
            exercise(
              "Grow the muddled crowd to purity, then hold it back",
              ["Grow the fourteen people of the muddled crowd four ways: with no restriction, under the growth widget’s default depth cap of six, under a depth cap of two, and with a leaf minimum of four people. For each print the depth reached, the number of leaves and the training accuracy.", "Section 23 says the unrestricted tree needs eleven leaves and a depth of seven to reach 1.000 and that the cap of six stops it at nine leaves and 0.857, section 24 says the leaf minimum of four stops it at three leaves and 0.714, and Part 1 says the cap of two gives four leaves. The page does not say what the four-leaf tree scores."],
              `from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

# Grow the tree with no restriction, with max_depth=6, with max_depth=2
# and with min_samples_leaf=4, and for each print the depth, the number
# of leaves and the training accuracy.`,
              `from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

for label, controls in [("no restriction", {}), ("depth cap 6", {"max_depth": 6}), ("depth cap 2", {"max_depth": 2}), ("leaf minimum 4", {"min_samples_leaf": 4})]:
    tree = DecisionTreeClassifier(**controls).fit([heights, weights], is_adult)
    print(f"{label}: depth {tree.depth}, leaves {tree.n_leaves}, training accuracy {tree.score([heights, weights], is_adult):.3f}")`,
              `no restriction: depth 7, leaves 11, training accuracy 1.000
depth cap 6: depth 6, leaves 9, training accuracy 0.857
depth cap 2: depth 2, leaves 4, training accuracy 0.643
leaf minimum 4: depth 2, leaves 3, training accuracy 0.714`,
              { hints: ["The growth controls are constructor fields, max_depth, min_samples_leaf, min_samples_split and min_impurity_decrease, and an unrestricted tree is the constructor with none of them set.", "The same crowd and the same two features go to every fit, so only the controls change between the four lines.", "A tree at the cap of two is a root with two questions beneath it and four leaves, which is the tree Part 1 describes, and its accuracy is what those four leaves’ majorities get right."], check: numberCheck("What training accuracy does the tree capped at a depth of two reach on the muddled crowd?", 0.643, 0.0005, "Four leaves on fourteen interleaved people leave several of them mixed, and each mixed leaf predicts its majority, so nine of the fourteen are labelled correctly. Two questions cannot carve this crowd, which is why the unrestricted tree spends ten of them, and why the held-out score rather than the training score is what decides how many are worth asking.") },
            ),
            exercise(
              "Sweep the depth cap on the overlapping crowd",
              ["Reproduce section 26. The page holds back thirteen of the forty-four people by a seeded shuffle, the positions listed in the script, grows a tree on the other thirty-one at every depth cap from one to six, and scores each tree on both shares. Print the depth cap, the leaves, the training accuracy and the held-out accuracy for each.", "The table in section 26 reads 0.935 and 0.846 at caps of one and two, then 1.000 and 0.692 from three onward, where two extra leaves took the training score to perfect and cost two of the thirteen held-out people."],
              `from oop_ml import DecisionTreeClassifier, Feature

heights = [142, 135, 162, 136, 143, 152, 136, 145, 147, 142, 150, 144, 128, 165, 119, 150, 153, 143, 138, 126, 143, 131, 158, 162, 143, 177, 167, 166, 193, 162, 173, 163, 173, 147, 179, 183, 156, 164, 154, 169, 162, 176, 156, 154]
weights = [39, 16, 59, 54, 38, 41, 35, 44, 38, 34, 47, 50, 54, 25, 27, 47, 54, 48, 55, 40, 67, 32, 80, 84, 82, 51, 83, 80, 71, 59, 66, 67, 55, 39, 69, 68, 74, 53, 89, 73, 60, 67, 66, 70]
is_adult = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
hidden = [1, 8, 11, 13, 16, 18, 24, 29, 35, 38, 39, 41, 43]

training = [position for position in range(len(heights)) if position not in hidden]
training_inputs = [Feature("height", [heights[position] for position in training]), Feature("weight", [weights[position] for position in training])]
training_target = Feature("is_adult", [is_adult[position] for position in training])
hidden_inputs = [Feature("height", [heights[position] for position in hidden]), Feature("weight", [weights[position] for position in hidden])]
hidden_target = Feature("is_adult", [is_adult[position] for position in hidden])

for cap in range(1, 7):
    # Grow a tree under this depth cap on the training share, then print
    # the cap, its leaf count, and its accuracy on each share.
    pass`,
              `from oop_ml import DecisionTreeClassifier, Feature

heights = [142, 135, 162, 136, 143, 152, 136, 145, 147, 142, 150, 144, 128, 165, 119, 150, 153, 143, 138, 126, 143, 131, 158, 162, 143, 177, 167, 166, 193, 162, 173, 163, 173, 147, 179, 183, 156, 164, 154, 169, 162, 176, 156, 154]
weights = [39, 16, 59, 54, 38, 41, 35, 44, 38, 34, 47, 50, 54, 25, 27, 47, 54, 48, 55, 40, 67, 32, 80, 84, 82, 51, 83, 80, 71, 59, 66, 67, 55, 39, 69, 68, 74, 53, 89, 73, 60, 67, 66, 70]
is_adult = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
hidden = [1, 8, 11, 13, 16, 18, 24, 29, 35, 38, 39, 41, 43]

training = [position for position in range(len(heights)) if position not in hidden]
training_inputs = [Feature("height", [heights[position] for position in training]), Feature("weight", [weights[position] for position in training])]
training_target = Feature("is_adult", [is_adult[position] for position in training])
hidden_inputs = [Feature("height", [heights[position] for position in hidden]), Feature("weight", [weights[position] for position in hidden])]
hidden_target = Feature("is_adult", [is_adult[position] for position in hidden])

for cap in range(1, 7):
    tree = DecisionTreeClassifier(max_depth=cap).fit(training_inputs, training_target)
    print(f"cap {cap}: leaves {tree.n_leaves}, training accuracy {tree.score(training_inputs, training_target):.3f}, held-out accuracy {tree.score(hidden_inputs, hidden_target):.3f}")`,
              `cap 1: leaves 2, training accuracy 0.935, held-out accuracy 0.846
cap 2: leaves 4, training accuracy 0.935, held-out accuracy 0.846
cap 3: leaves 6, training accuracy 1.000, held-out accuracy 0.692
cap 4: leaves 6, training accuracy 1.000, held-out accuracy 0.692
cap 5: leaves 6, training accuracy 1.000, held-out accuracy 0.692
cap 6: leaves 6, training accuracy 1.000, held-out accuracy 0.692`,
              { hints: ["The tree is grown on the training share alone, so the training features and target are what go to fit, and the hidden share is only ever handed to score.", "score takes a list of features and a target and answers the share labelled correctly, so one call on each share gives the two columns of the table.", "From a cap of three onward the tree is the same tree, six leaves and a perfect training score, because every leaf is already pure and nothing is left to split, which is why the cap stops mattering."], check: numberCheck("What held-out accuracy does the tree reach at a depth cap of three?", 0.692, 0.0005, "Nine of the thirteen held-out people, where the caps of one and two got eleven. The two extra leaves that took the training score from 0.935 to 1.000 fenced off rectangles around individual training observations, and the held-out observations do not respect those fences. Training accuracy never falls as the cap rises, and the held-out score is what says when the extra questions stopped being worth asking.") },
            ),
            exercise(
              "Ask for trees that cannot be grown",
              ["Grow a tree on the crossed crowd of section 20, four children on one diagonal and four adults on the other, and read it back. Then hand the library two cases Part 16 says it refuses by name, a target holding one class only and a height that is not a number, and print the name and message of each refusal.", "On the crossed crowd every candidate question earns a gain of zero, so the search admits nothing and the tree should be one leaf at an accuracy of 0.5. The two refusals should arrive before any growth, one from the fit and one from the feature itself."],
              `from oop_ml import DecisionTreeClassifier, Feature, MLLibError

heights = Feature("height", [130, 135, 170, 175, 130, 135, 170, 175])
weights = Feature("weight", [30, 35, 70, 75, 70, 75, 30, 35])
is_adult = Feature("is_adult", [0, 0, 0, 0, 1, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
# Print the tree as text with its leaf count, depth and training accuracy.
# Then try a fit on an all-child target, and try to build a height feature
# holding float("nan"), catching the library's own error each time and
# printing its class name and message.`,
              `from oop_ml import DecisionTreeClassifier, Feature, MLLibError

heights = Feature("height", [130, 135, 170, 175, 130, 135, 170, 175])
weights = Feature("weight", [30, 35, 70, 75, 70, 75, 30, 35])
is_adult = Feature("is_adult", [0, 0, 0, 0, 1, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
print(tree.describe())
print(f"leaves {tree.n_leaves}, depth {tree.depth}, training accuracy {tree.score([heights, weights], is_adult):.3f}")

try:
    DecisionTreeClassifier().fit([heights, weights], Feature("is_adult", [0, 0, 0, 0, 0, 0, 0, 0]))
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")

try:
    Feature("height", [130, 135, float("nan"), 175, 130, 135, 170, 175])
except MLLibError as refusal:
    print(f"{type(refusal).__name__}: {refusal}")`,
              `predict 0  [n=8, impurity=0.5000]
leaves 1, depth 0, training accuracy 0.500
SingleClassError: feature_values holds only class [0.0], so there is nothing to discriminate between
InvalidValuesError: feature_values must contain only finite values`,
              { hints: ["A tree that admits no split is a single leaf predicting the majority, and with four of each the majority is a tie broken toward the lower class, so describe prints one line and depth is zero.", "Every refusal the library makes derives from MLLibError, so catching that one catches whichever specific refusal each case turns out to be.", "The non-finite value is refused by the feature before any model sees it, which is the coercion boundary doing its job once, so the second try block needs no fit in it at all."] },
            ),
          ],
        },
      ]}
    />
  );
}
