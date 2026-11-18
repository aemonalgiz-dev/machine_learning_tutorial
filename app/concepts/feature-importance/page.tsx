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
import { ArrangementBars } from "@/components/widgets/ArrangementBars";
import { CreditLedger } from "@/components/widgets/CreditLedger";
import { ImportanceBars } from "@/components/widgets/ImportanceBars";
import { ScrambleLadder } from "@/components/widgets/ScrambleLadder";

export const metadata: Metadata = pageMetadata("/concepts/feature-importance", {
  title: "Which Feature Mattered · Perceptron Lab",
  description:
    "Feature importance investigates how input measurements affect a fitted model's results. Different methods answer different questions, and related measurements can complicate how their scores should be interpreted.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function FeatureImportancePage() {
  return (
    <ConceptPage
      lessonId="feature-importance"
      intuition={lessonIntuitions["feature-importance"]}
      technicalStart="Part 4. Breaking a Column on Purpose"
      openingTitle="What Did the Model Actually Use?"
      playgroundTitle="What happens when we disrupt one measurement?"
      playgroundIntro="Compare the two importance rankings, especially for the noise feature. Read each ranking alongside the model's predictive score."
      title="Which Feature Mattered"
      tagline={"Feature importance investigates how input measurements affect a fitted model's results. Different methods answer different questions, and related measurements can complicate how their scores should be interpreted."}
      prerequisites={
        <>
          The first measure reads the splits of a{" "}
          <Link href="/concepts/decision-trees" className={link}>
            decision tree
          </Link>
          , and the model the two measures disagree about is a{" "}
          <Link href="/concepts/random-forests" className={link}>
            random forest
          </Link>
          , so read those two pages first, and in particular the trees
          page&rsquo;s account of the split search and the gain it scores each
          question by. The crowd that this page steps through is the tangled
          crowd of twenty-five people the bagging and forests pages fit, and
          the forest grown beside it is the seed-7 committee the forests page
          ended on.
        </>
      }

      playground={<ImportanceBars />}
      sections={[
        {
          title: "Part 1. Three Questions One Word Hides",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Three different questions">
                <p>Suppose we ask a forest which input mattered most. We could count the questions it asked about each input. We could measure how much each question separated the training labels. Or we could scramble one input for new observations and check how much worse prediction becomes. These ask different questions.</p>
              <p>The split-based calculation calls the remaining class mixture impurity, and credits a question for reducing it. A column used in many small questions may still contribute less than one useful first question. Another column may provide almost the same information. Let&apos;s calculate the measures on the same forest and see why their answers differ.</p>
                <DerivationTable
                  expressionHeading="the question"
                  reasonHeading="what answers it"
                  rows={[
                    { expression: "used often", reason: "a count of the decision nodes that asked about the column. Cheap, and blind to how much each question was worth." },
                    { expression: "removed the most impurity", reason: "the sum over those nodes of the rows that reached the node times the impurity the question removed, normalized to a share. The split reading, and the first measure on this page." },
                    { expression: "the predictions depend on it", reason: "scramble the column, score the fitted model again, and read the drop as reliance. The scramble reading, and the second measure." },
                  ]}
                />
                <InAModel title="On a crowd of two hundred people, one forest, three answers">
                  <>
<p>The example contains two hundred height and weight pairs. Its labels are generated from height alone; weight is related to height and therefore carries some indirect information about those labels. We fit thirty trees, offering one randomly chosen feature at each split. The forest uses weight in 272 splits and height in 240. A split count has favored the indirectly related measurement, so we need to ask what that count actually measures.</p>
                  <p>The split-based importance also favors weight, with shares 0.521 and 0.479. On two hundred held-out people, permutation importance instead gives height 0.957 and weight 0.043. The latter ranking agrees with the variable used by this data generator, but it still describes the fitted model&rsquo;s dependence under a particular scoring experiment.</p>
</>
                </InAModel>
                <ArrangementBars arrangements={["measurements"]} showModelToggle={false} />
                <p>The displayed bars compare split counts, impurity credit and permutation scores from training and held-out rows. They all describe this forest, but they measure different behavior. The model switch below also lets us inspect the lone tree fitted to the same observations.</p>
                <KeepInMind>
                  Before comparing importance values, identify the question they answer. A split count, an impurity share and a permutation score can rank the same features differently without any calculation being wrong.</KeepInMind>
              </SubSection>

              <SubSection title="2. Two sets of people, and a puzzle">
                <>
<p>
                  Two datasets carry the page. The first is the tangled crowd of twenty-five people that the bagging and forests pages fit, children and adults by height and weight, on which a tree grows eight splits to reach pure leaves, and that is where the split reading is assembled by hand. The second is the larger drawn crowd from the box above, which has two columns added to it that a careful reader should distrust.
                </p>
                <p>One added column is a random raffle number, different for each of the two hundred people and generated independently of their measurements. The other is height plus a small measurement error; its correlation with height is 0.996. Weight has correlation 0.898 with height, and the raffle number has correlation −0.131 in this draw. Independent variables can have nonzero sample correlation.</p>
</>
                <>
<p>
                  Beside those sits the puzzle in the box at the top of the page, built to defeat the trees page&rsquo;s search. Two columns are coin flips, and the class is 1 exactly when the two flips disagree. Ask about either coin alone and both sides of the split come back half and half, no better than the node was before, so no single question helps.
                </p>
                <p>The third column contains independent noise with three hundred distinct values. It offers many threshold candidates, while either coin alone gives no impurity improvement in this constructed puzzle. Searching many noise thresholds can find a chance reduction in training impurity. That gives the tree a reason to choose noise before it discovers the coins&rsquo; interaction.</p>
</>
                <KeepInMind>
                  Both noise examples offer many candidate cut points without a population relationship to the target. Their chance training gains can compete with useful measurements, especially when the useful information requires several questions together.</KeepInMind>
              </SubSection>

              <SubSection title="3. Shares of an explanation, not measurements of the world">
                <>
<p>These reports return one non-negative value for each fitted column and normalize the values to sum to one. A column with no credit remains explicitly present at zero. Each share is relative to the other credits in this report. It is not a percentage of everything that explains the outcome.</p>
                <p>Related columns can divide the fitted model’s credit in different ways. Adding a second measurement of the same underlying quantity may reduce the first column’s share even when its information remains useful. The shares describe this fitted model with this available set of inputs.</p>
</>
                <Equation>{"share(feature) = raw score(feature) / Σ raw score over every feature"}</Equation>
                <p>
                  The raw score is the quantity each measure produces, impurity
                  removed for the first and accuracy lost for the second. A
                  model whose raw scores all come to zero has no shares to
                  report, and rather than divide zero by zero the reading is
                  refused, in words the last Part quotes.
                </p>
                <KeepInMind>
                  A share of 0.52 means 52 percent of the credit assigned by this particular report. It is not 52 percent of an outcome&rsquo;s causes or of all information available about it. The meaning of the underlying credit still matters.</KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Reading the Splits",
          content: (
            <>
              <SubSection title="4. What one question removes">
                <p>A node contains observations with a mixture of class labels. A candidate question divides them into child nodes. Its impurity gain is the parent’s impurity minus the weighted impurity remaining in those children. The weights reflect how many observations enter each group. The tree records that gain when it chooses the split.</p>
                <Equation>{"gain = I(parent) − (n_left / n)·I(left) − (n_right / n)·I(right)"}</Equation>
                <WorkedExample title="The root of the tangled crowd">
                  <p>

                    Twenty-five people, thirteen adults and twelve children,
                    with a Gini impurity of 0.4992, which is almost as mixed as
                    a node can be. The best question is whether height is
                    under 147.5 centimeters, and it removes 0.1881 of that
                    impurity. Every other question the search considered, on
                    either column at any threshold, removed less.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The gain is a fact about one node. It says nothing yet about
                  the column, because a column that removes a great deal at a
                  node holding three people has done very little for the tree.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Weighting a question by the people it was asked of">
                <p>A feature receives the split’s gain multiplied by the number of observations that reached the node. This distinguishes a useful question asked of the whole dataset from an equally large gain affecting only three people. The following comparison shows why both the improvement and the size of the group matter.</p>
                <Equation>{"credit(node) = rows at node × gain at node"}</Equation>
                <WorkedExample title="The largest gain in the tree earns the fourth largest credit">
                  <>
                    <p>
                      The fourth split asks about weight in a node of three people. Its
                      impurity reduction is larger than the root’s, but it affects far
                      fewer people. Credit accounts for both quantities.
                    </p>
                    <Equation>{"fourth split credit ≈ 3 × 0.4444 ≈ 1.333\nroot split credit ≈ 25 × 0.1881 ≈ 4.702"}</Equation>
                    <p>
                      The root earns about three and a half times as much credit. A
                      large improvement on a small node need not outweigh a smaller
                      improvement on the whole crowd. Values shown here are rounded from
                      the full calculation.
                    </p>
                  </>
                </WorkedExample>
                <WhyThisWorks title="How node weighting measures the tree’s total impurity reduction">
                  <>
<p>
                    Ask how much impurity the whole tree removed. Write N for the people at the root and n for the people at some node. That node&rsquo;s contribution to the tree&rsquo;s total is its gain scaled by the fraction n / N of people who reached it, so the total is a sum of (n / N) × gain over every decision node.
                  </p>
                  <p>
                    Group the sum by which column each node asked about and divide each group by the whole; the N cancels out of every share, leaving each column&rsquo;s credit as the sum of n × gain over its nodes. The weighting falls out of asking about the tree rather than about the nodes one at a time.
                  </p>
</>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="6. Accumulating credit one split at a time">
                <p>
                  Now walk the tangled crowd&rsquo;s tree and keep a ledger.
                  Each split adds its credit to its column&rsquo;s running
                  total, and at any moment the running shares are the running
                  totals divided by their sum. The slider adds the eight splits
                  in the order the decision-tree page steps through them,
                  breadth first from the root.
                </p>
                <CreditLedger />
                <>
                  <p>
                    After the root, height holds all the credit. The second split asks
                    about weight in a node of nine people.
                  </p>
                  <Equation>{"second split credit ≈ 9 × 0.0494 ≈ 0.444"}</Equation>
                  <p>

                    Weight’s share is now about 0.086. The fourth split lifts it to
                    0.232, the closest the two columns come. Later splits favor height,
                    including two questions worth 1.5 apiece. The final ledger is:
                  </p>
                  <Equation>{"height credit ≈ 9.702\nweight credit ≈ 2.778\ntotal credit ≈ 9.702 + 2.778 = 12.480"}</Equation>
                </>
                <KeepInMind>
                  This importance score comes directly from the recorded splits. After fitting, we add up their weighted contributions. Its limitations therefore depend on which questions the tree chose and how many observations reached each split. The score describes that fitted tree; it does not establish what caused the outcome.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Normalizing, and a column that never won" id="7-normalising-and-a-column-that-never-won">
                <>
                  <p>
                    Divide each feature’s accumulated credit by the total credit to
                    obtain its reported share.
                  </p>
                  <Equation>{"height share ≈ 9.702 / 12.480 ≈ 0.777\nweight share ≈ 2.778 / 12.480 ≈ 0.223"}</Equation>
                  <p>
                    A feature that wins no split receives a zero. The implementation
                    keeps the full list of columns so that an unused feature appears
                    explicitly. On the parity puzzle, the tree never asks about the
                    first coin, and its reported share is zero.
                  </p>
                </>
                <Equation>{"share(feature) = Σ over its nodes of rows × gain  /  Σ over every node of rows × gain"}</Equation>
                <KeepInMind>
                  A zero here means the search never chose the column, at any
                  node, against the alternatives it was offered. It does not
                  mean the column carries no information, and the drawn crowd
                  in Part 6 has a column at zero that predicts the label well
                  on its own.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Averaging across a forest's members">
                <p>The credit can change when the fitted tree changes. A feature used near the root can lose much of its credit after a small change in the sample. The forest here averages the normalized shares from twenty-five member trees. Averaging shares gives each member equal weight, rather than allowing a tree with a larger raw impurity reduction to dominate the report.</p>
                <NumberTable
                  headings={["the seed-7 committee on the tangled crowd", "height", "weight", "roots on height"]}
                  rows={[
                    ["lone tree, every column at every split", "0.777", "0.223", "1 of 1"],
                    ["forest, one column offered per split, 25 members", "0.527", "0.473", "8 of 25"],
                    ["bagging, both columns at every split, 25 members", "0.711", "0.289", "20 of 25"],
                  ]}
                  caption="The forest and the bagged committee are the random-forests page's own, refitted here. Under the forest the members' height shares run from 0.179 to 1.000, and their mean is the 0.527 reported."
                />
                <p>Random feature availability changes which measurements these trees can use. When height is unavailable at a node, a tree may split on weight instead, assigning it the corresponding impurity credit. The forest&rsquo;s height and weight shares are therefore closer than the lone tree&rsquo;s. Bagging offers both columns at every node and assigns more credit to height in this example.</p>
                <KeepInMind>
                  Averaging can reduce variation between tree-specific reports. It does not remove a systematic preference shared by their split searches, such as the preference for features offering many thresholds.</KeepInMind>
              </SubSection>

              <SubSection title="9. Why the split reading is free">
                <p>
                  This measure uses gains and row counts recorded when the tree was fitted. Computing it afterwards requires traversing the tree, or each tree in a forest, without evaluating the data again. That makes it inexpensive to report. We should still describe it as a measure of the fitted splits rather than an independent evaluation of predictive importance.
                </p>
                <KeepInMind>
                  The reading costs one walk of the tree and inherits every
                  preference of the search that grew it, and the next Part is
                  about those preferences.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. Where the Split Reading Misleads",
          content: (
            <>
              <SubSection title="10. A column with many places to cut">
                <p>
                  The search compares the best question each column can ask.
                  A coin offers one threshold, so it gets one chance to show a
                  gain. A column with three hundred distinct values offers a
                  threshold between every adjacent pair, so it gets hundreds of
                  chances, and the search keeps the best of them. On the parity
                  puzzle that is decisive, since the coins cannot win a single
                  question, and the lone tree roots on the noise column and
                  asks about it at three of its four nodes, for a share of
                  0.807 on a column that carries nothing.
                </p>
                <p>In the larger drawn dataset, the lone tree makes sixteen splits using height and weight and never selects the raffle number. This particular fit therefore gives the identifier zero credit. The forest offers only one of the three columns at each split, so some nodes must consider the raffle number without either useful measurement beside it.</p>
                <ArrangementBars arrangements={["with_ticket"]} initialModel="forest" readings={["counts", "impurity"]} />
                <p>When offered only the raffle number at a mixed-label node, a tree can select a chance threshold improvement without comparing it with height. Across this forest, 196 of 559 splits use the identifier, more than use height. It receives an impurity share of 0.107. The lone tree, which always considers the other columns too, uses it in none of its sixteen splits.</p>
                <KeepInMind>
                  More candidate thresholds give a noise feature more chances to obtain a training gain. Random feature selection can expose that feature without its stronger alternatives. This is one reason split-based importance may give a high-cardinality feature substantial credit.</KeepInMind>
              </SubSection>

              <SubSection title="11. Two columns carrying one signal split the credit">
                <p>The two height readings are strongly correlated, so they often offer similar splits. A node credits only the feature actually selected, even when the other could have supplied much the same division. Measurement error, sampled rows, available features and tie rules can all affect how their credit is divided.</p>
                <ArrangementBars arrangements={["measurements", "with_twin"]} initialArrangement="with_twin" readings={["impurity"]} />
                <>
<p>
                  With height alone the lone tree credits it 0.897; with the second reading beside it the two split the same work 0.860 to 0.101. The forest is the sharper case. Height alone earns 0.479 of the forest&rsquo;s impurity; with its twin present the twin leads at 0.510 and height falls to 0.257, and weight, which did not change, moves from 0.521 to 0.233 because the twin took the nodes weight used to be offered.
                </p>
                <p>The second reading was constructed by adding measurement error to height. A larger share for it therefore does not establish that it contains more underlying information. It tells us which of the available readings this fitted model happened to use.</p>
</>
                <KeepInMind>
                  For related features, inspect both their individual shares and their combined credit. A group sum summarizes the credit assigned to that group, but it does not establish a causal effect. Individual rankings can be unstable when the features provide similar information.</KeepInMind>
              </SubSection>

              <SubSection title="12. The ledger was written while the model memorized" id="12-the-ledger-was-written-while-the-model-memorised">
                <p>Split-based importance is calculated from the gains recorded on training rows. Re-evaluating new rows does not change that stored split ledger. In this draw, the fully grown tree has training accuracy 1.0 and held-out accuracy 0.845. Its importance report describes the training impurity reductions; it does not separately identify which splits generalize.</p>
                <NumberTable
                  headings={["the lone tree fitted on the ticket alone", "reading"]}
                  rows={[
                    ["splits grown, depth reached", "109, 21"],
                    ["accuracy on its rows, held out", "1.000, 0.500"],
                    ["ticket's share of impurity removed", "1.000"],
                  ]}
                  caption="Two hundred people and one column of raffle numbers. The tree separates every person by ticket number and the ledger records every question as productive."
                />
                <p>A tree given only the ticket identifier grows 109 splits to depth 21. It reaches training accuracy 1.0 and held-out accuracy 0.5. The split-based calculation assigns the ticket all the credit because it accounts for all the impurity reduction in that tree. That calculation correctly describes the training splits. The held-out score answers the separate question of whether those splits helped predict new labels.</p>
                <KeepInMind>
                  Read split-based importance alongside an evaluation on new observations. The report explains the fitted tree&rsquo;s training splits; the predictive score checks how well that tree performed on the chosen evaluation data.</KeepInMind>
              </SubSection>

              <SubSection title="13. Averaging steadies the reading without correcting it">
                <>
<p>Averaging many trees can reduce tree-to-tree variability, but a shared preference for many-threshold features can remain. The parity forest scores 0.993 on training rows and 0.960 held out, yet its averaged impurity report gives noise a share of 0.519. Good predictions do not make every split-based importance share a reliable measure of predictive reliance.</p>
                <p>
                  On the drawn crowd with all four columns and two offered per split, the ticket keeps 0.043 of the forest&rsquo;s impurity across thirty members, at 77 of the 418 splits.
                </p>
</>
                <KeepInMind>
                  The forest averages reports from its fitted members. That can stabilize the values without correcting a bias in the feature-selection procedure they share. It does not mean every member selects the same feature.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            choice(
              "The forest of thirty trees on the drawn crowd is asked which column mattered, three ways. Which of the three answers height?",
              [
                "How often each column was used for a split",
                "How much impurity each column removed when it was used",
                "How much worse the predictions get on two hundred unseen people when the column is scrambled",
                "All three readings answer height",
              ],
              2,
              "Counting splits and summing the impurity removed both answer weight, 272 splits to 240 and 0.521 to 0.479. Only the scramble on unseen people answers height, 0.957 to 0.043, and it is the one that agrees with how the crowd was made, since the rule that assigns adult reads height alone and weight follows height only through overall body size.",
            ),
            choice(
              "Why is a split’s credit its gain multiplied by the number of rows at the node, rather than its gain alone?",
              [
                "Because a large improvement on a small node would otherwise count as much as a smaller improvement on the whole crowd",
                "Because impurity is not comparable between nodes at different depths",
                "Because the shares would not sum to one without it",
                "Because deeper nodes are the ones most likely to have memorized their rows",
              ],
              0,
              "On the tangled crowd the fourth split asks about weight in a node of three people and removes more impurity than the root does, yet its credit is about 1.333 against the root’s 4.702. The weighting is not a convention imposed afterwards either, since it falls out of asking what fraction of the whole tree’s impurity reduction each node contributed.",
            ),
            trueFalse(
              "A column whose reported share is zero carries no information about the label.",
              false,
              "Zero split importance means this tree gave the feature no credited impurity reduction. Zero normalized permutation importance can also mean its mean score change was zero or negative before clamping. Neither establishes that the column contains no useful information: another model or a different set of available inputs may use it. Weight alone still supports a held-out accuracy of 0.760 in the supplied example.",
            ),
            several(
              "The forest asks about the raffle ticket at 196 of its 559 splits, while the lone tree never asks about it across sixteen questions. Which of these are part of the reason?",
              [
                "The ticket offers many candidate thresholds, giving the search many opportunities to find chance label imbalances",
                "Offering one of three columns per split can leave the forest searching only ticket thresholds at that node",
                "Height and weight bring the lone tree to pure leaves without the ticket ever being the best option at any node",
                "Bootstrap resampling creates a population-level relationship between ticket number and class",
              ],
              [0, 1, 2],
              "A high-cardinality distractor provides many candidate partitions and can receive impurity credit from chance training imbalances. Feature subsampling sometimes leaves it as the only available candidate column. The tree still requires an admissible improving split; it is not forced to ask a useless question. These effects explain training credit without creating a predictive relationship in the data-generating population.",
            ),
            trueFalse(
              "Averaging thirty ledgers steadies the split reading, and it still cannot remove a preference that every member’s search shares.",
              true,
              "Averaging can reduce variability among feature-credit estimates, but it does not automatically remove a shared split-selection preference for many candidate thresholds. The parity forest predicts well on held-out rows while still assigning the distractor more than half its normalized impurity credit. That disagreement is a reason to examine what each importance procedure measures.",
            ),
        ],
        },
        {
          title: "Part 4. Breaking a Column on Purpose",
          content: (
            <>
              <SubSection title="14. The experiment">
                <p>Permutation importance starts with a baseline score from the fitted model. Shuffle one feature among the observations, keep the other columns and labels in place, then score again. The score change measures how much the model’s predictions relied on the original arrangement of that feature. Shuffling breaks its relationships with both the label and the other inputs, which matters when features are related.</p>
                <Equation>{"drop(feature) = intact score − score with that column shuffled"}</Equation>
                <WorkedExample title="The parity forest, scrambled on its own rows">
                  <p>The parity forest scores 0.993 on its training rows. After shuffling, its scores are 0.538 for the first coin, 0.515 for the second and 0.977 for noise. The corresponding mean drops are 0.4553, 0.4787 and 0.0167, giving normalized shares 0.479, 0.504 and 0.018. Disrupting either coin greatly reduces accuracy; disrupting noise has little effect on this score despite its large impurity share.</p>
                </WorkedExample>
                <KeepInMind>
                  Permutation importance tests how the score changes when one column&rsquo;s values are reassigned among rows. This disrupts its relationship with both the target and other inputs. It measures the fitted model under that perturbation, rather than reading its recorded splits.</KeepInMind>
              </SubSection>

              <SubSection title="15. Why shuffle rather than replace">
                <p>Replacing the column with zeros would also change the values the model receives. Shuffling keeps its observed distribution while changing which row receives each value. That isolates a different experiment from replacement, although it can still create combinations of features that are unusual in the original data. The score drop needs to be interpreted with that limitation in mind.</p>
                <KeepInMind>
                  Shuffling preserves the observed values and their frequencies within that column. It changes their row assignments and their relationships with other columns, so the result describes this specific perturbation rather than a causal intervention.</KeepInMind>
              </SubSection>

              <SubSection title="16. Repeats, averaged and then clamped">
                <>
<p>Different permutations can produce different score changes. This implementation uses one seeded generator to shuffle each column five times and averages the drops. A negative mean drop means the perturbed data scored better in this experiment. The reporting convention then clamps that mean to zero before converting contributions into nonnegative shares.</p>
                <p>Clamping each draw separately would discard negative fluctuations while keeping positive ones, pushing the reported importance upward. Averaging first lets the repeated estimates offset one another before the implementation applies its non-negative reporting rule.</p>
</>
                <Equation>{"drop_j = s − (1 / R) · Σ over R shuffles of s(column j shuffled)\nshare_j = max(0, drop_j) / Σ_k max(0, drop_k)"}</Equation>
                <WorkedExample title="A negative drop on the lone parity tree, held out">
                  <p>
                    The lone tree scores 0.4967 on the rows it never saw.
                    Scramble the second coin and its average score is 0.5047,
                    a drop of −0.0080, which the clamp takes to zero; scramble
                    the noise column and it is 0.4853, a drop of 0.0113. The
                    clamped drops sum to 0.0113, so the noise column&rsquo;s
                    share is exactly 1.0 and the two coins are at exactly
                    zero, on a model that is at chance whichever column is
                    scrambled.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  The clamp comes after the average. A share of exactly zero
                  can mean a drop of exactly nothing or a drop below nothing,
                  and the raw drops are the place to tell them apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Which rows to scramble">
                <p>Permutation scores depend on which observations we evaluate. Shuffling the training rows measures reliance on the examples already fitted. Shuffling held-out rows measures reliance when predicting those new cases. A model that memorized its training rows can give quite different answers to those questions. The switch below changes the rows used in the experiment.</p>
                <ScrambleLadder />
                <>
<p>On training rows the forest gives noise a share of 0.018. On held-out rows its mean drop is −0.004 and its clamped share is zero, while the coin shares are 0.510 and 0.490. The lone tree scores about 0.497 held out, and its measured score changes remain within 0.012. Breiman&rsquo;s forest approach instead permutes each member&rsquo;s own out-of-bag rows, using observations excluded from that tree&rsquo;s fit without reserving a separate dataset.</p>
                <p>
                  The scramble here takes whichever rows it is handed and has no per-member out-of-bag variant, so this page uses held-out rows where the forests page would have used the rows each member left out.
                </p>
</>
                <NumberTable
                  headings={["the drawn crowd's forest, fitted on the ticket alone", "reading"]}
                  rows={[
                    ["accuracy on its rows, out of bag, held out", "0.990, 0.420, 0.505"],
                    ["ticket's share, scrambled on its rows", "1.000"],
                    ["ticket's drop, scrambled held out", "−0.004"],
                    ["ticket's share, scrambled held out", "refused, no column earned anything"],
                  ]}
                  caption="Thirty trees on two hundred raffle numbers. On the rows it memorized the scramble credits the ticket with everything; on rows it never saw no column's scramble lowers the score, and shares are refused rather than reported."
                />
                <KeepInMind>

                  Which rows are scrambled is part of the measurement. A
                  reading taken on the training rows of a model that memorized
                  them reports what it memorized with, and can hand a column
                  of raffle numbers a share of one.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. The extra predictions an importance estimate requires" id="18-what-it-costs">
                <>
                  <p>
                    The split measure needs one walk through a fitted tree. Permutation
                    importance needs a baseline scoring pass and another pass for every
                    feature in every repeat. The parity puzzle has three features and
                    uses five repeats.
                  </p>
                  <Equation>{"scoring passes = 1 + features × repeats\n               = 1 + 3 × 5\n               = 16"}</Equation>
                  <p>
                    That cost grows with the number of features and repeats. The split
                    measure is cheap to read from the fitted tree; permutation
                    importance costs more because it measures changed predictions.
                  </p>
                </>
                <KeepInMind>
                  The scramble costs a scoring pass per column per repeat and
                  needs rows to scramble, which on the parity puzzle is
                  sixteen passes against the single walk the split reading
                  takes, and Part 3 is what that walk leaves unexamined.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where the Two Readings Agree and Where They Part",
          content: (
            <>
              <SubSection title="19. A model that does not work, on which they agree">
                <>
<p>
                  It is tempting to read the forest&rsquo;s result as the scramble seeing through a column that fooled the ledger, and to expect it to do the same on any model. The lone parity tree says otherwise. It scores 0.537 on its own rows and 0.497 held out, chance either way, because it rooted on noise and never found the two-question structure.
                </p>
                <p>
                  Read from its splits, the noise column gets 0.807. Scramble that column and the tree falls from 0.537 to 0.504, most of the little it had above chance, while scrambling the second coin takes it only to 0.523 and scrambling the first changes nothing, so the scramble hands the noise column 0.710. Both readings name the noise column, and both are right.
                </p>
                <p>The tree really does use the noise feature. That reliance is a property of the fitted model, even though the feature has no useful role in the process that generated the labels.</p>
</>
                <KeepInMind>
                  Permutation importance describes the fitted model&rsquo;s score dependence under a shuffle. A model can rely on a noise feature, so this measure cannot certify that a highly ranked feature contains a genuine population relationship.</KeepInMind>
              </SubSection>

              <SubSection title="20. A model that works, on which they part">
                <p>The parity forest shows a large disagreement: it predicts well at 0.960 held-out accuracy, yet gives noise an impurity share of 0.519 and very little permutation importance. In this fit, many noise splits receive training credit without being essential to the final predictions. Such disagreement is possible in other fits too; it does not require a generally accurate model.</p>
                <NumberTable
                  headings={["the worked draw", "lone tree", "forest"]}
                  rows={[
                    ["accuracy on its rows, held out", "0.537, 0.497", "0.993, 0.960"],
                    ["noise column by the splits", "0.807", "0.519"],
                    ["noise column by scrambling its rows", "0.710", "0.018"],
                    ["noise column by scrambling held out", "1.000", "0.000"],
                    ["leads by the splits", "noise", "noise"],
                    ["leads by scrambling", "noise", "a coin"],
                  ]}
                  caption="The same three hundred rows, seed 4. The lone tree’s held-out share of 1.000 is based on a raw drop of only 0.0113; inspect that small magnitude alongside the near-chance baseline."
                />
                <KeepInMind>
                  When split credit and permutation scores disagree, inspect the model and data before assigning a reason. Training-only gains, correlated features, the chosen score and the shuffle itself can all contribute. The two reports provide different evidence rather than a universal rule for identifying unnecessary columns.</KeepInMind>
              </SubSection>

              <SubSection title="21. The same story on the crowd">
                <p>

                  The drawn crowd&rsquo;s forest with the ticket among its
                  columns tells the story on people rather than coins. The
                  ledger credits the ticket 0.107 and the scramble on the
                  training rows still gives it 0.084, since thirty memorizing
                  trees do lean a little on the raffle numbers they memorized
                  with. Held out, the ticket&rsquo;s drop is −0.012 and its
                  share exactly zero, while height takes all of it.
                </p>
                <ArrangementBars arrangements={["with_ticket"]} initialModel="forest" readings={["impurity", "training", "held_out"]} showModelToggle={false} />
                <p>The first row of bars describes impurity reduction during training. The second measures permutation effects on training accuracy, and the third measures them on held-out accuracy. Only the held-out permutation report assigns the identifier zero share here. Agreement with the known generator helps interpret this example, but is not a general guarantee of causal importance.</p>
                <KeepInMind>
                  Training impurity credit with little held-out permutation effect can indicate chance-fitting. It is a clue to investigate, not a unique signature: related features and limited sensitivity of the chosen score can produce similar patterns.</KeepInMind>
              </SubSection>

              <SubSection title="22. Correlated columns hide each other from the scramble">
                <p>Correlated inputs complicate permutation importance too. If the model can obtain similar information from another column, shuffling just one may cause a small score change. Small individual drops do not establish that the shared information is unimportant. The second height reading lets us examine that case.</p>
                <ArrangementBars arrangements={["measurements", "with_twin"]} initialArrangement="with_twin" initialModel="forest" readings={["held_out"]} showModelToggle={false} />
                <>
<p>With height and weight available, shuffling height reduces held-out accuracy by 0.360. With the second height reading added, the separate drops are 0.148 for height and 0.184 for the second reading. Their sum, 0.332, is not a joint-shuffle measurement. Each separate experiment leaves the other reading intact, which can reduce the observed effect.</p>
                <p>The normalized shares favor the second reading, 0.540 versus 0.434. That describes how this forest uses the two available measurements, influenced by both the sampled data and random feature availability. The lone tree uses them differently: it selects the second reading at five splits, yet shuffling it held out gives a mean drop of −0.001. A selected split need not cause a measurable decrease in this held-out accuracy score.</p>
</>
                <KeepInMind>
                  Under the scramble, correlated columns substitute for one
                  another and a group can matter while every member of it
                  reports a small drop. Read the correlations before the
                  shares, and scramble a correlated group together when the
                  question is about the group.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. A zero is about this fit">
                <>
<p>
                  Both measures hand out zeros, and every zero on this page is a statement about one fitted model. The lone parity tree gives the first coin exactly zero by both readings because it never asked about it, and the forest fitted to the same rows gives that coin 0.479 on its rows and 0.510 held out.
                </p>
                <p>
                  The drawn crowd&rsquo;s lone tree gives the ticket zero because height and weight finished the job first, and its forest, short of options at a third of its nodes, gives the ticket 0.107. Weight in that lone tree gets a held-out share of exactly zero, from a drop of −0.030, and the next Part shows what weight can do when nothing better is offered.
                </p>
</>
                <KeepInMind>
                  A zero impurity share means no positive credit was assigned by that split report. A zero permutation share can also come from a negative mean drop clamped to zero or from a score insensitive to the changed predictions. Neither proves that the feature lacks information in another model or dataset.</KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Importance Cannot Say",
          content: (
            <>
              <SubSection title="24. Reliance is not causation">
                <>
<p>
                  The drawn crowd&rsquo;s rule assigns adult by height alone, with a little noise, and weight follows height only because both follow overall body size. Fit a model on weight and nothing else and it predicts adulthood usefully, the lone tree at 0.755 held out and the forest at 0.760, and every reading gives weight a share of one, because it is the only column there is.
                </p>
                <p>Weight is a useful proxy in this constructed dataset because it is associated with height. A model using weight can predict the supplied labels without identifying the rule that generated them. Reliance on a predictive measurement does not establish that changing that measurement would change the outcome.</p>
</>
                <ArrangementBars arrangements={["weight_only", "measurements"]} initialArrangement="weight_only" initialModel="forest" readings={["held_out"]} showModelToggle={false} />
                <p>With height also available, weight&rsquo;s held-out permutation share is 0.043, based on a mean accuracy drop of 0.016. The model relies less on that proxy when it can use the variable that generated the labels. The second height measurement offers a similar caution: a larger importance share for a noisy reading does not identify an additional cause of the target.</p>
                <KeepInMind>
                  These importance reports do not establish causation. A proxy can support useful prediction without being a cause of the outcome. Testing what changes an outcome requires additional assumptions or evidence beyond a fitted model&rsquo;s feature ranking.</KeepInMind>
              </SubSection>

              <SubSection title="25. Importance is not a verdict on the column">
                <p>Another comparison refits the model without a feature and evaluates the new fit. Removing the raffle number changes this forest&rsquo;s held-out accuracy from 0.870 to 0.880. The lone tree stays at 0.845 because it never selected the identifier. This draw provides no measured benefit from keeping the ticket, but a small difference from one refit is not an intrinsic value for the column.</p>
                <NumberTable
                  headings={["held-out accuracy of the forest", "reading"]}
                  rows={[
                    ["height and weight", "0.880"],
                    ["with the ticket", "0.870"],
                    ["with height read twice", "0.875"],
                    ["all four columns, two offered per split", "0.870"],
                    ["weight alone", "0.760"],
                    ["the ticket alone", "0.505"],
                  ]}
                  caption="Thirty trees, seed 0, with two hundred held-out people for every configuration. These comparisons require new fits and measure the selected training procedure as well as the available features."
                />
                <p>The effect of a column depends on which other information is available. Weight has a held-out share of 0.043 beside height, while a model using weight alone reaches 0.760 accuracy. Both results can be correct. Neither report assigns weight an intrinsic value independent of the model and its other inputs.</p>
                <KeepInMind>
                  None of the three measures is a verdict on the column.
                  Weight scores 0.043 in a model that had height available,
                  and carries a model of its own to 0.760 when height is
                  withheld.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Reading a report of shares">
                <p>An importance report needs its method and model. For permutation results, also record the evaluated rows, score, repeats and seed. Inspect relationships between inputs before interpreting their individual shares. This forest assigns the ticket 0.107 by impurity reduction, 0.084 by training-row permutation and 0.000 by held-out permutation. Those values answer different questions and should be labeled accordingly.</p>
                <DerivationTable
                  expressionHeading="if the shares are"
                  reasonHeading="then ask"
                  rows={[
                    { expression: "from the splits", reason: "whether a highly ranked column offers many cut points, whether two ranked columns are correlated, and what the model scored held out." },
                    { expression: "from scrambling the training rows", reason: "whether the model memorized, since a memorizing model leans on whatever it memorized with." },
                    { expression: "from scrambling held-out rows", reason: "whether correlated columns are hiding each other, and whether a zero is a column the model had a substitute for." },
                    { expression: "from any of the three", reason: "nothing about causation, since a proxy the model can use serves it as well as a cause would, and weight alone reached 0.760." },
                  ]}
                />
                <KeepInMind>
                  Quote the measure, the rows, the model and the held-out
                  score with every share, because without them a reader
                  cannot tell which of this page&rsquo;s three answers for
                  the ticket, 0.107, 0.084 or 0.000, they are looking at.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 to 6",
          quiz: [
            choice(
              "Why is a column shuffled rather than overwritten with zeros or with fresh noise?",
              [
                "A permutation preserves the column's observed marginal values while disrupting their pairing with the target and other inputs",
                "Overwriting would change how many rows there are to score",
                "A shuffle is cheaper than generating replacement values",
                "A shuffle leaves the other columns’ correlations with this one intact",
              ],
              0,
              "Replacing a column with zeros or fresh noise changes its marginal values as well as its relationships. Permutation preserves the observed value multiset but changes which row receives each value, disrupting associations with both the target and other columns. The score change is specific to that perturbation. With correlated inputs, the shuffled combinations may be implausible, which matters when interpreting the result.",
            ),
            trueFalse(
              "A negative drop is clamped to zero on each of the five shuffles, before they are averaged.",
              false,
              "The clamp comes after the average. The five drops are five estimates of one number, so a negative one should be allowed to cancel a positive one, and clamping each draw instead would push a useless column’s score upward. That also means a share of exactly zero can hide a drop of exactly nothing or a drop below nothing, which only the raw drops distinguish.",
            ),
            choice(
              "The lone parity tree scores 0.537 on its own rows and 0.497 held out. Its ledger gives the noise column 0.807 and the scramble gives it 0.710. What follows?",
              [
                "The scramble has seen through a column that fooled the ledger",
                "Both readings name the noise column and both are right, because that tree genuinely relies on it",
                "The scramble cannot be trusted on a model that is at chance",
                "The two measures always agree on a tree grown until its leaves are pure",
              ],
              1,
              "The fitted tree uses the distractor, so shuffling it changes that model's training predictions. That is model reliance, not evidence that the distractor predicts the population label. Its near-chance held-out accuracy is essential context. Importance measurements can disagree even for weak models, but interpreting any ranking requires checking whether the model performs usefully on the evaluation rows.",
            ),
            several(
              "Height is read a second time with a little measurement error, correlated with the first reading at 0.996. Which of these were measured on the drawn crowd?",
              [
                "The forest’s ledger puts the twin ahead of height, 0.510 to 0.257",
                "Weight’s ledger share falls from 0.521 to 0.233 although weight did not change",
                "Scrambling the twin held out costs the forest more than scrambling height cost when height stood by itself",
                "The twin’s share rises because it carries information the first reading of height does not",
              ],
              [0, 1],
              "The second height reading is generated from the first plus noise, so it adds no new label information conditional on the original height in this setup. A fitted forest can still rely more on one copy or assign it more split credit. The individual permutation drops are 0.148 and 0.184 with both copies present, versus 0.360 for height in the model without the copy. Their sum is not a joint-permutation measurement; correlated features require care when attributing group reliance.",
            ),
            trueFalse(
              "Fitted on weight and nothing else, the forest predicts adulthood at 0.760 held out and every reading gives weight a share of one, and nothing in that report says weight has any role in who is an adult.",
              true,
              "The rule that assigns adult reads height alone, and weight follows the label only through overall body size, so the model relies on a proxy and reliance is what the scramble measures. Offer height beside weight and the same forest’s held-out share for weight falls to 0.043, from a drop of 0.016. No importance measure establishes causation, which is why a report of shares has to say which question it answered, for which model and on which rows, as the one forest’s 0.107, 0.084 and 0.000 for the ticket show.",
            ),
        ],
        },
        {
          title: "Part 7. Recording How Feature Credit Was Measured" , id: "part-7-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="27. Specify the scoring experiment before comparing importance" id="27-what-a-complete-implementation-states">
                <>
<p>To compare split-based importance reports, first check what earned the credit. Here a split contributes its gain multiplied by the number of rows that reached it. The impurity measure matters, as does whether stand-in splits receive credit as they did in the 1984 treatment.</p>
                <p>A forest can average member shares or add the underlying credits before normalizing. Those procedures need not agree. Every fitted feature should still appear in the report, including a feature that earned zero credit.</p>
                <p>Permutation importance describes an experiment, so its report needs the score, rows, repeat count and random seed. The selected column is shuffled among those rows; it is not replaced with invented values. In this implementation, negative credit is clamped after averaging the repeated score changes.</p>
                <p>Check whether each forest member uses its own out-of-bag rows, and what happens if shuffling no column lowers the score. Both importance reports expose their raw quantities beside shares normalized to sum to one, so the share can be traced back to what was measured.</p>
</>
              </SubSection>

              <SubSection title="28. Unused features, invalid permutations and undefined scores" id="28-the-edges-tried-rather-than-remembered">
                <p>The table records the SDK’s responses to these cases, including the named error when a report cannot be computed. Accepted output still needs its raw values and evaluation context to be interpreted correctly.</p>
                <DerivationTable
                  expressionHeading="Data or permutation condition"
                  reasonHeading="Effect on the importance estimate"
                  rows={[
                    { expression: "a feature of no values", reason: "refused at the boundary, before any model sees it, since a feature must not be empty." },
                    { expression: "one row", reason: "refused by the classifier, because one row holds one class and there is nothing to discriminate between." },
                    { expression: "one class only", reason: "refused for the same reason and in the same words." },
                    { expression: "a non-finite value", reason: "refused at the boundary; a feature must contain only finite values." },
                    { expression: "every column constant, then the split reading", reason: "the tree grows no split and the reading is refused, since no feature earned anything and there are no shares to report." },
                    { expression: "one constant column beside two real ones", reason: "accepted; the constant column wins no split and its share is exactly 0.0." },
                    { expression: "every column constant, then the scramble", reason: "refused with the same words; a model that never consulted a column cannot lose anything by its scramble." },
                    { expression: "a scramble of zero repeats", reason: "refused at construction, before any data is seen, since the repeat count must be at least one." },
                    { expression: "either reading before fit", reason: "refused by name as not yet fitted, from the tree's own guard, before any private state is touched." },
                    { expression: "a scramble with a column renamed", reason: "refused; the fit expected height and weight and was handed stature and weight." },
                    { expression: "a scramble with the columns reordered", reason: "accepted, matched by name, and the shares come back in the order handed." },
                    { expression: "a share asked for by a name the fit never saw", reason: "refused, naming the known features." },
                    { expression: "two columns of one name", reason: "refused at the fit, since feature names must be unique." },
                    { expression: "more features per split than there are features", reason: "accepted; every split is offered every column, which is bagging, and the shares are reported as usual." },
                    { expression: "a committee whose members have no splits to read", reason: "refused; a bagged ridge model cannot report impurity shares and is told to use the scramble instead." },
                    { expression: "a forest member that grew no split", reason: "the refusal underneath speaks about one member; this page checks first and refuses in a sentence about the draw, which four of one hundred and eighty draws needed." },
                    { expression: "a negative drop", reason: "clamped to zero after averaging, following this SDK’s nonnegative reporting convention. The raw drop remains available because a negative estimate differs from an exactly zero effect." },
                    { expression: "a border of tie-breaking between correlated columns", reason: "the available data, candidate features and tie rules affect which column receives each split’s credit. Small perturbations can change their individual shares even when the shared information remains useful." },
                  ]}
                />
                <p>If all raw contributions are zero after this reporting rule, they cannot be normalized into shares summing to one. The SDK raises an error explaining that condition. This does not always mean the model ignored every column: effects can be absent under the chosen score or negative and then clamped. The ticket-only forest in section 17 demonstrates that distinction.</p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Practice. Asking a Fitted Model Both Questions With the Library",
          practice: [
            exercise("Read the ledger off the tangled crowd’s tree",["Fit an unrestricted DecisionTreeClassifier to the twenty-five people below. Print the fitted leaf count, split count and depth, followed by each feature_importances share to four decimal places.", "Compare each share with the sample-weighted impurity reductions calculated earlier. A feature receives credit for splits this fitted tree used; the shares do not establish the feature's intrinsic usefulness or causal effect."],`from oop_ml import DecisionTreeClassifier, Feature

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]
crowd = [Feature("height", heights), Feature("weight", weights)]
label = Feature("is_adult", is_adult)

tree = DecisionTreeClassifier().fit(crowd, label)
# Print how many splits the tree grew, from the leaf count its root reports,
# then each column's share of the split reading to four places.`,`from oop_ml import DecisionTreeClassifier, Feature

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]
crowd = [Feature("height", heights), Feature("weight", weights)]
label = Feature("is_adult", is_adult)

tree = DecisionTreeClassifier().fit(crowd, label)
leaves = tree.root.n_leaves
print(f"{leaves - 1} splits to {leaves} pure leaves, depth {tree.root.depth}")
for share in tree.feature_importances:
    print(f"{share.name} {share.value:.4f}")`,`8 splits to 9 pure leaves, depth 5
height 0.7774
weight 0.2226`,{...{ hints: ["The split reading is a property of the fitted tree, feature_importances, and it is iterable, one entry per column with a name and a value.", "A share can also be read by name, as tree.feature_importances[\"height\"]. Every column the tree was fitted on is present, at zero if it never won a split.", "The root is tree.root, and a node reports its depth and the number of leaves beneath it as depth and n_leaves."], check: numberCheck("What share does the split reading give height, to four places?", 0.7774, 0.0005, "This share is the tree's height-credit total divided by all credited impurity reduction. It records how that fitted tree used height while growing, rather than an intrinsic importance of height.") },question:"How much of this tree's impurity reduction is credited to each feature?"}),
            exercise("Grow the seed-7 forest beside it",["Fit two twenty-five-member RandomForestClassifier models under seed 7: one with max_features=1 and one with max_features=2. With both inputs offered at every split, the latter uses the same full-feature search as bagged trees under matching settings.", "Print the two importance shares for each ensemble beside the single tree's shares. Also print both out-of-bag accuracies. Compare changes in feature credit with changes in predictive performance."],`from oop_ml import DecisionTreeClassifier, Feature, RandomForestClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]
crowd = [Feature("height", heights), Feature("weight", weights)]
label = Feature("is_adult", is_adult)

tree = DecisionTreeClassifier().fit(crowd, label)
# Grow the forest, 25 members offered one column per split under seed 7,
# and the bagged committee, the same but offered both columns. Print the
# height and weight shares of all three models to four places, and each
# committee's out-of-bag accuracy to two.`,`from oop_ml import DecisionTreeClassifier, Feature, RandomForestClassifier

heights = [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145,
           151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143]
weights = [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55,
           45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50]
is_adult = [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0]
crowd = [Feature("height", heights), Feature("weight", weights)]
label = Feature("is_adult", is_adult)

tree = DecisionTreeClassifier().fit(crowd, label)
forest = RandomForestClassifier(n_members=25, max_features=1, random_seed=7).fit(crowd, label)
bagged = RandomForestClassifier(n_members=25, max_features=2, random_seed=7).fit(crowd, label)

for name, model in [("lone tree", tree), ("forest", forest), ("bagged", bagged)]:
    shares = model.feature_importances
    print(f"{name}: height {shares['height']:.4f}, weight {shares['weight']:.4f}")
print(f"forest out of bag {forest.out_of_bag_score():.2f}")
print(f"bagged out of bag {bagged.out_of_bag_score():.2f}")`,`lone tree: height 0.7774, weight 0.2226
forest: height 0.5271, weight 0.4729
bagged: height 0.7111, weight 0.2889
forest out of bag 0.52
bagged out of bag 0.64`,{...{ hints: ["A committee is configured at construction, with n_members, max_features and random_seed, and fitted exactly as the tree is.", "max_features is how many columns a split is offered. With two columns, 1 is the lottery and 2 offers every column at every split, which is bagging.", "out_of_bag_score takes no arguments. It scores each person by the members whose resample left that person out, so it is a held-out score that cost no held-out rows."], check: numberCheck("What share does the bagged committee’s split reading give height, to four places?", 0.7111, 0.0005, "Restricting the available features changes which splits the trees can choose and therefore where their impurity credit goes. Compare that credit with predictive performance before treating the more even shares as an improvement.") },question:"Does restricting the available features change the forest's importance scores?"}),
            exercise("Ask the parity puzzle both questions",["Use the starter's seeded parity data: two binary coin columns, a standard-normal distractor, and class 1 when the coins differ. Fit the depth-three tree and twenty-member depth-three forest with one candidate feature per split. Print their training accuracies and impurity importances.", "Measure the forest with PermutationImportance(n_repeats=5, random_seed=0) on those same training rows. Print its normalized shares to four decimal places. Compare which features receive split credit with which features the fitted predictions depend on under shuffling."],`import numpy as np
from oop_ml import DecisionTreeClassifier, Feature, PermutationImportance, RandomForestClassifier

generator = np.random.default_rng(4)
first = generator.integers(0, 2, size=300).astype(float)
second = generator.integers(0, 2, size=300).astype(float)
noise = generator.normal(size=300)
puzzle = [Feature("first", first), Feature("second", second), Feature("distractor", noise)]
parity = Feature("parity", (first != second).astype(float))

tree = DecisionTreeClassifier(max_depth=3).fit(puzzle, parity)
forest = RandomForestClassifier(n_members=20, max_features=1, max_depth=3, random_seed=0).fit(puzzle, parity)
# Print both models' accuracy on these rows and the split reading of each,
# then the forest's scramble on these same rows, five repeats under seed 0.`,`import numpy as np
from oop_ml import DecisionTreeClassifier, Feature, PermutationImportance, RandomForestClassifier

generator = np.random.default_rng(4)
first = generator.integers(0, 2, size=300).astype(float)
second = generator.integers(0, 2, size=300).astype(float)
noise = generator.normal(size=300)
puzzle = [Feature("first", first), Feature("second", second), Feature("distractor", noise)]
parity = Feature("parity", (first != second).astype(float))

tree = DecisionTreeClassifier(max_depth=3).fit(puzzle, parity)
forest = RandomForestClassifier(n_members=20, max_features=1, max_depth=3, random_seed=0).fit(puzzle, parity)

for name, model in [("lone tree", tree), ("forest", forest)]:
    print(f"{name}: accuracy {model.score(puzzle, parity):.3f}")
    for share in model.feature_importances:
        print(f"  ledger {share.name} {share.value:.4f}")

scramble = PermutationImportance(n_repeats=5, random_seed=0)
for share in scramble.measure(forest, puzzle, parity):
    print(f"forest scramble {share.name} {share.value:.4f}")`,`lone tree: accuracy 0.537
  ledger first 0.0000
  ledger second 0.1929
  ledger distractor 0.8071
forest: accuracy 0.993
  ledger first 0.2018
  ledger second 0.2796
  ledger distractor 0.5187
forest scramble first 0.4790
forest scramble second 0.5035
forest scramble distractor 0.0175`,{...{ hints: ["score takes the columns and the target and answers the accuracy as a float. max_depth=3 is enough for parity, which takes two questions, and far short of memorizing three hundred rows.", "feature_importances is the split reading on a tree and on a forest alike. The forest averages its members’ shares, so the noise column keeps credit that every member’s search gave it.", "PermutationImportance is configured with n_repeats and random_seed, and its measure method takes the fitted model, the columns and the target. It refits nothing, and the model and rows it is handed are what decide the reading."], check: numberCheck("What share does the scramble on the forest’s own rows give the noise column, to four places?", 0.0175, 0.0005, "The fitted forest depends strongly on the two coin columns even though the noise column received substantial split credit. Shuffling asks about prediction dependence, while the ledger asks about credited training splits.") },question:"Can a feature earn split credit without helping the model's predictions?"}),
            exercise("Scramble the rows the models never saw",["Use draw to generate the training rows and then three hundred held-out rows from the same generator. Fit both models on training rows only. Print each held-out accuracy, then measure permutation importance using the held-out inputs and labels.", "Print each returned share to four decimal places. Compare the shares with the model's accuracy: normalizing a tiny accidental score change can give a large relative share even when the model predicts poorly."],`import numpy as np
from oop_ml import DecisionTreeClassifier, Feature, PermutationImportance, RandomForestClassifier

generator = np.random.default_rng(4)

def draw(n_rows):
    first = generator.integers(0, 2, size=n_rows).astype(float)
    second = generator.integers(0, 2, size=n_rows).astype(float)
    noise = generator.normal(size=n_rows)
    columns = [Feature("first", first), Feature("second", second), Feature("distractor", noise)]
    return columns, Feature("parity", (first != second).astype(float))

puzzle, parity = draw(300)
held_out, held_out_parity = draw(300)
tree = DecisionTreeClassifier(max_depth=3).fit(puzzle, parity)
forest = RandomForestClassifier(n_members=20, max_features=1, max_depth=3, random_seed=0).fit(puzzle, parity)
# Score both models on the held-out rows, then scramble each on those rows,
# five repeats under seed 0, and print every share to four places.`,`import numpy as np
from oop_ml import DecisionTreeClassifier, Feature, PermutationImportance, RandomForestClassifier

generator = np.random.default_rng(4)

def draw(n_rows):
    first = generator.integers(0, 2, size=n_rows).astype(float)
    second = generator.integers(0, 2, size=n_rows).astype(float)
    noise = generator.normal(size=n_rows)
    columns = [Feature("first", first), Feature("second", second), Feature("distractor", noise)]
    return columns, Feature("parity", (first != second).astype(float))

puzzle, parity = draw(300)
held_out, held_out_parity = draw(300)
tree = DecisionTreeClassifier(max_depth=3).fit(puzzle, parity)
forest = RandomForestClassifier(n_members=20, max_features=1, max_depth=3, random_seed=0).fit(puzzle, parity)

scramble = PermutationImportance(n_repeats=5, random_seed=0)
for name, model in [("lone tree", tree), ("forest", forest)]:
    print(f"{name}: held-out accuracy {model.score(held_out, held_out_parity):.3f}")
    for share in scramble.measure(model, held_out, held_out_parity):
        print(f"  {share.name} {share.value:.4f}")`,`lone tree: held-out accuracy 0.497
  first 0.0000
  second 0.0000
  distractor 1.0000
forest: held-out accuracy 0.960
  first 0.5102
  second 0.4898
  distractor 0.0000`,{...{ hints: ["The held-out rows come from the same generator object after the training rows, so the two draws have to happen in that order and from one generator.", "score and measure both take the held-out columns and the held-out target. Neither refits the model; only the rows it is asked about change.", "A share of exactly 0.0000 or 1.0000 is the clamp at work. The library reports the clamped shares only, so a drop below nothing and a drop of exactly nothing both come back as zero."], check: numberCheck("What held-out share does the scramble give the first coin on the forest, to four places?", 0.5102, 0.0005, "A held-out score drop is noisy, and this implementation clamps a negative mean drop to zero before normalizing shares. A weak model can assign a large relative share to a tiny accidental drop, so inspect the score and unnormalized drops too.") },question:"How do the same fitted models' importance measurements change on held-out parity rows?"}),
          ],
        },
      ]}
    />
  );
}
