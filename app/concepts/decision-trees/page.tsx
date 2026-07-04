import type { Metadata } from "next";
import Link from "next/link";
import { ConceptPage } from "@/components/concept/ConceptPage";
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
    "A sequence of yes-or-no questions, each chosen from the data by how much class mixture it removes, readable as a flowchart until it grows too large to read.",
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
      title="Decision Trees"
      tagline="Yes-or-no questions, each chosen from the data, readable top to bottom as a flowchart."
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
      history={
        <>
          <p>
            The models so far answer with arithmetic. A logistic fit hands a
            doctor a slope of 1.69 and an intercept of −7.18, and however
            accurate it is, no one reads meaning off those numbers directly or
            explains them to a patient. The first automatic trees were built
            for a different complaint. James Morgan and John Sonquist at the
            Survey Research Center at the University of Michigan published
            &ldquo;Problems in the analysis of survey data, and a
            proposal&rdquo; in 1963, and their trouble was that survey answers
            interact. The effect of one answer on a household&rsquo;s income
            depended on what the other answers were, in ways a regression
            with one coefficient per input could not express unless someone
            guessed the interaction in advance. Their Automatic Interaction
            Detector split the sample on whichever question reduced the
            variance of the outcome most and then split each half again,
            which is this page&rsquo;s recipe already, though applied to a
            numeric outcome and without a rule for when to stop.
          </p>
          <p>
            Two strands matured it. Leo Breiman, Jerome Friedman, Richard
            Olshen and Charles Stone published Classification and Regression
            Trees in 1984, out of consulting problems like the one the book
            opens with, predicting from a heart attack patient&rsquo;s first
            day in hospital at the University of California San Diego medical
            centre whether they would survive thirty days, and the answer was
            a tree of three questions a doctor could carry in their head. Ross
            Quinlan&rsquo;s ID3, described in 1979 and again in a 1986 paper
            in Machine Learning, grew out of a chess endgame problem he worked
            on with Donald Michie in Edinburgh, learning from a table of
            positions which of them were lost within a fixed number of moves.
            Both strands settled on the same recipe, ask the data which single
            question best separates the classes, split on it, and repeat
            inside each half; CART measured a question by the Gini impurity
            and ID3 by the information it gained, and both measures appear on
            this page. What the CART authors insisted on, and what the survey
            work had lacked, was that growing the tree is the easy half. A
            tree can keep asking until every leaf holds one person, and it
            will then reproduce the people it trained on perfectly and
            predict poorly for anyone else, so the harder decision is how
            large a tree to trust, which they settled by growing a large one
            and pruning it back against held-out data. That is also where the
            children and adults above end up, one clean question on the ideal
            crowd and a thicket of them on the tangled one.
          </p>
        </>
      }
      playground={<TreePlayground />}
      sections={[
        {
          title: "Part 1. A Model Built from Questions",
          defaultOpen: true,
          content: (
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
          ),
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
                  follow, the tree reaches an accuracy of 1.000 with nine
                  rectangles and the line manages 0.68. Neither is the better
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
                  crowd, height below 146 and weight below 48.5 both score
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
                  eight splits and nine leaves and reaches a training accuracy
                  of 1.000, with the last two splits each fencing off a single
                  person at depth four. Pure training leaves do not mean good
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
                  single-person rectangles the unrestricted tree grew. Depth is
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
                  at their defaults and step to the last two splits. Each acts
                  on four people at depth four, earns a gain of 0.375, and
                  leaves one person alone in a rectangle. Three questions
                  were spent to explain one observation.
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
                <p>
                  With K classes the formula is the general one already
                  written, G = 1 − Σₖ pₖ², and the mechanism is unchanged.
                  Count every class in the node, turn counts into shares,
                  compute the impurity, compare candidates, and predict the
                  majority at a leaf. Ties between classes at a leaf need a
                  policy exactly as ties between splits did.
                </p>
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
            </SubSection>
          ),
        },
      ]}
    />
  );
}
