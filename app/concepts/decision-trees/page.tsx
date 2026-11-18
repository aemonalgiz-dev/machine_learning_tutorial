import { pageMetadata } from "@/lib/seo";
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

export const metadata: Metadata = pageMetadata("/concepts/decision-trees", {
  title: "Decision Trees · Perceptron Lab",
  description:
    "A decision tree divides observations through a sequence of questions about their measurements. Each route ends in a prediction, making the fitted decisions traceable while leaving their reliability dependent on the examples used.",
});

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
      lessonId="decision-trees"
      intuition={lessonIntuitions["decision-trees"]}
      technicalStart="Part 5. Scoring One Split"
      openingTitle="Which Question Should Come First?"
      playgroundTitle="Follow a person through the tree's questions"
      playgroundIntro="Follow one point from the first question to its final leaf. Then compare how changing the tree's depth changes its prediction regions."
      title="Decision Trees"
      tagline={"A decision tree divides observations through a sequence of questions about their measurements. Each route ends in a prediction, making the fitted decisions traceable while leaving their reliability dependent on the examples used."}
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
                <p>Load the ideal case above. It contains eleven people, five labeled children and six labeled adults. In these measurements, one height threshold separates the groups. We can read the entire prediction rule as a single question.</p>
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
                  A larger tree lets one answer lead to another question. The starting question is the root, later questions are internal nodes, and the final predictions are leaves. Load the muddled crowd and set the depth cap to two. You can follow a person from the root through a second question to one of four leaves.
                </p>
              </SubSection>

              <SubSection title="3. Walking one observation through the tree">
                <p>We can understand a fitted tree by following one observation through its questions. The example below uses sixteen people arranged so that both height and weight matter. Keeping the tree two questions deep lets us see every possible route.</p>
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
                <p>Some observations reach a prediction after fewer questions than others. That makes their prediction cheaper to compute. It does not make it more reliable: the path length tells us how much work the tree did, while reliability depends on the evidence behind the prediction.</p>
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
                <p>The third question gives the clearest division among these three candidates. A computer needs a numerical criterion to compare it with the other candidates. There are nineteen candidate splits in all for this dataset. Next we will build the score used to compare them.</p>
                <p>A leaf predicts its majority class for everyone who reaches it. Every minority observation in that leaf is therefore a training mistake under this rule. A useful split sends observations into groups where that majority prediction makes fewer errors or where class mixing is reduced.</p>
              <p>In this example, the third question leaves no minority on either side and correctly classifies all eleven people. The first leaves three children on a side with six adults. The second leaves one minority observation. We now have concrete groups to compare before introducing a numerical impurity score.</p>
              </SubSection>

              <SubSection title="9. Pure and mixed nodes">
                <p>A node is called pure when all its observations have the same label. Five children and no adults is pure; four children and one adult still contains a mixture. Five and five is the most even mixture possible for two classes. To compare questions, we need a number that increases as the labels become more mixed. Section 10 introduces that measure.</p>
                <p>A numerical measure lets the computer rank nineteen candidate questions instead of comparing three by eye. We want a pure node to receive zero, because its labels already agree. For two classes, the largest value should occur at an even mixture. Measures that increase with mixing agree on the three questions above, although their values between those cases can differ. The next Part explains the measure used here.</p>
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
                  <p>These are independent draws with replacement, so the same observation can be selected twice. Gini is the disagreement probability under that rule: 60/121 for five children and six adults. Drawing two different observations without replacement instead gives 6/11. The distinction becomes smaller as the node grows.</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Calculating root impurity">
                <p>Five children and six adults.</p>
                <Equation>{"p_child = 5/11        p_adult = 6/11\nG_root = 1 − (5/11)² − (6/11)² = 1 − 25/121 − 36/121 = 60/121 ≈ 0.496"}</Equation>
                <p>The result is close to the two-class maximum of 0.5, reflecting a highly mixed root. It describes the data before a question is asked. We still need to compare that starting mixture with the groups each candidate question would create.</p>
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
                <p>The parent is the group before a split; its children are the resulting groups. Parent impurity measures the original mixture. Weighted child impurity measures the mixture that remains, accounting for how many observations enter each group. Their difference is the impurity gain.</p>
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
                  each pair of neighboring distinct values, and put a
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
              "The split score weights each resulting node by the number of observations reaching it. The nine-person mixed node therefore has more influence than the two-person pure node:\n\n```math\nweighted impurity ≈ (2/11) × 0 + (9/11) × 0.444 ≈ 0.364\n```\n\nA plain average would give the nodes equal weight despite their different sizes.",
            ),
            trueFalse(
              "Eleven distinct heights offer ten candidate thresholds, one at the midpoint of each gap between neighboring values.",
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
                <p>The tree repeats the same search within smaller subsets of observations. Each question is chosen using the data that reached its node. The procedure never evaluates all the questions in the completed tree together.</p>
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
                <p>The crossed example has four children on one diagonal and four adults on the other. A height question followed by a weight question on each branch can separate all eight. Each prediction path needs two questions, although the completed tree has three split nodes.</p>
                <RootGainChart points={CROSSED_CROWD} />
                <p>All six candidate root questions have zero immediate gain. The implementation requires positive gain, so it stops with one leaf and accuracy 0.5. A lookahead search could recognize the useful second level. An algorithm permitted to take a zero-gain first split could also continue. This failure follows from the greedy criterion together with this stopping policy.</p>
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
                  <p>The shares come from the training observations that reached this leaf. Four people give shares in steps of a quarter. A leaf containing one person reports complete agreement because it has no other observations to compare. Those estimates can change considerably with another sample. If probability estimates matter, consider larger leaves, smoothing, or calibration checked on held-out data.</p>
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
                <p>An unrestricted tree keeps splitting while an eligible improvement is available. It may stop at pure leaves or because no candidate split is accepted. On the overlapping fourteen-person dataset, it reaches eleven leaves and depth seven with perfect training accuracy.</p>
<p>The growth widget caps depth at six. It therefore stops at nine leaves and training accuracy 0.857, with two leaves still mixed. Restricting depth limits specialization; held-out predictions are needed to check whether the extra splits would help.</p>
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
                <p>Increasing α makes each additional leaf more costly in the objective, so simpler trees become preferable. The resulting pruning sequence gives us candidates to compare on held-out data. Pruning removes branches from a tree that has already grown; the earlier controls prevent some branches from growing in the first place.</p>
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
                <p>An observation that needs several extra questions might be a measurement error or a genuine rare case. It might also indicate a missing feature or a complicated underlying relationship. The tree cannot tell which explanation is correct merely by fitting that observation. Held-out performance helps us check whether the extra distinctions also help with new cases.</p>
              </SubSection>

              <SubSection title="28. Bias, variance, and tree depth">
                <NumberTable
                  headings={["", "shallow tree", "deep tree"]}
                  rows={[
                    ["regions", "few and simple", "many and specific"],
                    ["can represent", "coarse structure only", "detailed interactions"],
                    ["approximation tendency", "limited flexibility can leave systematic patterns unrepresented", "more flexibility can represent finer patterns; training error alone does not measure bias"],
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
              "The shares are empirical class proportions among the training observations in that leaf. Four observations give proportions in steps of one quarter. A leaf containing one adult reports an adult share of one, but that is limited evidence about a new observation. Larger leaves, smoothing and held-out calibration are options to evaluate when probability estimates matter.",
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
              "At depth caps one and two, this fixed split has training accuracy 0.935 and held-out accuracy 0.846. At cap three, training accuracy becomes perfect while held-out accuracy falls to 0.692. The additional partitions fit details of the training observations that do not help these held-out people. That is evidence to compare growth restrictions on separate validation data.",
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
                <p>Changing one label can change the selected root split. Later questions are then fitted on different subsets, so parts of the tree and prediction map may change too. The second mode fits five random four-fifths subsets and overlays their root thresholds. Differences between those fits show sensitivity to the sample; a changed early split need not change every later prediction.</p>
              </SubSection>

              <SubSection title="30. Why forests average many trees">
                <p>Bagging and random forests use varied trees to reduce sensitivity to a single training sample. If their prediction errors are not perfectly correlated, averaging can reduce variance compared with one member. Forests add feature randomness to the varied samples, encouraging trees to differ. The <Link href="/concepts/bagging" className={linkClass}>bagging</Link>{" "}and <Link href="/concepts/random-forests" className={linkClass}>random forests</Link>{" "}pages examine how much that variation helps.</p>
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

                  Measure the heights in meters instead of centimeters and the
                  question becomes height less than 1.515. The same people are
                  on each side of it, because dividing every value by a hundred
                  keeps their order, and a threshold question reads nothing
                  but the order.
                </p>
                <UnitConversion />
                <p>Positive affine unit conversions preserve the equivalent midpoint thresholds in an exact split search. More generally, strictly increasing transformations preserve the possible partitions of the training observations. A nonlinear transformation can still change the midpoint behavior between observed values, and finite precision or approximate search can change fitted results. Standardization is therefore usually unnecessary for ordinary threshold trees, while missing values and encodings still require explicit handling.</p>
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
                  different implementations, and there is no single behavior
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
                <p>A small tree can be followed by reading its questions. As depth and leaf count increase, that becomes difficult, even though every rule remains available to inspect. Thousands of explicit rules can still be too many to understand together. Readability depends on the size of the fitted tree, rather than on the model family alone.</p>
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

                A positive gain means the split reduces expected impurity; zero means it leaves impurity unchanged, as in section 20&apos;s crossed example. A larger gain favors a cleaner immediate division under this criterion. It does not by itself tell us how the full tree will perform on new observations.
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
          title: "Part 16. Making Thresholds, Ties and Stopping Rules Explicit" , id: "part-16-implementation-and-failure-contracts",
          content: (
            <SubSection title="39. Specify the split search, leaf predictions and stopping rules" id="39-implementation-and-failure-contracts">
              <p>The growth procedure also needs rules for inputs and ties. These details decide whether the implementation can fit a given dataset and whether repeated fits reproduce the same tree.</p>
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
                Before growing a tree, this SDK refuses an empty column,
                non-finite measurements and a target containing only one class.
                The last choice is an SDK convention: a general tree implementation
                can instead return a single leaf for a single-class target.
              </p>
              <p>
                A constant feature is different. It is valid data, but there is
                no threshold that separates its values. Keep every height the
                same and the tree must use weight if it is to separate anyone.
                On this dataset its root asks whether weight is below 47, and
                its four leaves give a training accuracy of 0.909.
              </p>
              <p>
                A minimum leaf size larger than the dataset prevents every split.
                The root becomes one leaf predicting the majority class, adult
                here, with a training accuracy of 0.545. Finally, equality follows
                the same rule during training and prediction: a value exactly
                on the threshold goes right because the left test is strictly less.
              </p>
            </SubSection>
          ),
        },
        {
          title: "Questions on Parts 11 to 16",
          quiz: [
            trueFalse(
              "Measuring the heights in meters rather than centimeters changes which people a threshold question separates.",
              false,
              "Converting centimeters to meters divides every height and the corresponding threshold by one hundred. The split therefore sends the same people down each branch. For a strictly increasing nonlinear transformation, candidate training partitions remain available, but stored midpoint thresholds may classify unseen values differently. A transformation that merges distinct values can also change the available partitions.",
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
              "The weight comparison applies only in the height region selected by the earlier branch. Its contribution to the prediction therefore depends on height. A plain additive linear model cannot represent that conditional rule without additional features or another change to its form.",
            ),
            several(
              "The tree asks about weight after height. What does that path establish?",
              [
                "The question reduced the chosen training impurity inside that branch",
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
                "The root question can move, and everything beneath it is decided inside the halves it made, so the branches reorganize and large regions of the map change their prediction",
                "Only the leaf holding the relabeled person changes, since the other leaves never saw it",
                "Nothing changes until several labels move, since one person cannot shift a split’s gain",
                "The root is fixed by the crowd’s shape and cannot move, so only the lower splits change",
              ],
              0,
              "Changing one label changes the scores of candidate splits. If an early choice changes, later splits are fitted to different subsets and many predictions can change. Deep trees can therefore be sensitive to small data changes. Bagging and random forests fit varied trees and combine their predictions to reduce that sensitivity; the benefit depends partly on how correlated their errors are.",
            ),
        ],
        },
        {
          title: "Practice. Growing the Crowds With the Library",
          practice: [
            exercise("Grow the one-question tree",["Fit an unrestricted DecisionTreeClassifier to the eleven people below, with child labeled 0 and adult labeled 1. Print tree.describe(), then inspect the root split: its feature, threshold, Gini impurity and impurity reduction.", "Print the fitted depth, leaf count and training accuracy. Use the leaf impurities to explain why this dataset needs no further split."],`from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
# Print the tree as text, then the root's question, Gini and gain, and
# the depth, leaf count and training accuracy.`,`from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
print(tree.describe())

root = tree.root
print(f"root question {root.split.feature_name} < {root.split.threshold}")
print(f"root Gini {root.impurity:.3f}, gain {root.split.gain:.3f}")
print(f"depth {tree.depth}, leaves {tree.n_leaves}, training accuracy {tree.score([heights, weights], is_adult):.3f}")`,`height < 151.5 ?  [n=11, impurity=0.4959, gain=0.4959]
  predict 0  [n=5, impurity=0.0000]
  predict 1  [n=6, impurity=0.0000]
root question height < 151.5
root Gini 0.496, gain 0.496
depth 1, leaves 2, training accuracy 1.000`,{...{ hints: ["The classes are a feature like the others, 0 for a child and 1 for an adult, and describe answers the grown tree as indented text, one question or one answer per line.", "root is the top node. A node that asks a question carries split, with feature_name, threshold and gain, and its own impurity, which is the Gini of the people who reached it.", "depth and n_leaves are properties of the fitted model, and score answers the share of people it labels correctly."], check: numberCheck("What gain does the root question earn, to three places?", 0.496, 0.0005, "The root split sends the two classes to pure leaves, removing all of the parent node's impurity. There is no remaining mixture for another split to reduce.") },question:"Which question separates the supplied children and adults?"}),
            exercise("Grow the muddled crowd to purity, then hold it back",["Fit the fourteen-person overlapping dataset four ways: unrestricted, max_depth=6, max_depth=2 and min_samples_leaf=4. Print the depth, leaf count and training accuracy of each fitted tree.", "Compare where each restriction stops the tree. A mixed leaf predicts its majority class; its remaining mistakes are allowed by that restricted model. These are training scores, so they cannot decide which restriction predicts new people best."],`from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

# Grow the tree with no restriction, with max_depth=6, with max_depth=2
# and with min_samples_leaf=4, and for each print the depth, the number
# of leaves and the training accuracy.`,`from oop_ml import DecisionTreeClassifier, Feature

heights = Feature("height", [145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

for label, controls in [("no restriction", {}), ("depth cap 6", {"max_depth": 6}), ("depth cap 2", {"max_depth": 2}), ("leaf minimum 4", {"min_samples_leaf": 4})]:
    tree = DecisionTreeClassifier(**controls).fit([heights, weights], is_adult)
    print(f"{label}: depth {tree.depth}, leaves {tree.n_leaves}, training accuracy {tree.score([heights, weights], is_adult):.3f}")`,`no restriction: depth 7, leaves 11, training accuracy 1.000
depth cap 6: depth 6, leaves 9, training accuracy 0.857
depth cap 2: depth 2, leaves 4, training accuracy 0.643
leaf minimum 4: depth 2, leaves 3, training accuracy 0.714`,{...{ hints: ["The growth controls are constructor fields, max_depth, min_samples_leaf, min_samples_split and min_impurity_decrease, and an unrestricted tree is the constructor with none of them set.", "The same crowd and the same two features go to every fit, so only the controls change between the four lines.", "A tree at the cap of two is a root with two questions beneath it and four leaves, which is the tree Part 1 describes, and its accuracy is what those four leaves’ majorities get right."], check: numberCheck("What training accuracy does the tree capped at a depth of two reach on the muddled crowd?", 0.643, 0.0005, "The depth-two tree leaves mixed classes in some leaves and predicts each leaf's majority. Its training score describes that restricted rule; held-out observations are needed to assess whether more splits help.") },question:"What changes when we restrict how far the tree can grow?"}),
            exercise("Sweep the depth cap on the overlapping crowd",["Use the supplied thirteen held-out row positions and the remaining thirty-one training people. Fit one tree per max_depth value from one through six. For each, print the cap, fitted leaf count, training accuracy and held-out accuracy.", "Compare when additional depth improves training accuracy and whether the held-out predictions improve with it. If the tree stops changing before the maximum cap, inspect whether its existing leaves are already pure."],`from oop_ml import DecisionTreeClassifier, Feature

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
    pass`,`from oop_ml import DecisionTreeClassifier, Feature

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
    print(f"cap {cap}: leaves {tree.n_leaves}, training accuracy {tree.score(training_inputs, training_target):.3f}, held-out accuracy {tree.score(hidden_inputs, hidden_target):.3f}")`,`cap 1: leaves 2, training accuracy 0.935, held-out accuracy 0.846
cap 2: leaves 4, training accuracy 0.935, held-out accuracy 0.846
cap 3: leaves 6, training accuracy 1.000, held-out accuracy 0.692
cap 4: leaves 6, training accuracy 1.000, held-out accuracy 0.692
cap 5: leaves 6, training accuracy 1.000, held-out accuracy 0.692
cap 6: leaves 6, training accuracy 1.000, held-out accuracy 0.692`,{...{ hints: ["The tree is grown on the training share alone, so the training features and target are what go to fit, and the hidden share is only ever handed to score.", "score takes a list of features and a target and answers the share labeled correctly, so one call on each share gives the two columns of the table.", "From a cap of three onward the tree is the same tree, six leaves and a perfect training score, because every leaf is already pure and nothing is left to split, which is why the cap stops mattering."], check: numberCheck("What held-out accuracy does the tree reach at a depth cap of three?", 0.692, 0.0005, "The deeper tree gains training accuracy while losing accuracy on these held-out people. That result belongs to this split; it is evidence to examine model flexibility, not a guarantee about every deeper tree.") },question:"Does a deeper tree improve predictions for the people held out?"}),
            exercise("Ask for trees that cannot be grown",["Fit a tree to the eight people arranged in the crossed pattern below, then print its text description, leaf count, depth and training accuracy. Next try an all-child target and a Feature containing NaN, catching MLLibError for each and printing the error class and message.", "For the crossed pattern, inspect whether any first split reduces impurity. Notice that the NaN error can occur while constructing Feature, before a model is fitted. Place each try block around the operation that can raise it."],`from oop_ml import DecisionTreeClassifier, Feature, MLLibError

heights = Feature("height", [130, 135, 170, 175, 130, 135, 170, 175])
weights = Feature("weight", [30, 35, 70, 75, 70, 75, 30, 35])
is_adult = Feature("is_adult", [0, 0, 0, 0, 1, 1, 1, 1])

tree = DecisionTreeClassifier().fit([heights, weights], is_adult)
# Print the tree as text with its leaf count, depth and training accuracy.
# Then try a fit on an all-child target, and try to build a height feature
# holding float("nan"), catching the library's own error each time and
# printing its class name and message.`,`from oop_ml import DecisionTreeClassifier, Feature, MLLibError

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
    print(f"{type(refusal).__name__}: {refusal}")`,`predict 0  [n=8, impurity=0.5000]
leaves 1, depth 0, training accuracy 0.500
SingleClassError: feature_values holds only class [0.0], so there is nothing to discriminate between
InvalidValuesError: feature_values must contain only finite values`,{...{ hints: ["A tree that admits no split is a single leaf predicting the majority, and with four of each the majority is a tie broken toward the lower class, so describe prints one line and depth is zero.", "Feature checks that its values are finite when it is created. The NaN case therefore needs only Feature construction inside its try block."] },question:"When does this tree stop growing, and which inputs does the library reject?"}),
          ],
        },
      ]}
    />
  );
}
