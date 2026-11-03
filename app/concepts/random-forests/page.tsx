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
import { BoundaryDisagreement } from "@/components/widgets/BoundaryDisagreement";
import { CommitteeScrubber } from "@/components/widgets/CommitteeScrubber";
import { DivergingGrowth } from "@/components/widgets/DivergingGrowth";
import { DiversityDashboard } from "@/components/widgets/DiversityDashboard";
import { FeatureLottery } from "@/components/widgets/FeatureLottery";
import { SameSampleTrees } from "@/components/widgets/SameSampleTrees";
import { SeedComparison } from "@/components/widgets/SeedComparison";
import { SplitCompetition } from "@/components/widgets/SplitCompetition";
import { StrengthCorrelationSweep } from "@/components/widgets/StrengthCorrelationSweep";
import { TradeCalculator } from "@/components/widgets/TradeCalculator";
import { VarianceFloorChart } from "@/components/widgets/VarianceFloorChart";

export const metadata: Metadata = {
  title: "Random Forests · Perceptron Lab",
  description:
    "Combining trees helps when their errors differ. Random forests vary both the sampled observations and the features available at a split, encouraging different trees to contribute different information.",
};

const link = "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RandomForestsPage() {
  return (
    <ConceptPage
      lessonId="random-forests"
      intuition={lessonIntuitions["random-forests"]}
      technicalStart="Part 2. The One Rule Random Forests Change"
      openingTitle="A Crowd That Keeps Making the Same Mistake"
      playgroundTitle="What do differently grown trees agree on?"
      playgroundIntro="Compare the questions and predictions of individual trees. Change how many features each split may consider and watch what happens to their agreement."
      title="Random Forests"
      tagline={"Combining trees helps when their errors differ. Random forests vary both the sampled observations and the features available at a split, encouraging different trees to contribute different information."}
      prerequisites={
        <>
          This page changes one rule of{" "}
          <Link href="/concepts/bagging" className={link}>
            bagging
          </Link>
          . Its worked example shows why resampling alone can leave trees
          making similar mistakes. For the out-of-bag score used here, the{" "}
          <Link href="/concepts/bagging" className={link}>
            bagging page
          </Link>{" "}
          covers how it is built and what it can and cannot say.
        </>
      }

      playground={<CommitteeScrubber maxFeatures={1} />}
      sections={[
        {
          title: "Part 1. The Limit Bagging Leaves Behind",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. The similarity left behind by bagging">
                <p>Bagging trained trees on different resampled crowds and combined their answers. Their boundaries varied, but they still often chose the same first measurement: height. Different training rows did not remove every similarity between the members.</p>
              <p>In the saved tangled-crowd run, 20 of 25 trees begin with height. On people that neither member saw in training, pairs agree on 72.4 percent of labels. Random forests add another source of variation by restricting which features a split can consider. Let&apos;s see how that changes the questions before judging the final vote.</p>
                <NumberTable
                  headings={["the bagged committee, 25 trees", "reading"]}
                  rows={[
                    ["trees opening on height, on weight", "20, 5"],
                    ["pairwise prediction agreement, out of bag", "0.724"],
                    ["training accuracy", "0.960"],
                    ["out-of-bag accuracy", "0.640"],
                  ]}
                  caption="The census and agreement are read from the same fitted committee, seed 7, the one the bagging page ended on."
                />
                <KeepInMind>
                  Bootstrap resampling creates diversity, and bagged trees
                  can still remain strongly related. That is the gap this
                  page is about, not a failure of bagging.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Why strong features dominate">
                <p>
                  At the root, each tree compares the best available height split with the best weight split. It chooses the one with the larger impurity reduction on its sample. Resampling changes both gains, but the same feature can keep winning if its advantage is large. That helps explain why many of these trees still begin with height.
                </p>
                <SplitCompetition />
                <p>

                  Eight resamples, eight different boards, and height takes
                  the root on five of them, usually at the same threshold of
                  147.5 centimeters. On the full committee it is 20 of 25.
                  The samples vary the rows, and a feature that is
                  consistently the strongest keeps winning anyway, so
                  resampling alone cannot stop most trees from asking the
                  same first question.
                </p>
              </SubSection>

              <SubSection title="3. Structural similarity versus error correlation">
                <p>
                  When we say two trees are similar, we might mean their first split, their predictions, or their errors. The following comparison separates those meanings. Agreement on a root feature alone does not tell us how much their mistakes overlap.
                </p>
                <DerivationTable
                  expressionHeading="the idea"
                  reasonHeading="what it measures"
                  rows={[
                    { expression: "structural similarity", reason: "the trees ask similar questions, the same features at similar thresholds. The root census is a count of this." },
                    { expression: "prediction agreement", reason: "the trees give the same answer at the same input, whether or not it is right. Measured from the predictions." },
                    { expression: "error correlation", reason: "the trees tend to be wrong on the same people. Measured from the predictions and the truth together." },
                  ]}
                />
                <p>These measurements describe different properties. Trees with different root features can make similar predictions, while trees beginning with the same feature can disagree later. Here twenty of twenty-five roots use height. Prediction agreement is 0.724 and error correlation is 0.463, averaged over eligible member pairs using observations that both omitted.</p>
                <KeepInMind>
                  Different-looking trees are useful only when their
                  prediction errors also become less shared. Every claim on
                  this page about diversity is checked against the
                  predictions, not the shape of the trees.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. The One Rule Random Forests Change",
          content: (
            <>
              <SubSection title="4. How an ordinary tree chooses a split">
                <p>
                  At one node an ordinary tree lays out every feature it has,
                  generates the candidate thresholds for each, scores every
                  candidate by the impurity it would remove, and takes the
                  best of the whole board. On the tangled crowd the root
                  board has two rows.
                </p>
                <NumberTable
                  headings={["feature", "its best question", "gain"]}
                  rows={[
                    ["height", "height < 147.5", "0.1881"],
                    ["weight", "weight < 41.5", "0.1030"],
                  ]}
                  caption="The full candidate board at the root of the tangled crowd, scored by the same split search the decision-tree page walked through."
                />
                <p>
                  The ordinary tree sees both rows and picks height, and it
                  would pick height at this node every time, because the
                  board does not change when nothing about the rows changes.
                </p>
              </SubSection>

              <SubSection title="5. Randomly Selecting Candidate Features" id="5-the-random-feature-lottery">
                <p>At each node, randomly choose a subset of the features. Search for the best split using only that subset. The scoring rule is unchanged; the difference is that some candidate questions are unavailable on this particular draw.</p>
                <FeatureLottery />
                <p>With one of two features chosen uniformly at each node, weight alone has probability one half of being available. The node still searches for its best weight threshold; it simply cannot compare that split with a height split. The display uses a seeded generator to illustrate the sampling rule, rather than claiming to replay stored draws from a particular fitted tree.</p>
                <KeepInMind>
                  A random forest still chooses the best available split.
                  Randomness changes what is available, not how the choice
                  is made.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A new feature subset at every node">
                <p>
                  The subset is redrawn at every split, not chosen once for
                  the tree. The root gets a draw, then the left child gets
                  its own, then the right child, and so on down every branch
                  that is still eligible to split. A tree denied height at
                  the root can be offered it one level down and take it
                  there, and a tree that opened on height can be denied it
                  at the very next node.
                </p>
                <WorkedExample title="One forest tree on the tangled crowd">
                  <p>
                    Offered one feature per split under lottery seed 2, the
                    tree opens with weight less than 41.5, the question the
                    ordinary tree ranked second, and then makes eight more
                    splits under fresh draws, finishing at depth 6 with 10
                    leaves and a training accuracy of 0.88. Under seed 1 the
                    first draw happens to offer height, the tree opens
                    exactly as the ordinary one does, and reaches a training
                    accuracy of 1.0 in 8 splits. Both trees are grown and
                    stepped through in section 11.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  Each node receives its own random set of candidate
                  features, so the randomness compounds through the tree
                  rather than being decided once at the top.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The max_features setting">
                <p>
                  Write p for the number of features and m for how many each
                  split is offered. The setting goes by max_features in most
                  implementations and mtry in the original one.
                </p>
                <DerivationTable
                  expressionHeading="setting"
                  reasonHeading="what it means"
                  rows={[
                    { expression: "m = p", reason: "every split sees every feature. This is ordinary bagging, exactly." },
                    { expression: "smaller m", reason: "more restriction at every split, and more chance the strongest question is withheld." },
                    { expression: "m = 1", reason: "each node receives one randomly selected feature and compares its eligible thresholds. It cannot compare different features at that node." },
                  ]}
                />
                <p>This dataset has two features. Offering one per node gives the restricted comparison, while offering both gives bagging under the matching settings. The scrubber at the top uses one feature per split and compares committees from one to twenty-five members.</p>
                <KeepInMind>
                  The feature-subset size controls how much choice each tree
                  node retains. It is the one setting that makes a forest a
                  forest.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. How Random Features Create Diversity",
          content: (
            <>
              <SubSection title="8. Same bootstrap sample, different feature permissions">
                <p>
                  The cleanest way to see what the lottery does is to take
                  the bootstrap out of the picture. Hold one resample fixed,
                  grow several trees on exactly those rows, and vary only the
                  seed of the feature lottery. Whatever differs between the
                  trees was caused by the permissions and by nothing else.
                </p>
                <SameSampleTrees />
                <p>
                  The shared sample holds 18 distinct people and omits 7. A
                  tree offered both features roots on height. Under lottery
                  seed 1 the forest tree also roots on height, at 147.5, and
                  finishes at depth 4 with 7 leaves; under seeds 2, 3 and 4
                  it roots on weight less than 41.5 and grows deeper. The
                  first two trees agree on 88 percent of the crowd, 22 of the
                  25 people, from identical training rows.
                </p>
                <KeepInMind>
                  Random feature selection can produce different trees even
                  when their training observations are identical.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Bagging and random forests under controlled conditions">
                <p>
                  Now the whole comparison, with everything held fixed that
                  can be. Same crowd, same seed, so the same 25 bootstrap
                  samples in the same order, same tree settings. Bagging
                  offers every split both features; the forest offers one.
                </p>
                <DiversityDashboard />
                <p>
                  Read the two columns against each other. The roots spread
                  from 20 and 5 to 8 and 17, which is structural diversity
                  and the easy part. The prediction agreement barely moves,
                  0.724 against 0.731, and the error correlation goes the
                  wrong way, 0.463 against 0.517. The members got weaker,
                  from a mean out-of-bag strength of 0.641 to 0.572, and the
                  committee&rsquo;s own out-of-bag score fell from 0.64 to
                  0.52. On this crowd, under this seed, the lottery
                  rearranged the trees without making their mistakes less
                  shared, and paid for it in strength.
                </p>
                <KeepInMind>
                  The difference between bagging and a random forest is the
                  additional feature lottery during tree growth, and nothing
                  else. Whatever the dashboard shows is that lottery&rsquo;s
                  doing.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Reading the root-feature census">
                <p>The root counts tell us which features supplied the first question and whether the restriction changed that distribution. They do not measure shared errors or predictive accuracy. In the dashboard above, the root counts changed substantially while prediction agreement barely changed. We need both measurements to understand what the restriction achieved.</p>
                <WhyThisWorks title="Why a spread census can leave the predictions alone">
                  <p>A feature withheld at the root can become available at a later node. That later split is chosen using only the observations reaching that node, so its best threshold may differ from the full-data root threshold. Trees can nevertheless reach similar partitions through different sequences of questions.</p>
                </WhyThisWorks>
                <KeepInMind>
                  The root census shows one source of tree diversity.
                  Predictive diversity has to be measured from the
                  trees&rsquo; outputs.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. How early split differences compound">
                <p>
                  When a different root does matter, it matters because of
                  what follows it. The first split decides which people reach
                  each child, and every later node searches only the rows it
                  was sent, so a different first question changes every
                  board below it. The two trees here are the seed 1 and seed
                  2 trees from section 6, grown on the whole crowd with one
                  feature per split, stepped in lockstep.
                </p>
                <DivergingGrowth seeds={[1, 2]} />
                <p>

                  Tree A opens on height and finishes at 8 splits and 9
                  leaves. Tree B opens on weight and needs 9 splits and 10
                  leaves to reach a worse fit. The strongly colored cells
                  are where the two partitions disagree at each step, and
                  they appear from the first split and never fully close.
                </p>
                <KeepInMind>
                  A different early split changes the smaller datasets seen
                  by every descendant node, so tree structures can diverge
                  quickly from one different decision.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The Strength-Correlation Trade",
          content: (
            <>
              <SubSection title="12. Individual-tree strength">
                <p>Here, a member’s strength means its accuracy on observations it did not train on. Each tree already has such observations: those omitted by its bootstrap sample. The dashboard uses that tree’s own out-of-bag rows to estimate its strength.</p>
                <NumberTable
                  headings={["25 members, seed 7", "bagging", "random forest"]}
                  rows={[
                    ["mean member strength", "0.641", "0.572"],
                    ["weakest member", "0.43", "0.33"],
                    ["strongest member", "0.88", "0.75"],
                  ]}
                  caption="Each member scored on the rows its own sample omitted, between 7 and 12 people per member."
                />
                <p>

                  Restriction may weaken a tree for three reasons. Its
                  strongest feature may be unavailable at a node, it may take
                  a weaker split there, and it may need more questions to
                  recover a pattern one question would have captured. It is
                  not guaranteed to weaken a tree, since an alternative
                  feature can sometimes generalize better than the one the
                  training rows preferred, which is why the number is
                  measured. Here it fell by 0.07.
                </p>
              </SubSection>

              <SubSection title="13. Prediction agreement and error correlation">
                <p>
                  Take any two members and the people both of them left out.
                  Each person lands in one of four cells, both trees right,
                  only the first right, only the second right, both wrong.
                  Agreement is the share in the two cells where the trees
                  said the same thing, and error correlation is the ordinary
                  correlation between the two columns of right-or-wrong
                  indicators, which is high when the both-wrong cell is
                  fuller than the two trees&rsquo; separate error rates would
                  predict.
                </p>
                <DerivationTable
                  expressionHeading="quantity"
                  reasonHeading="from the four cells"
                  rows={[
                    { expression: "prediction agreement", reason: "the share of shared people on whom the two trees give the same answer, right or wrong." },
                    { expression: "joint error count", reason: "the both-wrong cell on its own." },
                    { expression: "error correlation", reason: "the correlation of the two error indicators over shared observations. It is undefined when there are no shared observations or either indicator is constant, whether always correct or always wrong." },
                  ]}
                />
                <p>
                  The dashboard averages both over every pair that has a
                  defined value. On this crowd the forest&rsquo;s error
                  correlation is 0.517 against bagging&rsquo;s 0.463, so the
                  lottery did not buy the thing it was meant to buy.
                </p>
                <KeepInMind>
                  The committee benefits most when individual mistakes are
                  not consistently shared. A vote can only cancel a mistake
                  that some members did not make.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. The strength-correlation trade">
                <p>Feature restriction can reduce similarity between trees, but it can also make their individual predictions worse. Whether the committee improves depends on both effects together. That is a result to evaluate on the problem, rather than a guaranteed benefit of randomization.</p>
                <DerivationTable
                  expressionHeading="the trade succeeds when"
                  reasonHeading="and fails when"
                  rows={[
                    { expression: "the alternative features still carry useful signal", reason: "the withheld feature is much stronger than anything left on the board" },
                    { expression: "restriction produces meaningfully different errors", reason: "the trees get weaker without their errors becoming less shared" },
                    { expression: "the vote cancels enough of those differing errors", reason: "the remaining features carry little information at all" },
                  ]}
                />
                <KeepInMind>
                  Random forests improve on bagging only when the added
                  diversity compensates for any loss of individual-tree
                  quality. Neither half of that sentence is automatic.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Measuring the trade">
                <p>
                  On two features the sweep over m has two points, and they
                  are the two columns of the dashboard. Everything the trade
                  involves is in one table.
                </p>
                <NumberTable
                  headings={["m", "mean member strength", "error correlation", "committee out of bag", "roots on height"]}
                  rows={[
                    ["1", "0.572", "0.517", "0.52", "8 of 25"],
                    ["2, which is bagging", "0.641", "0.463", "0.64", "20 of 25"],
                  ]}
                  caption="The tangled crowd, 25 members, seed 7. The out-of-bag score is the only column that says whether the trade paid."
                />
                <p>
                  Section 19 runs the same sweep on data with six features,
                  where m has room to move and the answer changes with the
                  data.
                </p>
                <KeepInMind>
                  The useful feature-subset size balances member quality with
                  diversity, and where the balance lands is read off the
                  evaluation, not off the census.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 4",
          quiz: [
            trueFalse(
              "Resampling alone still left 20 of the 25 bagged trees opening with a question about height.",
              true,
              "At the root two candidates compete and the tree takes whichever earns the larger impurity reduction on the rows it was given. Changing the rows changes both gains, and a feature that is consistently the strongest keeps winning anyway. Across every pair of bagged members the two agreed on 72.4 percent of the people neither had seen, at an error correlation of 0.463.",
            ),
            choice(
              "What exactly does a random forest change about how a tree grows?",
              [
                "It draws a random subset of the features before each search, so the tree picks the best of a smaller board",
                "It scores the candidate splits differently, favoring features that earlier splits did not use",
                "It grows each tree on a random subset of the features chosen once at the start",
                "It replaces the impurity reduction with a random tie-break among the top candidates",
              ],
              0,
              "The split score is unchanged. At each eligible node, the forest samples a subset of input columns and searches only their candidate thresholds. With two inputs and max_features=1, each input has probability one half of being offered. Setting max_features=2 instead makes both available.",
            ),
            trueFalse(
              "The feature subset is drawn once for a tree and used at every node of it.",
              false,
              "It is redrawn at every split. The root gets a draw, then the left child gets its own, then the right child, and so on down every branch still eligible to split, so the randomness compounds through the tree. A tree denied height at the root can be offered it one level down and take the same 147.5 threshold the ordinary tree would have taken first.",
            ),
            choice(
              "One resample is held fixed and only the lottery seed is varied. What came out?",
              [
                "Seed 1 roots on height at 147.5 and finishes at depth 4 with 7 leaves, while seeds 2, 3 and 4 root on weight less than 41.5 and grow deeper",
                "All four seeds produced the same tree, since the training rows were identical",
                "The four trees differed in their thresholds but all rooted on height",
                "The trees differed only below the root, since the first draw always offers every feature",
              ],
              0,
              "The observations and labels are fixed, so these differences come from the feature-sampling sequence. With height unavailable at the root, the tree uses the best available weight split, sending different subsets to later nodes. The resulting trees agree on twenty-two of the twenty-five training people despite their different branches.",
            ),
            several(
              "Bagging and the forest are run on the same crowd under the same seed. Which of these did the lottery do?",
              [
                "Spread the roots from 20 and 5 to 8 and 17",
                "Left the prediction agreement almost where it was, 0.724 against 0.731",
                "Lowered the error correlation, which is the thing the restriction is for",
                "Lowered the mean out-of-bag strength of a member from 0.641 to 0.572",
              ],
              [0, 1, 3],
              "Root feature counts change, but the measured error correlation rises from 0.463 to 0.517 and mean per-tree out-of-bag accuracy falls from 0.641 to 0.572. The forest's out-of-bag accuracy also falls from 0.64 to 0.52. More balanced root counts alone do not show that tree errors became less correlated or that predictions improved.",
            ),
        ],
        },
        {
          title: "Part 5. The Two-Feature Teaching Example",
          content: (
            <>
              <SubSection title="16. Why two features make the restriction severe">
                <>
<p>With only height and weight, selecting one feature removes half the available feature choices. On the full dataset, the best height split has gain 0.188 and the best weight split has gain 0.103. A node offered weight alone searches its weight thresholds but cannot compare them with the stronger height split.</p>
                <p>
                  Section 5&rsquo;s lottery counts how often the strongest feature was denied, and at m = 1 it was withheld in 8 of the 12 draws shown, about what a coin should manage.
                </p>
</>
                <KeepInMind>
                  One-feature subsets strongly restrict a two-feature problem. A larger input table may provide useful alternatives when a feature is withheld, but additional irrelevant columns do not help. The six-feature examples below compare different distributions of predictive information.</KeepInMind>
              </SubSection>

              <SubSection title="17. Reading the teaching example">
                <p>
                  The census and the scores are both worth reading for what
                  they support and no further.
                </p>
                <NumberTable
                  headings={["seed 7, 25 members", "bagging", "random forest"]}
                  rows={[
                    ["trees opening on height", "20 of 25", "8 of 25"],
                    ["trees opening on weight", "5 of 25", "17 of 25"],
                    ["out-of-bag accuracy", "0.64", "0.52"],
                  ]}
                />
                <>
<p>
                  The forest&rsquo;s roots are more evenly spread across the two features, and that much is directly supported. The particular 8 to 17 split is random variation under this run, not a finding that weight became the better predictor, since height was denied at half the roots by the coin rather than by the data. And under this dataset, this configuration, 25 trees and this random draw, the forest scored worse.
                </p>
                <p>
                  The restriction appears to have cost more strength than it recovered through lower correlation, and section 13 showed the correlation did not fall at all. What this one result does not establish is that bagging is generally better on two-feature problems, and 25 trees is few enough that a different seed could tell a different story.
                </p>
                <p>
                  So run the seeds.
                </p>
</>
              </SubSection>

              <SubSection title="18. Repeating the comparison across seeds">
                <SeedComparison />
                <p>Across these eight seeds, the forest beats bagging only for seed one, and the mean score difference favors bagging by 0.06. Bagging uses height at 16 to 23 roots; the forest uses it at 7 to 9. Repeating the fits shows that the earlier result was not isolated among these seeds. Eight runs still do not establish the ranking for every random draw or dataset.</p>
                <KeepInMind>

                  One forest&rsquo;s census is a random outcome. Repeated
                  runs reveal the behavior of the procedure, and the
                  teaching example shows that added randomness can hurt, not
                  that random forests fail on small feature sets in general.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Why Alternative Features Can Help the Forest",
          content: (
            <>
              <SubSection title="19. Sparse versus shared signal">
                <p>The next examples use 120 simulated observations with six measurements. In one setup, the label-generating rule depends on one feature and the remaining five add noise. In the other, all six contribute equally to the generating rule. This lets us compare restrictions when useful information is concentrated with restrictions when it is spread across the inputs.</p>
                <StrengthCorrelationSweep />
                <>
<p>
                  The same restriction does two different things. In the sparse world the members lose strength fast as m falls, from 0.932 at m = 6 to 0.757 at m = 1, because a node offered only noise columns asks a useless question. Their errors become far less shared at the same time, the correlation falling from 0.694 to 0.141, and the two effects cancel almost exactly, so the committee&rsquo;s score sits between 0.933 and 0.95 at every m and the restriction is close to free.
                </p>
                <p>
                  In the shared world no feature is much better than another, so restriction costs almost no strength, 0.68 to 0.69 at every m, while the correlation still falls, 0.205 to 0.117, and the committee gains, from 0.75 at m = 6 to 0.80 at m = 1 and 0.817 at m = 2.
                </p>
</>
                <>
<p>
                  Put the three measured cases side by side. On the tangled crowd the restriction cost 0.12. In the sparse world it cost nothing to speak of. In the shared world it gained 0.05 to 0.07. A fourth arrangement, three noisy copies of one feature beside three noise columns, was measured at 25 members and lost 0.06 at m = 1, which is the world the phrase redundant features usually brings to mind, and at a committee size section 18 has already shown to be unstable.
                </p>
                <p>These comparisons show why the available alternatives matter. They also show that member strength, error correlation and committee performance must be measured together. No single root count or input-table width determines the outcome.</p>
</>
                <KeepInMind>
                  The same amount of feature randomness can help when the
                  signal is spread across several features and can hurt when
                  it is concentrated in one, and which happens is a property
                  of the data, measured rather than assumed. Fewer offered
                  features does not automatically mean lower correlation,
                  and more randomness is not automatically better.
                </KeepInMind>
                <p>More features help only if the sampled subsets contain useful alternatives. A table with many irrelevant columns can make small subsets especially weak. The useful value of m depends on where predictive information is concentrated, how much the features overlap, and the data available to fit each tree. Compare candidate settings rather than choosing from the column count alone.</p>
              </SubSection>
            </>
          ),
        },
        { id: "part-7-visualising-the-committees-decision",
          title: "Part 7. Visualizing the Committee's Decision",
          content: (
            <>
              <SubSection title="20. Final class versus vote agreement">
                <p>
                  At every location each tree predicts a class, the votes are
                  counted, and the larger count is the answer. The winning
                  share is a separate number, and the scrubber at the top of
                  the page draws the two apart, the majority on the left and
                  how firmly the members agree on the right. Two cells can be
                  painted the same class with the forest nearly unanimous in
                  one and split 13 to 12 in the other, and the left map
                  cannot tell them apart.
                </p>
                <KeepInMind>
                  A forest&rsquo;s vote fraction measures committee
                  agreement. It is not automatically a calibrated
                  probability, and a 60 percent vote is not a claim that six
                  in ten such people are adults.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Comparing committee boundaries">
                <p>

                  The lottery changes individual trees, and through them the
                  committee&rsquo;s final regions. The map below is blank
                  wherever bagging and the forest agree and colored only
                  where they do not, in the forest&rsquo;s color, with the
                  probe reporting each committee&rsquo;s vote as a count of
                  members.
                </p>
                <BoundaryDisagreement />
                <KeepInMind>
                  Sampling features changes the individual trees and can change the ensemble&apos;s decision regions. Here most changes occur where the earlier votes were already close.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 8. Deriving the Variance Trade",
          content: (
            <>
              <SubSection title="22. The correlation-variance formula">
                <p>
                  The bagging page&rsquo;s formula is the right instrument
                  for thinking about this trade, with its assumptions stated.
                  Take B numeric predictions with a common variance σ², a
                  common pairwise correlation ρ, and equal weights in the
                  average. Then
                </p>
                <Equation>{"Var(committee) = ρσ² + (1 − ρ)·σ²/B"}</Equation>
                <KeepInMind>
                  This is a simplified explanatory model. For classification
                  it can be connected to averaged zero-and-one vote
                  indicators, and it is not an exact formula for the error of
                  a majority vote. It is used here to say which way things
                  push, not to predict a score.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The large-ensemble variance floor">
                <p>As B grows, the term divided by B approaches zero, leaving ρσ². In this simplified model, the remaining variance comes from variation shared by the members. Reducing their correlation can lower that limit, provided changes in their individual variance do not offset the benefit.</p>
                <VarianceFloorChart />
                <KeepInMind>
                  Increasing the number of trees approaches a
                  correlation-dependent floor rather than eliminating the
                  committee&rsquo;s variance.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. How feature restriction changes σ² and ρ">
                <p>Restricting features can affect both quantities. A tree denied a useful feature may become a less stable predictor, increasing σ². Different subsets can also make the trees’ predictions less similar, reducing ρ. Neither effect is guaranteed. At a finite B, compare the complete expression, because a decrease in one term can be outweighed by an increase in the other.</p>
                <KeepInMind>
                  Feature randomness changes both the individual variation
                  and the shared variation. Its net value depends on their
                  combination, and section 9 is what that combination looked
                  like on one crowd.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. A numerical strength-correlation example">
                <>
                  <p>
                    Compare three hypothetical committees of twenty-five trees. Each
                    calculation has a shared-error contribution that averaging cannot
                    remove and a remaining contribution divided by the committee size.
                  </p>
                  <Equation>{"bagging, σ² = 1.0 and ρ = 0.5:\n  variance = 0.5 + 0.5 / 25 = 0.52\n\nforest A, σ² = 1.2 and ρ = 0.25:\n  variance = 0.3 + 0.9 / 25 = 0.336\n\nforest B, σ² = 1.6 and ρ = 0.45:\n  variance = 0.72 + 0.88 / 25 = 0.7552"}</Equation>
                  <p>Forest A has lower ensemble variance because its correlation reduction outweighs the increase in member variance. Forest B has higher ensemble variance despite a small correlation reduction. These hypothetical calculations concern variance, rather than classification accuracy. Use the calculator to compare the combined effects.</p>
                </>
                <TradeCalculator />
                <KeepInMind>
                  Lower correlation is valuable only relative to the
                  accompanying change in member variance.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 to 8",
          quiz: [
            choice(
              "The same comparison is run across eight seeds. What does that add to the single run?",
              [
                "The forest beats bagging on one seed and the mean difference is 0.06 in bagging’s favor, so the single run was a fair sample of the procedure",
                "The forest wins on most seeds, so the single run was unlucky",
                "The two are indistinguishable once the seeds are averaged",
                "The census varies wildly across seeds, so no reading of it is safe",
              ],
              0,
              "Across these eight seeds, bagging uses height at sixteen to twenty-three roots; the forest uses it at seven to nine. The forest has higher out-of-bag accuracy on only one seed, and bagging leads by 0.06 on average. Repetition gives more evidence about this procedure's variability on this dataset, although eight runs do not establish a universal result.",
            ),
            several(
              "Two simulated worlds share 120 people and six measurements and differ only in where the signal lives. Which of these did they measure?",
              [
                "In the sparse world member strength falls from 0.932 at m = 6 to 0.757 at m = 1 while correlation falls from 0.694 to 0.141, and the committee stays between 0.933 and 0.95",
                "In the shared world strength barely moves while correlation falls from 0.205 to 0.117, and the committee gains from 0.75 at m = 6 to 0.817 at m = 2",
                "What decided each case was whether a node denied its best feature was offered something nearly as good",
                "A fourth arrangement, three noisy copies of one feature beside three noise columns, lost 0.06 at m = 1 with 25 members",
              ],
              [0, 1, 2, 3],
              "All four were measured. In the sparse world the two effects cancel almost exactly, so the restriction is close to free rather than helpful, and the world of three noisy copies behaved like the sparse one, at a committee size the seed check had already shown to be unstable. A long feature list is not itself the thing a forest benefits from, since hundreds of mostly irrelevant columns make a small subset weak in the way the sparse world is weak, only more so.",
            ),
            trueFalse(
              "A 60 percent vote from the committee is a claim that about six in ten such people are adults.",
              false,
              "A vote fraction measures committee agreement and is not automatically a calibrated probability. Two cells can be painted the same class with the forest nearly unanimous in one and split 13 to 12 in the other, and the majority map cannot tell them apart, which is why the two are drawn separately.",
            ),
            choice(
              "In Var(committee) = ρσ² + (1 − ρ)σ²/B, what happens as the number of trees grows without bound?",
              [
                "The variance approaches ρσ², a floor set by the correlation rather than by the committee size",
                "The variance approaches zero, since averaging more members removes more noise",
                "The variance approaches σ², since the members share a common variance",
                "The variance stops depending on ρ, which is why more trees are the main lever",
              ],
              0,
              "Under the equal-variance/common-correlation assumptions, the term divided by B approaches zero while the shared term remains. Feature subsampling can change both individual prediction variance and pairwise correlation. Whether their combination improves depends on their measured values; correlation is not guaranteed to fall for every dataset.",
            ),
            choice(
              "For twenty-five trees, compare Var(mean)=ρσ²+(1−ρ)σ²/25. Bagging has σ²=1 and ρ=0.5; forest A has σ²=1.2 and ρ=0.25; forest B has σ²=1.6 and ρ=0.45. Which has the smallest variance, and why?",
              [
                "Forest A at 0.336, because its lower correlation more than pays for its noisier members",
                "Bagging at 0.52, because its members are the least noisy of the three",
                "Forest B at 0.7552, because it has the lowest correlation of the three",
                "All three are equal once the committee size is taken into account",
              ],
              0,
              "The hypothetical variances are:\n\n```math\nbagging: 0.5 × 1 + 0.5 × 1 / 25 = 0.52\nforest A: 0.25 × 1.2 + 0.75 × 1.2 / 25 = 0.336\nforest B: 0.45 × 1.6 + 0.55 × 1.6 / 25 = 0.7552\n```\n\nForest A has the smallest variance because its lower correlation compensates for its larger individual variance. These are variances under the stated model, not measured classification accuracies.",
            ),
        ],
        },
        {
          title: "Part 9. Choosing the Feature Subset",
          content: (
            <>
              <SubSection title="26. Choosing max_features">
                <p>The setting m controls how many features each node may consider. Smaller subsets impose more restriction, which may reduce similarity between trees while weakening their splits. With m = p, all features are available and the procedure becomes bagging. Conventional choices such as the square root of p for classification and a third of p for regression give starting points to evaluate, rather than a result for every dataset.</p>
                <p>
                  Since out-of-bag evaluation is taught elsewhere, the
                  procedure is short. Fit forests at several candidate values
                  of m, compare their out-of-bag scores, look at how much
                  those scores move across seeds before trusting a small
                  difference, and choose by the evaluation procedure the{" "}
                  <Link href="/concepts/grid-search" className={link}>
                    search page
                  </Link>{" "}
                  lays out. Section 19 is that sweep on two worlds, and
                  section 18 is the seed check on one crowd.
                </p>
                <KeepInMind>
                  The feature-subset size changes the available split choices. It can affect individual-tree quality, shared errors and tree size, especially if an offered subset has no valid split. Choose it using evaluation evidence rather than a universal rule.</KeepInMind>
              </SubSection>

              <SubSection title="27. Other forest settings">
                <p>
                  The lottery defines the forest, and it is not the only
                  setting that decides how the forest behaves. The number of
                  trees, the maximum depth, the minimum rows to split and to
                  leave, the size of the bootstrap sample and whether
                  bootstrapping is on at all, any class weighting, the split
                  criterion and the random seed all carry over from bagging
                  and from the tree, and a forest inherits every one of their
                  consequences. Some implementations allow the bootstrap to
                  be switched off, leaving the feature lottery as the only
                  source of randomness.
                </p>
                <KeepInMind>
                  Random feature selection defines the forest, while the
                  base-tree and committee settings determine how that forest
                  behaves.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 10. Feature Importance",
          content: (
            <>
              <SubSection title="28. Impurity-based feature importance">
                <p>Feature use can be summarized by frequency, impurity reduction or changes in predictive performance. These need not give the same ranking. Impurity importance totals each feature’s weighted impurity reductions across the trees and normalizes those totals. The <Link href="/concepts/feature-importance" className={link}>feature-importance page</Link>{" "}compares this training-based summary with performance-based measures.</p>
                <InAModel title="On the seed 7 forest">
                  <p>
                    Impurity importance gives height 0.527 and weight 0.473,
                    nearly even, because the lottery made the trees spend
                    roughly equal impurity reductions on both. On the
                    bagged committee from the same seed the same measure
                    gives height 0.711 and weight 0.289. The data did not
                    change between the two; the lottery did, and the
                    forest&rsquo;s figure describes how this forest used its
                    features, which the lottery decided as much as the data
                    did.
                  </p>
                </InAModel>
                <KeepInMind>

                  Impurity importance can favor continuous features and
                  features with many candidate thresholds, and correlated
                  features can divide or obscure one another&rsquo;s share.
                  It summarizes how the fitted forest used a feature, not
                  how causally important the feature is.
                </KeepInMind>
              </SubSection>

              <SubSection title="29. Permutation importance">
                <p>
                  The third question is answered by breaking a feature and
                  watching what happens. Measure the baseline score, shuffle
                  one feature&rsquo;s column so it keeps its distribution and
                  loses its relationship with the label, measure again, and
                  read the drop as reliance on that feature. It should be
                  computed on evaluation rows, and the out-of-bag rows serve
                  when an implementation supports it.
                </p>
                <InAModel title="On the same forest">
                  <p>
                    Permutation importance gives height 0.64 and weight 0.36
                    over five shuffles. Shuffling height costs the forest
                    more than shuffling weight, which is the same ordering
                    the root board in section 4 gave and a stronger lean than
                    the impurity measure reported.
                  </p>
                </InAModel>
                <KeepInMind>
                  Correlated features can substitute for one another, so
                  permuting one may show little loss even when the group
                  matters, and no importance measure establishes causation.
                  Permutation importance estimates how much predictive
                  performance depends on a feature under one particular
                  evaluation procedure.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 11. Limitations",
          content: (
            <>
              <SubSection title="30. Limits of forest interpretability">
                <p>A small tree can be read as a flowchart. A forest of many trees contains far more routes, making it difficult to inspect the complete prediction rule at once. Prediction maps and feature summaries help with particular questions, but neither shows every individual decision. Inspect selected members or local paths when that detail matters.</p>
                <KeepInMind>
                  Random forests trade much of a single tree&rsquo;s direct
                  readability for stability and predictive power.
                </KeepInMind>
              </SubSection>

              <SubSection title="31. Predictions outside familiar data">
                <p>Every member starts from the same available records. Incorrect labels, missing information, or sampling bias can therefore affect the whole committee. Averaging does not guarantee that these problems disappear. Leakage, changing populations and unequal error costs still need attention, and vote agreement still needs checking before it is interpreted as a probability.</p>
                <p>
                  Far from the data, the forest keeps answering. A regression
                  forest assembles its answer from training targets in the
                  leaves, so it cannot follow a trend past the range it saw
                  the way a line can. A classification forest lets the
                  outermost regions of every tree extend to infinity, so a
                  query far outside the crowd inherits whichever leaf its
                  ray ends in.
                </p>
                <InAModel title="Three queries the crowd never covered">
                  <p>For the query at 250 centimeters and 30 kilograms, the seed-seven forest returns mean adult probability 0.493 across its members. At 100 centimeters and 120 kilograms it returns 0.465. At 300 centimeters and 200 kilograms it returns 1.0 despite being far from the training observations. These are averaged leaf estimates, rather than fractions of twenty-five hard class votes. Agreement does not measure how well the training data covers a query.</p>
                </InAModel>
                <KeepInMind>
                  A forest still returns a prediction outside familiar data,
                  and the existence of a prediction does not establish that
                  it is reliable. Distance from the training support is a
                  separate check the forest will not make for you.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 12. Recording How the Trees and Feature Samples Were Grown" , id: "part-12-implementation-and-failure-contracts",
          content: (
            <>
              <SubSection title="32. What a forest must specify and refuse">
                <p>A forest is described by how its trees were grown and how their predictions are combined. Record the tree count, whether rows are bootstrapped and the sample size, and how many features are drawn at each split. Each base tree also needs its depth limit, minimum split and leaf sizes, and split criterion.</p>
                <p>For classification, distinguish a hard vote from averaged probabilities, and state the tie rule and any class weighting. Reproducibility depends on how seeds are shared among trees and whether they fit in parallel. Finally, say whether the fit supplies an out-of-bag evaluation.</p>
                <DerivationTable
                  expressionHeading="Data or forest setting"
                  reasonHeading="Effect on fitting and voting"
                  rows={[
                    { expression: "empty data", reason: "refused before any member is grown, by the same guard every model here shares." },
                    { expression: "one row, or one class only", reason: "refused by name, since there is nothing to discriminate between; one row is one class." },
                    { expression: "max_features below one", reason: "refused at construction, before any data is seen." },
                    { expression: "max_features above the feature count", reason: "accepted, and every split is offered every feature, which is bagging." },
                    { expression: "a node whose offered features admit no valid split", reason: "the node becomes a leaf; a withheld feature is not searched for." },
                    { expression: "a bootstrap sample missing a class", reason: "the committee states the class width to every member, so a member that saw one class still votes over both." },
                    { expression: "vote ties", reason: "settled by one stated rule, the same rule the bagging page uses." },
                    { expression: "a fixed seed", reason: "reproduces the samples, the lotteries and the committee exactly; each member's lottery is seeded from the committee's seed and its position." },
                    { expression: "a base tree handed in", reason: "refused at construction; the forest builds its own trees, so depth, the minimum sizes and the subset size are set on the forest itself." },
                  ]}
                />
                <p>This implementation rejects a single-class target, including a dataset with only one observation. It also rejects max_features=0 when the model is constructed because no candidate input would be available.</p>
<p>A request for three features when only two exist is accepted by offering both. Under matching seed and tree settings, that removes the feature restriction and reproduces bagging: twenty roots use height and five use weight, with training accuracy 0.96 and out-of-bag accuracy 0.64. The bootstrap samples and full-feature split searches match in this implementation.</p>
                <p>
                  Reusing the same random-generator setup for every tree can
                  repeat the feature-sampling sequence. That defeats part of the
                  intended diversity. This implementation derives a member&rsquo;s
                  seed from the committee seed and the member&rsquo;s position,
                  so a refit can reproduce the complete procedure.
                </p>
                <p>
                  Different random streams can still choose the same feature or
                  subset by chance. The requirement is not that every draw differ,
                  but that trees are not forced to replay one identical stream.
                  Inspecting the sampled features helps catch that implementation
                  error; a repeated feature on its own does not prove an error.
                </p>
                <p>
                  The SDK therefore constructs the trees inside the forest rather
                  than accepting a preconfigured base tree. Depth, minimum sizes
                  and feature-subset size are configured on the forest, which also
                  controls how each member is seeded.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 9 to 12",
          quiz: [
            trueFalse(
              "With m set equal to the number of features, a random forest is exactly bagging.",
              true,
              "With all features offered, the feature restriction disappears. If the base-tree settings, bootstrap samples and tie rules match, this implementation produces the bagging procedure. It also accepts max_features above the feature count by offering all available features. Defaults are starting values rather than a reason to skip validation of the candidate feature count.",
            ),
            choice(
              "Impurity importance gives height 0.527 and weight 0.473 on the forest, and height 0.711 and weight 0.289 on the bagged committee from the same seed. What explains the difference?",
              [
                "The lottery, which made the trees spend roughly equal impurity reductions on both features",
                "The data, which the two committees read differently",
                "The bagged committee saw more rows, so it could tell the two features apart",
                "The forest normalizes its shares and the bagged committee does not",
              ],
              0,
              "The data did not change between the two figures. A forest’s impurity importance describes how that forest used its features, which the lottery decided as much as the data did. The measure can also favor continuous features and features with many candidate thresholds, and correlated features can divide or obscure one another’s share.",
            ),
            choice(
              "Permutation importance gives height 0.64 and weight 0.36 over five shuffles. What is being measured?",
              [
                "How much predictive performance depends on a feature, under one particular evaluation procedure",
                "How causally important the feature is to the label",
                "How often the feature was chosen at the root",
                "How much impurity the feature removed across every split",
              ],
              0,
              "Shuffling a column preserves its observed marginal values while disrupting its relationship with the target and other inputs. The score change measures how the fixed model relies on that column under this perturbation. Correlated inputs can substitute for one another, or shuffling can create implausible combinations. The result is specific to the model, data and evaluation procedure and does not establish causation.",
            ),
            choice(
              "The seed 7 forest is asked about someone 250 centimeters tall weighing 30 kilograms, and returns an adult share of 0.493. At 300 centimeters and 200 kilograms it returns 1.0. What should be read from that?",
              [
                "That the forest keeps answering far from its data and the vote share does not know how far away the query is",
                "That the near tie at 250 centimeters correctly reports the model’s uncertainty about an unusual person",
                "That the unanimous answer at 300 centimeters is the more trustworthy of the two",
                "That a classification forest refuses queries beyond the range it saw",
              ],
              0,
              "The near tie is assembled from leaves that were about small children and tall adults, and the unanimous answer is no less far from anything the forest saw. The existence of a prediction does not establish that it is reliable, and distance from the training support is a separate check the forest will not make for you.",
            ),
            several(
              "Which of these were measured on this crowd as part of the implementation contract?",
              [
                "A single-class target is refused with a named error",
                "A max_features of zero is refused when the forest is constructed",
                "A max_features above the feature count is refused, since there are not enough features to draw from",
                "A query far outside the crowd is refused rather than answered",
              ],
              [0, 1],
              "Asking for three features of two is accepted, and every split is then offered both, which reaches the bagging column of the dashboard by another route. A refusal for a query far outside the crowd is what the limitations section denies, because a forest still returns a prediction outside familiar data and says nothing about how far away the query was.",
            ),
        ],
        },
        {
          title: "Practice. Growing the Forest With the Library",
          practice: [
            exercise("Switch the lottery on and read the dashboard’s top rows",["Fit BaggingClassifier and RandomForestClassifier to the twenty-five people below, both with n_members=25 and random_seed=7. Set max_features=1 for the forest so each split considers one of the two inputs. Print both out-of-bag scores and the number of trees splitting first on each feature.", "This implementation uses the same bootstrap samples for the two models under these settings. Compare the root counts with the out-of-bag results: changing which features are available need not improve the combined predictions."],`from oop_ml import BaggingClassifier, Feature, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

bagged = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
# Fit the forest with the same members and seed, offering one feature per
# split, then print each committee's out-of-bag score to two places and how
# many of its members root on height and on weight.`,`from oop_ml import BaggingClassifier, Feature, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

bagged = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)

for name, committee in (("bagging", bagged), ("forest", forest)):
    roots = [member.root.split.feature_name for member in committee.members]
    print(f"{name}: out of bag {committee.out_of_bag_score():.2f}, "
          f"roots on height {roots.count('height')}, on weight {roots.count('weight')}")`,`bagging: out of bag 0.64, roots on height 20, on weight 5
forest: out of bag 0.52, roots on height 8, on weight 17`,{...{ hints: ["max_features is the number of candidate input features sampled at each split. With two inputs, max_features=1 restricts the search; max_features=2 offers both and reproduces the unrestricted feature search.", "The forest builds its own trees, so it takes no base_model. Depth and the minimum sizes, if you want them, are fields on the forest itself.", "The members are a tuple on either committee, and each member is a tree whose root holds a split, and the split knows the name of the feature it asks about."], check: numberCheck("What out-of-bag score does the forest report, to two places?", 0.52, 0.005, "The feature lottery spreads the root choices but lowers this seeded committee's out-of-bag score. Diversity in chosen features alone does not establish a better ensemble.") },question:"How does offering fewer features at each split change this committee?"}),
            exercise("Measure each member’s strength out of bag",["For each fitted tree in the bagged ensemble and forest, calculate accuracy using only the people omitted from that tree's bootstrap sample. We call this per-tree out-of-bag accuracy its strength in this comparison.", "Print the mean, minimum and maximum per-tree accuracies for each ensemble. Pair members with samples in the same order so each tree is evaluated on its own omitted rows."],`from oop_ml import BaggingClassifier, Feature, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
truth = list(is_adult.values)

bagged = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)
# For each committee, score every member on the people its own sample omitted,
# then print the mean strength to three places and the weakest and strongest
# member to two places.`,`from oop_ml import BaggingClassifier, Feature, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
truth = list(is_adult.values)

bagged = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)

for name, committee in (("bagging", bagged), ("forest", forest)):
    strengths = []
    for member, sample in zip(committee.members, committee.samples):
        answers = list(member.predict([heights, weights]))
        omitted = list(sample.out_of_bag)
        right = sum(1 for person in omitted if answers[person] == truth[person])
        strengths.append(right / len(omitted))
    print(f"{name}: mean strength {sum(strengths) / len(strengths):.3f}, "
          f"weakest {min(strengths):.2f}, strongest {max(strengths):.2f}")`,`bagging: mean strength 0.641, weakest 0.43, strongest 0.88
forest: mean strength 0.572, weakest 0.33, strongest 0.75`,{...{ hints: ["members and samples are two tuples in the same order, so zipping them pairs every tree with the resample it grew on.", "A sample’s out_of_bag is the list of positions it never drew. Those positions index into the crowd, so they pick out the same people in the member’s answers and in the truth.", "A member answers the whole crowd at once through predict, and the truth is the target’s values. Comparing the two at the omitted positions and dividing by how many there are is the member’s strength."], check: numberCheck("What is the forest’s mean member strength, to three places?", 0.572, 0.0005, "Limiting available features can force less effective splits and reduce individual-tree performance. The ensemble benefits only if reduced dependence between their errors compensates sufficiently; this crowd does not show such a benefit under the given seed.") },question:"What happens to each tree's out-of-bag accuracy under feature sampling?"}),
            exercise("Ask the forest which feature mattered",["Print impurity-based feature_importances for the bagged ensemble and the forest. Then measure the fitted forest with PermutationImportance(n_repeats=5, random_seed=1), using the same supplied features and labels. Print the returned feature shares to three decimal places.", "The permutation comparison keeps the fitted forest fixed and shuffles one column at a time. Here it uses training rows, so its result describes reliance on those rows. A held-out measurement would address reliance during evaluation on new data."],`from oop_ml import Feature, BaggingClassifier, PermutationImportance, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

bagged = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)
# Print the impurity importances of both committees, then the permutation
# importances of the forest over five shuffles under seed 1, each share to
# three places.`,`from oop_ml import Feature, BaggingClassifier, PermutationImportance, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

bagged = BaggingClassifier(n_members=25, random_seed=7).fit([heights, weights], is_adult)
forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)

for name, committee in (("bagging", bagged), ("forest", forest)):
    shares = ", ".join(f"{each.name} {each.value:.3f}" for each in committee.feature_importances)
    print(f"{name}, impurity importance: {shares}")

shuffled = PermutationImportance(n_repeats=5, random_seed=1).measure(forest, [heights, weights], is_adult)
shares = ", ".join(f"{each.name} {each.value:.3f}" for each in shuffled)
print(f"forest, permutation importance: {shares}")`,`bagging, impurity importance: height 0.711, weight 0.289
forest, impurity importance: height 0.527, weight 0.473
forest, permutation importance: height 0.640, weight 0.360`,{...{ hints: ["feature_importances on a fitted committee is the members’ impurity shares averaged, and it is iterable, each entry carrying a name and a value.", "PermutationImportance is constructed with n_repeats and random_seed, and its measure takes the fitted model, the features and the target. It never refits anything.", "The impurity shares and this library's normalized permutation shares sum to one in this example. Permutation importance in other APIs may instead report raw score changes, including negative values, so check the returned convention."], check: numberCheck("What permutation importance does the forest give height, to two places?", 0.64, 0.005, "The two methods measure different properties. Split importance credits the training reductions the forest used, while permutation importance measures how much the fixed model's score depends on each input on the evaluated rows.") },question:"Do split credit and shuffled-feature dependence agree?"}),
            exercise("Ask about people far from the crowd",["Section 31 asks the seed 7 forest about someone 250 centimeters tall weighing 30 kilograms, someone 100 centimeters and 120 kilograms, and someone 300 centimeters and 200 kilograms, and reads the adult share for each. Put the three questions to the forest yourself.", "The adult share is the second column of the forest’s averaged probabilities, since adult is class 1. Print it for each person to three places, and notice that the forest answers all three without any sign of how far away they are."],`from oop_ml import Feature, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)
# Ask the forest for its class probabilities at the three far-off people and
# print each one's adult share to three places.`,`from oop_ml import Feature, RandomForestClassifier

heights = Feature("height", [147, 156, 145, 159, 162, 120, 122, 118, 180, 183, 178, 145, 145, 151, 151, 157, 157, 148, 154, 160, 147, 153, 150, 156, 143])
weights = Feature("weight", [41, 53, 57, 57, 61, 25, 28, 24, 80, 83, 78, 45, 55, 45, 55, 45, 55, 50, 50, 50, 58, 58, 42, 42, 50])
is_adult = Feature("is_adult", [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0])

forest = RandomForestClassifier(n_members=25, random_seed=7, max_features=1).fit(
    [heights, weights], is_adult
)

far_heights = [250, 100, 300]
far_weights = [30, 120, 200]
shares = forest.predict_probabilities(
    [Feature("height", far_heights), Feature("weight", far_weights)]
)
for height, weight, row in zip(far_heights, far_weights, shares):
    print(f"{height} cm and {weight} kg: adult share {row[1]:.3f}")`,`250 cm and 30 kg: adult share 0.493
100 cm and 120 kg: adult share 0.465
300 cm and 200 kg: adult share 1.000`,{...{ hints: ["predict_probabilities takes features named exactly as the fit saw them and answers one row per person, with one column per class in class order.", "Iterating over the probability matrix gives one row at a time, and the adult share is the entry at position 1 of each row."], check: numberCheck("What adult share does the forest give the person 250 centimeters tall and 30 kilograms, to three places?", 0.493, 0.0005, "Tree regions extend outside the observed measurements, so a distant query still reaches leaves and receives a class share. High agreement among those leaf predictions is not evidence that the query resembles training data.") },question:"What does a forest's class share tell us about queries far from its training data?"}),
          ],
        },
      ]}
    />
  );
}
